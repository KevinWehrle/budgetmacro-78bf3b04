import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { format, startOfDay, isSameDay } from "date-fns";

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
  deleteFoodLog: (id: string) => void;
  clearFoodLogs: () => void;
  goals: Goals;
  setGoals: (goals: Goals) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  todayTotals: { calories: number; protein: number; cost: number };
  history: DayHistory[];
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

  const [history, setHistory] = useState<DayHistory[]>(() => {
    const saved = localStorage.getItem("macromoney-history");
    return saved ? JSON.parse(saved) : [];
  });

  const [lastCheckedDate, setLastCheckedDate] = useState<string>(() => {
    const saved = localStorage.getItem("macromoney-last-date");
    return saved || format(new Date(), "yyyy-MM-dd");
  });

  // Check for day change and archive previous day's data
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    
    if (lastCheckedDate !== today) {
      // Archive yesterday's data if there were any logs
      const yesterdayLogs = foodLogs.filter((log) => {
        const logDate = format(new Date(log.timestamp), "yyyy-MM-dd");
        return logDate === lastCheckedDate;
      });

      if (yesterdayLogs.length > 0) {
        const totals = yesterdayLogs.reduce(
          (acc, log) => ({
            calories: acc.calories + log.calories,
            protein: acc.protein + log.protein,
            cost: acc.cost + log.cost,
          }),
          { calories: 0, protein: 0, cost: 0 }
        );

        const newHistoryEntry: DayHistory = {
          date: lastCheckedDate,
          ...totals,
          goalCalories: goals.calories,
          goalProtein: goals.protein,
          goalBudget: goals.budget,
        };

        setHistory((prev) => {
          const exists = prev.some((h) => h.date === lastCheckedDate);
          if (exists) return prev;
          return [newHistoryEntry, ...prev];
        });
      }

      // Clear today's logs (keep only non-yesterday logs for history reference)
      setFoodLogs((prev) =>
        prev.filter((log) => {
          const logDate = format(new Date(log.timestamp), "yyyy-MM-dd");
          return logDate === today;
        })
      );

      setLastCheckedDate(today);
      localStorage.setItem("macromoney-last-date", today);
    }
  }, [lastCheckedDate, foodLogs, goals]);

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

  useEffect(() => {
    localStorage.setItem("macromoney-history", JSON.stringify(history));
  }, [history]);

  // Calculate today's totals
  const todayTotals = foodLogs
    .filter((log) => {
      const today = new Date();
      const logDate = new Date(log.timestamp);
      return isSameDay(logDate, today);
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
        history,
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
