import { useApp } from "@/context/AppContext";
import { Calendar, Flame, Dumbbell, DollarSign, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

export function History() {
  const { history, goals } = useApp();

  const getPercentage = (value: number, goal: number) => {
    return Math.round((value / goal) * 100);
  };

  const getStatusColor = (value: number, goal: number, isSpent = false) => {
    const pct = getPercentage(value, goal);
    if (isSpent) {
      return pct <= 100 ? "text-progress-money" : "text-red-400";
    }
    if (pct >= 90) return "text-progress-protein";
    if (pct >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  // Prepare chart data - last 7 days
  const getChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayData = history.find(h => h.date === dateStr);
      
      last7Days.push({
        day: format(date, "EEE"),
        fullDate: dateStr,
        spent: dayData ? dayData.cost : 0,
        protein: dayData ? dayData.protein : 0,
      });
    }
    return last7Days;
  };

  const chartData = getChartData();
  const hasData = history.length > 0;

  return (
    <div className="px-4 py-4 slide-up">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">
          History
        </h1>
      </div>

      {/* 7-Day Chart */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">7-Day Overview</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="20%">
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={(value) => `${value}g`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
              />
              <Bar 
                yAxisId="left"
                dataKey="spent" 
                name="Spent" 
                fill="hsl(258, 90%, 66%)" 
                radius={[4, 4, 0, 0]}
                opacity={hasData ? 1 : 0.3}
              />
              <Bar 
                yAxisId="right"
                dataKey="protein" 
                name="Protein" 
                fill="hsl(160, 84%, 45%)" 
                radius={[4, 4, 0, 0]}
                opacity={hasData ? 1 : 0.3}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {!hasData && (
          <p className="text-xs text-muted-foreground/60 text-center mt-2">
            Start logging to see your progress visualized here
          </p>
        )}
      </div>

      {history.length === 0 ? (
        <div className="glass-card p-6 text-center">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-sm">No daily history yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Your progress summaries will appear here after each day
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((day) => {
            const proteinPct = getPercentage(day.protein, day.goalProtein);
            const caloriesPct = getPercentage(day.calories, day.goalCalories);
            const spentPct = getPercentage(day.cost, day.goalBudget);

            return (
              <div key={day.date} className="glass-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground text-sm">
                    {format(parseISO(day.date), "EEE, MMM d")}
                  </span>
                  <div className="flex items-center gap-1">
                    {proteinPct >= 90 ? (
                      <TrendingUp className="w-3 h-3 text-progress-protein" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`text-xs ${proteinPct >= 90 ? 'text-progress-protein' : 'text-red-400'}`}>
                      {proteinPct}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/20 rounded-lg p-2">
                    <Flame className="w-3 h-3 text-progress-calories mx-auto mb-0.5" />
                    <p className={`text-xs font-bold ${getStatusColor(day.calories, day.goalCalories)}`}>
                      {day.calories}
                    </p>
                    <p className="text-[10px] text-muted-foreground">/ {day.goalCalories}</p>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-2">
                    <Dumbbell className="w-3 h-3 text-progress-protein mx-auto mb-0.5" />
                    <p className={`text-xs font-bold ${getStatusColor(day.protein, day.goalProtein)}`}>
                      {day.protein}g
                    </p>
                    <p className="text-[10px] text-muted-foreground">/ {day.goalProtein}g</p>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-2">
                    <DollarSign className="w-3 h-3 text-progress-money mx-auto mb-0.5" />
                    <p className={`text-xs font-bold ${getStatusColor(day.cost, day.goalBudget, true)}`}>
                      ${day.cost.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">/ ${day.goalBudget}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
