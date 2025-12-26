import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Store {
  id: string;
  name: string;
  location_tag: string | null;
  created_at: string;
  updated_at: string;
}

export function useStores() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Store[];
    },
    enabled: !!user
  });

  const addStoreMutation = useMutation({
    mutationFn: async (store: { name: string; location_tag?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('stores')
        .insert({
          ...store,
          user_id: user.id
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: () => toast.error('Failed to add store')
  });

  const updateStoreMutation = useMutation({
    mutationFn: async (store: { id: string; name: string; location_tag?: string }) => {
      const { error } = await supabase
        .from('stores')
        .update({ name: store.name, location_tag: store.location_tag })
        .eq('id', store.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: () => toast.error('Failed to update store')
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast.success('Store removed');
    },
    onError: () => toast.error('Failed to remove store')
  });

  return {
    stores,
    isLoading,
    addStore: addStoreMutation.mutateAsync,
    updateStore: updateStoreMutation.mutate,
    deleteStore: deleteStoreMutation.mutate,
    isAdding: addStoreMutation.isPending
  };
}
