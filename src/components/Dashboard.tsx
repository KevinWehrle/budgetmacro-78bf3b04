import { useState } from "react";
import { ProgressRing } from "./ProgressRing";
import { Zap, Trash2, Edit2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface FoodLog {
  id: string;
  description: string;
  calories: number;
  protein: number;
  cost: number;
  timestamp: Date;
}

// Helper to limit cost to 2 decimal places
const formatCostInput = (value: string): string => {
  const match = value.match(/^\d*\.?\d{0,2}/);
  return match ? match[0] : '';
};

export function Dashboard() {
  const { todayTotals, goals, foodLogs, deleteFoodLog, updateFoodLog } = useApp();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; description: string } | null>(null);
  const [editingEntry, setEditingEntry] = useState<FoodLog | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    calories: "",
    protein: "",
    cost: ""
  });

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

  const openEdit = (log: FoodLog) => {
    setEditingEntry(log);
    setEditForm({
      description: log.description,
      calories: log.calories.toString(),
      protein: log.protein.toString(),
      cost: log.cost.toFixed(2)
    });
  };

  const handleCostChange = (value: string) => {
    setEditForm({ ...editForm, cost: formatCostInput(value) });
  };

  const handleEditSave = () => {
    if (!editingEntry) return;
    
    updateFoodLog(editingEntry.id, {
      description: editForm.description,
      calories: parseInt(editForm.calories) || 0,
      protein: parseInt(editForm.protein) || 0,
      cost: parseFloat(editForm.cost) || 0
    });
    
    setEditingEntry(null);
    setEditForm({ description: "", calories: "", protein: "", cost: "" });
  };

  // Calculate remaining values
  const remainingCalories = Math.max(0, goals.calories - todayTotals.calories);
  const remainingProtein = Math.max(0, goals.protein - todayTotals.protein);
  const remainingBudget = Math.max(0, goals.budget - todayTotals.cost);

  return (
    <div className="px-4 py-4 slide-up">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">
          Today's Progress
        </h1>
      </div>

      <div className="glass-card p-5">
        <div className="flex flex-col gap-4">
          <ProgressRing
            progress={todayTotals.calories}
            max={goals.calories}
            label="Calories"
            value={`${todayTotals.calories}`}
            variant="calories"
            remaining={`${remainingCalories} left`}
          />
          <ProgressRing
            progress={todayTotals.protein}
            max={goals.protein}
            label="Protein"
            value={`${todayTotals.protein}g`}
            variant="protein"
            remaining={`${remainingProtein}g left`}
          />
          <ProgressRing
            progress={todayTotals.cost}
            max={goals.budget}
            label="Spent"
            value={`$${todayTotals.cost.toFixed(2)}`}
            variant="money"
            remaining={`$${remainingBudget.toFixed(2)} left`}
          />
        </div>
      </div>

      <div className="mt-3 glass-card p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          Recent Entries
        </h3>
        {todayLogs.length === 0 ? (
          <p className="text-muted-foreground/60 text-center py-3 text-sm">
            Add your first meal to start tracking!
          </p>
        ) : (
          <div className="space-y-2">
            {todayLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/20"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {log.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-progress-calories">{log.calories} cal</span>
                    {" • "}
                    <span className="text-progress-protein">{log.protein}g protein</span>
                    {" • "}
                    <span className="text-progress-money">${log.cost.toFixed(2)}</span>
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => openEdit(log)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteConfirm({ id: log.id, description: log.description })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Entry Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Description</Label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Calories</Label>
                <Input
                  type="number"
                  value={editForm.calories}
                  onChange={(e) => setEditForm({ ...editForm, calories: e.target.value })}
                />
              </div>
              <div>
                <Label>Protein (g)</Label>
                <Input
                  type="number"
                  value={editForm.protein}
                  onChange={(e) => setEditForm({ ...editForm, protein: e.target.value })}
                />
              </div>
              <div>
                <Label>Cost ($)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={editForm.cost}
                  onChange={(e) => handleCostChange(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleEditSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="glass-card">
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
