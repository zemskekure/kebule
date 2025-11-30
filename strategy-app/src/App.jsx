import React, { useState, useMemo } from 'react';
import { Plus, Download, Upload, LayoutGrid, List, Zap, HardHat, BarChart3, Search } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { YearNode } from './components/MindMap';
import { DetailPanel } from './components/DetailPanel';
import { VisionBoard } from './components/VisionBoard';
import { Dashboard } from './components/Dashboard';
import { AIChatWindow } from './components/AIChatWindow';

// --- Types & Initial Data ---

const INITIAL_BRANDS = [
  { id: 'b1', name: 'Lokál', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b2', name: 'Eska', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b3', name: 'Café Savoy', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b4', name: 'Brasileiro', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b5', name: 'Čestr', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b6', name: 'Amaso', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b7', name: 'Bokovka', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b8', name: 'Bufet', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b9', name: 'Burger Service', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b10', name: 'Cukrárna Myšák', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b11', name: 'Dva kohouti', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b12', name: 'Kantýna', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b13', name: 'Kuchyň', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b14', name: 'La Degustation', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b15', name: 'Marie B.', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b16', name: 'Naše maso', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b17', name: 'Pasta Fresca', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b18', name: 'Pastacaffé', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b19', name: 'Pizza Nuova', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b20', name: 'Pult', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b21', name: 'Štangl', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b22', name: 'U Kalendů', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
  { id: 'b23', name: 'UM', logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' },
];

const INITIAL_YEARS = [
  { id: 'y1', title: '2026' }
];

const INITIAL_VISIONS = [
  {
    id: 'v1',
    yearId: 'y1',
    title: 'Rok české gastronomie',
    description: 'Hlavní vize: Návrat ke kořenům s moderním přístupem.'
  }
];

const INITIAL_THEMES = [
  { id: 't1', visionId: 'v1', title: 'Digitalizace', description: 'Zlepšení procesů pomocí technologií.', priority: 'Vysoká' },
  { id: 't2', visionId: 'v1', title: 'Udržitelnost', description: 'Ekologie a zero waste.', priority: 'Střední' },
  { id: 't3', visionId: 'v1', title: 'Lidé a péče', description: 'Nábor a vzdělávání talentů.', priority: 'Vysoká' },
];

const INITIAL_PROJECTS = [
  {
    id: 'p1',
    themeId: 't1',
    title: 'Nová mobilní aplikace',
    description: 'Věrnostní program pro hosty.',
    status: 'V přípravě',
    brands: ['b1', 'b2'],
    type: 'standard'
  },
];

const INITIAL_NEW_RESTAURANTS = [
  {
    id: 'nr1',
    themeId: 't2',
    title: 'Nový Lokál - Dejvice',
    description: 'Expanze do další čtvrti.',
    status: 'V přípravě',
    brands: ['b1'],
    openingDate: '2026-03-15',
    phase: 'Construction',
    conceptSummary: 'Klasický Lokál s větším důrazem na zahrádku.',
    socialLinks: { web: '', instagram: '', facebook: '' },
    contact: 'Jan Novák',
    accountManager: 'Petra Svobodová'
  },
];

const INITIAL_INFLUENCES = [
  { id: 'i1', title: 'Michelin Guide', type: 'external', description: 'Tlak na kvalitu a ocenění.', connectedThemeIds: ['t3'] },
  { id: 'i2', title: 'AI & Automatizace', type: 'external', description: 'Změna v objednávkových systémech.', connectedThemeIds: ['t1'] },
  { id: 'i3', title: 'Vlastní pekárna', type: 'internal', description: 'Možnost zásobovat všechny pobočky.', connectedThemeIds: ['t2'] },
];

const STORAGE_KEY = 'strategieAmbiente_v4';

// --- Hooks ---

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
  // State
  const [data, setData] = useLocalStorage(STORAGE_KEY, {
    brands: INITIAL_BRANDS,
    years: INITIAL_YEARS,
    visions: INITIAL_VISIONS,
    themes: INITIAL_THEMES,
    projects: INITIAL_PROJECTS,
    newRestaurants: INITIAL_NEW_RESTAURANTS,
    influences: INITIAL_INFLUENCES
  });

  const [viewMode, setViewMode] = useState('admin'); // 'admin' | 'dashboard' | 'vision'
  const [selectedNode, setSelectedNode] = useState(null); // { type: 'year'|'vision'|'theme'|'project'|'influence'|'newRestaurant', id: string }
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({}); // { [id]: boolean }
  const [searchQuery, setSearchQuery] = useState('');

  // Actions
  const addBrand = (name) => {
    if (!name.trim()) return;
    const newBrand = { id: Date.now().toString(), name, logoUrl: '', socialLinks: { web: '', instagram: '', facebook: '' }, contact: '', accountManager: '' };
    setData(prev => ({ ...prev, brands: [...prev.brands, newBrand] }));
  };

  const addInfluence = (title, type) => {
    if (!title.trim()) return;
    const newInfluence = { id: Date.now().toString(), title, type, description: '', connectedThemeIds: [] };
    setData(prev => ({ ...prev, influences: [...(prev.influences || []), newInfluence] }));
  };

  const addNewRestaurant = () => {
    const newId = Date.now().toString();
    const newRest = {
      id: newId,
      title: 'Nová restaurace',
      description: '',
      status: 'Idea',
      brands: [],
      openingDate: '',
      phase: 'Idea',
      conceptSummary: '',
      socialLinks: { web: '', instagram: '', facebook: '' },
      contact: '',
      accountManager: ''
    };
    setData(prev => ({ ...prev, newRestaurants: [...(prev.newRestaurants || []), newRest] }));
    selectNode('newRestaurant', newId);
  };

  const toggleBrandFilter = (id) => {
    setSelectedBrandIds(prev =>
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectNode = (type, id) => {
    setSelectedNode({ type, id });
  };

  const updateNode = (type, id, updates) => {
    setData(prev => {
      const collectionName = type === 'year' ? 'years' :
        type === 'vision' ? 'visions' :
          type === 'theme' ? 'themes' :
            type === 'project' ? 'projects' :
              type === 'newRestaurant' ? 'newRestaurants' : 'influences';
      const collection = prev[collectionName] || [];
      const updatedCollection = collection.map(item => item.id === id ? { ...item, ...updates } : item);
      return { ...prev, [collectionName]: updatedCollection };
    });
  };

  const deleteNode = (type, id) => {
    if (!window.confirm('Opravdu chcete smazat tento záznam?')) return;

    setData(prev => {
      let newState = { ...prev };
      if (type === 'year') {
        newState.years = prev.years.filter(y => y.id !== id);
        // Cascade delete visions
        const visionsToDelete = prev.visions.filter(v => v.yearId === id).map(v => v.id);
        newState.visions = prev.visions.filter(v => v.yearId !== id);
        // Cascade delete themes
        const themesToDelete = prev.themes.filter(t => visionsToDelete.includes(t.visionId)).map(t => t.id);
        newState.themes = prev.themes.filter(t => !visionsToDelete.includes(t.visionId));
        // Cascade delete projects
        newState.projects = prev.projects.filter(p => !themesToDelete.includes(p.themeId));
      } else if (type === 'vision') {
        newState.visions = prev.visions.filter(v => v.id !== id);
        const themesToDelete = prev.themes.filter(t => t.visionId === id).map(t => t.id);
        newState.themes = prev.themes.filter(t => t.visionId !== id);
        newState.projects = prev.projects.filter(p => !themesToDelete.includes(p.themeId));
      } else if (type === 'theme') {
        newState.themes = prev.themes.filter(t => t.id !== id);
        newState.projects = prev.projects.filter(p => p.themeId !== id);
      } else if (type === 'project') {
        newState.projects = prev.projects.filter(p => p.id !== id);
      } else if (type === 'newRestaurant') {
        newState.newRestaurants = prev.newRestaurants.filter(r => r.id !== id);
      } else if (type === 'influence') {
        newState.influences = prev.influences.filter(i => i.id !== id);
      }
      return newState;
    });
    setSelectedNode(null);
  };

  const addYear = () => {
    const newId = Date.now().toString();
    const newYear = { id: newId, title: '202X' };
    setData(prev => ({ ...prev, years: [...prev.years, newYear] }));
    setExpandedNodes(prev => ({ ...prev, [newId]: true }));
    selectNode('year', newId);
  };

  const addVision = (yearId) => {
    const newId = Date.now().toString();
    const newVision = { id: newId, yearId, title: 'Nová vize', description: '' };
    setData(prev => ({ ...prev, visions: [...prev.visions, newVision] }));
    setExpandedNodes(prev => ({ ...prev, [yearId]: true, [newId]: true }));
    selectNode('vision', newId);
  };

  const addTheme = (visionId) => {
    const newId = Date.now().toString();
    const newTheme = { id: newId, visionId, title: 'Nové hlavní téma', description: '', priority: 'Střední' };
    setData(prev => ({ ...prev, themes: [...prev.themes, newTheme] }));
    setExpandedNodes(prev => ({ ...prev, [visionId]: true, [newId]: true }));
    selectNode('theme', newId);
  };

  const addProject = (themeId) => {
    const newId = Date.now().toString();
    const newProject = {
      id: newId,
      themeId,
      title: 'Nový úkol',
      description: '',
      status: 'Nápad',
      brands: [],
      type: 'standard'
    };
    setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
    setExpandedNodes(prev => ({ ...prev, [themeId]: true }));
    selectNode('project', newId);
  };

  const handleAICommand = (cmd) => {
    // ... existing AI logic ...
    if (cmd.type === 'UPDATE_DATE') {
      const targetRest = data.newRestaurants[0];
      if (targetRest) {
        const parts = cmd.date.split('.');
        if (parts.length === 3) {
          const isoDate = `${parts[2].trim()}-${parts[1].trim().padStart(2, '0')}-${parts[0].trim().padStart(2, '0')}`;
          updateNode('newRestaurant', targetRest.id, { openingDate: isoDate });
          alert(`AI: Datum pro ${targetRest.title} aktualizováno na ${isoDate}`);
        }
      }
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "strategie_ambiente.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json.brands && json.years) {
          setData(json);
          alert('Data byla úspěšně importována.');
        } else {
          alert('Chyba: Neplatný formát JSON souboru.');
        }
      } catch (err) {
        alert('Chyba při čtení souboru.');
      }
    };
    reader.readAsText(file);
  };

  // Derived state for filtering
  const filteredProjects = useMemo(() => {
    let result = data.projects;
    if (selectedBrandIds.length > 0) {
      result = result.filter(p => p.brands.some(bId => selectedBrandIds.includes(bId)));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q));
    }
    return result;
  }, [data.projects, selectedBrandIds, searchQuery]);

  const filteredNewRestaurants = useMemo(() => {
    let result = data.newRestaurants || [];
    if (selectedBrandIds.length > 0) {
      result = result.filter(r => r.brands.some(bId => selectedBrandIds.includes(bId)));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.title.toLowerCase().includes(q));
    }
    return result;
  }, [data.newRestaurants, selectedBrandIds, searchQuery]);

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
    // Years usually don't have titles to search, but we can search by year string
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(y => y.title.includes(q));
    }
    return result;
  }, [data.years, filteredVisions, selectedBrandIds, searchQuery]);


  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1>Thought OS: Ambiente</h1>
        </div>

        {/* Global Search */}
        <div className="global-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Hledat..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'admin' ? 'active' : ''}`}
              onClick={() => setViewMode('admin')}
            >
              <List size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Editor
            </button>
            <button
              className={`toggle-btn ${viewMode === 'dashboard' ? 'active' : ''}`}
              onClick={() => setViewMode('dashboard')}
            >
              <BarChart3 size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Dashboard
            </button>
            <button
              className={`toggle-btn ${viewMode === 'vision' ? 'active' : ''}`}
              onClick={() => setViewMode('vision')}
            >
              <LayoutGrid size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Vize
            </button>
          </div>
          {viewMode === 'admin' && (
            <>
              <button className="btn btn-sm" onClick={exportData} title="Exportovat JSON">
                <Download size={16} />
              </button>
              <label className="btn btn-sm" title="Importovat JSON" style={{ cursor: 'pointer' }}>
                <Upload size={16} />
                <input type="file" style={{ display: 'none' }} onChange={importData} accept=".json" />
              </label>
            </>
          )}
        </div>
      </header>

      {viewMode === 'vision' ? (
        <VisionBoard data={data} />
      ) : viewMode === 'dashboard' ? (
        <Dashboard data={data} />
      ) : (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar
            brands={data.brands}
            influences={data.influences || []}
            newRestaurants={filteredNewRestaurants}
            selectedBrandIds={selectedBrandIds}
            onAddBrand={addBrand}
            onAddInfluence={addInfluence}
            onAddNewRestaurant={addNewRestaurant}
            onToggleFilter={toggleBrandFilter}
            onSelectInfluence={(id) => selectNode('influence', id)}
            onSelectNewRestaurant={(id) => selectNode('newRestaurant', id)}
            selectedNode={selectedNode}
          />

          <div className="panel panel-center">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Mapa myšlenek</span>
              <div className="header-actions">
                <button className="btn btn-primary btn-sm" onClick={addYear}>
                  <Plus size={16} /> Přidat rok
                </button>
              </div>
            </div>
            <div className="panel-content">
              {filteredYears.length === 0 ? (
                <div className="empty-state">
                  <p>Žádná data k zobrazení. Přidejte rok nebo upravte filtry.</p>
                </div>
              ) : (
                filteredYears.map(year => (
                  <YearNode
                    key={year.id}
                    data={year}
                    visions={filteredVisions.filter(v => v.yearId === year.id)}
                    allThemes={filteredThemes}
                    allProjects={filteredProjects}
                    expanded={!!expandedNodes[year.id]}
                    onToggle={() => toggleNode(year.id)}
                    selected={selectedNode?.id === year.id}
                    onSelect={() => selectNode('year', year.id)}
                    onAddVision={() => addVision(year.id)}
                    onToggleNode={toggleNode}
                    expandedNodes={expandedNodes}
                    selectedNode={selectedNode}
                    onSelectNode={selectNode}
                    onAddTheme={addTheme}
                    onAddProject={addProject}
                  />
                ))
              )}
            </div>
          </div>

          <DetailPanel
            selectedNode={selectedNode}
            data={data}
            onUpdate={updateNode}
            onDelete={deleteNode}
          />

          {/* AI Chat Window - Only in Admin Mode */}
          <AIChatWindow onCommand={handleAICommand} />
        </div>
      )}
    </div>
  );
}

export default App;
