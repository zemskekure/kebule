import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Download, Upload, LayoutGrid, List, BarChart3, Search, Moon, Sun, GitBranch, LogOut, User } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useConfirm } from './contexts/ConfirmContext';
import { LoginModal } from './components/LoginModal';
import { DetailPanel } from './components/DetailPanel';
import { VisionBoard } from './components/VisionBoard';
import { Dashboard } from './components/Dashboard';
import { AIChatWindow } from './components/AIChatWindow';
import { EditorSidebar } from './components/EditorSidebar';
import { EditorContent } from './components/EditorContent';
import { SandboxEditor } from './components/SandboxEditor';
import { useStrategyData } from './hooks/useStrategyData';

// --- Theme localStorage hook ---

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

function App() {
  // Auth
  const { currentUser, isAdmin, login, logout, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const confirm = useConfirm();

  // Use the strategy data hook for all CRUD operations
  const {
    data,
    addBrand,
    addLocation,
    addInfluence,
    addNewRestaurant,
    addYear,
    addVision,
    addTheme,
    addProject,
    updateNode,
    deleteNode,
    moveItem,
    addSandboxNode,
    addSignal,
    updateSignal,
    deleteSignal,
    convertSignalToProject,
    exportData,
    importData,
    restoreData,
  } = useStrategyData();

  // UI State - default to vision for non-logged-in users
  const [viewMode, setViewMode] = useState('vision'); // 'admin' | 'dashboard' | 'vision' | 'sandbox'
  const [editorSection, setEditorSection] = useState('thought-system');
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Theme state for each view
  const [themes, setThemes] = useLocalStorage('themes_v1', {
    admin: 'light',
    dashboard: 'dark',
    vision: 'dark',
    sandbox: 'dark'
  });

  const toggleTheme = (view) => {
    setThemes(prev => ({
      ...prev,
      [view]: prev[view] === 'light' ? 'dark' : 'light'
    }));
  };

  const currentTheme = themes[viewMode];

  // Apply theme to document for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // --- UI Actions (wrappers that also update UI state) ---

  const handleAddBrand = (name) => {
    const newId = addBrand(name);
    selectNode('brand', newId);
  };

  const handleAddLocation = (brandId, name, address) => {
    const newId = addLocation(brandId, name, address);
    selectNode('location', newId);
  };

  const handleAddInfluence = (title, type) => {
    const newId = addInfluence(title, type);
    selectNode('influence', newId);
  };

  const handleAddNewRestaurant = (category = 'new') => {
    const newId = addNewRestaurant(category);
    selectNode('newRestaurant', newId);
  };

  const handleAddYear = () => {
    const newId = addYear();
    setExpandedNodes(prev => ({ ...prev, [newId]: true }));
    selectNode('year', newId);
  };

  const handleAddVision = (yearId) => {
    const newId = addVision(yearId);
    setExpandedNodes(prev => ({ ...prev, [yearId]: true, [newId]: true }));
    selectNode('vision', newId);
  };

  const handleAddTheme = (visionId) => {
    const newId = addTheme(visionId);
    setExpandedNodes(prev => ({ ...prev, [visionId]: true, [newId]: true }));
    selectNode('theme', newId);
  };

  const handleAddProject = (themeId) => {
    const newId = addProject(themeId);
    setExpandedNodes(prev => ({ ...prev, [themeId]: true }));
    selectNode('project', newId);
  };

  const handleAddSignal = (signalPartial) => {
    const newId = addSignal(signalPartial);
    selectNode('signal', newId);
    return newId;
  };

  const handleDeleteNode = useCallback(async (type, id, options = {}) => {
    const { skipConfirm = false } = options;
    
    if (!skipConfirm) {
      const confirmed = await confirm({
        title: 'Smazat záznam',
        message: 'Opravdu chcete smazat tento záznam? Tato akce je nevratná.',
        confirmText: 'Smazat',
        cancelText: 'Zrušit',
        type: 'danger'
      });
      if (!confirmed) return;
    }
    
    const deleted = deleteNode(type, id, { skipConfirm: true, confirmFn: true });
    if (deleted) {
      setSelectedNode(null);
    }
  }, [confirm, deleteNode]);

  // --- Filter/Selection Actions ---

  const toggleBrandFilter = (id) => {
    setSelectedBrandIds(prev =>
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const toggleLocationFilter = (id) => {
    setSelectedLocationIds(prev =>
      prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]
    );
  };

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectNode = (type, id) => {
    setSelectedNode({ type, id });
  };

  // --- AI Command Handler ---

  const handleAICommand = (cmd) => {
    console.log("Received AI Command:", cmd);

    if (cmd.command === 'UPDATE_DATE') {
      const targetName = cmd.target.toLowerCase();
      const targetRest = data.newRestaurants.find(r => r.title.toLowerCase().includes(targetName));

      if (targetRest) {
        updateNode('newRestaurant', targetRest.id, { openingDate: cmd.date });
        console.log(`Updated ${targetRest.title} to ${cmd.date}`);
      } else {
        alert(`AI Error: Nemohu najít restauraci s názvem "${cmd.target}"`);
      }
    }
  };

  // --- Derived state for filtering ---

  const filteredProjects = useMemo(() => {
    let result = data.projects;
    if (selectedBrandIds.length > 0 || selectedLocationIds.length > 0) {
      result = result.filter(p => {
        const hasBrand = p.brands.some(bId => selectedBrandIds.includes(bId));
        return hasBrand;
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q));
    }
    return result;
  }, [data.projects, selectedBrandIds, selectedLocationIds, searchQuery]);

  const filteredNewRestaurants = useMemo(() => {
    let result = data.newRestaurants || [];

    if (selectedBrandIds.length > 0 || selectedLocationIds.length > 0) {
      result = result.filter(r => {
        const brandMatch = r.brands.some(bId => selectedBrandIds.includes(bId));
        const locationMatch = r.locationId && selectedLocationIds.includes(r.locationId);

        if (selectedBrandIds.length > 0 && brandMatch) return true;
        if (selectedLocationIds.length > 0 && locationMatch) return true;

        return false;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.title.toLowerCase().includes(q));
    }
    return result;
  }, [data.newRestaurants, selectedBrandIds, selectedLocationIds, searchQuery]);

  const filteredThemes = useMemo(() => {
    let result = data.themes;
    if (selectedBrandIds.length > 0) {
      const themeIds = new Set(filteredProjects.map(p => p.themeId));
      result = result.filter(t => themeIds.has(t.id));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }
    return result;
  }, [data.themes, filteredProjects, selectedBrandIds, searchQuery]);

  const filteredVisions = useMemo(() => {
    let result = data.visions;
    if (selectedBrandIds.length > 0) {
      const visionIds = new Set(filteredThemes.map(t => t.visionId));
      result = result.filter(v => visionIds.has(v.id));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => v.title.toLowerCase().includes(q));
    }
    return result;
  }, [data.visions, filteredThemes, selectedBrandIds, searchQuery]);

  const filteredYears = useMemo(() => {
    let result = data.years;
    if (selectedBrandIds.length > 0) {
      const yearIds = new Set(filteredVisions.map(v => v.yearId));
      result = result.filter(y => yearIds.has(y.id));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(y => y.title.includes(q));
    }
    return result;
  }, [data.years, filteredVisions, selectedBrandIds, searchQuery]);

  // --- Render ---

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <header style={{
        backgroundColor: currentTheme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: currentTheme === 'dark' ? 'blur(20px)' : 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: currentTheme === 'dark' ? 'blur(20px)' : 'blur(20px) saturate(180%)',
        color: currentTheme === 'dark' ? '#ffffff' : '#212529'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <h1 style={{ color: currentTheme === 'dark' ? '#ffffff' : '#212529', margin: 0, lineHeight: 1.2 }}>šiška</h1>
            <span style={{ fontSize: '0.65rem', color: currentTheme === 'dark' ? '#6b7280' : '#9ca3af', fontWeight: 400, letterSpacing: '0.5px' }}>build 0.1.0</span>
          </div>
        </div>

        {/* Global Search */}
        <div className="global-search">
          <Search size={16} className="search-icon" style={{ color: currentTheme === 'dark' ? '#adb5bd' : '#adb5bd' }} />
          <input
            type="text"
            placeholder="Hledat..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#f1f3f5',
              color: currentTheme === 'dark' ? '#ffffff' : '#212529',
              border: currentTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent'
            }}
          />
        </div>

        <div className="header-actions">
          <div className="view-toggle" style={{
            backgroundColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#f1f3f5'
          }}>
            <button
              className={`toggle-btn ${viewMode === 'admin' ? 'active' : ''}`}
              onClick={() => isAdmin ? setViewMode('admin') : setShowLoginModal(true)}
              style={{
                color: currentTheme === 'dark' ? (viewMode === 'admin' ? '#000' : '#fff') : (viewMode === 'admin' ? '#212529' : '#868e96'),
                backgroundColor: viewMode === 'admin' ? (currentTheme === 'dark' ? '#fff' : '#fff') : 'transparent'
              }}
            >
              <List size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Editor
            </button>
            <button
              className={`toggle-btn ${viewMode === 'dashboard' ? 'active' : ''}`}
              onClick={() => isAdmin ? setViewMode('dashboard') : setShowLoginModal(true)}
              style={{
                color: currentTheme === 'dark' ? (viewMode === 'dashboard' ? '#000' : '#fff') : (viewMode === 'dashboard' ? '#212529' : '#868e96'),
                backgroundColor: viewMode === 'dashboard' ? (currentTheme === 'dark' ? '#fff' : '#fff') : 'transparent'
              }}
            >
              <BarChart3 size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Dashboard
            </button>
            <button
              className={`toggle-btn ${viewMode === 'vision' ? 'active' : ''}`}
              onClick={() => setViewMode('vision')}
              style={{
                color: currentTheme === 'dark' ? (viewMode === 'vision' ? '#000' : '#fff') : (viewMode === 'vision' ? '#212529' : '#868e96'),
                backgroundColor: viewMode === 'vision' ? (currentTheme === 'dark' ? '#fff' : '#fff') : 'transparent'
              }}
            >
              <LayoutGrid size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Vize
            </button>
            <button
              className={`toggle-btn ${viewMode === 'sandbox' ? 'active' : ''}`}
              onClick={() => isAdmin ? setViewMode('sandbox') : setShowLoginModal(true)}
              style={{
                color: currentTheme === 'dark' ? (viewMode === 'sandbox' ? '#000' : '#fff') : (viewMode === 'sandbox' ? '#212529' : '#868e96'),
                backgroundColor: viewMode === 'sandbox' ? (currentTheme === 'dark' ? '#fff' : '#fff') : 'transparent'
              }}
            >
              <GitBranch size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Sandbox
            </button>
          </div>

          {/* User indicator / Login button */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '20px',
                backgroundColor: currentTheme === 'dark' ? 'rgba(234, 88, 12, 0.15)' : 'rgba(234, 88, 12, 0.08)',
                border: currentTheme === 'dark' ? '1px solid rgba(234, 88, 12, 0.3)' : '1px solid rgba(234, 88, 12, 0.2)'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'white'
                }}>
                  {currentUser.initials}
                </div>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: currentTheme === 'dark' ? '#fff' : '#374151'
                }}>
                  {currentUser.name.split(' ')[0]}
                </span>
              </div>
              <button
                className="btn btn-sm"
                onClick={logout}
                title="Odhlásit se"
                style={{
                  backgroundColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                  border: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-sm"
              onClick={() => setShowLoginModal(true)}
              style={{
                backgroundColor: 'linear-gradient(135deg, #ea580c, #c2410c)',
                background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <User size={16} /> Přihlásit
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            className="btn btn-sm"
            onClick={() => toggleTheme(viewMode)}
            title={currentTheme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
            style={{
              backgroundColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              border: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {currentTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {viewMode === 'admin' && (
            <>
              <button
                className="btn btn-sm"
                onClick={exportData}
                title="Exportovat JSON"
                style={{
                  backgroundColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                  border: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <Download size={16} />
              </button>
              <label
                className="btn btn-sm"
                title="Importovat JSON"
                style={{
                  cursor: 'pointer',
                  backgroundColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                  border: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <Upload size={16} />
                <input type="file" style={{ display: 'none' }} onChange={importData} accept=".json" />
              </label>
            </>
          )}
        </div>
      </header>

      {viewMode === 'vision' ? (
        <VisionBoard data={data} theme={currentTheme} />
      ) : viewMode === 'dashboard' ? (
        <Dashboard data={data} theme={currentTheme} />
      ) : viewMode === 'sandbox' ? (
        <SandboxEditor
          data={data}
          theme={currentTheme}
          onUpdateNode={updateNode}
          onDeleteNode={handleDeleteNode}
          onAddNode={addSandboxNode}
        />
      ) : (
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          backgroundColor: currentTheme === 'dark' ? '#0a0a0a' : '#f8f9fa'
        }}>
          {/* New Editor Sidebar with Menu */}
          <EditorSidebar
            activeSection={editorSection}
            onSectionChange={setEditorSection}
            theme={currentTheme}
          />

          {/* Editor Content Area */}
          <EditorContent
            activeSection={editorSection}
            data={data}
            selectedNode={selectedNode}
            expandedNodes={expandedNodes}
            onSelectNode={selectNode}
            onToggleNode={toggleNode}
            onAddYear={handleAddYear}
            onAddVision={handleAddVision}
            onAddTheme={handleAddTheme}
            onAddProject={handleAddProject}
            onAddInfluence={handleAddInfluence}
            onAddNewRestaurant={handleAddNewRestaurant}
            onAddBrand={handleAddBrand}
            onAddLocation={handleAddLocation}
            onAddSignal={handleAddSignal}
            onMoveItem={moveItem}
            onRestoreBackup={restoreData}
            theme={currentTheme}
          />

          {/* Detail Panel */}
          <DetailPanel
            selectedNode={selectedNode}
            data={data}
            onUpdate={updateNode}
            onDelete={handleDeleteNode}
            onConvertSignalToProject={convertSignalToProject}
            theme={currentTheme}
          />

          {/* AI Chat Window */}
          <AIChatWindow onCommand={handleAICommand} data={data} />
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onLogin={(email, password) => {
            const result = login(email, password);
            if (result.success) {
              setShowLoginModal(false);
            }
            return result;
          }}
          onClose={() => setShowLoginModal(false)}
          theme={currentTheme}
        />
      )}
    </div>
  );
}

export default App;
