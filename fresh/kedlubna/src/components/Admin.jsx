import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole } from '../utils/auth';
import { supabase } from '../services/supabase';
import './Admin.css';

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('viewer');
  const [addError, setAddError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setSaving(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Nepodařilo se změnit roli. Zkontrolujte oprávnění.');
    } finally {
      setSaving(null);
    }
  };

  const handleAddUser = async () => {
    if (!newEmail.trim()) return;
    setAddError('');

    // Check if user already exists
    const existing = users.find(u => u.email?.toLowerCase() === newEmail.toLowerCase().trim());
    if (existing) {
      // User exists - just change their role
      await handleRoleChange(existing.id, newRole);
      setShowAddForm(false);
      setNewEmail('');
      setNewRole('viewer');
      return;
    }

    // User doesn't exist yet - create a pending entry in profiles
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          email: newEmail.toLowerCase().trim(),
          role: newRole,
          name: newEmail.split('@')[0]
        });

      if (error) throw error;

      await loadUsers();
      setShowAddForm(false);
      setNewEmail('');
      setNewRole('viewer');
    } catch (error) {
      console.error('Failed to add user:', error);
      setAddError('Nepodařilo se přidat uživatele. Zkuste to znovu.');
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = search.toLowerCase();
    return (
      (user.name || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower)
    );
  });

  const getInitials = (name, email) => {
    if (name && name !== 'Bez jména') {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return (email || '?').charAt(0).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#E8BC6A', '#81C784', '#64B5F6', '#BA68C8', '#FF8A65', '#4DB6AC'
    ];
    const index = (name || '').charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="admin">
        <div className="admin-loading">Načítám uživatele...</div>
      </div>
    );
  }

  return (
    <div className="admin">
      <div className="admin-header">
        <div>
          <h2>Správa uživatelů</h2>
          <p className="admin-subtitle">
            {users.length} uživatelů
          </p>
        </div>
        <button className="add-user-btn" onClick={() => setShowAddForm(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Přidat uživatele
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="add-user-form">
          <h4>Přidat nového uživatele</h4>
          <p className="add-user-hint">Zadejte email a vyberte roli. Uživatel získá tuto roli při prvním přihlášení.</p>
          <div className="add-user-fields">
            <input
              type="email"
              placeholder="email@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              autoFocus
            />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="manager">Manažer</option>
              <option value="viewer">Pouze čtení</option>
            </select>
            <button className="add-btn" onClick={handleAddUser}>Přidat</button>
            <button className="cancel-btn" onClick={() => { setShowAddForm(false); setNewEmail(''); setAddError(''); }}>Zrušit</button>
          </div>
          {addError && <p className="add-error">{addError}</p>}
        </div>
      )}

      {/* Search */}
      <div className="admin-search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Hledat uživatele..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Roles Legend */}
      <div className="roles-legend">
        <div className="role-item">
          <span className="role-badge admin">Admin</span>
          <span className="role-desc">Plný přístup + správa</span>
        </div>
        <div className="role-item">
          <span className="role-badge manager">Manažer</span>
          <span className="role-desc">Vše kromě administrace</span>
        </div>
        <div className="role-item">
          <span className="role-badge viewer">Viewer</span>
          <span className="role-desc">Pouze prohlížení</span>
        </div>
      </div>

      {/* Users List */}
      <div className="users-list">
        {filteredUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-info">
              <div
                className="user-avatar"
                style={{ background: getAvatarColor(user.name || user.email) }}
              >
                {getInitials(user.name, user.email)}
              </div>
              <div className="user-details">
                <h3>{user.name || 'Bez jména'}</h3>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="user-role">
              <select
                value={user.role || 'viewer'}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                disabled={saving === user.id}
                className={`role-select ${user.role || 'viewer'}`}
              >
                <option value="admin">Admin</option>
                <option value="manager">Manažer</option>
                <option value="viewer">Pouze čtení</option>
              </select>
              {saving === user.id && <span className="saving">Ukládám...</span>}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="empty-state">
          <p>{search ? 'Žádní uživatelé nenalezeni' : 'Zatím žádní uživatelé'}</p>
        </div>
      )}
    </div>
  );
}

export default Admin;
