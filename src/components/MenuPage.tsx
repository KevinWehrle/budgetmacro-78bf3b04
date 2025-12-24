import { Link } from "react-router-dom";
import { Settings, Shield, Info, Target, ChevronRight } from "lucide-react";

const menuItems = [
  {
    icon: Target,
    label: "Set Goals",
    description: "Customize your daily targets",
    href: "#",
    disabled: true,
  },
  {
    icon: Settings,
    label: "Settings",
    description: "App preferences",
    href: "#",
    disabled: true,
  },
  {
    icon: Shield,
    label: "Privacy Policy",
    description: "How we handle your data",
    href: "/privacy",
    disabled: false,
  },
  {
    icon: Info,
    label: "About",
    description: "Learn more about MacroMoney",
    href: "/about",
    disabled: false,
  },
];

export function MenuPage() {
  return (
    <div className="px-4 py-6 slide-up">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        <span className="text-primary neon-glow-text">Menu</span>
      </h1>

      <div className="space-y-3">
        {menuItems.map((item) => {
          const content = (
            <div
              className={`cyber-card p-4 flex items-center gap-4 ${
                item.disabled ? "opacity-50" : "hover:border-primary/50"
              } transition-colors`}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          );

          if (item.disabled) {
            return <div key={item.label}>{content}</div>;
          }

          return (
            <Link key={item.label} to={item.href}>
              {content}
            </Link>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          MacroMoney v1.0.0
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Built for broke & buff students 💪
        </p>
      </div>
    </div>
  );
}
