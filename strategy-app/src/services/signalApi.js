/**
 * API service for Signal Lite backend integration
 */

const API_URL = (import.meta.env.VITE_SIGNAL_API_URL || 'https://signal-lite-backend.onrender.com').replace(/\/$/, '');

/**
 * Update a signal in Signal Lite backend
 * @param {string} signalId - Signal ID
 * @param {object} updates - Fields to update (status, projectId, themeIds, etc.)
 * @param {string} token - Google OAuth token
 */
export async function updateSignal(signalId, updates, token) {
  if (!token) {
    throw new Error('Authentication token required');
  }

  const response = await fetch(`${API_URL}/signals/${signalId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Failed to update signal');
  }

  return response.json();
}

/**
 * Fetch signals from Signal Lite backend
 * @param {string} token - Google OAuth token (optional for public access)
 * @param {object} params - Query parameters (limit, offset, status, authorEmail)
 */
export async function fetchSignals(token = null, params = {}) {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}/signals${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error('Failed to fetch signals');
  }

  return response.json();
}
