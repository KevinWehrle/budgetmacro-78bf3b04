import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { format, startOfDay, isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FoodLog {
  id: string;
  description: string;
  calories: number;
  protein: number;
  cost: number;
  timestamp: Date;
}

interface Goals {
  calories: number;
  protein: number;
  budget: number;
}

interface AppSettings {
  notifications: boolean;
  darkMode: boolean;
}

interface DayHistory {
  date: string;
  calories: number;
  protein: number;
  cost: number;
  goalCalories: number;
  goalProtein: number;
  goalBudget: number;
}

interface AppContextType {
  foodLogs: FoodLog[];
  addFoodLog: (log: Omit<FoodLog, "id" | "timestamp">) => void;
  updateFoodLog: (id: string, log: Omit<FoodLog, "id" | "timestamp">) => void;
  deleteFoodLog: (id: string) => void;
  clearFoodLogs: () => void;
  goals: Goals;
  setGoals: (goals: Goals) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  todayTotals: { calories: number; protein: number; cost: number };
  history: DayHistory[];
  loading: boolean;
}

const defaultGoals: Goals = {
  calories: 2000,
  protein: 150,
  budget: 15,
};

const defaultSettings: AppSettings = {
  notifications: false,
  darkMode: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [goals, setGoalsState] = useState<Goals>(defaultGoals);
  const [settings, setSettingsState] = useState<AppSettings>(defaultSettings);
  const [history, setHistory] = useState<DayHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setFoodLogs([]);
      setGoalsState(defaultGoals);
      setSettingsState(defaultSettings);
      setHistory([]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Load today's food logs
        const today = format(new Date(), "yyyy-MM-dd");
        const { data: logsData, error: logsError } = await supabase
          .from("food_logs")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", `${today}T00:00:00`)
          .order("created_at", { ascending: false });

        if (logsError) throw logsError;

        setFoodLogs(
          (logsData || []).map((log) => ({
            id: log.id,
            description: log.description,
            calories: log.calories,
            protein: log.protein,
            cost: Number(log.cost),
            timestamp: new Date(log.created_at),
          }))
        );

        // Load goals
        const { data: goalsData, error: goalsError } = await supabase
          .from("user_goals")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (goalsError) throw goalsError;

        if (goalsData) {
          setGoalsState({
            calories: goalsData.calories,
            protein: goalsData.protein,
            budget: Number(goalsData.budget),
          });
        }

        // Load settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (settingsError) throw settingsError;

        if (settingsData) {
          setSettingsState({
            notifications: settingsData.notifications,
            darkMode: settingsData.dark_mode,
          });
        }

        // Load history
        const { data: historyData, error: historyError } = await supabase
          .from("day_history")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(30);

        if (historyError) throw historyError;

        setHistory(
          (historyData || []).map((h) => ({
            date: h.date,
            calories: h.calories,
            protein: h.protein,
            cost: Number(h.cost),
            goalCalories: h.goal_calories,
            goalProtein: h.goal_protein,
            goalBudget: Number(h.goal_budget),
          }))
        );
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Calculate today's totals
  const todayTotals = foodLogs
    .filter((log) => isSameDay(new Date(log.timestamp), new Date()))
    .reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        cost: acc.cost + log.cost,
      }),
      { calories: 0, protein: 0, cost: 0 }
    );

  const addFoodLog = useCallback(async (log: Omit<FoodLog, "id" | "timestamp">) => {
    if (!user) return;

    const newLog: FoodLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    // Optimistic update
    setFoodLogs((prev) => [newLog, ...prev]);

    try {
      const { error } = await supabase.from("food_logs").insert({
        id: newLog.id,
        user_id: user.id,
        description: log.description,
        calories: log.calories,
        protein: log.protein,
        cost: log.cost,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error adding food log:", error);
      // Revert optimistic update
      setFoodLogs((prev) => prev.filter((l) => l.id !== newLog.id));
      toast.error("Failed to save food entry");
    }
  }, [user]);

  const updateFoodLog = useCallback(async (id: string, log: Omit<FoodLog, "id" | "timestamp">) => {
    if (!user) return;

    const previousLogs = foodLogs;
    // Optimistic update
    setFoodLogs((prev) => 
      prev.map((l) => l.id === id ? { ...l, ...log } : l)
    );

    try {
      const { error } = await supabase
        .from("food_logs")
        .update({
          description: log.description,
          calories: log.calories,
          protein: log.protein,
          cost: log.cost,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating food log:", error);
      // Revert optimistic update
      setFoodLogs(previousLogs);
      toast.error("Failed to update entry");
    }
  }, [user, foodLogs]);

  const deleteFoodLog = useCallback(async (id: string) => {
    if (!user) return;

    const previousLogs = foodLogs;
    // Optimistic update
    setFoodLogs((prev) => prev.filter((log) => log.id !== id));

    try {
      const { error } = await supabase
        .from("food_logs")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting food log:", error);
      // Revert optimistic update
      setFoodLogs(previousLogs);
      toast.error("Failed to delete entry");
    }
  }, [user, foodLogs]);

  const clearFoodLogs = useCallback(async () => {
    if (!user) return;

    const today = format(new Date(), "yyyy-MM-dd");
    const previousLogs = foodLogs;
    // Optimistic update
    setFoodLogs([]);

    try {
      const { error } = await supabase
        .from("food_logs")
        .delete()
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`);

      if (error) throw error;
      toast.success("All entries cleared");
    } catch (error) {
      console.error("Error clearing food logs:", error);
      // Revert optimistic update
      setFoodLogs(previousLogs);
      toast.error("Failed to clear entries");
    }
  }, [user, foodLogs]);

  const setGoals = useCallback(async (newGoals: Goals) => {
    if (!user) return;

    const previousGoals = goals;
    // Optimistic update
    setGoalsState(newGoals);

    try {
      const { error } = await supabase
        .from("user_goals")
        .upsert({
          user_id: user.id,
          calories: newGoals.calories,
          protein: newGoals.protein,
          budget: newGoals.budget,
        }, { onConflict: "user_id" });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving goals:", error);
      // Revert optimistic update
      setGoalsState(previousGoals);
      toast.error("Failed to save goals");
    }
  }, [user, goals]);

  const setSettings = useCallback(async (newSettings: AppSettings) => {
    if (!user) return;

    const previousSettings = settings;
    // Optimistic update
    setSettingsState(newSettings);

    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          notifications: newSettings.notifications,
          dark_mode: newSettings.darkMode,
        }, { onConflict: "user_id" });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving settings:", error);
      // Revert optimistic update
      setSettingsState(previousSettings);
      toast.error("Failed to save settings");
    }
  }, [user, settings]);

  return (
    <AppContext.Provider
      value={{
        foodLogs,
        addFoodLog,
        updateFoodLog,
        deleteFoodLog,
        clearFoodLogs,
        goals,
        setGoals,
        settings,
        setSettings,
        todayTotals,
        history,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
