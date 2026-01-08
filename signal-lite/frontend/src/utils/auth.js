import { supabase } from '../services/supabaseClient';

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Failed to get session:', error);
    return null;
  }
  return session;
}

export async function getAccessToken() {
  const session = await getSession();
  return session?.access_token || null;
}

export async function login() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        prompt: 'select_account',
        access_type: 'offline'
      },
      redirectTo: window.location.origin
    }
  });

  if (error) {
    console.error('Login failed:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout failed:', error);
  }
}

export function getUserFromSession(session) {
  if (!session?.user) return null;

  const user = session.user;
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.user_metadata?.full_name || user.email
  };
}
