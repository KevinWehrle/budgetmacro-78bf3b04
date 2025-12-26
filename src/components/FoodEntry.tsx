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
import { Sparkles, Loader2, Flame, Dumbbell, DollarSign, Check, X, Pencil, Package, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface FoodEstimate {
  description: string;
  calories: number;
  protein: number;
  cost: number;
}

interface PantryItem {
  id: string;
  name: string;
  total_cost: number;
  total_servings: number;
  current_servings: number;
  protein_per_serving: number;
  calories_per_serving: number;
  serving_unit: string;
  is_out_of_stock: boolean;
}

type EntryMode = 'select' | 'pantry' | 'manual' | 'ai';

export function FoodEntry() {
  const { addFoodLog } = useApp();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [mode, setMode] = useState<EntryMode>('select');
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [estimate, setEstimate] = useState<FoodEstimate | null>(null);
  const [editingField, setEditingField] = useState<'calories' | 'protein' | 'cost' | null>(null);
  const [editValues, setEditValues] = useState({ calories: "", protein: "", cost: "" });
  
  // Pantry state
  const [selectedPantryItem, setSelectedPantryItem] = useState<PantryItem | null>(null);
  const [servingsAmount, setServingsAmount] = useState("");
  const [showPantryConfirm, setShowPantryConfirm] = useState(false);

  // Manual entry state
  const [manualEntry, setManualEntry] = useState({
    description: "",
    calories: "",
    protein: "",
    cost: ""
  });

  const { data: pantryItems = [] } = useQuery({
    queryKey: ['pantry-items', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_out_of_stock', false)
        .order('name');
      
      if (error) throw error;
      return data as PantryItem[];
    },
    enabled: !!user
  });

  const updatePantryMutation = useMutation({
    mutationFn: async ({ id, current_servings, is_out_of_stock }: { id: string; current_servings: number; is_out_of_stock: boolean }) => {
      const { error } = await supabase
        .from('pantry_items')
        .update({ current_servings, is_out_of_stock })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
    }
  });

  const handleAISubmit = async () => {
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
      setMode('select');
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setEstimate(null);
    setEditValues({ calories: "", protein: "", cost: "" });
    setEditingField(null);
  };

  const handlePantryItemSelect = (item: PantryItem) => {
    setSelectedPantryItem(item);
    setServingsAmount("1");
    setShowPantryConfirm(true);
  };

  const calculatePantryMeal = () => {
    if (!selectedPantryItem) return null;
    const servings = parseFloat(servingsAmount) || 0;
    const costPerServing = selectedPantryItem.total_cost / selectedPantryItem.total_servings;
    
    return {
      calories: Math.round(selectedPantryItem.calories_per_serving * servings),
      protein: Math.round(selectedPantryItem.protein_per_serving * servings),
      cost: Math.round(costPerServing * servings * 100) / 100
    };
  };

  const handlePantryConfirm = () => {
    if (!selectedPantryItem) return;
    
    const servings = parseFloat(servingsAmount) || 0;
    const meal = calculatePantryMeal();
    if (!meal) return;

    // Log the food
    addFoodLog({
      description: `${servings} ${selectedPantryItem.serving_unit}(s) of ${selectedPantryItem.name}`,
      calories: meal.calories,
      protein: meal.protein,
      cost: meal.cost
    });

    // Update pantry inventory
    const newServings = selectedPantryItem.current_servings - servings;
    const isOutOfStock = newServings <= 0;
    
    updatePantryMutation.mutate({
      id: selectedPantryItem.id,
      current_servings: Math.max(0, newServings),
      is_out_of_stock: isOutOfStock
    });

    toast.success("Food logged from pantry!", {
      description: isOutOfStock 
        ? `${selectedPantryItem.name} is now out of stock`
        : `${newServings.toFixed(1)} ${selectedPantryItem.serving_unit}s remaining`
    });

    setShowPantryConfirm(false);
    setSelectedPantryItem(null);
    setServingsAmount("");
    setMode('select');
  };

  const handleManualSubmit = () => {
    if (!manualEntry.description.trim()) {
      toast.error("Please add a description");
      return;
    }

    addFoodLog({
      description: manualEntry.description,
      calories: parseInt(manualEntry.calories) || 0,
      protein: parseInt(manualEntry.protein) || 0,
      cost: parseFloat(manualEntry.cost) || 0
    });

    toast.success("Food logged!");
    setManualEntry({ description: "", calories: "", protein: "", cost: "" });
    setMode('select');
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

  const pantryMeal = calculatePantryMeal();

  // Mode Selection Screen
  if (mode === 'select') {
    return (
      <div className="px-4 py-6 space-y-6 pb-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Log Food</h1>
          <p className="text-sm text-muted-foreground">Choose how you'd like to log your meal</p>
        </div>

        <div className="space-y-4">
          <Card 
            className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => setMode('pantry')}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-protein/20">
                <Package className="w-6 h-6 text-protein" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Log from Pantry</h3>
                <p className="text-sm text-muted-foreground">
                  Select from your tracked inventory. Auto-calculates cost & macros.
                </p>
                {pantryItems.length > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    {pantryItems.length} items in stock
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          <Card 
            className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => setMode('manual')}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-calories/20">
                <Pencil className="w-6 h-6 text-calories" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Quick Log (Manual)</h3>
                <p className="text-sm text-muted-foreground">
                  Enter calories, protein, and cost yourself
                </p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-5 cursor-pointer hover:bg-muted/30 transition-colors relative overflow-hidden"
            onClick={() => setMode('ai')}
          >
            <Badge className="absolute top-3 right-3 bg-primary/20 text-primary border-primary/30">
              <FlaskConical className="w-3 h-3 mr-1" />
              Beta
            </Badge>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">AI Estimate</h3>
                <p className="text-sm text-muted-foreground">
                  Describe your meal and AI estimates the nutrition
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Pantry Selection Screen
  if (mode === 'pantry') {
    return (
      <div className="px-4 py-6 space-y-6 pb-24">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setMode('select')}>
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Log from Pantry</h1>
            <p className="text-sm text-muted-foreground">Select an item to log</p>
          </div>
        </div>

        {pantryItems.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Pantry is Empty</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add items to your pantry first to log from here
            </p>
            <Button variant="outline" onClick={() => setMode('select')}>
              Go Back
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {pantryItems.map((item) => {
              const costPerServing = item.total_cost / item.total_servings;
              return (
                <Card 
                  key={item.id}
                  className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => handlePantryItemSelect(item)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{item.name}</h4>
                      <div className="flex gap-3 mt-1 text-sm">
                        <span className="text-calories">{item.calories_per_serving} cal</span>
                        <span className="text-protein">{item.protein_per_serving}g</span>
                        <span className="text-spent">${costPerServing.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {item.current_servings.toFixed(1)} left
                      </p>
                      <p className="text-xs text-muted-foreground/70">{item.serving_unit}s</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pantry Confirm Dialog */}
        <Dialog open={showPantryConfirm} onOpenChange={setShowPantryConfirm}>
          <DialogContent className="glass-card max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Log {selectedPantryItem?.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                How many {selectedPantryItem?.serving_unit}s are you eating?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max={selectedPantryItem?.current_servings}
                  value={servingsAmount}
                  onChange={(e) => setServingsAmount(e.target.value)}
                  className="text-center text-2xl font-bold h-14"
                  placeholder="1"
                />
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {selectedPantryItem?.current_servings.toFixed(1)} {selectedPantryItem?.serving_unit}s available
                </p>
              </div>

              {pantryMeal && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass-card p-3 text-center">
                    <Flame className="w-5 h-5 text-calories mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{pantryMeal.calories}</p>
                    <p className="text-xs text-muted-foreground">calories</p>
                  </div>
                  <div className="glass-card p-3 text-center">
                    <Dumbbell className="w-5 h-5 text-protein mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{pantryMeal.protein}g</p>
                    <p className="text-xs text-muted-foreground">protein</p>
                  </div>
                  <div className="glass-card p-3 text-center">
                    <DollarSign className="w-5 h-5 text-spent mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">${pantryMeal.cost.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">cost</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => setShowPantryConfirm(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                variant="default" 
                onClick={handlePantryConfirm} 
                className="flex-1"
                disabled={!servingsAmount || parseFloat(servingsAmount) <= 0}
              >
                <Check className="w-4 h-4" />
                Confirm & Log
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Manual Entry Screen
  if (mode === 'manual') {
    return (
      <div className="px-4 py-6 space-y-6 pb-24">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setMode('select')}>
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Quick Log</h1>
            <p className="text-sm text-muted-foreground">Enter details manually</p>
          </div>
        </div>

        <Card className="p-4 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Description</label>
            <Input
              placeholder="e.g., Lunch - Chicken and rice"
              value={manualEntry.description}
              onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Calories</label>
              <Input
                type="number"
                placeholder="0"
                value={manualEntry.calories}
                onChange={(e) => setManualEntry({ ...manualEntry, calories: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Protein (g)</label>
              <Input
                type="number"
                placeholder="0"
                value={manualEntry.protein}
                onChange={(e) => setManualEntry({ ...manualEntry, protein: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Cost ($)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={manualEntry.cost}
                onChange={(e) => setManualEntry({ ...manualEntry, cost: e.target.value })}
              />
            </div>
          </div>

          <Button className="w-full" onClick={handleManualSubmit}>
            <Check className="w-4 h-4" />
            Log Entry
          </Button>
        </Card>
      </div>
    );
  }

  // AI Entry Screen
  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setMode('select')}>
          ← Back
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">AI Estimate</h1>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <FlaskConical className="w-3 h-3 mr-1" />
              Beta
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Describe what you ate</p>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <p className="text-xs text-muted-foreground/70 text-center italic">
          AI estimates cost based on local averages; please verify for accuracy.
        </p>

        <Textarea
          placeholder="e.g., 3 eggs, a chicken breast with rice, protein shake..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[100px] bg-background/50 border-border/30 focus:border-primary resize-none"
        />

        <Button
          variant="sleek"
          size="lg"
          className="w-full shimmer"
          onClick={handleAISubmit}
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
      </Card>

      {/* AI Review & Edit Modal */}
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