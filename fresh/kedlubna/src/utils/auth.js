import { supabase } from '../services/supabase';

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function login() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: { prompt: 'select_account' },
      redirectTo: window.location.origin
    }
  });
  return { success: !error, error: error?.message };
}

export async function logout() {
  await supabase.auth.signOut();
}

export function getUser(session) {
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    name: u.user_metadata?.name || u.user_metadata?.full_name || u.email
  };
}
