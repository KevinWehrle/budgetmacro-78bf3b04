import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { AdBanner } from "@/components/AdBanner";
import { Dashboard } from "@/components/Dashboard";
import { FoodEntry } from "@/components/FoodEntry";
import { ValueFoods } from "@/components/ValueFoods";
import { MenuPage } from "@/components/MenuPage";
import { Zap } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

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
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "add" && <FoodEntry />}
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
