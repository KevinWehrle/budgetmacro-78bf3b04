import { useEffect, useState } from "react";

interface ProgressRingProps {
  progress: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  value: string;
  variant: "calories" | "protein" | "money";
}

const variantColors = {
  calories: {
    stroke: "stroke-progress-calories",
    glow: "progress-ring-glow-calories",
    text: "text-progress-calories",
  },
  protein: {
    stroke: "stroke-progress-protein",
    glow: "progress-ring-glow-protein",
    text: "text-progress-protein",
  },
  money: {
    stroke: "stroke-progress-money",
    glow: "progress-ring-glow-money",
    text: "text-progress-money",
  },
};

export function ProgressRing({
  progress,
  max,
  size = 100,
  strokeWidth = 8,
  label,
  value,
  variant,
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((animatedProgress / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const colors = variantColors[variant];

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className={`-rotate-90 ${colors.glow}`}
          width={size}
          height={size}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={`${colors.stroke} transition-all duration-1000 ease-out`}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-bold ${colors.text}`}>{value}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
