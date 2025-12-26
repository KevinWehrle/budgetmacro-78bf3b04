import { useState } from 'react';
import { LayoutDashboard, Info, TrendingUp, Gauge, Trophy, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PantryItem {
  id: string;
  name: string;
  total_cost: number;
  total_servings: number;
  current_servings: number;
  protein_per_serving: number;
  calories_per_serving: number;
  is_out_of_stock: boolean;
}

interface AIRecommendation {
  id: string;
  insight_text: string;
  confidence_score: number;
  created_at: string;
}

export function ProInsights() {
  const { history, goals } = useApp();
  const { user } = useAuth();
  const [infoModal, setInfoModal] = useState<string | null>(null);
  const [selectedFoodName, setSelectedFoodName] = useState<string | null>(null);

  // Fetch pantry items
  const { data: pantryItems = [] } = useQuery({
    queryKey: ['pantry-items', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_out_of_stock', false);
      if (error) throw error;
      return data as PantryItem[];
    },
    enabled: !!user
  });

  // Fetch AI recommendations
  const { data: recommendations = [] } = useQuery({
    queryKey: ['ai-recommendations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as AIRecommendation[];
    },
    enabled: !!user
  });

  // Calculate Cost per 100g Protein over last 14 days
  const getEfficiencyData = () => {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = history.find(h => h.date === dateStr);
      
      if (dayData && dayData.protein > 0) {
        const costPer100g = (dayData.cost / (dayData.protein / 100));
        data.push({
          day: format(date, 'MMM d'),
          value: parseFloat(costPer100g.toFixed(2))
        });
      } else {
        data.push({
          day: format(date, 'MMM d'),
          value: null
        });
      }
    }
    return data;
  };

  // Calculate Pantry Runway
  const getPantryRunway = () => {
    const totalPantryCalories = pantryItems.reduce((sum, item) => {
      return sum + (item.calories_per_serving * item.current_servings);
    }, 0);

    // Calculate average daily calorie intake from history
    const recentDays = history.slice(0, 14);
    if (recentDays.length === 0) return { days: 0, percentage: 0 };
    
    const avgDailyCalories = recentDays.reduce((sum, day) => sum + day.calories, 0) / recentDays.length;
    if (avgDailyCalories === 0) return { days: 0, percentage: 0 };

    const runwayDays = Math.floor(totalPantryCalories / avgDailyCalories);
    const percentage = Math.min(100, (runwayDays / 14) * 100); // 14 days = 100%
    
    return { days: runwayDays, percentage };
  };

  // Calculate Top Value Foods (lowest cost per gram of protein)
  const getTopValueFoods = () => {
    const itemsWithValue = pantryItems
      .filter(item => item.protein_per_serving > 0 && item.total_servings > 0)
      .map(item => {
        const costPerServing = item.total_cost / item.total_servings;
        const costPerGramProtein = costPerServing / item.protein_per_serving;
        return {
          name: item.name,
          costPerGramProtein: costPerGramProtein,
          proteinPerServing: item.protein_per_serving
        };
      })
      .sort((a, b) => a.costPerGramProtein - b.costPerGramProtein)
      .slice(0, 5);
    
    return itemsWithValue;
  };

  const efficiencyData = getEfficiencyData();
  const pantryRunway = getPantryRunway();
  const topValueFoods = getTopValueFoods();
  const hasEfficiencyData = efficiencyData.some(d => d.value !== null);

  const infoDescriptions: Record<string, { title: string; description: string }> = {
    efficiency: {
      title: 'Cost per 100g Protein',
      description: 'This chart tracks how efficiently you\'re spending on protein over the last 14 days. Lower values mean you\'re getting more protein for your money. Calculate by dividing your daily food cost by the amount of protein consumed (per 100g).'
    },
    runway: {
      title: 'Pantry Runway',
      description: 'Estimates how many days of food you have left based on your current pantry inventory and your average daily calorie consumption. Calculated by dividing total pantry calories by your average daily intake.'
    },
    roi: {
      title: 'Top Value Foods',
      description: 'Ranks your pantry items by cost-effectiveness for protein. Shows which foods give you the most protein per dollar spent. Lower cost per gram of protein = better value for hitting your protein goals on a budget.'
    }
  };

  return (
    <div className="px-4 py-6 space-y-6 pb-24 slide-up">
      <div className="flex items-center gap-2 mb-4">
        <LayoutDashboard className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">
          Pro Insights
        </h1>
      </div>

      {/* Efficiency Card - Line Chart */}
      <Card className="p-4 bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-sm font-medium text-foreground">Cost per 100g Protein</span>
          </div>
          <button 
            onClick={() => setInfoModal('efficiency')}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <Info className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={efficiencyData}>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(value) => `$${value}`}
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0a0a', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`$${value?.toFixed(2)}`, 'Cost/100g Protein']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 0, r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {!hasEfficiencyData && (
          <p className="text-xs text-muted-foreground/60 text-center mt-2">
            Log some meals to see your protein efficiency trends
          </p>
        )}
      </Card>

      {/* Pantry Runway Card */}
      <Card className="p-4 bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm font-medium text-foreground">Pantry Runway</span>
          </div>
          <button 
            onClick={() => setInfoModal('runway')}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <Info className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${pantryRunway.percentage}%`,
                  background: `linear-gradient(90deg, #10B981, #8B5CF6)`
                }}
              />
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-[#10B981]">{pantryRunway.days}</span>
            <span className="text-sm text-muted-foreground ml-1">days</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {pantryRunway.days === 0 
            ? 'Add items to your pantry to estimate runway'
            : `Based on your average daily intake of ${history.length > 0 ? Math.round(history.slice(0, 14).reduce((s, d) => s + d.calories, 0) / Math.min(14, history.length)) : 0} calories`
          }
        </p>
      </Card>

      {/* ROI Leaderboard Card */}
      <Card className="p-4 bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-sm font-medium text-foreground">Top Value Foods</span>
          </div>
          <button 
            onClick={() => setInfoModal('roi')}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <Info className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        {topValueFoods.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 text-center py-4">
            Add pantry items with protein values to see your best value foods
          </p>
        ) : (
          <div className="space-y-2">
            {topValueFoods.map((food, index) => (
              <div 
                key={food.name}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${index === 0 ? 'text-[#10B981]' : 'text-muted-foreground'}`}>
                    #{index + 1}
                  </span>
                  <button
                    onClick={() => setSelectedFoodName(food.name)}
                    className="text-sm text-foreground truncate max-w-[150px] text-left hover:text-primary transition-colors"
                    title="Tap to see full name"
                  >
                    {food.name}
                  </button>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-[#8B5CF6]">
                    ${food.costPerGramProtein.toFixed(3)}
                  </span>
                  <span className="text-xs text-muted-foreground">/g protein</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Smart AI Suggestions */}
      <Card className="p-4 bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">Smart AI Suggestions</span>
        </div>
        {recommendations.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground/60">
              No AI suggestions yet
            </p>
            <p className="text-xs text-muted-foreground/40 mt-1">
              Insights will appear here from your AI model
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <div 
                key={rec.id}
                className="p-3 rounded-lg bg-white/5 border border-white/5"
              >
                <p className="text-sm text-foreground">{rec.insight_text}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(rec.created_at), 'MMM d, h:mm a')}
                  </span>
                  <span className="text-xs text-[#10B981]">
                    {Math.round(rec.confidence_score * 100)}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info Modal */}
      <Dialog open={!!infoModal} onOpenChange={(open) => !open && setInfoModal(null)}>
        <DialogContent className="bg-[#0a0a0a] border border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#8B5CF6]" />
              {infoModal && infoDescriptions[infoModal]?.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {infoModal && infoDescriptions[infoModal]?.description}
          </p>
        </DialogContent>
      </Dialog>

      {/* Food Name Modal */}
      <Dialog open={!!selectedFoodName} onOpenChange={(open) => !open && setSelectedFoodName(null)}>
        <DialogContent className="bg-[#0a0a0a] border border-white/10">
          <DialogHeader>
            <DialogTitle>Food Item</DialogTitle>
          </DialogHeader>
          <p className="text-foreground">{selectedFoodName}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}