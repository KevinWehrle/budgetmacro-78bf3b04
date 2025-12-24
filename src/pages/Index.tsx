import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { AdBanner } from "@/components/AdBanner";
import { Dashboard } from "@/components/Dashboard";
import { FoodEntry } from "@/components/FoodEntry";
import { ValueFoods } from "@/components/ValueFoods";
import { MenuPage } from "@/components/MenuPage";
import { Zap } from "lucide-react";

interface FoodLog {
  description: string;
  calories: number;
  protein: number;
  cost: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);

  // Calculate totals from food logs
  const totals = foodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      cost: acc.cost + log.cost,
    }),
    { calories: 0, protein: 0, cost: 0 }
  );

  const handleAddFood = (entry: FoodLog) => {
    setFoodLogs((prev) => [...prev, entry]);
    setActiveTab("dashboard");
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">
              Macro<span className="text-primary neon-glow-text">Money</span>
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        {activeTab === "dashboard" && (
          <Dashboard
            calories={totals.calories}
            caloriesGoal={2000}
            protein={totals.protein}
            proteinGoal={150}
            moneySpent={totals.cost}
            moneyBudget={15}
          />
        )}
        {activeTab === "add" && <FoodEntry onAddFood={handleAddFood} />}
        {activeTab === "foods" && <ValueFoods />}
        {activeTab === "menu" && <MenuPage />}
      </main>

      {/* Ad Banner */}
      <AdBanner />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
