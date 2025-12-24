import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings as SettingsIcon, Bell, Moon, Trash2, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Settings() {
  const { settings, setSettings, clearFoodLogs } = useApp();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.info("To install, use your browser's menu and select 'Add to Home Screen'");
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      toast.success("App installed successfully!");
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleClearData = () => {
    clearFoodLogs();
    toast.success("All food logs cleared!");
    navigate("/");
  };

  const toggleNotifications = () => {
    setSettings({ ...settings, notifications: !settings.notifications });
    toast.success(settings.notifications ? "Notifications disabled" : "Notifications enabled");
  };

  const toggleDarkMode = () => {
    const newDarkMode = !settings.darkMode;
    setSettings({ ...settings, darkMode: newDarkMode });
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    toast.success(newDarkMode ? "Dark mode enabled" : "Light mode enabled");
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
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h1 className="font-semibold">Settings</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="cyber-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground">Daily reminders</p>
              </div>
            </div>
            <Switch 
              checked={settings.notifications} 
              onCheckedChange={toggleNotifications}
            />
          </div>

          <div className="cyber-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                <Moon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Dark Mode</h3>
                <p className="text-xs text-muted-foreground">{settings.darkMode ? "Currently on" : "Currently off"}</p>
              </div>
            </div>
            <Switch checked={settings.darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          {!isInstalled && (
            <div className="cyber-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Install App</h3>
                  <p className="text-xs text-muted-foreground">Add to home screen</p>
                </div>
              </div>
              <Button size="sm" onClick={handleInstall}>
                Install
              </Button>
            </div>
          )}

          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={handleClearData}
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
