import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { login, logout, getUser } from './utils/auth';
import {
  fetchSignals,
  fetchTopics,
  fetchBrands,
  fetchProjects,
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
  deleteSignal
} from './utils/api';
import Login from './components/Login';
import Inbox from './components/Inbox';
import Plan from './components/Plan';
import Znacky from './components/Znacky';
import Projects from './components/Projects';
import Relations from './components/Relations';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('inbox');

  // Real data from Supabase
  const [signals, setSignals] = useState([]);
  const [topics, setTopics] = useState([]);
  const [brands, setBrands] = useState([]);
  const [projects, setProjects] = useState([]);
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

  // Load data when session is available
  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

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
          <button
            className={`tab tab-inbox ${tab === 'inbox' ? 'active' : ''}`}
            onClick={() => setTab('inbox')}
          >
            Inbox
            {inboxCount > 0 && <span className="badge">{inboxCount}</span>}
          </button>
          <button
            className={`tab ${tab === 'plan' ? 'active' : ''}`}
            onClick={() => setTab('plan')}
          >
            Plán 2026
          </button>
          <button
            className={`tab ${tab === 'znacky' ? 'active' : ''}`}
            onClick={() => setTab('znacky')}
          >
            Značky
          </button>
          <button
            className={`tab ${tab === 'projects' ? 'active' : ''}`}
            onClick={() => setTab('projects')}
          >
            Projekty
          </button>
          <button
            className={`tab ${tab === 'relations' ? 'active' : ''}`}
            onClick={() => setTab('relations')}
          >
            Mapa
          </button>
        </nav>

        <div className="user-area">
          <span className="user-name">{user?.name}</span>
          <button className="logout-btn" onClick={logout}>
            Odhlásit
          </button>
        </div>
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
            {tab === 'relations' && (
              <Relations
                signals={signals}
                topics={topics}
                brands={brands}
                projects={projects}
              />
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
