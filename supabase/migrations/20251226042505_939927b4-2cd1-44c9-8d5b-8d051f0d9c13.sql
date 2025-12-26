-- Create ai_recommendations table for external Python model insights
CREATE TABLE public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_text TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own recommendations" 
ON public.ai_recommendations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" 
ON public.ai_recommendations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations" 
ON public.ai_recommendations 
FOR DELETE 
USING (auth.uid() = user_id);