import { useState } from 'react';
import { Plus, Package, Trash2, Edit2, AlertCircle, RotateCcw, Store as StoreIcon, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStores } from '@/hooks/useStores';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

interface PantryItem {
  id: string;
  name: string;
  store_id: string | null;
  total_cost: number;
  // Weight-based
  total_weight: number | null;
  current_weight: number | null;
  protein_per_100g: number | null;
  calories_per_100g: number | null;
  // Servings-based
  total_servings: number;
  current_servings: number;
  protein_per_serving: number;
  calories_per_serving: number;
  serving_unit: string;
  // Common
  is_out_of_stock: boolean;
  expires_at: string | null;
}

const formatCostInput = (value: string): string => {
  const match = value.match(/^\d*\.?\d{0,2}/);
  return match ? match[0] : '';
};

export const Pantry = () => {
  const { user } = useAuth();
  const { stores, addStore, isAdding: isAddingStore } = useStores();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<PantryItem | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<PantryItem | null>(null);
  const [trackingMode, setTrackingMode] = useState<'servings' | 'weight'>('servings');
  const [newStoreName, setNewStoreName] = useState('');
  const [showNewStore, setShowNewStore] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    store_id: '',
    total_cost: '',
    // Servings mode
    total_servings: '',
    protein_per_serving: '',
    calories_per_serving: '',
    // Weight mode
    total_weight: '',
    protein_per_100g: '',
    calories_per_100g: '',
    // Common
    expires_at: '',
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
    mutationFn: async (item: Partial<PantryItem>) => {
      const { error } = await supabase.from('pantry_items').insert({
        name: item.name!,
        store_id: item.store_id,
        total_cost: item.total_cost ?? 0,
        total_weight: item.total_weight,
        current_weight: item.current_weight,
        protein_per_100g: item.protein_per_100g,
        calories_per_100g: item.calories_per_100g,
        total_servings: item.total_servings ?? 1,
        current_servings: item.current_servings ?? 1,
        protein_per_serving: item.protein_per_serving ?? 0,
        calories_per_serving: item.calories_per_serving ?? 0,
        expires_at: item.expires_at,
        user_id: user?.id!,
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
      store_id: '',
      total_cost: '',
      total_servings: '',
      protein_per_serving: '',
      calories_per_serving: '',
      total_weight: '',
      protein_per_100g: '',
      calories_per_100g: '',
      expires_at: '',
    });
    setTrackingMode('servings');
    setNewStoreName('');
    setShowNewStore(false);
  };

  const handleCostChange = (value: string) => {
    setFormData({ ...formData, total_cost: formatCostInput(value) });
  };

  const handleAddNewStore = async () => {
    if (!newStoreName.trim()) return;
    try {
      const newStore = await addStore({ name: newStoreName.trim() });
      setFormData({ ...formData, store_id: newStore.id });
      setNewStoreName('');
      setShowNewStore(false);
      toast.success('Store added');
    } catch {
      // Error handled in hook
    }
  };

  const handleSubmit = () => {
    const baseItem: Partial<PantryItem> = {
      name: formData.name,
      store_id: formData.store_id || null,
      total_cost: parseFloat(formData.total_cost) || 0,
      expires_at: formData.expires_at || null,
    };

    if (trackingMode === 'weight') {
      const totalWeight = parseFloat(formData.total_weight) || 0;
      Object.assign(baseItem, {
        total_weight: totalWeight,
        current_weight: totalWeight,
        protein_per_100g: parseFloat(formData.protein_per_100g) || 0,
        calories_per_100g: parseFloat(formData.calories_per_100g) || 0,
        total_servings: 1,
        current_servings: 1,
        protein_per_serving: 0,
        calories_per_serving: 0,
      });
    } else {
      const totalServings = parseFloat(formData.total_servings) || 1;
      Object.assign(baseItem, {
        total_servings: totalServings,
        current_servings: totalServings,
        protein_per_serving: parseInt(formData.protein_per_serving) || 0,
        calories_per_serving: parseInt(formData.calories_per_serving) || 0,
        total_weight: null,
        current_weight: null,
        protein_per_100g: null,
        calories_per_100g: null,
      });
    }

    if (editingItem) {
      updateMutation.mutate({ ...baseItem, id: editingItem.id });
    } else {
      addMutation.mutate(baseItem);
    }
  };

  const openEdit = (item: PantryItem) => {
    setEditingItem(item);
    const isWeightBased = item.total_weight !== null && item.total_weight > 0;
    setTrackingMode(isWeightBased ? 'weight' : 'servings');
    setFormData({
      name: item.name,
      store_id: item.store_id || '',
      total_cost: item.total_cost.toString(),
      total_servings: item.total_servings.toString(),
      protein_per_serving: item.protein_per_serving.toString(),
      calories_per_serving: item.calories_per_serving.toString(),
      total_weight: item.total_weight?.toString() || '',
      protein_per_100g: item.protein_per_100g?.toString() || '',
      calories_per_100g: item.calories_per_100g?.toString() || '',
      expires_at: item.expires_at || '',
    });
  };

  const restockItem = (item: PantryItem) => {
    const updateData: Partial<PantryItem> & { id: string } = {
      id: item.id,
      is_out_of_stock: false
    };
    
    if (item.total_weight) {
      updateData.current_weight = item.total_weight;
    } else {
      updateData.current_servings = item.total_servings;
    }
    
    updateMutation.mutate(updateData);
    setRestoreConfirm(null);
  };

  const costPerServing = (item: PantryItem) => {
    if (item.total_weight && item.total_weight > 0) {
      return item.total_cost / (item.total_weight / 100);
    }
    return item.total_servings > 0 ? item.total_cost / item.total_servings : 0;
  };

  const getStoreName = (storeId: string | null) => {
    if (!storeId) return null;
    return stores.find(s => s.id === storeId)?.name;
  };

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
          <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
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

              {/* Store Selection */}
              <div>
                <Label className="flex items-center gap-2">
                  <StoreIcon className="w-4 h-4" />
                  Store (optional)
                </Label>
                {showNewStore ? (
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Store name"
                      value={newStoreName}
                      onChange={(e) => setNewStoreName(e.target.value)}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleAddNewStore}
                      disabled={isAddingStore || !newStoreName.trim()}
                    >
                      Add
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => { setShowNewStore(false); setNewStoreName(''); }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={formData.store_id}
                    onValueChange={(value) => {
                      if (value === 'new') {
                        setShowNewStore(true);
                      } else {
                        setFormData({ ...formData, store_id: value });
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No store</SelectItem>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="new" className="text-primary">
                        + Add new store
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Tracking Mode Toggle */}
              <div>
                <Label>Tracking Method</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant={trackingMode === 'servings' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrackingMode('servings')}
                  >
                    By Servings
                  </Button>
                  <Button
                    type="button"
                    variant={trackingMode === 'weight' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrackingMode('weight')}
                  >
                    By Weight (100g)
                  </Button>
                </div>
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
                {trackingMode === 'servings' ? (
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
                ) : (
                  <div>
                    <Label>Total Weight (g)</Label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={formData.total_weight}
                      onChange={(e) => setFormData({ ...formData, total_weight: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {trackingMode === 'servings' ? (
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
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Protein per 100g (g)</Label>
                    <Input
                      type="number"
                      placeholder="25"
                      value={formData.protein_per_100g}
                      onChange={(e) => setFormData({ ...formData, protein_per_100g: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Calories per 100g</Label>
                    <Input
                      type="number"
                      placeholder="165"
                      value={formData.calories_per_100g}
                      onChange={(e) => setFormData({ ...formData, calories_per_100g: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Expiry Date */}
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Expiry Date (optional)
                </Label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="mt-1"
                />
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
              {inStockItems.map((item) => {
                const storeName = getStoreName(item.store_id);
                const isWeightBased = item.total_weight !== null && item.total_weight > 0;
                const remaining = isWeightBased 
                  ? `${item.current_weight?.toFixed(0)}g of ${item.total_weight}g`
                  : `${item.current_servings.toFixed(1)} of ${item.total_servings} servings`;
                const progressPercent = isWeightBased
                  ? ((item.current_weight || 0) / (item.total_weight || 1)) * 100
                  : (item.current_servings / item.total_servings) * 100;

                return (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{item.name}</h4>
                          {storeName && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                              {storeName}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm">
                          <span className="text-progress-calories">
                            {isWeightBased 
                              ? `${item.calories_per_100g} cal/100g`
                              : `${item.calories_per_serving} cal/serving`
                            }
                          </span>
                          <span className="text-progress-protein">
                            {isWeightBased 
                              ? `${item.protein_per_100g}g protein/100g`
                              : `${item.protein_per_serving}g protein/serving`
                            }
                          </span>
                          <span className="text-progress-money">
                            ${costPerServing(item).toFixed(2)}/{isWeightBased ? '100g' : 'serving'}
                          </span>
                        </div>
                        {item.expires_at && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Expires: {format(new Date(item.expires_at), 'MMM d, yyyy')}
                          </div>
                        )}
                        <div className="mt-2 text-xs text-muted-foreground">
                          {remaining} remaining
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-progress-money h-1.5 rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
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
                );
              })}
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
              {outOfStockItems.map((item) => {
                const storeName = getStoreName(item.store_id);
                const isWeightBased = item.total_weight !== null && item.total_weight > 0;
                
                return (
                  <Card key={item.id} className="p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{item.name}</h4>
                          {storeName && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                              {storeName}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="text-progress-money">${costPerServing(item).toFixed(2)}/{isWeightBased ? '100g' : 'serving'}</span>
                          {' • '}
                          <span className="text-progress-protein">
                            {isWeightBased ? `${item.protein_per_100g}g/100g` : `${item.protein_per_serving}g protein`}
                          </span>
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
                );
              })}
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
              Add "{restoreConfirm?.name}" back to your pantry with {
                restoreConfirm?.total_weight 
                  ? `${restoreConfirm.total_weight}g`
                  : `${restoreConfirm?.total_servings} servings`
              }?
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
