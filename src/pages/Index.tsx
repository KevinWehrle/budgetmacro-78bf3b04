import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Dashboard } from "@/components/Dashboard";
import { FoodEntry } from "@/components/FoodEntry";
import { MenuPage } from "@/components/MenuPage";
import { Pantry } from "@/components/Pantry";
import { ProInsights } from "@/components/ProInsights";

import { useApp } from "@/context/AppContext";

const Index = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "dashboard");

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  const { settings } = useApp();

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  return (
    <div className="min-h-screen bg-background" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
      {/* Status bar spacer */}
      <div className="sticky top-0 z-50 bg-background h-[env(safe-area-inset-top,0px)]" />

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "add" && <FoodEntry />}
        {activeTab === "pantry" && <Pantry />}
        {activeTab === "insights" && <ProInsights />}
        {activeTab === "menu" && <MenuPage />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
