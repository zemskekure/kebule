const TOKEN_KEY = 'signal_lite_token';
const TOKEN_TIMESTAMP_KEY = 'signal_lite_token_timestamp';
const TOKEN_EXPIRY_MS = 55 * 60 * 1000; // 55 minutes (tokens expire at 60min, refresh at 55min)

export function storeToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Failed to store token:', error);
  }
}

export function getStoredToken() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const timestamp = localStorage.getItem(TOKEN_TIMESTAMP_KEY);
    
    if (!token || !timestamp) {
      return null;
    }
    
    // Check if token is expired
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > TOKEN_EXPIRY_MS) {
      console.log('Token expired, clearing...');
      clearToken();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Failed to clear token:', error);
  }
}

export function isTokenExpired() {
  try {
    const timestamp = localStorage.getItem(TOKEN_TIMESTAMP_KEY);
    if (!timestamp) return true;
    
    const age = Date.now() - parseInt(timestamp, 10);
    return age > TOKEN_EXPIRY_MS;
  } catch (error) {
    return true;
  }
}
