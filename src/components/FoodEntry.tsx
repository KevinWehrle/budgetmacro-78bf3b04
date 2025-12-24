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

    // Egg detection (grocery: ~$0.25-0.40 per egg)
    const eggMatch = lower.match(/(\d+)?\s*eggs?/);
    if (eggMatch) {
      const count = parseInt(eggMatch[1]) || 1;
      calories += count * 70;
      protein += count * 6;
      cost += count * 0.35;
    }

    // Chicken breast detection (~$3.50/lb, 6oz portion)
    if (lower.includes("chicken breast") || lower.includes("chicken")) {
      const portions = lower.includes("2") ? 2 : 1;
      calories += portions * 165;
      protein += portions * 31;
      cost += portions * 2.00;
    }

    // Canned tuna (~$1.50-2.00 per can)
    if (lower.includes("tuna")) {
      const cans = lower.includes("2") ? 2 : 1;
      calories += cans * 100;
      protein += cans * 22;
      cost += cans * 1.75;
    }

    // Greek yogurt (~$1.25-1.50 per container)
    if (lower.includes("greek yogurt") || lower.includes("yogurt")) {
      calories += 100;
      protein += 17;
      cost += 1.40;
    }

    // Protein shake/powder (~$1.00-1.50 per scoop)
    if (lower.includes("protein shake") || lower.includes("protein powder") || lower.includes("whey")) {
      calories += 120;
      protein += 25;
      cost += 1.25;
    }

    // Milk (~$4.50/gallon, $0.30 per cup)
    if (lower.includes("milk")) {
      calories += 150;
      protein += 8;
      cost += 0.35;
    }

    // Rice (~$0.15-0.25 per cooked cup)
    if (lower.includes("rice")) {
      calories += 200;
      protein += 4;
      cost += 0.20;
    }

    // Beans/lentils (~$0.40-0.60 per cup cooked)
    if (lower.includes("beans") || lower.includes("lentils")) {
      calories += 225;
      protein += 15;
      cost += 0.50;
    }

    // Peanut butter (~$0.25 per 2 tbsp)
    if (lower.includes("peanut butter")) {
      calories += 190;
      protein += 7;
      cost += 0.30;
    }

    // Oatmeal (~$0.20 per serving)
    if (lower.includes("oatmeal") || lower.includes("oats")) {
      calories += 150;
      protein += 5;
      cost += 0.25;
    }

    // Ground beef (~$5/lb, 4oz portion)
    if (lower.includes("ground beef") || lower.includes("beef")) {
      calories += 280;
      protein += 20;
      cost += 1.75;
    }

    // Cottage cheese (~$3.50 per container, $0.80 per serving)
    if (lower.includes("cottage cheese")) {
      calories += 110;
      protein += 14;
      cost += 0.85;
    }

    // Bread (~$0.20 per slice)
    if (lower.includes("bread") || lower.includes("toast")) {
      const slices = lower.includes("2") ? 2 : 1;
      calories += slices * 80;
      protein += slices * 3;
      cost += slices * 0.20;
    }

    // Fast food / restaurant detection (higher cost)
    if (lower.includes("mcdonald") || lower.includes("burger king") || lower.includes("wendy") || 
        lower.includes("chipotle") || lower.includes("subway") || lower.includes("fast food")) {
      calories += 600;
      protein += 25;
      cost += 9.00;
    }

    // Restaurant/dining out
    if (lower.includes("restaurant") || lower.includes("ate out") || lower.includes("takeout")) {
      calories += 700;
      protein += 30;
      cost += 15.00;
    }

    // Default if nothing matched
    if (calories === 0) {
      calories = 250;
      protein = 12;
      cost = 3.00;
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
