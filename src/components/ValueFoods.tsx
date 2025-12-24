import { TrendingUp, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

interface ValueFood {
  name: string;
  proteinPerDollar: number;
  protein: number;
  cost: number;
  keywords: string[];
}

const valueFoods: ValueFood[] = [
  { name: "Lentils (dry, 1 cup)", proteinPerDollar: 36, protein: 18, cost: 0.5, keywords: ["lentils", "legume", "vegan", "vegetarian", "soup", "dal", "curry"] },
  { name: "Split Peas (dry, 1 cup)", proteinPerDollar: 32, protein: 16, cost: 0.5, keywords: ["peas", "split", "legume", "soup", "vegan"] },
  { name: "Protein Powder (serving)", proteinPerDollar: 31, protein: 25, cost: 0.8, keywords: ["protein", "powder", "whey", "shake", "supplement", "gym", "workout"] },
  { name: "Soy Protein Powder", proteinPerDollar: 30, protein: 25, cost: 0.85, keywords: ["soy", "protein", "vegan", "plant", "powder"] },
  { name: "Casein Powder", proteinPerDollar: 28, protein: 25, cost: 0.9, keywords: ["casein", "protein", "slow release", "night", "supplement"] },
  { name: "Pea Protein Powder", proteinPerDollar: 28, protein: 24, cost: 0.85, keywords: ["pea", "protein", "vegan", "plant", "powder"] },
  { name: "Whole Chicken (lb)", proteinPerDollar: 28, protein: 84, cost: 3.0, keywords: ["chicken", "whole", "roast", "rotisserie"] },
  { name: "Chicken Drumsticks (lb)", proteinPerDollar: 25, protein: 75, cost: 3.0, keywords: ["chicken", "drumsticks", "legs", "poultry"] },
  { name: "Eggs (dozen)", proteinPerDollar: 24, protein: 72, cost: 3.0, keywords: ["egg", "eggs", "dozen", "breakfast", "omelette", "scrambled", "boiled", "fried"] },
  { name: "Milk (gallon)", proteinPerDollar: 24, protein: 96, cost: 4.0, keywords: ["milk", "dairy", "drink", "beverage", "whole", "skim"] },
  { name: "Chicken Liver (lb)", proteinPerDollar: 24, protein: 72, cost: 3.0, keywords: ["liver", "chicken", "organ"] },
  { name: "Chicken Breast (lb)", proteinPerDollar: 22, protein: 110, cost: 5.0, keywords: ["chicken", "breast", "poultry", "meat", "grilled", "baked"] },
  { name: "Canned Tuna", proteinPerDollar: 22, protein: 22, cost: 1.0, keywords: ["tuna", "fish", "canned", "seafood", "sandwich"] },
  { name: "Tofu (block)", proteinPerDollar: 20, protein: 40, cost: 2.0, keywords: ["tofu", "soy", "vegan", "vegetarian", "plant", "stir fry"] },
  { name: "Turkey (ground, lb)", proteinPerDollar: 20, protein: 100, cost: 5.0, keywords: ["turkey", "ground", "meat", "lean", "poultry"] },
  { name: "Chicken Thighs (lb)", proteinPerDollar: 20, protein: 80, cost: 4.0, keywords: ["chicken", "thighs", "dark meat", "poultry"] },
  { name: "Beef Liver (lb)", proteinPerDollar: 20, protein: 80, cost: 4.0, keywords: ["liver", "beef", "organ", "iron"] },
  { name: "Pork Shoulder (lb)", proteinPerDollar: 20, protein: 60, cost: 3.0, keywords: ["pork", "shoulder", "pulled pork", "bbq", "slow cook"] },
  { name: "Chickpeas (can)", proteinPerDollar: 19, protein: 19, cost: 1.0, keywords: ["chickpeas", "garbanzo", "hummus", "legume", "vegan", "falafel"] },
  { name: "Peanut Butter (2 tbsp)", proteinPerDollar: 17.5, protein: 7, cost: 0.4, keywords: ["peanut", "butter", "nut", "spread", "snack", "sandwich", "pb"] },
  { name: "Greek Yogurt", proteinPerDollar: 17, protein: 17, cost: 1.0, keywords: ["yogurt", "greek", "dairy", "breakfast", "snack"] },
  { name: "Edamame (cup)", proteinPerDollar: 17, protein: 17, cost: 1.0, keywords: ["edamame", "soy", "beans", "snack", "vegan"] },
  { name: "Tilapia (lb)", proteinPerDollar: 16, protein: 80, cost: 5.0, keywords: ["tilapia", "fish", "seafood", "white fish", "baked"] },
  { name: "Ham (lb)", proteinPerDollar: 16, protein: 80, cost: 5.0, keywords: ["ham", "pork", "deli", "sandwich", "meat"] },
  { name: "Black Beans (can)", proteinPerDollar: 15, protein: 15, cost: 1.0, keywords: ["beans", "black", "legume", "vegan", "burrito", "mexican"] },
  { name: "Sardines (can)", proteinPerDollar: 15, protein: 23, cost: 1.5, keywords: ["sardines", "fish", "canned", "seafood", "omega"] },
  { name: "Kidney Beans (can)", proteinPerDollar: 15, protein: 15, cost: 1.0, keywords: ["kidney", "beans", "legume", "chili", "vegan"] },
  { name: "Beef (ground, lb)", proteinPerDollar: 15, protein: 75, cost: 5.0, keywords: ["beef", "ground", "meat", "burger", "hamburger"] },
  { name: "Navy Beans (can)", proteinPerDollar: 15, protein: 15, cost: 1.0, keywords: ["navy", "beans", "white", "soup"] },
  { name: "Cottage Cheese", proteinPerDollar: 14, protein: 28, cost: 2.0, keywords: ["cottage", "cheese", "dairy", "snack"] },
  { name: "Pinto Beans (can)", proteinPerDollar: 14, protein: 14, cost: 1.0, keywords: ["pinto", "beans", "legume", "refried", "mexican", "burrito"] },
  { name: "Pork Chops (lb)", proteinPerDollar: 14, protein: 70, cost: 5.0, keywords: ["pork", "chops", "meat", "grilled"] },
  { name: "Pork Tenderloin (lb)", proteinPerDollar: 14, protein: 84, cost: 6.0, keywords: ["pork", "tenderloin", "lean", "roast"] },
  { name: "Rotisserie Chicken", proteinPerDollar: 14, protein: 100, cost: 7.0, keywords: ["rotisserie", "chicken", "whole", "prepared", "costco"] },
  { name: "Chicken Wings (lb)", proteinPerDollar: 14, protein: 70, cost: 5.0, keywords: ["chicken", "wings", "buffalo"] },
  { name: "Pollock (lb)", proteinPerDollar: 14, protein: 70, cost: 5.0, keywords: ["pollock", "fish", "white fish"] },
  { name: "Anchovies (can)", proteinPerDollar: 14, protein: 21, cost: 1.5, keywords: ["anchovies", "fish", "canned", "pizza"] },
  { name: "Oats (1 cup dry)", proteinPerDollar: 13, protein: 13, cost: 1.0, keywords: ["oats", "oatmeal", "breakfast", "fiber"] },
  { name: "Canned Salmon", proteinPerDollar: 13, protein: 39, cost: 3.0, keywords: ["salmon", "fish", "canned", "seafood", "omega"] },
  { name: "Egg Whites (carton)", proteinPerDollar: 13, protein: 50, cost: 4.0, keywords: ["egg", "whites", "liquid", "low fat", "protein"] },
  { name: "Tempeh (block)", proteinPerDollar: 12, protein: 30, cost: 2.5, keywords: ["tempeh", "soy", "vegan", "vegetarian", "fermented"] },
  { name: "Seitan (4 oz)", proteinPerDollar: 12, protein: 24, cost: 2.0, keywords: ["seitan", "wheat", "gluten", "vegan", "meat substitute"] },
  { name: "Mackerel (can)", proteinPerDollar: 12, protein: 18, cost: 1.5, keywords: ["mackerel", "fish", "canned", "omega", "seafood"] },
  { name: "Deli Turkey (lb)", proteinPerDollar: 11, protein: 88, cost: 8.0, keywords: ["turkey", "deli", "sandwich", "sliced", "lunch meat"] },
  { name: "Beef Roast (lb)", proteinPerDollar: 11, protein: 80, cost: 7.0, keywords: ["roast", "beef", "pot roast", "slow cook"] },
  { name: "Catfish (lb)", proteinPerDollar: 11, protein: 66, cost: 6.0, keywords: ["catfish", "fish", "fried", "southern"] },
  { name: "Skyr (container)", proteinPerDollar: 11, protein: 17, cost: 1.5, keywords: ["skyr", "icelandic", "yogurt", "dairy"] },
  { name: "Clams (can)", proteinPerDollar: 11, protein: 22, cost: 2.0, keywords: ["clams", "shellfish", "seafood", "chowder"] },
  { name: "Almonds (1 oz)", proteinPerDollar: 10, protein: 6, cost: 0.6, keywords: ["almonds", "nuts", "snack"] },
  { name: "Cheddar Cheese (oz)", proteinPerDollar: 10, protein: 7, cost: 0.7, keywords: ["cheddar", "cheese", "dairy", "snack"] },
  { name: "Shrimp (lb)", proteinPerDollar: 10, protein: 80, cost: 8.0, keywords: ["shrimp", "seafood", "shellfish", "prawns"] },
  { name: "Sirloin Steak (lb)", proteinPerDollar: 10, protein: 80, cost: 8.0, keywords: ["sirloin", "steak", "beef", "grilled"] },
  { name: "Deli Chicken (lb)", proteinPerDollar: 10, protein: 80, cost: 8.0, keywords: ["chicken", "deli", "sandwich", "sliced", "lunch meat"] },
  { name: "Hot Dogs (pack)", proteinPerDollar: 10, protein: 40, cost: 4.0, keywords: ["hot dog", "frankfurter", "bbq"] },
  { name: "Sausage Links (lb)", proteinPerDollar: 10, protein: 50, cost: 5.0, keywords: ["sausage", "pork", "breakfast", "links"] },
  { name: "Cod (lb)", proteinPerDollar: 10, protein: 80, cost: 8.0, keywords: ["cod", "fish", "white fish", "seafood", "baked"] },
  { name: "Haddock (lb)", proteinPerDollar: 10, protein: 80, cost: 8.0, keywords: ["haddock", "fish", "white fish", "fish and chips"] },
  { name: "Flounder (lb)", proteinPerDollar: 10, protein: 60, cost: 6.0, keywords: ["flounder", "fish", "baked"] },
  { name: "Protein Milk", proteinPerDollar: 9, protein: 30, cost: 3.5, keywords: ["protein", "milk", "fairlife", "shake"] },
  { name: "Ricotta Cheese (cup)", proteinPerDollar: 9, protein: 28, cost: 3.0, keywords: ["ricotta", "cheese", "dairy", "italian", "lasagna"] },
  { name: "Swiss Cheese (oz)", proteinPerDollar: 9, protein: 8, cost: 0.9, keywords: ["swiss", "cheese", "dairy", "sandwich"] },
  { name: "Mozzarella (oz)", proteinPerDollar: 9, protein: 6, cost: 0.65, keywords: ["mozzarella", "cheese", "dairy", "pizza", "italian"] },
  { name: "Provolone (oz)", proteinPerDollar: 9, protein: 7, cost: 0.8, keywords: ["provolone", "cheese", "italian", "sandwich"] },
  { name: "Trout (lb)", proteinPerDollar: 9, protein: 72, cost: 8.0, keywords: ["trout", "fish", "freshwater"] },
  { name: "Flank Steak (lb)", proteinPerDollar: 9, protein: 80, cost: 9.0, keywords: ["flank", "steak", "beef", "fajitas"] },
  { name: "Corned Beef (lb)", proteinPerDollar: 9, protein: 70, cost: 8.0, keywords: ["corned beef", "deli", "reuben"] },
  { name: "Deli Roast Beef (lb)", proteinPerDollar: 9, protein: 90, cost: 10.0, keywords: ["roast beef", "deli", "sandwich", "sliced"] },
  { name: "Quinoa (dry, 1 cup)", proteinPerDollar: 8, protein: 24, cost: 3.0, keywords: ["quinoa", "grain", "complete protein", "vegan", "gluten free"] },
  { name: "Bacon (lb)", proteinPerDollar: 8, protein: 40, cost: 5.0, keywords: ["bacon", "pork", "breakfast", "crispy"] },
  { name: "Lamb (lb)", proteinPerDollar: 8, protein: 80, cost: 10.0, keywords: ["lamb", "meat", "roast"] },
  { name: "String Cheese", proteinPerDollar: 8, protein: 7, cost: 0.9, keywords: ["string", "cheese", "snack", "mozzarella"] },
  { name: "Pastrami (lb)", proteinPerDollar: 8, protein: 80, cost: 10.0, keywords: ["pastrami", "deli", "sandwich", "smoked"] },
  { name: "Sole (lb)", proteinPerDollar: 8, protein: 60, cost: 8.0, keywords: ["sole", "fish", "delicate"] },
  { name: "Mussels (lb)", proteinPerDollar: 8, protein: 40, cost: 5.0, keywords: ["mussels", "shellfish", "seafood", "steamed"] },
  { name: "Sunflower Seeds (oz)", proteinPerDollar: 8, protein: 6, cost: 0.75, keywords: ["sunflower", "seeds", "snack"] },
  { name: "Crab (can)", proteinPerDollar: 8, protein: 24, cost: 3.0, keywords: ["crab", "shellfish", "seafood"] },
  { name: "Cornish Hen (each)", proteinPerDollar: 8, protein: 40, cost: 5.0, keywords: ["cornish", "hen", "poultry", "roast"] },
  { name: "Skirt Steak (lb)", proteinPerDollar: 8, protein: 80, cost: 10.0, keywords: ["skirt", "steak", "beef", "carne asada"] },
  { name: "Duck (lb)", proteinPerDollar: 8, protein: 80, cost: 10.0, keywords: ["duck", "poultry", "meat"] },
  { name: "Protein Bar", proteinPerDollar: 7, protein: 20, cost: 3.0, keywords: ["protein", "bar", "snack", "portable", "gym"] },
  { name: "Hemp Seeds (3 tbsp)", proteinPerDollar: 7, protein: 10, cost: 1.5, keywords: ["hemp", "seeds", "complete protein", "vegan", "omega"] },
  { name: "Pepperoni (oz)", proteinPerDollar: 7, protein: 5, cost: 0.7, keywords: ["pepperoni", "pizza", "italian", "snack"] },
  { name: "Almond Butter (2 tbsp)", proteinPerDollar: 7, protein: 7, cost: 1.0, keywords: ["almond", "butter", "nut", "spread"] },
  { name: "Parmesan (oz)", proteinPerDollar: 7, protein: 10, cost: 1.5, keywords: ["parmesan", "cheese", "italian", "aged"] },
  { name: "Venison (lb)", proteinPerDollar: 7, protein: 80, cost: 12.0, keywords: ["venison", "deer", "game", "meat", "lean"] },
  { name: "Sunflower Butter (2 tbsp)", proteinPerDollar: 7, protein: 7, cost: 1.0, keywords: ["sunflower", "butter", "seed", "nut free"] },
  { name: "Ribeye Steak (lb)", proteinPerDollar: 6, protein: 80, cost: 14.0, keywords: ["ribeye", "steak", "beef", "grilled", "premium"] },
  { name: "Feta Cheese (oz)", proteinPerDollar: 6, protein: 4, cost: 0.7, keywords: ["feta", "cheese", "greek", "salad"] },
  { name: "Salami (oz)", proteinPerDollar: 6, protein: 5, cost: 0.8, keywords: ["salami", "deli", "italian"] },
  { name: "Pumpkin Seeds (oz)", proteinPerDollar: 6, protein: 9, cost: 1.5, keywords: ["pumpkin", "seeds", "snack"] },
  { name: "Bison (lb)", proteinPerDollar: 6, protein: 80, cost: 14.0, keywords: ["bison", "buffalo", "meat", "lean"] },
  { name: "Scallops (lb)", proteinPerDollar: 6, protein: 60, cost: 10.0, keywords: ["scallops", "shellfish", "seafood", "seared"] },
  { name: "Chia Seeds (2 tbsp)", proteinPerDollar: 5, protein: 5, cost: 1.0, keywords: ["chia", "seeds", "superfood", "omega", "vegan"] },
  { name: "Tahini (2 tbsp)", proteinPerDollar: 5, protein: 5, cost: 1.0, keywords: ["tahini", "sesame", "hummus"] },
  { name: "Goat Cheese (oz)", proteinPerDollar: 5, protein: 5, cost: 1.0, keywords: ["goat", "cheese", "salad"] },
  { name: "Blue Cheese (oz)", proteinPerDollar: 5, protein: 6, cost: 1.2, keywords: ["blue", "cheese", "salad"] },
  { name: "Halibut (lb)", proteinPerDollar: 5, protein: 80, cost: 16.0, keywords: ["halibut", "fish", "white fish", "seafood"] },
  { name: "Beef Jerky (oz)", proteinPerDollar: 5, protein: 10, cost: 2.0, keywords: ["jerky", "beef", "snack", "dried", "portable"] },
  { name: "Turkey Jerky (oz)", proteinPerDollar: 5, protein: 10, cost: 2.0, keywords: ["jerky", "turkey", "snack", "dried", "lean"] },
  { name: "Cashew Butter (2 tbsp)", proteinPerDollar: 5, protein: 5, cost: 1.0, keywords: ["cashew", "butter", "nut", "spread"] },
  { name: "Bone Broth (cup)", proteinPerDollar: 5, protein: 10, cost: 2.0, keywords: ["bone", "broth", "collagen", "soup"] },
  { name: "Prosciutto (oz)", proteinPerDollar: 4, protein: 6, cost: 1.5, keywords: ["prosciutto", "italian", "ham"] },
  { name: "Oysters (dozen)", proteinPerDollar: 4, protein: 24, cost: 6.0, keywords: ["oysters", "shellfish", "raw", "seafood"] },
  { name: "Pistachios (oz)", proteinPerDollar: 4, protein: 6, cost: 1.5, keywords: ["pistachios", "nuts", "snack"] },
  { name: "Cashews (oz)", proteinPerDollar: 4, protein: 5, cost: 1.25, keywords: ["cashews", "nuts", "snack", "creamy"] },
  { name: "Walnuts (oz)", proteinPerDollar: 4, protein: 4, cost: 1.0, keywords: ["walnuts", "nuts", "omega", "brain"] },
  { name: "Brie (oz)", proteinPerDollar: 4, protein: 6, cost: 1.5, keywords: ["brie", "cheese", "french", "soft"] },
  { name: "Mixed Nuts (oz)", proteinPerDollar: 4, protein: 5, cost: 1.25, keywords: ["mixed", "nuts", "snack", "trail mix"] },
  { name: "Trail Mix (oz)", proteinPerDollar: 4, protein: 4, cost: 1.0, keywords: ["trail", "mix", "hiking", "snack", "nuts"] },
  { name: "Smoked Salmon (4 oz)", proteinPerDollar: 4, protein: 24, cost: 6.0, keywords: ["smoked", "salmon", "lox", "bagel", "brunch"] },
  { name: "Lobster (lb)", proteinPerDollar: 4, protein: 80, cost: 20.0, keywords: ["lobster", "shellfish", "seafood", "luxury"] },
  { name: "Brazil Nuts (oz)", proteinPerDollar: 3, protein: 4, cost: 1.5, keywords: ["brazil", "nuts", "selenium"] },
  { name: "Hazelnuts (oz)", proteinPerDollar: 3, protein: 4, cost: 1.25, keywords: ["hazelnuts", "nuts"] },
  { name: "Cream Cheese (oz)", proteinPerDollar: 3, protein: 2, cost: 0.6, keywords: ["cream", "cheese", "bagel", "spread"] },
  { name: "Burrata (4 oz)", proteinPerDollar: 3, protein: 12, cost: 4.0, keywords: ["burrata", "cheese", "italian", "creamy"] },
  { name: "Pecans (oz)", proteinPerDollar: 2, protein: 3, cost: 1.5, keywords: ["pecans", "nuts", "pie", "southern"] },
];

// Sort by protein per dollar
const sortedFoods = [...valueFoods].sort(
  (a, b) => b.proteinPerDollar - a.proteinPerDollar
);

// Helper function to find similar foods based on keywords
function findSimilarFoods(query: string, excludeNames: string[]): ValueFood[] {
  const queryWords = query.toLowerCase().split(/\s+/);
  
  return sortedFoods
    .filter((food) => !excludeNames.includes(food.name))
    .map((food) => {
      let score = 0;
      const nameWords = food.name.toLowerCase();
      const allKeywords = [...food.keywords, ...nameWords.split(/\s+/)];
      
      queryWords.forEach((word) => {
        if (word.length < 2) return;
        allKeywords.forEach((keyword) => {
          if (keyword.includes(word) || word.includes(keyword)) {
            score += 1;
          }
        });
      });
      
      return { food, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ food }) => food);
}

export function ValueFoods() {
  const [searchQuery, setSearchQuery] = useState("");

  const { exactMatches, similarFoods } = useMemo(() => {
    if (!searchQuery.trim()) {
      return { exactMatches: sortedFoods, similarFoods: [] };
    }
    
    const query = searchQuery.toLowerCase().trim();
    const exact = sortedFoods.filter((food) => {
      const nameMatch = food.name.toLowerCase().includes(query);
      const keywordMatch = food.keywords.some((keyword) => 
        keyword.includes(query) || query.includes(keyword)
      );
      return nameMatch || keywordMatch;
    });
    
    const exactNames = exact.map((f) => f.name);
    const similar = findSimilarFoods(query, exactNames);
    
    return { exactMatches: exact, similarFoods: similar };
  }, [searchQuery]);

  const renderFoodItem = (food: ValueFood) => {
    return (
      <div
        key={food.name}
        className="cyber-card p-4 flex items-center gap-4"
      >
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
  };

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
        {searchQuery.trim() && (
          <p className="text-sm text-muted-foreground mb-2">
            {exactMatches.length} {exactMatches.length === 1 ? "result" : "results"} found
          </p>
        )}
        
        {exactMatches.length === 0 && searchQuery.trim() ? (
          <>
            <div className="cyber-card p-4 text-center mb-4">
              <p className="text-muted-foreground">0 results found for "{searchQuery}"</p>
            </div>
            {similarFoods.length > 0 && (
              <>
                <p className="text-sm font-medium text-foreground mb-2">Similar foods:</p>
                {similarFoods.map((food) => renderFoodItem(food))}
              </>
            )}
          </>
        ) : (
          <>
            {exactMatches.map((food) => renderFoodItem(food))}
            
            {searchQuery.trim() && similarFoods.length > 0 && (
              <>
                <p className="text-sm font-medium text-foreground mt-4 pt-4 border-t border-border/50 mb-2">
                  Similar foods:
                </p>
                {similarFoods.map((food) => renderFoodItem(food))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
