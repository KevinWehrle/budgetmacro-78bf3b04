import { TrendingUp, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

interface ValueFood {
  name: string;
  proteinPerDollar: number;
  protein: number;
  cost: number;
  emoji: string;
  image?: string;
  keywords: string[];
}

const valueFoods: ValueFood[] = [
  { name: "Eggs (dozen)", proteinPerDollar: 24, protein: 72, cost: 3.0, emoji: "🥚", image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=100&h=100&fit=crop", keywords: ["egg", "eggs", "dozen", "breakfast", "omelette", "scrambled"] },
  { name: "Chicken Breast (lb)", proteinPerDollar: 22, protein: 110, cost: 5.0, emoji: "🍗", image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=100&h=100&fit=crop", keywords: ["chicken", "breast", "poultry", "meat", "grilled"] },
  { name: "Canned Tuna", proteinPerDollar: 22, protein: 22, cost: 1.0, emoji: "🐟", image: "https://images.unsplash.com/photo-1559736322-98ce4f9a6e1e?w=100&h=100&fit=crop", keywords: ["tuna", "fish", "canned", "seafood"] },
  { name: "Greek Yogurt", proteinPerDollar: 17, protein: 17, cost: 1.0, emoji: "🥛", keywords: ["yogurt", "greek", "dairy", "breakfast", "snack"] },
  { name: "Cottage Cheese", proteinPerDollar: 14, protein: 28, cost: 2.0, emoji: "🧀", keywords: ["cottage", "cheese", "dairy"] },
  { name: "Protein Powder (serving)", proteinPerDollar: 31, protein: 25, cost: 0.8, emoji: "💪", keywords: ["protein", "powder", "whey", "shake", "supplement"] },
  { name: "Black Beans (can)", proteinPerDollar: 15, protein: 15, cost: 1.0, emoji: "🫘", keywords: ["beans", "black", "legume", "vegan", "vegetarian"] },
  { name: "Lentils (dry, 1 cup)", proteinPerDollar: 36, protein: 18, cost: 0.5, emoji: "🥣", keywords: ["lentils", "legume", "vegan", "vegetarian", "soup"] },
  { name: "Peanut Butter (2 tbsp)", proteinPerDollar: 17.5, protein: 7, cost: 0.4, emoji: "🥜", keywords: ["peanut", "butter", "nut", "spread", "snack"] },
  { name: "Milk (gallon)", proteinPerDollar: 24, protein: 96, cost: 4.0, emoji: "🥛", keywords: ["milk", "dairy", "drink", "beverage"] },
  { name: "Tofu (block)", proteinPerDollar: 20, protein: 40, cost: 2.0, emoji: "🍲", keywords: ["tofu", "soy", "vegan", "vegetarian", "plant"] },
  { name: "Sardines (can)", proteinPerDollar: 15, protein: 23, cost: 1.5, emoji: "🐠", keywords: ["sardines", "fish", "canned", "seafood", "omega"] },
];

// Sort by protein per dollar
const sortedFoods = [...valueFoods].sort(
  (a, b) => b.proteinPerDollar - a.proteinPerDollar
);

export function ValueFoods() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return sortedFoods;
    
    const query = searchQuery.toLowerCase().trim();
    return sortedFoods.filter((food) => {
      const nameMatch = food.name.toLowerCase().includes(query);
      const keywordMatch = food.keywords.some((keyword) => 
        keyword.includes(query) || query.includes(keyword)
      );
      return nameMatch || keywordMatch;
    });
  }, [searchQuery]);

  return (
    <div className="px-4 py-6 slide-up">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-primary animate-pulse-glow" />
        <h1 className="text-2xl font-bold text-foreground">
          Value <span className="text-primary neon-glow-text">Foods</span>
        </h1>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Ranked by protein per dollar. Get the most gains for your budget.
      </p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search foods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/30 border-border/50 focus:border-primary"
        />
      </div>

      <div className="space-y-3">
        {filteredFoods.length === 0 ? (
          <div className="cyber-card p-6 text-center">
            <p className="text-muted-foreground">No foods found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredFoods.map((food) => {
            const originalIndex = sortedFoods.indexOf(food);
            const isTopThree = originalIndex < 3;
            const rankLabels = ["1st", "2nd", "3rd"];
            
            return (
              <div
                key={food.name}
                className={`cyber-card p-4 flex items-center gap-4 ${isTopThree ? "border-primary/30" : ""}`}
              >
                {isTopThree && food.image ? (
                  <div className="relative">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {rankLabels[originalIndex]}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted/50 text-xl">
                    {food.emoji}
                  </div>
                )}
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
            );
          })
        )}
      </div>
    </div>
  );
}
