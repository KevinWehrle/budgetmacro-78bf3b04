import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
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
      setShowConfirm(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleConfirm = () => {
    if (estimate) {
      addFoodLog(estimate);
      toast.success("Food logged!", {
        description: `${estimate.protein}g protein • $${estimate.cost.toFixed(2)}`,
      });
      setInput("");
      setEstimate(null);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setEstimate(null);
  };

  // Simple estimation logic based on keywords
  const estimateNutrition = (text: string) => {
    const lower = text.toLowerCase();
    let calories = 0;
    let protein = 0;
    let cost = 0;

    // Egg detection
    const eggMatch = lower.match(/(\d+)?\s*eggs?/);
    if (eggMatch) {
      const count = parseInt(eggMatch[1]) || 1;
      calories += count * 70;
      protein += count * 6;
      cost += count * 0.3;
    }

    // Chicken breast detection
    if (lower.includes("chicken breast") || lower.includes("chicken")) {
      const portions = lower.includes("2") ? 2 : 1;
      calories += portions * 165;
      protein += portions * 31;
      cost += portions * 1.5;
    }

    // Tuna detection
    if (lower.includes("tuna")) {
      const cans = lower.includes("2") ? 2 : 1;
      calories += cans * 100;
      protein += cans * 22;
      cost += cans * 1.0;
    }

    // Greek yogurt
    if (lower.includes("greek yogurt") || lower.includes("yogurt")) {
      calories += 100;
      protein += 17;
      cost += 1.0;
    }

    // Protein shake/powder
    if (lower.includes("protein shake") || lower.includes("protein powder") || lower.includes("whey")) {
      calories += 120;
      protein += 25;
      cost += 0.8;
    }

    // Milk
    if (lower.includes("milk")) {
      calories += 150;
      protein += 8;
      cost += 0.5;
    }

    // Rice
    if (lower.includes("rice")) {
      calories += 200;
      protein += 4;
      cost += 0.3;
    }

    // Beans
    if (lower.includes("beans") || lower.includes("lentils")) {
      calories += 225;
      protein += 15;
      cost += 0.5;
    }

    // Peanut butter
    if (lower.includes("peanut butter")) {
      calories += 190;
      protein += 7;
      cost += 0.4;
    }

    // Default if nothing matched
    if (calories === 0) {
      calories = 200;
      protein = 10;
      cost = 2.0;
    }

    return { calories, protein, cost };
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
                  <p className="text-xs text-muted-foreground">cost</p>
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
