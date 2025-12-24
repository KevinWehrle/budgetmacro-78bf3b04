import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Sparkles, Loader2, Flame, Dumbbell, DollarSign, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

interface FoodEstimate {
  description: string;
  calories: number;
  protein: number;
  cost: number;
}

export function FoodEntry() {
  const { addFoodLog } = useApp();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [estimate, setEstimate] = useState<FoodEstimate | null>(null);
  const [customCost, setCustomCost] = useState("");

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast.error("Please describe what you ate");
      return;
    }

    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const mockEstimates = estimateNutrition(input);
      setEstimate({
        description: input,
        ...mockEstimates,
      });
      setCustomCost("");
      setShowConfirm(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleConfirm = () => {
    if (estimate) {
      const finalCost = customCost.trim() ? parseFloat(customCost) : estimate.cost;
      addFoodLog({
        ...estimate,
        cost: isNaN(finalCost) ? estimate.cost : finalCost,
      });
      toast.success("Food logged!", {
        description: `${estimate.protein}g protein • $${(isNaN(finalCost) ? estimate.cost : finalCost).toFixed(2)}`,
      });
      setInput("");
      setEstimate(null);
      setCustomCost("");
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setEstimate(null);
    setCustomCost("");
  };

  // More realistic estimation logic based on keywords
  const estimateNutrition = (text: string) => {
    const lower = text.toLowerCase();
    let calories = 0;
    let protein = 0;
    let cost = 0;

    // Egg detection (1 large egg = 72 cal, 6g protein, ~$0.35)
    const eggMatch = lower.match(/(\d+)?\s*eggs?/);
    if (eggMatch) {
      const count = parseInt(eggMatch[1]) || 1;
      calories += count * 72;
      protein += count * 6;
      cost += count * 0.35;
    }

    // Chicken breast (6oz = 280 cal, 53g protein, ~$2.00)
    if (lower.includes("chicken breast")) {
      const portions = lower.includes("2") ? 2 : 1;
      calories += portions * 280;
      protein += portions * 53;
      cost += portions * 2.00;
    } else if (lower.includes("chicken")) {
      // Generic chicken (thigh/leg/etc - 6oz = 320 cal, 40g protein)
      const portions = lower.includes("2") ? 2 : 1;
      calories += portions * 320;
      protein += portions * 40;
      cost += portions * 1.75;
    }

    // Canned tuna (5oz can = 120 cal, 27g protein, ~$1.75)
    if (lower.includes("tuna")) {
      const cans = lower.includes("2") ? 2 : 1;
      calories += cans * 120;
      protein += cans * 27;
      cost += cans * 1.75;
    }

    // Greek yogurt (6oz container = 100 cal, 17g protein, ~$1.40)
    if (lower.includes("greek yogurt")) {
      calories += 100;
      protein += 17;
      cost += 1.40;
    } else if (lower.includes("yogurt")) {
      // Regular yogurt (6oz = 150 cal, 6g protein)
      calories += 150;
      protein += 6;
      cost += 1.00;
    }

    // Protein shake/powder (1 scoop = 120 cal, 24g protein, ~$1.25)
    if (lower.includes("protein shake") || lower.includes("protein powder") || lower.includes("whey")) {
      calories += 120;
      protein += 24;
      cost += 1.25;
    }

    // Milk (1 cup whole = 150 cal, 8g protein / skim = 90 cal, 8g protein)
    if (lower.includes("skim milk") || lower.includes("nonfat milk")) {
      calories += 90;
      protein += 8;
      cost += 0.35;
    } else if (lower.includes("milk")) {
      calories += 150;
      protein += 8;
      cost += 0.35;
    }

    // Rice (1 cup cooked white = 205 cal, 4g protein / brown = 215 cal, 5g protein)
    if (lower.includes("brown rice")) {
      calories += 215;
      protein += 5;
      cost += 0.25;
    } else if (lower.includes("rice")) {
      calories += 205;
      protein += 4;
      cost += 0.20;
    }

    // Beans/lentils (1 cup cooked = 230 cal, 15g protein)
    if (lower.includes("beans") || lower.includes("lentils")) {
      calories += 230;
      protein += 15;
      cost += 0.50;
    }

    // Peanut butter (2 tbsp = 190 cal, 8g protein)
    if (lower.includes("peanut butter")) {
      calories += 190;
      protein += 8;
      cost += 0.30;
    }

    // Oatmeal (1 cup cooked = 160 cal, 6g protein)
    if (lower.includes("oatmeal") || lower.includes("oats")) {
      calories += 160;
      protein += 6;
      cost += 0.25;
    }

    // Ground beef (4oz 80/20 = 290 cal, 19g protein / 90/10 = 200 cal, 23g protein)
    if (lower.includes("lean beef") || lower.includes("ground beef 90")) {
      calories += 200;
      protein += 23;
      cost += 2.00;
    } else if (lower.includes("ground beef") || lower.includes("beef")) {
      calories += 290;
      protein += 19;
      cost += 1.75;
    }

    // Steak (6oz ribeye = 420 cal, 40g protein / sirloin = 320 cal, 46g protein)
    if (lower.includes("steak") || lower.includes("ribeye") || lower.includes("sirloin")) {
      calories += 370;
      protein += 43;
      cost += 5.00;
    }

    // Cottage cheese (1 cup = 220 cal, 28g protein)
    if (lower.includes("cottage cheese")) {
      calories += 220;
      protein += 28;
      cost += 0.85;
    }

    // Bread (1 slice = 80 cal, 3g protein)
    if (lower.includes("bread") || lower.includes("toast")) {
      const slices = lower.includes("2") ? 2 : 1;
      calories += slices * 80;
      protein += slices * 3;
      cost += slices * 0.20;
    }

    // Banana (1 medium = 105 cal, 1g protein)
    if (lower.includes("banana")) {
      const count = lower.match(/(\d+)\s*banana/) ? parseInt(lower.match(/(\d+)\s*banana/)![1]) : 1;
      calories += count * 105;
      protein += count * 1;
      cost += count * 0.25;
    }

    // Apple (1 medium = 95 cal, 0.5g protein)
    if (lower.includes("apple")) {
      calories += 95;
      protein += 1;
      cost += 0.75;
    }

    // Pasta (1 cup cooked = 220 cal, 8g protein)
    if (lower.includes("pasta") || lower.includes("spaghetti") || lower.includes("noodles")) {
      calories += 220;
      protein += 8;
      cost += 0.40;
    }

    // Salmon (6oz = 350 cal, 40g protein)
    if (lower.includes("salmon")) {
      calories += 350;
      protein += 40;
      cost += 4.50;
    }

    // Tofu (1/2 block = 180 cal, 20g protein)
    if (lower.includes("tofu")) {
      calories += 180;
      protein += 20;
      cost += 1.25;
    }

    // Cheese (1oz cheddar = 115 cal, 7g protein)
    if (lower.includes("cheese") && !lower.includes("cottage")) {
      calories += 115;
      protein += 7;
      cost += 0.50;
    }

    // Fast food / restaurant detection
    if (lower.includes("mcdonald") || lower.includes("burger king") || lower.includes("wendy")) {
      calories += 650;
      protein += 28;
      cost += 9.00;
    } else if (lower.includes("chipotle")) {
      calories += 850;
      protein += 45;
      cost += 12.00;
    } else if (lower.includes("subway")) {
      calories += 450;
      protein += 25;
      cost += 8.00;
    } else if (lower.includes("pizza")) {
      const slices = lower.match(/(\d+)\s*slice/) ? parseInt(lower.match(/(\d+)\s*slice/)![1]) : 2;
      calories += slices * 285;
      protein += slices * 12;
      cost += slices * 2.50;
    }

    // Restaurant/dining out
    if (lower.includes("restaurant") || lower.includes("ate out") || lower.includes("takeout")) {
      calories += 800;
      protein += 35;
      cost += 18.00;
    }

    // Default if nothing matched
    if (calories === 0) {
      calories = 300;
      protein = 15;
      cost = 4.00;
    }

    return { calories, protein, cost: Math.round(cost * 100) / 100 };
  };

  return (
    <div className="px-4 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
      <div className="w-full max-w-md slide-up">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Sparkles className="w-6 h-6 text-primary animate-pulse-glow" />
          <h1 className="text-2xl font-bold text-foreground">
            AI <span className="text-primary neon-glow-text">Food Entry</span>
          </h1>
        </div>

        <div className="cyber-card p-4">
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Describe what you ate and I'll estimate the protein and cost for you.
          </p>

          <Textarea
            placeholder="e.g., 3 eggs, a chicken breast with rice, protein shake..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] bg-background/50 border-border/50 focus:border-primary resize-none mb-4"
          />

          <Button
            variant="neon"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Food
              </>
            )}
          </Button>
        </div>
      </div>


      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-card border-border max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Confirm Entry
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Here's what I estimated for your meal:
            </DialogDescription>
          </DialogHeader>

          {estimate && (
            <div className="space-y-4 py-4">
              <div className="cyber-card p-3 bg-muted/30">
                <p className="text-sm text-foreground font-medium">
                  "{estimate.description}"
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="cyber-card p-3 text-center">
                  <Flame className="w-5 h-5 text-progress-calories mx-auto mb-1" />
                  <p className="text-lg font-bold text-progress-calories">
                    {estimate.calories}
                  </p>
                  <p className="text-xs text-muted-foreground">calories</p>
                </div>
                <div className="cyber-card p-3 text-center">
                  <Dumbbell className="w-5 h-5 text-progress-protein mx-auto mb-1" />
                  <p className="text-lg font-bold text-progress-protein">
                    {estimate.protein}g
                  </p>
                  <p className="text-xs text-muted-foreground">protein</p>
                </div>
                <div className="cyber-card p-3 text-center">
                  <DollarSign className="w-5 h-5 text-progress-money mx-auto mb-1" />
                  <p className="text-lg font-bold text-progress-money">
                    ${estimate.cost.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">estimated</p>
                </div>
              </div>

              <div className="cyber-card p-3 bg-muted/20">
                <label className="text-xs text-muted-foreground block mb-2">
                  Know the exact price? Enter it here:
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={estimate.cost.toFixed(2)}
                    value={customCost}
                    onChange={(e) => setCustomCost(e.target.value)}
                    className="pl-8 bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button variant="neon" onClick={handleConfirm} className="flex-1">
              <Check className="w-4 h-4" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
