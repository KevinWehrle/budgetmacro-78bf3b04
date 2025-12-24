import { useState } from "react";
import { ProgressRing } from "./ProgressRing";
import { Zap, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export function Dashboard() {
  const { todayTotals, goals, foodLogs, deleteFoodLog } = useApp();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; description: string } | null>(null);

  // Get today's logs only
  const todayLogs = foodLogs.filter((log) => {
    const today = new Date();
    const logDate = new Date(log.timestamp);
    return (
      logDate.getDate() === today.getDate() &&
      logDate.getMonth() === today.getMonth() &&
      logDate.getFullYear() === today.getFullYear()
    );
  });

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteFoodLog(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

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
            progress={todayTotals.calories}
            max={goals.calories}
            label="Calories"
            value={`${todayTotals.calories}`}
            variant="calories"
          />
          <ProgressRing
            progress={todayTotals.protein}
            max={goals.protein}
            label="Protein"
            value={`${todayTotals.protein}g`}
            variant="protein"
          />
          <ProgressRing
            progress={todayTotals.cost}
            max={goals.budget}
            label="Spent"
            value={`$${todayTotals.cost.toFixed(2)}`}
            variant="money"
          />
        </div>

        <div className="mt-6 pt-4 border-t border-border/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Goal</p>
              <p className="text-sm font-semibold text-progress-calories">
                {goals.calories} cal
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Goal</p>
              <p className="text-sm font-semibold text-progress-protein">
                {goals.protein}g
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-sm font-semibold text-progress-money">
                ${goals.budget.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 cyber-card p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          Recent Entries
        </h3>
        {todayLogs.length === 0 ? (
          <p className="text-muted-foreground/60 text-center py-4 text-sm">
            Add your first meal to start tracking!
          </p>
        ) : (
          <div className="space-y-3">
            {todayLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {log.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.calories} cal • {log.protein}g protein • ${log.cost.toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => setDeleteConfirm({ id: log.id, description: log.description })}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.description}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
