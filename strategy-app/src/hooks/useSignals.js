import { useState, useEffect } from 'react';

/**
 * Hook to fetch signals from Signal Lite backend
 * @param {string} googleToken - Google OAuth token for authentication
 * @param {number} refreshInterval - How often to refresh in milliseconds (default: 30000)
 */
export function useSignals(googleToken, refreshInterval = 30000) {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!googleToken) {
      setLoading(false);
      return;
    }

    async function fetchSignals() {
      try {
        const response = await fetch('https://signal-lite-backend.onrender.com/signals', {
          headers: {
            'Authorization': `Bearer ${googleToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch signals: ${response.status}`);
        }

        const data = await response.json();
        setSignals(data.signals || []);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch signals:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    // Initial fetch
    fetchSignals();

    // Set up polling
    const interval = setInterval(fetchSignals, refreshInterval);

    return () => clearInterval(interval);
  }, [googleToken, refreshInterval]);

  return { signals, loading, error };
}
