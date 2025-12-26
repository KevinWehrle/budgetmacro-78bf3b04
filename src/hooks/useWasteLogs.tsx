import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface WasteLog {
  id: string;
  pantry_item_id: string | null;
  item_name: string;
  amount_wasted: number;
  cost_lost: number;
  waste_reason: string | null;
  is_expired: boolean;
  created_at: string;
}

export function useWasteLogs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wasteLogs = [], isLoading } = useQuery({
    queryKey: ['waste-logs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('waste_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as WasteLog[];
    },
    enabled: !!user
  });

  const addWasteLogMutation = useMutation({
    mutationFn: async (log: {
      pantry_item_id?: string;
      item_name: string;
      amount_wasted: number;
      cost_lost: number;
      waste_reason?: string;
      is_expired?: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('waste_logs').insert({
        ...log,
        user_id: user.id,
        is_expired: log.is_expired ?? false
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waste-logs'] });
      toast.success('Waste logged');
    },
    onError: () => toast.error('Failed to log waste')
  });

  const deleteWasteLogMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('waste_logs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waste-logs'] });
    },
    onError: () => toast.error('Failed to delete waste log')
  });

  // Calculate total waste cost
  const totalWasteCost = wasteLogs.reduce((sum, log) => sum + Number(log.cost_lost), 0);

  return {
    wasteLogs,
    isLoading,
    addWasteLog: addWasteLogMutation.mutate,
    deleteWasteLog: deleteWasteLogMutation.mutate,
    totalWasteCost,
    isAdding: addWasteLogMutation.isPending
  };
}
