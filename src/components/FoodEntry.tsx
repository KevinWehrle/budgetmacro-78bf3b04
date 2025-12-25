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
import { Sparkles, Loader2, Flame, Dumbbell, DollarSign, Check, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";

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
  const [editingField, setEditingField] = useState<'calories' | 'protein' | 'cost' | null>(null);
  const [editValues, setEditValues] = useState({ calories: "", protein: "", cost: "" });

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast.error("Please describe what you ate");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { foodDescription: input.trim() }
      });

      if (error) {
        console.error('Edge function error:', error);
        const fallbackEstimates = estimateNutritionFallback(input);
        setEstimate({
          description: input,
          ...fallbackEstimates,
        });
      } else if (data.error) {
        console.error('AI error:', data.error);
        const fallbackEstimates = estimateNutritionFallback(input);
        setEstimate({
          description: input,
          ...fallbackEstimates,
        });
      } else {
        setEstimate({
          description: input,
          calories: data.calories,
          protein: data.protein,
          cost: data.cost,
        });
      }
      
      setEditValues({ calories: "", protein: "", cost: "" });
      setEditingField(null);
      setShowConfirm(true);
    } catch (err) {
      console.error('Request error:', err);
      const fallbackEstimates = estimateNutritionFallback(input);
      setEstimate({
        description: input,
        ...fallbackEstimates,
      });
      setEditValues({ calories: "", protein: "", cost: "" });
      setShowConfirm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSave = (field: 'calories' | 'protein' | 'cost') => {
    if (!estimate) return;
    
    const value = parseFloat(editValues[field]);
    if (!isNaN(value) && value >= 0) {
      setEstimate({ ...estimate, [field]: value });
    }
    setEditingField(null);
    setEditValues({ ...editValues, [field]: "" });
  };

  const handleConfirm = () => {
    if (estimate) {
      addFoodLog(estimate);
      toast.success("Food logged!", {
        description: `${estimate.protein}g protein • $${estimate.cost.toFixed(2)}`,
      });
      setInput("");
      setEstimate(null);
      setEditValues({ calories: "", protein: "", cost: "" });
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setEstimate(null);
    setEditValues({ calories: "", protein: "", cost: "" });
    setEditingField(null);
  };

  const estimateNutritionFallback = (text: string) => {
    const lower = text.toLowerCase();
    let calories = 0;
    let protein = 0;
    let cost = 0;

    const eggMatch = lower.match(/(\d+)?\s*eggs?/);
    if (eggMatch) {
      const count = parseInt(eggMatch[1]) || 1;
      calories += count * 72;
      protein += count * 6;
      cost += count * 0.35;
    }

    if (lower.includes("chicken breast")) {
      const portions = lower.includes("2") ? 2 : 1;
      calories += portions * 280;
      protein += portions * 53;
      cost += portions * 2.00;
    } else if (lower.includes("chicken")) {
      const portions = lower.includes("2") ? 2 : 1;
      calories += portions * 320;
      protein += portions * 40;
      cost += portions * 1.75;
    }

    if (lower.includes("tuna")) {
      const cans = lower.includes("2") ? 2 : 1;
      calories += cans * 120;
      protein += cans * 27;
      cost += cans * 1.75;
    }

    if (lower.includes("greek yogurt")) {
      calories += 100;
      protein += 17;
      cost += 1.40;
    } else if (lower.includes("yogurt")) {
      calories += 150;
      protein += 6;
      cost += 1.00;
    }

    if (lower.includes("protein shake") || lower.includes("protein powder") || lower.includes("whey")) {
      calories += 120;
      protein += 24;
      cost += 1.25;
    }

    if (lower.includes("skim milk") || lower.includes("nonfat milk")) {
      calories += 90;
      protein += 8;
      cost += 0.35;
    } else if (lower.includes("milk")) {
      calories += 150;
      protein += 8;
      cost += 0.35;
    }

    if (lower.includes("brown rice")) {
      calories += 215;
      protein += 5;
      cost += 0.25;
    } else if (lower.includes("rice")) {
      calories += 205;
      protein += 4;
      cost += 0.20;
    }

    if (lower.includes("beans") || lower.includes("lentils")) {
      calories += 230;
      protein += 15;
      cost += 0.50;
    }

    if (lower.includes("peanut butter")) {
      calories += 190;
      protein += 8;
      cost += 0.30;
    }

    if (lower.includes("oatmeal") || lower.includes("oats")) {
      calories += 160;
      protein += 6;
      cost += 0.25;
    }

    if (lower.includes("lean beef") || lower.includes("ground beef 90")) {
      calories += 200;
      protein += 23;
      cost += 2.00;
    } else if (lower.includes("ground beef") || lower.includes("beef")) {
      calories += 290;
      protein += 19;
      cost += 1.75;
    }

    if (lower.includes("steak") || lower.includes("ribeye") || lower.includes("sirloin")) {
      calories += 370;
      protein += 43;
      cost += 5.00;
    }

    if (lower.includes("cottage cheese")) {
      calories += 220;
      protein += 28;
      cost += 0.85;
    }

    if (lower.includes("bread") || lower.includes("toast")) {
      const slices = lower.includes("2") ? 2 : 1;
      calories += slices * 80;
      protein += slices * 3;
      cost += slices * 0.20;
    }

    if (lower.includes("banana")) {
      const count = lower.match(/(\d+)\s*banana/) ? parseInt(lower.match(/(\d+)\s*banana/)![1]) : 1;
      calories += count * 105;
      protein += count * 1;
      cost += count * 0.25;
    }

    if (lower.includes("apple")) {
      calories += 95;
      protein += 1;
      cost += 0.75;
    }

    if (lower.includes("pasta") || lower.includes("spaghetti") || lower.includes("noodles")) {
      calories += 220;
      protein += 8;
      cost += 0.40;
    }

    if (lower.includes("salmon")) {
      calories += 350;
      protein += 40;
      cost += 4.50;
    }

    if (lower.includes("tofu")) {
      calories += 180;
      protein += 20;
      cost += 1.25;
    }

    if (lower.includes("cheese") && !lower.includes("cottage")) {
      calories += 115;
      protein += 7;
      cost += 0.50;
    }

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

    if (lower.includes("restaurant") || lower.includes("ate out") || lower.includes("takeout")) {
      calories += 800;
      protein += 35;
      cost += 18.00;
    }

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
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            AI Food Entry
          </h1>
        </div>

        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-3 text-center">
            Describe what you ate and I'll estimate the nutrition and cost.
          </p>
          <p className="text-xs text-muted-foreground/70 mb-4 text-center italic">
            AI estimates cost based on local averages; please verify for accuracy.
          </p>

          <Textarea
            placeholder="e.g., 3 eggs, a chicken breast with rice, protein shake..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px] bg-background/50 border-border/30 focus:border-primary resize-none mb-4"
          />

          <Button
            variant="sleek"
            size="lg"
            className="w-full shimmer"
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

      {/* Review & Edit Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="glass-card max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Review & Edit
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tap any value to manually correct it before logging.
            </DialogDescription>
          </DialogHeader>

          {estimate && (
            <div className="space-y-4 py-4">
              <div className="glass-card p-3 bg-muted/20">
                <p className="text-sm text-foreground font-medium">
                  "{estimate.description}"
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Calories */}
                <button
                  onClick={() => {
                    setEditingField('calories');
                    setEditValues({ ...editValues, calories: estimate.calories.toString() });
                  }}
                  className="glass-card p-3 text-center hover:bg-muted/30 transition-colors group"
                >
                  <Flame className="w-5 h-5 text-progress-calories mx-auto mb-1" />
                  {editingField === 'calories' ? (
                    <Input
                      type="number"
                      value={editValues.calories}
                      onChange={(e) => setEditValues({ ...editValues, calories: e.target.value })}
                      onBlur={() => handleEditSave('calories')}
                      onKeyDown={(e) => e.key === 'Enter' && handleEditSave('calories')}
                      className="h-7 text-center text-lg font-bold p-0 bg-transparent border-b border-progress-calories"
                      autoFocus
                    />
                  ) : (
                    <p className="text-lg font-bold text-foreground group-hover:text-progress-calories transition-colors">
                      {estimate.calories}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs text-muted-foreground">calories</p>
                    <Pencil className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>

                {/* Protein */}
                <button
                  onClick={() => {
                    setEditingField('protein');
                    setEditValues({ ...editValues, protein: estimate.protein.toString() });
                  }}
                  className="glass-card p-3 text-center hover:bg-muted/30 transition-colors group"
                >
                  <Dumbbell className="w-5 h-5 text-progress-protein mx-auto mb-1" />
                  {editingField === 'protein' ? (
                    <Input
                      type="number"
                      value={editValues.protein}
                      onChange={(e) => setEditValues({ ...editValues, protein: e.target.value })}
                      onBlur={() => handleEditSave('protein')}
                      onKeyDown={(e) => e.key === 'Enter' && handleEditSave('protein')}
                      className="h-7 text-center text-lg font-bold p-0 bg-transparent border-b border-progress-protein"
                      autoFocus
                    />
                  ) : (
                    <p className="text-lg font-bold text-foreground group-hover:text-progress-protein transition-colors">
                      {estimate.protein}g
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs text-muted-foreground">protein</p>
                    <Pencil className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>

                {/* Cost */}
                <button
                  onClick={() => {
                    setEditingField('cost');
                    setEditValues({ ...editValues, cost: estimate.cost.toFixed(2) });
                  }}
                  className="glass-card p-3 text-center hover:bg-muted/30 transition-colors group"
                >
                  <DollarSign className="w-5 h-5 text-progress-money mx-auto mb-1" />
                  {editingField === 'cost' ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editValues.cost}
                      onChange={(e) => setEditValues({ ...editValues, cost: e.target.value })}
                      onBlur={() => handleEditSave('cost')}
                      onKeyDown={(e) => e.key === 'Enter' && handleEditSave('cost')}
                      className="h-7 text-center text-lg font-bold p-0 bg-transparent border-b border-progress-money"
                      autoFocus
                    />
                  ) : (
                    <p className="text-lg font-bold text-foreground group-hover:text-progress-money transition-colors">
                      ${estimate.cost.toFixed(2)}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs text-muted-foreground">cost</p>
                    <Pencil className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button variant="default" onClick={handleConfirm} className="flex-1">
              <Check className="w-4 h-4" />
              Confirm & Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
