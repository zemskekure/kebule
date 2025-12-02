import { useState, useMemo, useCallback } from 'react';

// --- Initial Data ---

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
  { id: 'l24', brandId: 'b2', name: 'Eska Letná', address: 'Šmeralova, Praha 7' },
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
  { id: 'l25', brandId: 'b10', name: 'Myšák Holešovice', address: 'Osadní, Praha 7' },
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
    category: 'new',
    locationId: null,
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
    locationId: 'l1',
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

// --- Helper: localStorage hook ---

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

// --- Helper: Get collection name from type ---

function getCollectionName(type) {
  const mapping = {
    year: 'years',
    vision: 'visions',
    theme: 'themes',
    project: 'projects',
    newRestaurant: 'newRestaurants',
    reconstruction: 'newRestaurants', // Facelifts are stored in newRestaurants with category: 'facelift'
    brand: 'brands',
    location: 'locations',
    influence: 'influences',
  };
  return mapping[type] || 'influences';
}

// --- Main Hook ---

export function useStrategyData() {
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

  // --- CRUD Operations ---

  const addBrand = useCallback((name) => {
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
    return newId;
  }, [setData]);

  const addLocation = useCallback((brandId, name, address) => {
    const newId = Date.now().toString();
    const locationName = name && name.trim() ? name : 'Nová pobočka';
    const newLocation = { id: newId, brandId, name: locationName, address: address || '' };
    setData(prev => ({ ...prev, locations: [...(prev.locations || []), newLocation] }));
    return newId;
  }, [setData]);

  const addInfluence = useCallback((title, type) => {
    const newId = Date.now().toString();
    const influenceTitle = title && title.trim() ? title : 'Nový vliv';
    const influenceType = type || 'external';
    const newInfluence = { id: newId, title: influenceTitle, type: influenceType, description: '', connectedThemeIds: [], connectedProjectIds: [] };
    setData(prev => ({ ...prev, influences: [...(prev.influences || []), newInfluence] }));
    return newId;
  }, [setData]);

  const addNewRestaurant = useCallback((category = 'new') => {
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
    return newId;
  }, [setData]);

  const addYear = useCallback(() => {
    const newId = Date.now().toString();
    const newYear = { id: newId, title: '202X' };
    setData(prev => ({ ...prev, years: [...prev.years, newYear] }));
    return newId;
  }, [setData]);

  const addVision = useCallback((yearId) => {
    const newId = Date.now().toString();
    const newVision = { id: newId, yearId, title: 'Nová vize', description: '' };
    setData(prev => ({ ...prev, visions: [...prev.visions, newVision] }));
    return newId;
  }, [setData]);

  const addTheme = useCallback((visionId) => {
    const newId = Date.now().toString();
    const newTheme = { id: newId, visionId, title: 'Nové hlavní téma', description: '', priority: 'Střední' };
    setData(prev => ({ ...prev, themes: [...prev.themes, newTheme] }));
    return newId;
  }, [setData]);

  const addProject = useCallback((themeId) => {
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
    return newId;
  }, [setData]);

  const updateNode = useCallback((type, id, updates) => {
    setData(prev => {
      const collectionName = getCollectionName(type);
      const collection = prev[collectionName] || [];
      const updatedCollection = collection.map(item => item.id === id ? { ...item, ...updates } : item);
      return { ...prev, [collectionName]: updatedCollection };
    });
  }, [setData]);

  const deleteNode = useCallback((type, id, options = {}) => {
    const { skipConfirm = false } = options;
    if (!skipConfirm && !window.confirm('Opravdu chcete smazat tento záznam?')) return false;

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
      } else if (type === 'newRestaurant' || type === 'reconstruction') {
        newState.newRestaurants = (prev.newRestaurants || []).filter(r => r.id !== id);
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
    return true;
  }, [setData]);

  const moveItem = useCallback((itemType, itemId, newParentId, newIndex = null) => {
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
  }, [setData]);

  // --- Sandbox-specific add node ---

  const addSandboxNode = useCallback((type, position) => {
    const newId = Date.now().toString();
    const sandboxPosition = position;

    setData(prev => {
      let newState = { ...prev };

      if (type === 'year') {
        const newYear = { id: newId, title: '202X', sandboxPosition };
        newState.years = [...prev.years, newYear];
      } else if (type === 'vision') {
        const yearId = prev.years.length > 0 ? prev.years[0].id : 'y1';
        const newVision = { id: newId, yearId, title: 'Nová vize', description: '', sandboxPosition };
        newState.visions = [...prev.visions, newVision];
      } else if (type === 'theme') {
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
          connectedProjectIds: [],
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

    return newId;
  }, [setData]);

  // --- Import/Export ---

  const exportData = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "strategie_ambiente.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [data]);

  const importData = useCallback((event) => {
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
  }, [setData]);

  const restoreData = useCallback((restoredData) => {
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
  }, [setData]);

  return {
    data,
    // CRUD operations
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
    // Import/Export
    exportData,
    importData,
    restoreData,
  };
}

export default useStrategyData;
