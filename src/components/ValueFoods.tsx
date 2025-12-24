import { TrendingUp } from "lucide-react";

interface ValueFood {
  name: string;
  proteinPerDollar: number;
  protein: number;
  cost: number;
  emoji: string;
}

const valueFoods: ValueFood[] = [
  { name: "Eggs (dozen)", proteinPerDollar: 24, protein: 72, cost: 3.0, emoji: "🥚" },
  { name: "Chicken Breast (lb)", proteinPerDollar: 22, protein: 110, cost: 5.0, emoji: "🍗" },
  { name: "Canned Tuna", proteinPerDollar: 22, protein: 22, cost: 1.0, emoji: "🐟" },
  { name: "Greek Yogurt", proteinPerDollar: 17, protein: 17, cost: 1.0, emoji: "🥛" },
  { name: "Cottage Cheese", proteinPerDollar: 14, protein: 28, cost: 2.0, emoji: "🧀" },
  { name: "Protein Powder (serving)", proteinPerDollar: 31, protein: 25, cost: 0.8, emoji: "💪" },
  { name: "Black Beans (can)", proteinPerDollar: 15, protein: 15, cost: 1.0, emoji: "🫘" },
  { name: "Lentils (dry, 1 cup)", proteinPerDollar: 36, protein: 18, cost: 0.5, emoji: "🥣" },
  { name: "Peanut Butter (2 tbsp)", proteinPerDollar: 17.5, protein: 7, cost: 0.4, emoji: "🥜" },
  { name: "Milk (gallon)", proteinPerDollar: 24, protein: 96, cost: 4.0, emoji: "🥛" },
  { name: "Tofu (block)", proteinPerDollar: 20, protein: 40, cost: 2.0, emoji: "🍲" },
  { name: "Sardines (can)", proteinPerDollar: 15, protein: 23, cost: 1.5, emoji: "🐠" },
];

// Sort by protein per dollar
const sortedFoods = [...valueFoods].sort(
  (a, b) => b.proteinPerDollar - a.proteinPerDollar
);

export function ValueFoods() {
  return (
    <div className="px-4 py-6 slide-up">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-primary animate-pulse-glow" />
        <h1 className="text-2xl font-bold text-foreground">
          Value <span className="text-primary neon-glow-text">Foods</span>
        </h1>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Ranked by protein per dollar. Get the most gains for your budget! 💸
      </p>

      <div className="space-y-3">
        {sortedFoods.map((food, index) => (
          <div
            key={food.name}
            className="cyber-card p-4 flex items-center gap-4"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50 text-xl">
              {index < 3 ? ["🥇", "🥈", "🥉"][index] : food.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {food.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {food.protein}g protein • ${food.cost.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary neon-glow-text">
                {food.proteinPerDollar}g
              </p>
              <p className="text-xs text-muted-foreground">per $1</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
