import { ProgressRing } from "./ProgressRing";
import { Zap } from "lucide-react";

interface DashboardProps {
  calories: number;
  caloriesGoal: number;
  protein: number;
  proteinGoal: number;
  moneySpent: number;
  moneyBudget: number;
}

export function Dashboard({
  calories,
  caloriesGoal,
  protein,
  proteinGoal,
  moneySpent,
  moneyBudget,
}: DashboardProps) {
  return (
    <div className="px-4 py-6 slide-up">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-6 h-6 text-primary animate-pulse-glow" />
        <h1 className="text-2xl font-bold text-foreground">
          Today's <span className="text-primary neon-glow-text">Progress</span>
        </h1>
      </div>

      <div className="cyber-card p-6">
        <div className="flex justify-around items-center">
          <ProgressRing
            progress={calories}
            max={caloriesGoal}
            label="Calories"
            value={`${calories}`}
            variant="calories"
          />
          <ProgressRing
            progress={protein}
            max={proteinGoal}
            label="Protein"
            value={`${protein}g`}
            variant="protein"
          />
          <ProgressRing
            progress={moneySpent}
            max={moneyBudget}
            label="Spent"
            value={`$${moneySpent.toFixed(2)}`}
            variant="money"
          />
        </div>

        <div className="mt-6 pt-4 border-t border-border/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Goal</p>
              <p className="text-sm font-semibold text-progress-calories">
                {caloriesGoal} cal
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Goal</p>
              <p className="text-sm font-semibold text-progress-protein">
                {proteinGoal}g
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-sm font-semibold text-progress-money">
                ${moneyBudget.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 cyber-card p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          Recent Entries
        </h3>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground/60 text-center py-4">
            Add your first meal to start tracking!
          </p>
        </div>
      </div>
    </div>
  );
}
