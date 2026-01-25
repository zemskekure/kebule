import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { login, logout, getUser, getUserRole } from './utils/auth';
import {
  fetchSignals,
  fetchTopics,
  fetchBrands,
  fetchProjects,
  fetchBriefs,
  createTopic,
  deleteTopic,
  assignSignalToTopic,
  unassignSignalFromTopic,
  assignSignalToBrand,
  unassignSignalFromBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  createProject,
  updateProject,
  deleteProject,
  linkSignalToProject,
  resolveSignal,
  rejectSignal,
  deleteSignal,
  createBrief,
  updateBrief,
  deleteBrief
} from './utils/api';
import Login from './components/Login';
import Inbox from './components/Inbox';
import Plan from './components/Plan';
import Znacky from './components/Znacky';
import Projects from './components/Projects';
import Briefs from './components/Briefs';
import Relations from './components/Relations';
import Organization from './components/Organization';
import Admin from './components/Admin';
import './App.css';

// Role-based tab access
const TAB_PERMISSIONS = {
  admin: ['inbox', 'plan', 'znacky', 'projects', 'briefs', 'admin'],
  manager: ['inbox', 'plan', 'znacky', 'projects', 'briefs'],
  viewer: ['inbox', 'projects', 'briefs']
};

// User dropdown menu component
function UserMenu({ user, userRole, onAdminClick, onLogout }) {
  const [open, setOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Manažer';
      default: return 'Uživatel';
    }
  };

  // Generate a consistent color based on name
  const getAvatarColor = (name) => {
    const colors = [
      ['#E8BC6A', '#D4A856'], // gold
      ['#81C784', '#66BB6A'], // green
      ['#64B5F6', '#42A5F5'], // blue
      ['#BA68C8', '#AB47BC'], // purple
      ['#FF8A65', '#FF7043'], // orange
      ['#4DB6AC', '#26A69A'], // teal
    ];
    const index = (name || '').charCodeAt(0) % colors.length;
    return colors[index];
  };

  const [color1, color2] = getAvatarColor(user?.name);

  return (
    <div className="user-menu">
      <button className="user-menu-trigger" onClick={() => setOpen(!open)}>
        {user?.avatar && !avatarError ? (
          <img
            src={user.avatar}
            alt=""
            className="user-avatar"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div
            className="user-avatar-initials"
            style={{ background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)` }}
          >
            {user?.initials}
          </div>
        )}
        <span className="user-name">{user?.name}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`chevron ${open ? 'open' : ''}`}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="user-menu-backdrop" onClick={() => setOpen(false)} />
          <div className="user-menu-dropdown">
            <div className="user-menu-header">
              <span className="user-menu-email">{user?.email}</span>
              <span className={`user-menu-role ${userRole}`}>{getRoleLabel(userRole)}</span>
            </div>
            {userRole === 'admin' && (
              <button className="user-menu-item" onClick={() => { onAdminClick(); setOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 10C9.65685 10 11 8.65685 11 7C11 5.34315 9.65685 4 8 4C6.34315 4 5 5.34315 5 7C5 8.65685 6.34315 10 8 10Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M13 14C13 11.2386 10.7614 9 8 9C5.23858 9 3 11.2386 3 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M12.5 5.5L14 4M14 4L12.5 2.5M14 4H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Správa uživatelů
              </button>
            )}
            <button className="user-menu-item logout" onClick={onLogout}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6M11 11L14 8M14 8L11 5M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Odhlásit se
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('viewer');
  const [tab, setTab] = useState(() => {
    return localStorage.getItem('kedlubna-tab') || 'inbox';
  });

  // Get allowed tabs based on role
  const allowedTabs = TAB_PERMISSIONS[userRole] || TAB_PERMISSIONS.viewer;

  // Persist tab to localStorage (only if allowed)
  const handleTabChange = (newTab) => {
    if (allowedTabs.includes(newTab)) {
      setTab(newTab);
      localStorage.setItem('kedlubna-tab', newTab);
    }
  };

  // Check if user can edit (not a viewer)
  const canEdit = userRole !== 'viewer';

  // Real data from Supabase
  const [signals, setSignals] = useState([]);
  const [topics, setTopics] = useState([]);
  const [brands, setBrands] = useState([]);
  const [projects, setProjects] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch role separately - don't block loading
  useEffect(() => {
    if (session?.user?.id) {
      getUserRole(session.user.id).then(role => {
        setUserRole(role || 'viewer');
      });
    }
  }, [session]);

  // Load data when session is available
  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  // Reset tab if not allowed for current role
  useEffect(() => {
    if (!allowedTabs.includes(tab)) {
      const newTab = allowedTabs[0] || 'inbox';
      setTab(newTab);
      localStorage.setItem('kedlubna-tab', newTab);
    }
  }, [userRole]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [signalsData, topicsData, brandsData, projectsData] = await Promise.all([
        fetchSignals(),
        fetchTopics(),
        fetchBrands(),
        fetchProjects()
      ]);
      setSignals(signalsData);
      setTopics(topicsData);
      setBrands(brandsData);
      setProjects(projectsData);

      // Briefs table may not exist yet - fetch separately
      try {
        const briefsData = await fetchBriefs();
        setBriefs(briefsData);
      } catch (e) {
        console.warn('Briefs table not available yet:', e.message);
        setBriefs([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // === Topic Operations ===

  const handleAddTopic = async (name) => {
    const colors = ['#E8BC6A', '#81C784', '#64B5F6', '#BA68C8', '#FF8A65'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    try {
      const newTopic = await createTopic(name, color);
      setTopics([newTopic, ...topics]);
    } catch (error) {
      console.error('Failed to create topic:', error);
    }
  };

  const handleDeleteTopic = async (id) => {
    try {
      await deleteTopic(id);
      setTopics(topics.filter(t => t.id !== id));
      // Reload signals to update their topic assignments
      const signalsData = await fetchSignals();
      setSignals(signalsData);
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
  };

  // === Signal-Topic Assignment ===

  const handleAssignSignalToTopic = async (signalId, topicId) => {
    try {
      await assignSignalToTopic(signalId, topicId);
      // Reload signals to get updated assignments
      const signalsData = await fetchSignals();
      setSignals(signalsData);
    } catch (error) {
      console.error('Failed to assign signal to topic:', error);
    }
  };

  const handleUnassignSignalFromTopic = async (signalId, topicId) => {
    try {
      await unassignSignalFromTopic(signalId, topicId);
      const signalsData = await fetchSignals();
      setSignals(signalsData);
    } catch (error) {
      console.error('Failed to unassign signal from topic:', error);
    }
  };

  // === Signal-Brand Assignment ===

  const handleAssignSignalToBrand = async (signalId, brandId) => {
    try {
      await assignSignalToBrand(signalId, brandId);
      const signalsData = await fetchSignals();
      setSignals(signalsData);
    } catch (error) {
      console.error('Failed to assign signal to brand:', error);
    }
  };

  const handleUnassignSignalFromBrand = async (signalId, brandId) => {
    try {
      await unassignSignalFromBrand(signalId, brandId);
      const signalsData = await fetchSignals();
      setSignals(signalsData);
    } catch (error) {
      console.error('Failed to unassign signal from brand:', error);
    }
  };

  // === Project Operations ===

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData);
      setProjects([newProject, ...projects]);
      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  const handleUpdateProject = async (id, updates) => {
    try {
      const updatedProject = await updateProject(id, updates);
      setProjects(projects.map(p => p.id === id ? { ...p, ...updatedProject } : p));
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleLinkSignalToProject = async (signalId, projectId) => {
    try {
      await linkSignalToProject(signalId, projectId);
      const signalsData = await fetchSignals();
      setSignals(signalsData);
    } catch (error) {
      console.error('Failed to link signal to project:', error);
    }
  };

  // === Brand Operations ===

  const handleCreateBrand = async (brandData) => {
    try {
      const newBrand = await createBrand(brandData);
      setBrands([...brands, newBrand]);
      return newBrand;
    } catch (error) {
      console.error('Failed to create brand:', error);
      throw error;
    }
  };

  const handleUpdateBrand = async (id, updates) => {
    try {
      const updatedBrand = await updateBrand(id, updates);
      setBrands(brands.map(b => b.id === id ? { ...b, ...updatedBrand } : b));
    } catch (error) {
      console.error('Failed to update brand:', error);
    }
  };

  const handleDeleteBrand = async (id) => {
    try {
      await deleteBrand(id);
      setBrands(brands.filter(b => b.id !== id));
    } catch (error) {
      console.error('Failed to delete brand:', error);
      throw error; // Re-throw so UI can show error
    }
  };

  // === Signal Status Operations ===

  const handleResolveSignal = async (signalId, note) => {
    try {
      await resolveSignal(signalId, note);
      const signalsData = await fetchSignals();
      setSignals(signalsData);
    } catch (error) {
      console.error('Failed to resolve signal:', error);
    }
  };

  const handleRejectSignal = async (signalId, note) => {
    try {
      await rejectSignal(signalId, note);
      const signalsData = await fetchSignals();
      setSignals(signalsData);
    } catch (error) {
      console.error('Failed to reject signal:', error);
    }
  };

  const handleDeleteSignal = async (signalId) => {
    try {
      await deleteSignal(signalId);
      setSignals(signals.filter(s => s.id !== signalId));
    } catch (error) {
      console.error('Failed to delete signal:', error);
    }
  };

  // === Brief Operations ===

  const handleCreateBrief = async (briefData) => {
    try {
      const newBrief = await createBrief(briefData);
      setBriefs([newBrief, ...briefs]);

      // If brief was created from a project, update project status to "zadano"
      if (briefData.project_id) {
        await handleUpdateProject(briefData.project_id, { status: 'zadano' });
      }

      return newBrief;
    } catch (error) {
      console.error('Failed to create brief:', error);
      throw error;
    }
  };

  const handleUpdateBrief = async (id, updates) => {
    try {
      const updatedBrief = await updateBrief(id, updates);
      setBriefs(briefs.map(b => b.id === id ? { ...b, ...updatedBrief } : b));
    } catch (error) {
      console.error('Failed to update brief:', error);
    }
  };

  const handleDeleteBrief = async (id) => {
    try {
      await deleteBrief(id);
      setBriefs(briefs.filter(b => b.id !== id));
    } catch (error) {
      console.error('Failed to delete brief:', error);
    }
  };

  // === Render ===

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-orb" />
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={login} />;
  }

  const user = getUser(session);

  // Count signals in inbox
  const inboxCount = signals.filter(s => s.status === 'inbox').length;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-orb" />
          <span>Kedlubna</span>
        </div>

        <nav className="tabs">
          {allowedTabs.includes('inbox') && (
            <button
              className={`tab tab-inbox ${tab === 'inbox' ? 'active' : ''}`}
              onClick={() => handleTabChange('inbox')}
            >
              Inbox
              {inboxCount > 0 && <span className="badge">{inboxCount}</span>}
            </button>
          )}
          {allowedTabs.includes('plan') && (
            <button
              className={`tab ${tab === 'plan' ? 'active' : ''}`}
              onClick={() => handleTabChange('plan')}
            >
              Plán 2026
            </button>
          )}
          {allowedTabs.includes('znacky') && (
            <button
              className={`tab ${tab === 'znacky' ? 'active' : ''}`}
              onClick={() => handleTabChange('znacky')}
            >
              Značky
            </button>
          )}
          {allowedTabs.includes('projects') && (
            <button
              className={`tab ${tab === 'projects' ? 'active' : ''}`}
              onClick={() => handleTabChange('projects')}
            >
              Projekty
            </button>
          )}
          {allowedTabs.includes('briefs') && (
            <button
              className={`tab ${tab === 'briefs' ? 'active' : ''}`}
              onClick={() => handleTabChange('briefs')}
            >
              Zadání
            </button>
          )}
        </nav>

        <UserMenu
          user={user}
          userRole={userRole}
          onAdminClick={() => handleTabChange('admin')}
          onLogout={logout}
        />
      </header>

      {/* Content */}
      <main className="content">
        {dataLoading ? (
          <div className="loading-data">Načítám data...</div>
        ) : (
          <>
            {tab === 'inbox' && (
              <Inbox
                signals={signals}
                topics={topics}
                brands={brands}
                projects={projects}
                onAssignToTopic={handleAssignSignalToTopic}
                onUnassignFromTopic={handleUnassignSignalFromTopic}
                onAssignToBrand={handleAssignSignalToBrand}
                onUnassignFromBrand={handleUnassignSignalFromBrand}
                onResolve={handleResolveSignal}
                onReject={handleRejectSignal}
                onDelete={handleDeleteSignal}
              />
            )}
            {tab === 'plan' && (
              <Plan
                topics={topics}
                signals={signals}
                onAddTopic={handleAddTopic}
                onDeleteTopic={handleDeleteTopic}
                onUnassignSignal={handleUnassignSignalFromTopic}
              />
            )}
            {tab === 'znacky' && (
              <Znacky
                brands={brands}
                signals={signals}
                onCreateBrand={handleCreateBrand}
                onUpdateBrand={handleUpdateBrand}
                onDeleteBrand={handleDeleteBrand}
              />
            )}
            {tab === 'projects' && (
              <Projects
                projects={projects}
                topics={topics}
                brands={brands}
                signals={signals}
                onCreateProject={handleCreateProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
              />
            )}
            {tab === 'briefs' && (
              <Briefs
                briefs={briefs}
                projects={projects}
                brands={brands}
                signals={signals}
                onCreateBrief={handleCreateBrief}
                onUpdateBrief={handleUpdateBrief}
                onDeleteBrief={handleDeleteBrief}
              />
            )}
            {tab === 'relations' && (
              <Relations
                signals={signals}
                topics={topics}
                brands={brands}
                projects={projects}
              />
            )}
            {tab === 'organization' && (
              <Organization />
            )}
            {tab === 'admin' && userRole === 'admin' && (
              <Admin />
            )}
          </>
        )}
      </main>

      {/* Ambiente Branding */}
      <div className="ambiente-brand">
        <img src="/ambi_symbol_cernobile_rgb_fullhd.png" alt="Ambiente" className="ambiente-logo" />
        <span>Důvěrné · Pouze pro interní použití <strong>Ambiente</strong></span>
      </div>
    </div>
  );
}

export default App;
