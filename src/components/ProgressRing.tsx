import { useEffect, useState } from "react";

interface ProgressRingProps {
  progress: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  value: string;
  variant: "calories" | "protein" | "money";
  remaining?: string;
  sizeVariant?: "default" | "large";
}

const variantColors = {
  calories: {
    gradient: ["#F59E0B", "#FB923C"], // Amber to orange
    text: "text-progress-calories",
  },
  protein: {
    gradient: ["#059669", "#10B981"], // Forest green to emerald
    text: "text-progress-protein",
  },
  money: {
    gradient: ["#7C3AED", "#8B5CF6"], // Violet to purple
    text: "text-progress-money",
  },
};

export function ProgressRing({
  progress,
  max,
  size: customSize,
  strokeWidth: customStrokeWidth,
  label,
  value,
  variant,
  remaining,
  sizeVariant = "default",
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Determine size based on sizeVariant
  const size = customSize ?? (sizeVariant === "large" ? 140 : 100);
  const strokeWidth = customStrokeWidth ?? (sizeVariant === "large" ? 12 : 10);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((animatedProgress / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const colors = variantColors[variant];
  const gradientId = `${variant}Gradient`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="-rotate-90"
          width={size}
          height={size}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.gradient[0]} />
              <stop offset="100%" stopColor={colors.gradient[1]} />
            </linearGradient>
          </defs>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          {/* Progress ring with gradient */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            stroke={`url(#${gradientId})`}
            className="transition-all duration-1000 ease-out"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-bold text-foreground`}>{value}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      {remaining && (
        <span className={`text-xs font-semibold ${colors.text}`}>
          {remaining}
        </span>
      )}
    </div>
  );
}
