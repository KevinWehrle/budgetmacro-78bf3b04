import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

interface AppContextType {
  foodLogs: FoodLog[];
  addFoodLog: (log: Omit<FoodLog, "id" | "timestamp">) => void;
  deleteFoodLog: (id: string) => void;
  clearFoodLogs: () => void;
  goals: Goals;
  setGoals: (goals: Goals) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  todayTotals: { calories: number; protein: number; cost: number };
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
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>(() => {
    const saved = localStorage.getItem("macromoney-logs");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((log: FoodLog) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));
    }
    return [];
  });

  const [goals, setGoalsState] = useState<Goals>(() => {
    const saved = localStorage.getItem("macromoney-goals");
    return saved ? JSON.parse(saved) : defaultGoals;
  });

  const [settings, setSettingsState] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("macromoney-settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("macromoney-logs", JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem("macromoney-goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("macromoney-settings", JSON.stringify(settings));
  }, [settings]);

  // Calculate today's totals
  const todayTotals = foodLogs
    .filter((log) => {
      const today = new Date();
      const logDate = new Date(log.timestamp);
      return (
        logDate.getDate() === today.getDate() &&
        logDate.getMonth() === today.getMonth() &&
        logDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        cost: acc.cost + log.cost,
      }),
      { calories: 0, protein: 0, cost: 0 }
    );

  const addFoodLog = (log: Omit<FoodLog, "id" | "timestamp">) => {
    const newLog: FoodLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setFoodLogs((prev) => [newLog, ...prev]);
  };

  const deleteFoodLog = (id: string) => {
    setFoodLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const clearFoodLogs = () => {
    setFoodLogs([]);
  };

  const setGoals = (newGoals: Goals) => {
    setGoalsState(newGoals);
  };

  const setSettings = (newSettings: AppSettings) => {
    setSettingsState(newSettings);
  };

  return (
    <AppContext.Provider
      value={{
        foodLogs,
        addFoodLog,
        deleteFoodLog,
        clearFoodLogs,
        goals,
        setGoals,
        settings,
        setSettings,
        todayTotals,
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
