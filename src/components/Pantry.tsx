import { useState } from 'react';
import { Plus, Package, Trash2, Edit2, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

// Helper to limit cost to 2 decimal places
const formatCostInput = (value: string): string => {
  const match = value.match(/^\d*\.?\d{0,2}/);
  return match ? match[0] : '';
};

export const Pantry = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<PantryItem | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<PantryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    total_cost: '',
    total_servings: '',
    protein_per_serving: '',
    calories_per_serving: '',
  });

  const { data: pantryItems = [], isLoading } = useQuery({
    queryKey: ['pantry-items', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PantryItem[];
    },
    enabled: !!user
  });

  const addMutation = useMutation({
    mutationFn: async (item: Omit<PantryItem, 'id' | 'is_out_of_stock' | 'serving_unit'>) => {
      const { error } = await supabase.from('pantry_items').insert({
        ...item,
        user_id: user?.id,
        current_servings: item.total_servings,
        serving_unit: 'serving'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      toast.success('Item added to pantry');
      resetForm();
      setIsAddOpen(false);
    },
    onError: () => toast.error('Failed to add item')
  });

  const updateMutation = useMutation({
    mutationFn: async (item: Partial<PantryItem> & { id: string }) => {
      const { error } = await supabase
        .from('pantry_items')
        .update(item)
        .eq('id', item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      toast.success('Item updated');
      resetForm();
      setEditingItem(null);
    },
    onError: () => toast.error('Failed to update item')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pantry_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      toast.success('Item removed');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Failed to remove item')
  });

  const resetForm = () => {
    setFormData({
      name: '',
      total_cost: '',
      total_servings: '',
      protein_per_serving: '',
      calories_per_serving: '',
    });
  };

  const handleCostChange = (value: string) => {
    setFormData({ ...formData, total_cost: formatCostInput(value) });
  };

  const handleSubmit = () => {
    const item = {
      name: formData.name,
      total_cost: parseFloat(formData.total_cost) || 0,
      total_servings: parseFloat(formData.total_servings) || 1,
      current_servings: parseFloat(formData.total_servings) || 1,
      protein_per_serving: parseInt(formData.protein_per_serving) || 0,
      calories_per_serving: parseInt(formData.calories_per_serving) || 0,
    };

    if (editingItem) {
      updateMutation.mutate({ ...item, id: editingItem.id });
    } else {
      addMutation.mutate(item);
    }
  };

  const openEdit = (item: PantryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      total_cost: item.total_cost.toString(),
      total_servings: item.total_servings.toString(),
      protein_per_serving: item.protein_per_serving.toString(),
      calories_per_serving: item.calories_per_serving.toString(),
    });
  };

  const restockItem = (item: PantryItem) => {
    updateMutation.mutate({
      id: item.id,
      current_servings: item.total_servings,
      is_out_of_stock: false
    });
    setRestoreConfirm(null);
  };

  const costPerServing = (item: PantryItem) => 
    item.total_servings > 0 ? item.total_cost / item.total_servings : 0;

  const inStockItems = pantryItems.filter(i => !i.is_out_of_stock);
  const outOfStockItems = pantryItems.filter(i => i.is_out_of_stock);

  return (
    <div className="px-4 py-6 space-y-6 pb-24 slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Pantry</h2>
          <p className="text-sm text-muted-foreground">Track your food inventory</p>
        </div>
        <Dialog open={isAddOpen || !!editingItem} onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingItem(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add Pantry Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Item Name</Label>
                <Input
                  placeholder="e.g., Chicken Breast Pack"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Cost ($)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="12.99"
                    value={formData.total_cost}
                    onChange={(e) => handleCostChange(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Total Servings</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="6"
                    value={formData.total_servings}
                    onChange={(e) => setFormData({ ...formData, total_servings: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Protein per Serving (g)</Label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={formData.protein_per_serving}
                    onChange={(e) => setFormData({ ...formData, protein_per_serving: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Calories per Serving</Label>
                  <Input
                    type="number"
                    placeholder="165"
                    value={formData.calories_per_serving}
                    onChange={(e) => setFormData({ ...formData, calories_per_serving: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={!formData.name || addMutation.isPending || updateMutation.isPending}
              >
                {editingItem ? 'Update Item' : 'Add to Pantry'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">Loading pantry...</div>
      ) : pantryItems.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Pantry is Empty</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Add items to your pantry to start tracking food costs accurately
          </p>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Item
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {inStockItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                In Stock ({inStockItems.length})
              </h3>
              {inStockItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{item.name}</h4>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm">
                        <span className="text-progress-calories">
                          {item.calories_per_serving} cal/serving
                        </span>
                        <span className="text-progress-protein">
                          {item.protein_per_serving}g protein/serving
                        </span>
                        <span className="text-progress-money">
                          ${costPerServing(item).toFixed(2)}/serving
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {item.current_servings.toFixed(1)} of {item.total_servings} servings remaining
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-progress-money h-1.5 rounded-full transition-all"
                          style={{ width: `${(item.current_servings / item.total_servings) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEdit(item)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setDeleteConfirm(item)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {outOfStockItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Previous Items ({outOfStockItems.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Tap restock to add items back to your pantry from previous grocery trips
              </p>
              {outOfStockItems.map((item) => (
                <Card key={item.id} className="p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        <span className="text-progress-money">${costPerServing(item).toFixed(2)}/serving</span>
                        {' • '}
                        <span className="text-progress-protein">{item.protein_per_serving}g protein</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                        onClick={() => setRestoreConfirm(item)}
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restock
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setDeleteConfirm(item)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pantry Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restock Confirmation Dialog */}
      <AlertDialog open={!!restoreConfirm} onOpenChange={(open) => !open && setRestoreConfirm(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Restock Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Add "{restoreConfirm?.name}" back to your pantry with {restoreConfirm?.total_servings} servings?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => restoreConfirm && restockItem(restoreConfirm)}
            >
              Restock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
