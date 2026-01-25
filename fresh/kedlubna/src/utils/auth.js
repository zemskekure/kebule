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
  const name = u.user_metadata?.name || u.user_metadata?.full_name || u.email;
  return {
    id: u.id,
    email: u.email,
    name: name,
    avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
    initials: name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'
  };
}

export async function getUserRole(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Could not fetch user role:', error.message);
      return 'viewer';
    }
    return data?.role || 'viewer';
  } catch (e) {
    console.warn('getUserRole error:', e);
    return 'viewer';
  }
}

export async function updateUserRole(userId, newRole) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role')
    .order('name');

  if (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
  return data || [];
}
