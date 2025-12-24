import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Target, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Goals() {
  const [caloriesGoal, setCaloriesGoal] = useState("2000");
  const [proteinGoal, setProteinGoal] = useState("150");
  const [budgetGoal, setBudgetGoal] = useState("15");

  const handleSave = () => {
    toast.success("Goals saved!", {
      description: `${caloriesGoal} cal • ${proteinGoal}g protein • $${budgetGoal}/day`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14 max-w-md mx-auto">
          <Link
            to="/"
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

          <Button variant="neon" size="lg" className="w-full" onClick={handleSave}>
            <Save className="w-4 h-4" />
            Save Goals
          </Button>
        </div>
      </main>
    </div>
  );
}
