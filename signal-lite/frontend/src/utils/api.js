const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function sendSignal(signalData, token) {
  const response = await fetch(`${API_URL}/signals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(signalData)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Failed to send signal');
  }

  return response.json();
}

export async function getSignals(token, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}/signals${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch signals');
  }

  return response.json();
}
