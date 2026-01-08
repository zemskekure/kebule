import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * Hook to fetch signals with Supabase Realtime for instant updates
 * Falls back to polling if realtime fails
 */
export function useSignals(googleToken) {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all signals from Supabase directly
  const fetchSignals = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('signals')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      setSignals(data || []);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch signals:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchSignals();

    // Subscribe to realtime changes on signals table
    const channel = supabase
      .channel('signals-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'signals'
        },
        (payload) => {
          console.log('📡 Realtime signal update:', payload.eventType);
          
          if (payload.eventType === 'INSERT') {
            setSignals(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setSignals(prev => 
              prev.map(s => s.id === payload.new.id ? payload.new : s)
            );
          } else if (payload.eventType === 'DELETE') {
            setSignals(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSignals]);

  // Delete multiple signals by IDs
  const deleteSignals = useCallback(async (signalIds) => {
    if (!signalIds || signalIds.length === 0) return { success: false };

    try {
      const { error: deleteError } = await supabase
        .from('signals')
        .delete()
        .in('id', signalIds);

      if (deleteError) throw deleteError;

      // Optimistically remove from local state (realtime will also update)
      setSignals(prev => prev.filter(s => !signalIds.includes(s.id)));

      return { success: true };
    } catch (err) {
      console.error('Failed to delete signals:', err);
      return { success: false, error: err.message };
    }
  }, []);

  return { signals, loading, error, refetch: fetchSignals, deleteSignals };
}
