import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

export default function Goals() {
  const { goals, setGoals } = useApp();
  const navigate = useNavigate();
  
  const [caloriesGoal, setCaloriesGoal] = useState(goals.calories.toString());
  const [proteinGoal, setProteinGoal] = useState(goals.protein.toString());
  const [budgetGoal, setBudgetGoal] = useState(goals.budget.toString());

  useEffect(() => {
    setCaloriesGoal(goals.calories.toString());
    setProteinGoal(goals.protein.toString());
    setBudgetGoal(goals.budget.toString());
  }, [goals]);

  const handleSave = () => {
    const newGoals = {
      calories: parseInt(caloriesGoal) || 2000,
      protein: parseInt(proteinGoal) || 150,
      budget: parseFloat(budgetGoal) || 15,
    };
    setGoals(newGoals);
    toast.success("Goals saved!", {
      description: `${newGoals.calories} cal • ${newGoals.protein}g protein • $${newGoals.budget}/day`,
    });
    navigate("/?tab=menu");
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 pt-safe">
        <div className="flex items-center gap-3 px-4 h-16 max-w-md mx-auto">
          <Link
            to="/?tab=menu"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h1 className="font-semibold">Set Goals</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto">
        <p className="text-sm text-muted-foreground mb-6">
          Set your daily targets for calories, protein, and spending.
        </p>

        <div className="space-y-6">
          <div className="cyber-card p-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Daily Calories
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={caloriesGoal}
                onChange={(e) => setCaloriesGoal(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-primary"
              />
              <span className="text-sm text-muted-foreground">cal</span>
            </div>
          </div>

          <div className="cyber-card p-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Daily Protein
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-primary"
              />
              <span className="text-sm text-muted-foreground">grams</span>
            </div>
          </div>

          <div className="cyber-card p-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Daily Budget
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.50"
                value={budgetGoal}
                onChange={(e) => setBudgetGoal(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
          </div>

          <Button variant="default" size="lg" className="w-full" onClick={handleSave}>
            <Save className="w-4 h-4" />
            Save Goals
          </Button>
        </div>
      </main>
    </div>
  );
}
