import { useApp } from "@/context/AppContext";
import { Calendar, Flame, Dumbbell, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { format, parseISO } from "date-fns";

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

  return (
    <div className="px-4 py-6 slide-up">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          <span className="text-primary neon-glow-text">History</span>
        </h1>
      </div>

      {history.length === 0 ? (
        <div className="cyber-card p-8 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No history yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Your daily progress will appear here after each day
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((day) => {
            const proteinPct = getPercentage(day.protein, day.goalProtein);
            const caloriesPct = getPercentage(day.calories, day.goalCalories);
            const spentPct = getPercentage(day.cost, day.goalBudget);

            return (
              <div key={day.date} className="cyber-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-foreground">
                    {format(parseISO(day.date), "EEE, MMM d")}
                  </span>
                  <div className="flex items-center gap-1">
                    {proteinPct >= 90 ? (
                      <TrendingUp className="w-4 h-4 text-progress-protein" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-xs ${proteinPct >= 90 ? 'text-progress-protein' : 'text-red-400'}`}>
                      {proteinPct}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/30 rounded-lg p-2">
                    <Flame className="w-4 h-4 text-progress-calories mx-auto mb-1" />
                    <p className={`text-sm font-bold ${getStatusColor(day.calories, day.goalCalories)}`}>
                      {day.calories}
                    </p>
                    <p className="text-xs text-muted-foreground">/ {day.goalCalories} cal</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <Dumbbell className="w-4 h-4 text-progress-protein mx-auto mb-1" />
                    <p className={`text-sm font-bold ${getStatusColor(day.protein, day.goalProtein)}`}>
                      {day.protein}g
                    </p>
                    <p className="text-xs text-muted-foreground">/ {day.goalProtein}g</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <DollarSign className="w-4 h-4 text-progress-money mx-auto mb-1" />
                    <p className={`text-sm font-bold ${getStatusColor(day.cost, day.goalBudget, true)}`}>
                      ${day.cost.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">/ ${day.goalBudget}</p>
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
