import React, { useState, useMemo } from 'react';
import { Plus, Download, Upload, LayoutGrid, List, Zap, HardHat, BarChart3, Search, Moon, Sun, GitBranch } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { YearNode } from './components/MindMap';
import { DetailPanel } from './components/DetailPanel';
import { VisionBoard } from './components/VisionBoard';
import { Dashboard } from './components/Dashboard';
import { AIChatWindow } from './components/AIChatWindow';
import { EditorSidebar } from './components/EditorSidebar';
import { EditorContent } from './components/EditorContent';
import { SandboxEditor } from './components/SandboxEditor';

// --- Types & Initial Data ---

const INITIAL_BRANDS = [
  {
    id: 'b1',
    name: 'Lokál',
    foundationYear: '2009',
    conceptShort: 'Tradiční česká hospoda',
    description: 'Lokál je místem pro každého. Čepujeme pečlivě ošetřené pivo a vaříme klasická česká jídla bez umělých dochucovadel a polotovarů.',
    logoUrl: '',
    socialLinks: { web: 'lokal.ambi.cz', instagram: 'lokalcz', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b2',
    name: 'Eska',
    foundationYear: '2015',
    conceptShort: 'Restaurace s pekárnou',
    description: 'Eska je restaurace s pekárnou v Karlíně, která spojuje staré a nové. Tradiční postupy jako kvašení, sušení a pečení na ohni potkávají moderní přístup.',
    logoUrl: '',
    socialLinks: { web: 'eska.ambi.cz', instagram: 'eska_karlin', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b3',
    name: 'Café Savoy',
    foundationYear: '1893',
    conceptShort: 'Noblesní kavárna',
    description: 'Kavárna a restaurace v prvorepublikovém stylu. Vyhlášené snídaně, vídeňská káva a cukrářské výrobky vlastní výroby.',
    logoUrl: '',
    socialLinks: { web: 'cafesavoy.ambi.cz', instagram: 'cafesavoy', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b4',
    name: 'Brasileiro',
    foundationYear: '2004',
    conceptShort: 'Brazilská churrascaria',
    description: 'Autentická brazilská restaurace typu rodizio. Číšníci "passadores" odkrajují maso z jehel přímo na talíř hostů.',
    logoUrl: '',
    socialLinks: { web: 'brasileiro.ambi.cz', instagram: 'brasileiro_slovanskydum', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b5',
    name: 'Čestr',
    foundationYear: '2011',
    conceptShort: 'Steakhouse s českým masem',
    description: 'Restaurace zaměřená na vyzrálé hovězí maso z českého strakatého skotu a vepřové z přeštických prasat.',
    logoUrl: '',
    socialLinks: { web: 'cestr.ambi.cz', instagram: 'cestr_ambiente', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b6',
    name: 'Amaso',
    foundationYear: '2011',
    conceptShort: 'Zpracování masa',
    description: 'Dodáváme maso do restaurací Ambiente i zákazníkům domů. Staříme hovězí a vyrábíme vlastní uzeniny.',
    logoUrl: '',
    socialLinks: { web: 'amaso.cz', instagram: 'amaso_cz', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b7',
    name: 'Bokovka',
    foundationYear: '2014',
    conceptShort: 'Vinný bar',
    description: 'Vinný bar v Dlouhé ulici. Výběr vín od přátel a kamarádů, sýry a drobné občerstvení.',
    logoUrl: '',
    socialLinks: { web: 'bokovka.ambi.cz', instagram: 'bokovka', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b8',
    name: 'Bufet',
    foundationYear: '2017',
    conceptShort: 'Gril a fast food',
    description: 'Kvalitní fast food v Karlíně. Burgery, hranolky a pivo.',
    logoUrl: '',
    socialLinks: { web: '', instagram: '', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b9',
    name: 'Burger Service',
    foundationYear: '2023',
    conceptShort: 'Burgery s sebou',
    description: 'Revoluční 1. Rychlé burgery z kvalitního masa.',
    logoUrl: '',
    socialLinks: { web: 'burgerservice.cz', instagram: 'burgerservice_cz', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b10',
    name: 'Cukrárna Myšák',
    foundationYear: '1911',
    conceptShort: 'Tradiční cukrárna',
    description: 'Legendární pražská cukrárna ve Vodičkově ulici. Klasické české zákusky, káva a snídaně.',
    logoUrl: '',
    socialLinks: { web: 'mysak.ambi.cz', instagram: 'cukrarna.mysak', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b11',
    name: 'Dva kohouti',
    foundationYear: '2018',
    conceptShort: 'Pivovar a výčep',
    description: 'Místní pivovar v Karlíně. Pivo vaříme ráno a čepujeme večer.',
    logoUrl: '',
    socialLinks: { web: 'dvakohouti.cz', instagram: 'dvakohouti', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b12',
    name: 'Kantýna',
    foundationYear: '2017',
    conceptShort: 'Řeznictví a večeře',
    description: 'Masová restaurace v bývalé bance. Maso si vyberete u pultu a kuchaři vám ho připraví na ohni.',
    logoUrl: '',
    socialLinks: { web: 'kantyna.ambi.cz', instagram: 'kantyna', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b13',
    name: 'Kuchyň',
    foundationYear: '2018',
    conceptShort: 'Hradní restaurace',
    description: 'Česká kuchyně na Pražském hradě s nejlepším výhledem na město.',
    logoUrl: '',
    socialLinks: { web: 'kuchyn.ambi.cz', instagram: 'kuchyn_na_hrade', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b14',
    name: 'La Degustation',
    foundationYear: '2006',
    conceptShort: 'Michelin',
    description: 'Degustační večeře postavená na myšlenkách kuchařky Marie B. Svobodové z roku 1894.',
    logoUrl: '',
    socialLinks: { web: 'ladegustation.cz', instagram: 'ladegustation', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b15',
    name: 'Marie B.',
    foundationYear: '2023',
    conceptShort: 'Svobodná kuchyně',
    description: 'Sestra La Degustation. Víno a jídlo bez lístku, formou "carte blanche".',
    logoUrl: '',
    socialLinks: { web: 'marieb.cz', instagram: 'marieb__prague', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b16',
    name: 'Naše maso',
    foundationYear: '2014',
    conceptShort: 'Řeznictví',
    description: 'Řeznictví v Dlouhé ulici. Prodej masa a bistro s tatarákem a sekanou v housce.',
    logoUrl: '',
    socialLinks: { web: 'nasemaso.cz', instagram: 'nase_maso', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b17',
    name: 'Pasta Fresca',
    foundationYear: '2003',
    conceptShort: 'Italská trattorie',
    description: 'Domácí těstoviny a italská klasika v Celetné ulici.',
    logoUrl: '',
    socialLinks: { web: 'pastafresca.ambi.cz', instagram: 'pastafresca_ambiente', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b18',
    name: 'Pastacaffé',
    foundationYear: '2001',
    conceptShort: 'Italské bistro',
    description: 'Snídaně, káva a těstoviny. Rychlý italský bar.',
    logoUrl: '',
    socialLinks: { web: 'pastacaffe.ambi.cz', instagram: 'pastacaffe_ambiente', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b19',
    name: 'Pizza Nuova',
    foundationYear: '2006',
    conceptShort: 'Neapolská pizza',
    description: 'Pravá neapolská pizza z pece na dřevo a těstovinový bar.',
    logoUrl: '',
    socialLinks: { web: 'pizzanuova.ambi.cz', instagram: 'pizzanuova', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b20',
    name: 'Pult',
    foundationYear: '2021',
    conceptShort: 'Výčep',
    description: 'Šest druhů ležáků pečlivě ošetřených a načepovaných.',
    logoUrl: '',
    socialLinks: { web: 'pult.ambi.cz', instagram: 'pult_pivo', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b21',
    name: 'Štangl',
    foundationYear: '2023',
    conceptShort: 'Moderní česká kuchyně',
    description: 'Restaurace nad Eskou zaměřená na lokální suroviny a divoké byliny.',
    logoUrl: '',
    socialLinks: { web: 'stangl.ambi.cz', instagram: 'stangl_karlin', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b22',
    name: 'U Kalendů',
    foundationYear: '2021',
    conceptShort: 'Hostinec a pekárna',
    description: 'Tradiční pražská hospoda na náplavce s vlastní pekárnou.',
    logoUrl: '',
    socialLinks: { web: 'ukalendu.ambi.cz', instagram: 'u_kalendu', facebook: '' },
    contact: '',
    accountManager: ''
  },
  {
    id: 'b23',
    name: 'UM',
    foundationYear: '2020',
    conceptShort: 'Vzdělávací centrum',
    description: 'Školicí centrum pro profesionály i veřejnost. Kurzy vaření, pečení a čepování.',
    logoUrl: '',
    socialLinks: { web: 'um.ambi.cz', instagram: 'um_ambiente', facebook: '' },
    contact: '',
    accountManager: ''
  },
];

const INITIAL_LOCATIONS = [
  // Lokál
  { id: 'l1', brandId: 'b1', name: 'Dlouhááá', address: 'Dlouhá 33, Praha 1' },
  { id: 'l2', brandId: 'b1', name: 'U Bílé kuželky', address: 'Míšeňská 12, Praha 1' },
  { id: 'l3', brandId: 'b1', name: 'Hamburk', address: 'Sokolovská 55, Praha 8' },
  { id: 'l4', brandId: 'b1', name: 'Nad Stromovkou', address: 'Nad Královskou oborou 31, Praha 7' },
  { id: 'l5', brandId: 'b1', name: 'U Zavadilů', address: 'K Verneráku 70/1, Praha 4' },
  { id: 'l6', brandId: 'b1', name: 'Korunní', address: 'Korunní 984/39, Praha 2' },
  { id: 'l7', brandId: 'b1', name: 'U Jiráta', address: 'Vodičkova 699/30, Praha 1' },
  // Brasileiro
  { id: 'l8', brandId: 'b4', name: 'Brasileiro Slovanský dům', address: 'Na Příkopě 22, Praha 1' },
  { id: 'l9', brandId: 'b4', name: 'Brasileiro U Zelené žáby', address: 'U Radnice 8, Praha 1' },
  // Eska & Štangl
  { id: 'l10', brandId: 'b2', name: 'Eska Karlín', address: 'Pernerova 49, Praha 8' },
  { id: 'l24', brandId: 'b2', name: 'Eska Letná', address: 'Šmeralova, Praha 7' }, // New
  { id: 'l11', brandId: 'b21', name: 'Štangl', address: 'Pernerova 49, Praha 8' },
  // Others
  { id: 'l12', brandId: 'b3', name: 'Café Savoy', address: 'Vítězná 5, Praha 5' },
  { id: 'l13', brandId: 'b5', name: 'Čestr', address: 'Legerova 57/75, Praha 1' },
  { id: 'l14', brandId: 'b13', name: 'Kuchyň', address: 'Hradčanské nám. 186/1, Praha 1' },
  { id: 'l15', brandId: 'b14', name: 'La Degustation', address: 'Haštalská 18, Praha 1' },
  { id: 'l16', brandId: 'b12', name: 'Kantýna', address: 'Politických vězňů 5, Praha 1' },
  { id: 'l17', brandId: 'b16', name: 'Naše maso', address: 'Dlouhá 39, Praha 1' },
  { id: 'l18', brandId: 'b17', name: 'Pasta Fresca', address: 'Celetná 11, Praha 1' },
  { id: 'l19', brandId: 'b18', name: 'Pastacaffé Vodičkova', address: 'Vodičkova 67, Praha 1' },
  { id: 'l20', brandId: 'b18', name: 'Pastacaffé Vězeňská', address: 'Vězeňská 1, Praha 1' },
  { id: 'l21', brandId: 'b19', name: 'Pizza Nuova', address: 'Revoluční 1, Praha 1' },
  { id: 'l22', brandId: 'b10', name: 'Myšák Vodičkova', address: 'Vodičkova 710/31, Praha 1' },
  { id: 'l25', brandId: 'b10', name: 'Myšák Holešovice', address: 'Osadní, Praha 7' }, // New
  { id: 'l23', brandId: 'b22', name: 'U Kalendů', address: 'Rašínovo nábřeží 383/58, Praha 2' },
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
  { id: 't4', visionId: 'v1', title: 'Expanze', description: 'Nové pobočky a koncepty.', priority: 'Vysoká' },
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
    themeId: 't4',
    title: 'Nový Lokál - Dejvice',
    description: 'Expanze do další čtvrti.',
    status: 'V přípravě',
    brands: ['b1'],
    category: 'new', // 'new' | 'facelift'
    locationId: null, // For facelifts
    openingDate: '2026-03-15',
    phase: 'Construction',
    conceptSummary: 'Klasický Lokál s větším důrazem na zahrádku.',
    socialLinks: { web: '', instagram: '', facebook: '' },
    contact: 'Jan Novák',
    accountManager: 'Petra Svobodová'
  },
  {
    id: 'nr2',
    themeId: 't2',
    title: 'Rekonstrukce kuchyně Dlouhá',
    description: 'Modernizace vybavení.',
    status: 'Plánování',
    brands: ['b1'],
    category: 'facelift',
    locationId: 'l1', // Dlouhá
    openingDate: '2026-06-01',
    phase: 'Planning',
    conceptSummary: 'Nové konvektomaty a indukce.',
    socialLinks: { web: '', instagram: '', facebook: '' },
    contact: 'Karel Šéfkuchař',
    accountManager: ''
  }
];

const INITIAL_INFLUENCES = [
  { id: 'i1', title: 'Michelin Guide', type: 'external', description: 'Tlak na kvalitu a ocenění.', connectedThemeIds: ['t3'] },
  { id: 'i2', title: 'AI & Automatizace', type: 'external', description: 'Změna v objednávkových systémech.', connectedThemeIds: ['t1'] },
  { id: 'i3', title: 'Vlastní pekárna', type: 'internal', description: 'Možnost zásobovat všechny pobočky.', connectedThemeIds: ['t2'] },
];

const STORAGE_KEY = 'strategieAmbiente_v8';

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
    locations: INITIAL_LOCATIONS,
    years: INITIAL_YEARS,
    visions: INITIAL_VISIONS,
    themes: INITIAL_THEMES,
    projects: INITIAL_PROJECTS,
    newRestaurants: INITIAL_NEW_RESTAURANTS,
    influences: INITIAL_INFLUENCES
  });

  const [viewMode, setViewMode] = useState('admin'); // 'admin' | 'dashboard' | 'vision'
  const [editorSection, setEditorSection] = useState('thought-system'); // Editor section state
  const [selectedNode, setSelectedNode] = useState(null); // { type: 'year'|'vision'|'theme'|'project'|'influence'|'newRestaurant', id: string }
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({}); // { [id]: boolean }
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

  // Actions
  const addBrand = (name) => {
    const newId = Date.now().toString();
    const brandName = name && name.trim() ? name : 'Nová značka';
    const newBrand = {
      id: newId,
      name: brandName,
      logoUrl: '',
      conceptShort: '',
      description: '',
      foundationYear: '',
      socialLinks: { web: '', instagram: '', facebook: '' },
      contact: '',
      accountManager: ''
    };
    setData(prev => ({ ...prev, brands: [...prev.brands, newBrand] }));
    selectNode('brand', newId);
  };

  const addLocation = (brandId, name, address) => {
    const newId = Date.now().toString();
    const locationName = name && name.trim() ? name : 'Nová pobočka';
    const newLocation = { id: newId, brandId, name: locationName, address: address || '' };
    setData(prev => ({ ...prev, locations: [...(prev.locations || []), newLocation] }));
    selectNode('location', newId);
  };

  const addInfluence = (title, type) => {
    const newId = Date.now().toString();
    const influenceTitle = title && title.trim() ? title : 'Nový vliv';
    const influenceType = type || 'external';
    const newInfluence = { id: newId, title: influenceTitle, type: influenceType, description: '', connectedThemeIds: [] };
    setData(prev => ({ ...prev, influences: [...(prev.influences || []), newInfluence] }));
    selectNode('influence', newId);
  };

  const addNewRestaurant = (category = 'new') => {
    const newId = Date.now().toString();
    const newRest = {
      id: newId,
      title: category === 'new' ? 'Nová restaurace' : 'Nový facelift',
      description: '',
      status: 'Idea',
      brands: [],
      category: category,
      locationId: null,
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

  const updateNode = (type, id, updates) => {
    setData(prev => {
      const collectionName = type === 'year' ? 'years' :
        type === 'vision' ? 'visions' :
          type === 'theme' ? 'themes' :
            type === 'project' ? 'projects' :
              type === 'newRestaurant' ? 'newRestaurants' :
                type === 'reconstruction' ? 'facelifts' :
                  type === 'brand' ? 'brands' :
                    type === 'location' ? 'locations' : 'influences';
      const collection = prev[collectionName] || [];
      const updatedCollection = collection.map(item => item.id === id ? { ...item, ...updates } : item);
      return { ...prev, [collectionName]: updatedCollection };
    });
  };

  const deleteNode = (type, id, options = {}) => {
    const { skipConfirm = false } = options;
    if (!skipConfirm && !window.confirm('Opravdu chcete smazat tento záznam?')) return;

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
      } else if (type === 'reconstruction') {
        newState.facelifts = (prev.facelifts || []).filter(r => r.id !== id);
      } else if (type === 'influence') {
        newState.influences = prev.influences.filter(i => i.id !== id);
      } else if (type === 'brand') {
        newState.brands = prev.brands.filter(b => b.id !== id);
        // Also delete all locations of this brand
        newState.locations = (prev.locations || []).filter(l => l.brandId !== id);
      } else if (type === 'location') {
        newState.locations = (prev.locations || []).filter(l => l.id !== id);
      }
      return newState;
    });
    setSelectedNode(null);
  };

  // Move item to new parent (for drag and drop)
  const moveItem = (itemType, itemId, newParentId, newIndex = null) => {
    setData(prev => {
      let newState = { ...prev };
      
      if (itemType === 'project') {
        // Move project to new theme
        newState.projects = prev.projects.map(p => 
          p.id === itemId ? { ...p, themeId: newParentId } : p
        );
        // Reorder if index provided
        if (newIndex !== null) {
          const movedProject = newState.projects.find(p => p.id === itemId);
          const otherProjects = newState.projects.filter(p => p.id !== itemId);
          const themeProjects = otherProjects.filter(p => p.themeId === newParentId);
          const restProjects = otherProjects.filter(p => p.themeId !== newParentId);
          themeProjects.splice(newIndex, 0, movedProject);
          newState.projects = [...restProjects, ...themeProjects];
        }
      } else if (itemType === 'theme') {
        // Move theme to new vision
        newState.themes = prev.themes.map(t => 
          t.id === itemId ? { ...t, visionId: newParentId } : t
        );
        if (newIndex !== null) {
          const movedTheme = newState.themes.find(t => t.id === itemId);
          const otherThemes = newState.themes.filter(t => t.id !== itemId);
          const visionThemes = otherThemes.filter(t => t.visionId === newParentId);
          const restThemes = otherThemes.filter(t => t.visionId !== newParentId);
          visionThemes.splice(newIndex, 0, movedTheme);
          newState.themes = [...restThemes, ...visionThemes];
        }
      } else if (itemType === 'vision') {
        // Move vision to new year
        newState.visions = prev.visions.map(v => 
          v.id === itemId ? { ...v, yearId: newParentId } : v
        );
        if (newIndex !== null) {
          const movedVision = newState.visions.find(v => v.id === itemId);
          const otherVisions = newState.visions.filter(v => v.id !== itemId);
          const yearVisions = otherVisions.filter(v => v.yearId === newParentId);
          const restVisions = otherVisions.filter(v => v.yearId !== newParentId);
          yearVisions.splice(newIndex, 0, movedVision);
          newState.visions = [...restVisions, ...yearVisions];
        }
      }
      
      return newState;
    });
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
    console.log("Received AI Command:", cmd);

    if (cmd.command === 'UPDATE_DATE') {
      // Find restaurant by fuzzy name match
      const targetName = cmd.target.toLowerCase();
      const targetRest = data.newRestaurants.find(r => r.title.toLowerCase().includes(targetName));

      if (targetRest) {
        updateNode('newRestaurant', targetRest.id, { openingDate: cmd.date });
        // Optional: Show a toast or notification
        console.log(`Updated ${targetRest.title} to ${cmd.date}`);
      } else {
        alert(`AI Error: Nemohu najít restauraci s názvem "${cmd.target}"`);
      }
    }
  };

  const handleSandboxAddNode = (type, position) => {
    const newId = Date.now().toString();
    const sandboxPosition = position;

    setData(prev => {
      let newState = { ...prev };

      if (type === 'year') {
        const newYear = { id: newId, title: '202X', sandboxPosition };
        newState.years = [...prev.years, newYear];
      } else if (type === 'vision') {
        // Needs a yearId, but in sandbox we might not have one yet. 
        // We'll assign to the first year or a "Unassigned" state if possible.
        // For now, let's pick the first year if available.
        const yearId = prev.years.length > 0 ? prev.years[0].id : 'y1';
        const newVision = { id: newId, yearId, title: 'Nová vize', description: '', sandboxPosition };
        newState.visions = [...prev.visions, newVision];
      } else if (type === 'theme') {
        // Assign to first vision or empty
        const visionId = prev.visions.length > 0 ? prev.visions[0].id : 'v1';
        const newTheme = { id: newId, visionId, title: 'Nové téma', description: '', priority: 'Střední', sandboxPosition };
        newState.themes = [...prev.themes, newTheme];
      } else if (type === 'project') {
        const themeId = prev.themes.length > 0 ? prev.themes[0].id : 't1';
        const newProject = {
          id: newId,
          themeId,
          title: 'Nový projekt',
          description: '',
          status: 'Nápad',
          brands: [],
          type: 'standard',
          sandboxPosition
        };
        newState.projects = [...prev.projects, newProject];
      } else if (type === 'influence') {
        const newInfluence = {
          id: newId,
          title: 'Nový vliv',
          type: 'external',
          description: '',
          connectedThemeIds: [],
          sandboxPosition
        };
        newState.influences = [...(prev.influences || []), newInfluence];
      } else if (type === 'newRestaurant') {
        const newRest = {
          id: newId,
          title: 'Nová restaurace',
          description: '',
          status: 'Idea',
          brands: [],
          category: 'new',
          locationId: null,
          openingDate: '',
          phase: 'Idea',
          conceptSummary: '',
          socialLinks: { web: '', instagram: '', facebook: '' },
          contact: '',
          accountManager: '',
          sandboxPosition
        };
        newState.newRestaurants = [...(prev.newRestaurants || []), newRest];
      } else if (type === 'reconstruction') {
        const newRest = {
          id: newId,
          title: 'Nový facelift',
          description: '',
          status: 'Idea',
          brands: [],
          category: 'facelift',
          locationId: null,
          openingDate: '',
          phase: 'Idea',
          conceptSummary: '',
          socialLinks: { web: '', instagram: '', facebook: '' },
          contact: '',
          accountManager: '',
          sandboxPosition
        };
        newState.newRestaurants = [...(prev.newRestaurants || []), newRest];
      }

      return newState;
    });
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
          // Ensure locations exists for older exports
          if (!json.locations) json.locations = [];
          // Ensure newRestaurants have categories
          if (json.newRestaurants) {
            json.newRestaurants = json.newRestaurants.map(r => ({ ...r, category: r.category || 'new' }));
          }
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

  const restoreData = (restoredData) => {
    try {
      // Ensure locations exists for older backups
      if (!restoredData.locations) restoredData.locations = [];
      // Ensure newRestaurants have categories
      if (restoredData.newRestaurants) {
        restoredData.newRestaurants = restoredData.newRestaurants.map(r => ({ ...r, category: r.category || 'new' }));
      }
      setData(restoredData);
    } catch (err) {
      alert('Chyba při obnovení dat.');
    }
  };

  // Derived state for filtering
  const filteredProjects = useMemo(() => {
    let result = data.projects;
    // Filter by Brand OR Location
    if (selectedBrandIds.length > 0 || selectedLocationIds.length > 0) {
      result = result.filter(p => {
        const hasBrand = p.brands.some(bId => selectedBrandIds.includes(bId));
        // Projects don't have direct location link usually, but if they did:
        // For now, we assume projects are brand-level. If we want location specificity for projects, we'd need a locationId on projects.
        // But the requirement says "filter by brand location".
        // If a project belongs to Brand A, and we select Location A1 (child of Brand A), strictly speaking the project is for the whole brand unless specified.
        // However, usually "Location Filter" implies narrowing down.
        // Let's keep projects filtered by Brand for now, as they are strategic.
        // If the user wants to filter projects by location, we'd need to add locationId to projects.
        // Wait, the user said "filter by brand location".
        // Let's assume for now projects are brand-wide.
        // BUT, for Facelifts (which are in newRestaurants), they DO have locationId.
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

        // Logic:
        // 1. If Brand is selected, show it (Brand supersedes location).
        // 2. If Location is selected (and Brand NOT selected), show it.
        // 3. If Brand is NOT selected and Location is NOT selected, show everything (handled by outer if).

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
    // Years usually don't have titles to search, but we can search by year string
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(y => y.title.includes(q));
    }
    return result;
  }, [data.years, filteredVisions, selectedBrandIds, searchQuery]);


  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <header style={{
        backgroundColor: currentTheme === 'dark' ? 'rgba(20, 20, 20, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        color: currentTheme === 'dark' ? '#ffffff' : '#212529'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ color: currentTheme === 'dark' ? '#ffffff' : '#212529' }}>Šiška: Ambiente</h1>
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
              onClick={() => setViewMode('admin')}
              style={{
                color: currentTheme === 'dark' ? (viewMode === 'admin' ? '#000' : '#fff') : (viewMode === 'admin' ? '#212529' : '#868e96'),
                backgroundColor: viewMode === 'admin' ? (currentTheme === 'dark' ? '#fff' : '#fff') : 'transparent'
              }}
            >
              <List size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Editor
            </button>
            <button
              className={`toggle-btn ${viewMode === 'dashboard' ? 'active' : ''}`}
              onClick={() => setViewMode('dashboard')}
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
              onClick={() => setViewMode('sandbox')}
              style={{
                color: currentTheme === 'dark' ? (viewMode === 'sandbox' ? '#000' : '#fff') : (viewMode === 'sandbox' ? '#212529' : '#868e96'),
                backgroundColor: viewMode === 'sandbox' ? (currentTheme === 'dark' ? '#fff' : '#fff') : 'transparent'
              }}
            >
              <GitBranch size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Sandbox
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            className="btn btn-sm"
            onClick={() => toggleTheme(viewMode)}
            title={currentTheme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
            style={{
              backgroundColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#fff',
              color: currentTheme === 'dark' ? '#fff' : '#212529',
              border: currentTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e9ecef'
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
                  backgroundColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#fff',
                  color: currentTheme === 'dark' ? '#fff' : '#212529',
                  border: currentTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e9ecef'
                }}
              >
                <Download size={16} />
              </button>
              <label
                className="btn btn-sm"
                title="Importovat JSON"
                style={{
                  cursor: 'pointer',
                  backgroundColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#fff',
                  color: currentTheme === 'dark' ? '#fff' : '#212529',
                  border: currentTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e9ecef'
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
          onDeleteNode={deleteNode}
          onAddNode={handleSandboxAddNode}
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
            onAddYear={addYear}
            onAddVision={addVision}
            onAddTheme={addTheme}
            onAddProject={addProject}
            onAddInfluence={addInfluence}
            onAddNewRestaurant={addNewRestaurant}
            onAddBrand={addBrand}
            onAddLocation={addLocation}
            onMoveItem={moveItem}
            onRestoreBackup={restoreData}
            theme={currentTheme}
          />

          {/* Detail Panel */}
          <DetailPanel
            selectedNode={selectedNode}
            data={data}
            onUpdate={updateNode}
            onDelete={deleteNode}
            theme={currentTheme}
          />

          {/* AI Chat Window */}
          <AIChatWindow onCommand={handleAICommand} data={data} />
        </div>
      )}
    </div>
  );
}

export default App;
