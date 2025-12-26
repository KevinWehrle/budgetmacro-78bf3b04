import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:8080',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  // Allow Lovable preview domains and localhost
  const isAllowed = allowedOrigins.includes(origin) || 
                    origin.endsWith('.lovable.app') ||
                    origin.endsWith('.lovableproject.com');
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// Rate limiting constants
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 50; // 50 requests per hour per user

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log('Invalid user token:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // Check rate limiting
    const now = new Date();
    const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

    // Get or create rate limit record using service role for reliability
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: rateLimitData, error: rateLimitError } = await serviceClient
      .from('api_rate_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('endpoint', 'analyze-food')
      .maybeSingle();

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      // Continue without rate limiting if there's a DB error
    } else {
      if (rateLimitData) {
        const windowStartTime = new Date(rateLimitData.window_start);
        
        if (windowStartTime > windowStart) {
          // Still within the rate limit window
          if (rateLimitData.request_count >= MAX_REQUESTS_PER_WINDOW) {
            console.log('Rate limit exceeded for user:', user.id);
            return new Response(
              JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          // Increment counter
          await serviceClient
            .from('api_rate_limits')
            .update({ request_count: rateLimitData.request_count + 1 })
            .eq('id', rateLimitData.id);
        } else {
          // Window expired, reset counter
          await serviceClient
            .from('api_rate_limits')
            .update({ request_count: 1, window_start: now.toISOString() })
            .eq('id', rateLimitData.id);
        }
      } else {
        // Create new rate limit record
        await serviceClient
          .from('api_rate_limits')
          .insert({
            user_id: user.id,
            endpoint: 'analyze-food',
            request_count: 1,
            window_start: now.toISOString()
          });
      }
    }

    const { foodDescription, pantryItems: userPantryItems } = await req.json();

    // Input validation
    if (!foodDescription || typeof foodDescription !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Food description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedInput = foodDescription.trim();
    
    if (trimmedInput.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Food description cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (trimmedInput.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Food description too long (max 500 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build pantry context for AI
    let pantryContext = '';
    if (userPantryItems && Array.isArray(userPantryItems) && userPantryItems.length > 0) {
      pantryContext = `\n\nThe user has these items in their pantry with known prices:\n${
        userPantryItems.map((item: any) => 
          `- ${item.name}: $${(item.total_cost / item.total_servings).toFixed(2)} per ${item.serving_unit}, ${item.protein_per_serving}g protein, ${item.calories_per_serving} cal per ${item.serving_unit}`
        ).join('\n')
      }\n\nIf the user's food matches any pantry items, use those exact prices and nutrition values. Otherwise estimate based on typical prices.`;
    }

    // Sanitize input to prevent prompt injection attacks
    const sanitizeInput = (input: string): string => {
      // Remove characters commonly used in prompt injection
      const sanitized = input
        .replace(/[{}[\]<>"'`\\]/g, '') // Remove special chars that could be used for injection
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      return sanitized;
    };

    // Check for suspicious patterns that might indicate prompt injection
    const suspiciousPatterns = [
      /ignore\s+(all\s+)?(previous|above|prior)/i,
      /system\s*:/i,
      /assistant\s*:/i,
      /user\s*:/i,
      /forget\s+(everything|all)/i,
      /new\s+instructions?/i,
      /override/i,
      /disregard/i,
    ];

    const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(trimmedInput));
    if (hasSuspiciousPattern) {
      console.log('Suspicious input pattern detected from user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Invalid input detected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedInput = sanitizeInput(trimmedInput);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing food for user:', user.id, '- Input:', trimmedInput.substring(0, 50));

    const systemPrompt = `You are a nutrition and food cost expert. Analyze the food description provided and return accurate nutritional information and estimated cost.

Your response must be a valid JSON object with exactly these fields:
- calories: number (total calories)
- protein: number (grams of protein)
- cost: number (estimated cost in USD based on typical grocery/restaurant prices)

Consider:
- If it sounds like restaurant/fast food, use restaurant prices
- If it sounds like home cooking, use grocery store prices
- Be realistic about portion sizes
- Use average US prices as of 2024
${pantryContext}
Examples:
- "3 eggs" -> {"calories": 216, "protein": 18, "cost": 1.05}
- "chipotle burrito bowl" -> {"calories": 850, "protein": 45, "cost": 11.50}
- "protein shake with milk" -> {"calories": 270, "protein": 32, "cost": 1.60}

Only respond with the JSON object, no other text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this food: "${sanitizedInput}"` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze food' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'No analysis returned' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI analysis complete for user:', user.id);

    // Parse the JSON from the AI response
    let nutritionData;
    try {
      // Clean up the response in case it has markdown code blocks
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      nutritionData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response');
      return new Response(
        JSON.stringify({ error: 'Failed to parse nutrition data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and ensure we have the required fields
    const result = {
      calories: Math.round(Number(nutritionData.calories) || 200),
      protein: Math.round(Number(nutritionData.protein) || 10),
      cost: Math.round((Number(nutritionData.cost) || 3.00) * 100) / 100,
    };

    console.log('Returning nutrition data for user:', user.id);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing food:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'An error occurred while analyzing food' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
