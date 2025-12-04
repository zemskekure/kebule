import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  loadAllData, 
  createBrand, createLocation, createYear, createVision, createTheme, createInitiative, createProject, createNewRestaurant, createInfluence,
  updateBrand, updateLocation, updateYear, updateVision, updateTheme, updateInitiative, updateProject, updateNewRestaurant, updateInfluence,
  deleteBrand, deleteLocation, deleteYear, deleteVision, deleteTheme, deleteInitiative, deleteProject, deleteNewRestaurant, deleteInfluence
} from '../services/supabaseData';
import { updateSignal as signalLiteUpdateSignal, deleteSignal as signalLiteDeleteSignal } from '../services/signalApi';

// --- Initial Data (for loading state) ---

const INITIAL_DATA = {
  brands: [],
  locations: [],
  years: [],
  visions: [],
  themes: [],
  initiatives: [],
  projects: [],
  newRestaurants: [],
  influences: [],
  signals: []
};

// --- Helper: Get collection name from type ---

function getCollectionName(type) {
  const mapping = {
    year: 'years',
    vision: 'visions',
    theme: 'themes',
    initiative: 'initiatives',
    project: 'projects',
    newRestaurant: 'newRestaurants',
    reconstruction: 'newRestaurants', // Facelifts are stored in newRestaurants with category: 'facelift'
    brand: 'brands',
    location: 'locations',
    influence: 'influences',
    signal: 'signals',
  };
  return mapping[type] || 'influences';
}

// --- Helper to create audit fields ---
function createAuditFields(userId) {
  const now = new Date().toISOString();
  return {
    createdBy: userId || null,
    createdAt: now,
    updatedBy: userId || null,
    updatedAt: now
  };
}

function updateAuditFields(userId) {
  return {
    updatedBy: userId || null,
    updatedAt: new Date().toISOString()
  };
}

// --- Helper: Convert snake_case to camelCase ---
function toCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        result[camelKey] = toCamelCase(obj[key]);
        return result;
      },
      {}
    );
  }
  return obj;
}

// --- Main Hook ---

export function useStrategyData() {
  const { currentUser, googleToken } = useAuth();
  const userId = currentUser?.id || null;
  
  // State
  const [data, setData] = useState(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Load Data on Mount ---
  
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Load Strategy App data from Supabase
        const supabaseData = await loadAllData();
        
        // Convert all Supabase data to camelCase for the app
        const camelCaseData = toCamelCase(supabaseData);
        
        // Signals are now included in camelCaseData from Supabase
        setData(camelCaseData);
      } catch (err) {
        console.error('Failed to load strategy data:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (currentUser) {
      loadData();
    }
  }, [currentUser, googleToken]);

  // Ensure signals array exists for backward compatibility
  const safeData = {
    ...data,
    signals: data.signals ?? []
  };

  // --- CRUD Operations ---

  const addBrand = useCallback(async (name) => {
    const newId = Date.now().toString();
    const brandName = name && name.trim() ? name : 'Nová značka';
    const newBrand = {
      id: newId,
      name: brandName,
      logo_url: '',
      concept_short: '',
      description: '',
      foundation_year: '',
      social_links: { web: '', instagram: '', facebook: '' },
      contact: '',
      account_manager: '',
      created_by: userId,
      updated_by: userId
    };
    
    // Optimistic update
    setData(prev => ({ ...prev, brands: [...prev.brands, { ...newBrand, logoUrl: '', socialLinks: newBrand.social_links, conceptShort: '', foundationYear: '' }] }));
    
    // API call
    try {
      await createBrand(newBrand);
    } catch (err) {
      console.error('Failed to create brand:', err);
      // Revert on error would go here
    }
    
    return newId;
  }, [userId]);

  const addLocation = useCallback(async (brandId, name, address) => {
    const newId = Date.now().toString();
    const locationName = name && name.trim() ? name : 'Nová pobočka';
    const newLocation = { 
      id: newId, 
      brand_id: brandId, 
      name: locationName, 
      address: address || '', 
      created_by: userId, 
      updated_by: userId 
    };
    
    setData(prev => ({ ...prev, locations: [...(prev.locations || []), { ...newLocation, brandId: newLocation.brand_id }] }));
    
    try {
      await createLocation(newLocation);
    } catch (err) {
      console.error('Failed to create location:', err);
    }
    return newId;
  }, [userId]);

  const addInfluence = useCallback(async (title, type) => {
    const newId = Date.now().toString();
    const influenceTitle = title && title.trim() ? title : 'Nový vliv';
    const influenceType = type || 'external';
    const newInfluence = { 
      id: newId, 
      title: influenceTitle, 
      type: influenceType, 
      description: '', 
      connected_theme_ids: [], 
      connected_project_ids: [], 
      created_by: userId, 
      updated_by: userId 
    };
    
    setData(prev => ({ ...prev, influences: [...(prev.influences || []), { ...newInfluence, connectedThemeIds: [], connectedProjectIds: [] }] }));
    
    try {
      await createInfluence(newInfluence);
    } catch (err) {
      console.error('Failed to create influence:', err);
    }
    return newId;
  }, [userId]);

  const addNewRestaurant = useCallback(async (category = 'new') => {
    const newId = Date.now().toString();
    const newRest = {
      id: newId,
      title: category === 'new' ? 'Nová restaurace' : 'Nový facelift',
      description: '',
      status: 'Idea',
      category: category,
      location_id: null,
      opening_date: '',
      phase: 'Idea',
      concept_summary: '',
      social_links: { web: '', instagram: '', facebook: '' },
      contact: '',
      account_manager: '',
      brand_ids: [],
      location_ids: [],
      created_by: userId,
      updated_by: userId
    };
    
    setData(prev => ({ ...prev, newRestaurants: [...(prev.newRestaurants || []), { ...newRest, locationId: null, openingDate: '', conceptSummary: '', socialLinks: newRest.social_links, accountManager: '', brandIds: [], locationIds: [] }] }));
    
    try {
      await createNewRestaurant(newRest);
    } catch (err) {
      console.error('Failed to create new restaurant:', err);
    }
    return newId;
  }, [userId]);

  const addYear = useCallback(async () => {
    const newId = Date.now().toString();
    const newYear = { id: newId, title: '202X', created_by: userId, updated_by: userId };
    
    setData(prev => ({ ...prev, years: [...prev.years, newYear] }));
    
    try {
      await createYear(newYear);
    } catch (err) {
      console.error('Failed to create year:', err);
    }
    return newId;
  }, [userId]);

  const addVision = useCallback(async (yearId) => {
    const newId = Date.now().toString();
    const newVision = { 
      id: newId, 
      year_id: yearId, 
      title: 'Nová vize', 
      description: '', 
      brand_ids: [],
      location_ids: [],
      created_by: userId, 
      updated_by: userId 
    };
    
    setData(prev => ({ ...prev, visions: [...prev.visions, { ...newVision, yearId: newVision.year_id, brandIds: [], locationIds: [] }] }));
    
    try {
      await createVision(newVision);
    } catch (err) {
      console.error('Failed to create vision:', err);
    }
    return newId;
  }, [userId]);

  const addTheme = useCallback(async (visionId) => {
    const newId = Date.now().toString();
    const newTheme = { 
      id: newId, 
      vision_id: visionId, 
      title: 'Nové hlavní téma', 
      description: '', 
      priority: 'Střední', 
      brand_ids: [],
      location_ids: [],
      created_by: userId, 
      updated_by: userId 
    };
    
    setData(prev => ({ ...prev, themes: [...prev.themes, { ...newTheme, visionId: newTheme.vision_id, brandIds: [], locationIds: [] }] }));
    
    try {
      await createTheme(newTheme);
    } catch (err) {
      console.error('Failed to create theme:', err);
    }
    return newId;
  }, [userId]);

  const addInitiative = useCallback(async (themeId) => {
    console.log('Hook: addInitiative called with themeId:', themeId);
    // Generate UUID client-side to be safe
    const newId = crypto.randomUUID();
    console.log('Hook: Generated new UUID:', newId);
    const newInitiative = {
      id: newId,
      theme_id: themeId,
      name: 'Nový cíl',
      status: 'idea',
      description: '',
      start_date: null,
      end_date: null,
      created_by: userId,
      updated_by: userId
    };
    
    try {
      const created = await createInitiative(newInitiative);
      // Convert to camelCase and update local state
      const camelCaseInitiative = toCamelCase(created);
      setData(prev => ({ 
        ...prev, 
        initiatives: [...prev.initiatives, camelCaseInitiative] 
      }));
      return created.id;
    } catch (err) {
      console.error('Failed to create initiative:', err);
      // Even if API fails, we could optimistically add it, but let's stick to safe behavior
      return null;
    }
  }, [userId]);

  const addProject = useCallback(async (themeId, initiativeId = null) => {
    const newId = Date.now().toString();
    const newProject = {
      id: newId,
      theme_id: themeId,
      initiative_id: initiativeId,
      title: 'Nový úkol',
      description: '',
      status: 'Nápad',
      priority: 'medium',
      type: 'standard',
      brand_ids: [],
      location_ids: [],
      created_by: userId,
      updated_by: userId
    };
    
    setData(prev => ({ ...prev, projects: [...prev.projects, { ...newProject, themeId: newProject.theme_id, initiativeId: newProject.initiative_id, brandIds: [], locationIds: [] }] }));
    
    try {
      await createProject(newProject);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
    return newId;
  }, [userId]);

  const updateNode = useCallback(async (type, id, updates) => {
    console.log('updateNode called:', { type, id, updates });
    
    // Optimistic update
    setData(prev => {
      const collectionName = getCollectionName(type);
      const collection = prev[collectionName] || [];
      console.log('updateNode - collection before:', collection.find(item => item.id === id));
      const updatedCollection = collection.map(item => 
        item.id === id ? { ...item, ...updates, ...updateAuditFields(userId) } : item
      );
      console.log('updateNode - collection after:', updatedCollection.find(item => item.id === id));
      return { ...prev, [collectionName]: updatedCollection };
    });

    // Map updates to snake_case for API
    const apiUpdates = {};
    Object.keys(updates).forEach(key => {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      apiUpdates[snakeKey] = updates[key];
    });
    apiUpdates.updated_by = userId;
    apiUpdates.updated_at = new Date().toISOString();

    // Call appropriate update function
    try {
      if (type === 'brand') await updateBrand(id, apiUpdates);
      else if (type === 'location') await updateLocation(id, apiUpdates);
      else if (type === 'year') await updateYear(id, apiUpdates);
      else if (type === 'vision') await updateVision(id, apiUpdates);
      else if (type === 'theme') await updateTheme(id, apiUpdates);
      else if (type === 'initiative') await updateInitiative(id, apiUpdates);
      else if (type === 'project') await updateProject(id, apiUpdates);
      else if (type === 'newRestaurant' || type === 'reconstruction') await updateNewRestaurant(id, apiUpdates);
      else if (type === 'influence') await updateInfluence(id, apiUpdates);
      else if (type === 'signal') {
        // Signals are stored in Signal Lite backend, not Supabase
        // Signal Lite API expects camelCase, so pass original updates (not snake_case converted)
        console.log('Updating signal in Signal Lite backend:', { id, updates, hasToken: !!googleToken });
        await signalLiteUpdateSignal(id, updates, googleToken);
      }
    } catch (err) {
      console.error(`Failed to update ${type}:`, err);
    }
  }, [userId, googleToken]);

  const deleteNode = useCallback(async (type, id, options = {}) => {
    const { skipConfirm = false, confirmFn } = options;
    
    if (!skipConfirm && !confirmFn && !window.confirm('Opravdu chcete smazat tento záznam?')) return false;

    // Optimistic update
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
        // Cascade delete initiatives
        const initiativesToDelete = prev.initiatives.filter(i => i.themeId === id).map(i => i.id);
        newState.initiatives = prev.initiatives.filter(i => i.themeId !== id);
        // Cascade delete projects (both theme-level and initiative-level)
        newState.projects = prev.projects.filter(p => p.themeId !== id && !initiativesToDelete.includes(p.initiativeId));
      } else if (type === 'initiative') {
        newState.initiatives = prev.initiatives.filter(i => i.id !== id);
        // Unlink projects from this initiative (set initiativeId to null)
        // This matches the DB behavior (ON DELETE SET NULL)
        newState.projects = prev.projects.map(p => 
          p.initiativeId === id ? { ...p, initiativeId: null } : p
        );
      } else if (type === 'project') {
        newState.projects = prev.projects.filter(p => p.id !== id);
      } else if (type === 'newRestaurant' || type === 'reconstruction') {
        newState.newRestaurants = (prev.newRestaurants || []).filter(r => r.id !== id);
      } else if (type === 'influence') {
        newState.influences = prev.influences.filter(i => i.id !== id);
      } else if (type === 'brand') {
        newState.brands = prev.brands.filter(b => b.id !== id);
        newState.locations = (prev.locations || []).filter(l => l.brandId !== id);
      } else if (type === 'location') {
        newState.locations = (prev.locations || []).filter(l => l.id !== id);
      } else if (type === 'signal') {
        newState.signals = (prev.signals || []).filter(s => s.id !== id);
      }
      return newState;
    });

    // API call
    try {
      if (type === 'brand') await deleteBrand(id);
      else if (type === 'location') await deleteLocation(id);
      else if (type === 'year') await deleteYear(id);
      else if (type === 'vision') await deleteVision(id);
      else if (type === 'theme') await deleteTheme(id);
      else if (type === 'initiative') await deleteInitiative(id);
      else if (type === 'project') await deleteProject(id);
      else if (type === 'newRestaurant' || type === 'reconstruction') await deleteNewRestaurant(id);
      else if (type === 'influence') await deleteInfluence(id);
      // Signals are handled separately
    } catch (err) {
      console.error(`Failed to delete ${type}:`, err);
    }

    return true;
  }, []);

  // --- Signal CRUD Operations ---

  const addSignal = useCallback(() => {
    console.error('Signals can only be created in Signal Lite app');
  }, []);

  const updateSignal = useCallback(async (id, updates) => {
    setData(prev => ({
      ...prev,
      signals: (prev.signals || []).map(s => s.id === id ? { ...s, ...updates, ...updateAuditFields(userId) } : s)
    }));
    
    try {
      await signalLiteUpdateSignal(id, updates, googleToken);
    } catch (err) {
      console.error('Failed to update signal:', err);
    }
  }, [userId, googleToken]);

  const deleteSignal = useCallback(async (id, skipConfirm = false, confirmFn = null) => {
    if (!skipConfirm && !confirmFn && !window.confirm('Opravdu chcete smazat tento drobek?')) return false;
    
    setData(prev => ({
      ...prev,
      signals: (prev.signals || []).filter(s => s.id !== id)
    }));
    
    try {
      await signalLiteDeleteSignal(id, googleToken);
    } catch (err) {
      console.error('Failed to delete signal:', err);
    }
    return true;
  }, [googleToken]);

  const convertSignalToProject = useCallback(async (signalId, themeId) => {
    const signal = (data.signals || []).find(s => s.id === signalId);
    if (!signal) return null;

    const newProjectId = Date.now().toString();
    const newProject = {
      id: newProjectId,
      theme_id: themeId,
      title: signal.title,
      description: signal.body || '',
      status: 'Nápad',
      priority: 'medium',
      type: 'standard',
      brand_ids: [],
      location_ids: [],
      created_by: userId,
      updated_by: userId
    };

    // Calculate new themeIds
    const newThemeIds = signal.themeIds?.includes(themeId) 
      ? signal.themeIds 
      : [...(signal.themeIds || []), themeId];

    // Optimistic update
    setData(prev => {
      const updatedProjects = [...prev.projects, { ...newProject, themeId: newProject.theme_id, brandIds: [], locationIds: [] }];
      const updatedSignals = (prev.signals || []).map(s => {
        if (s.id === signalId) {
          return { ...s, status: 'converted', projectId: newProjectId, themeIds: newThemeIds, ...updateAuditFields(userId) };
        }
        return s;
      });
      return { ...prev, projects: updatedProjects, signals: updatedSignals };
    });

    // API calls
    try {
      await createProject(newProject);
      await apiUpdateSignal(signalId, {
        status: 'converted',
        projectId: newProjectId,
        themeIds: newThemeIds
      }, googleToken);
    } catch (err) {
      console.error('Failed to convert signal:', err);
    }

    return {
      projectId: newProjectId,
      signalUpdates: {
        status: 'converted',
        projectId: newProjectId,
        themeIds: newThemeIds
      }
    };
  }, [data.signals, userId, googleToken]);

  const moveItem = useCallback((itemType, itemId, newParentId, newIndex = null) => {
    // This functionality requires more complex handling with positions (sandboxPosition)
    // For now, just updating parent ID
    const updates = {};
    if (itemType === 'project') updates.themeId = newParentId;
    else if (itemType === 'theme') updates.visionId = newParentId;
    else if (itemType === 'vision') updates.yearId = newParentId;
    
    updateNode(itemType, itemId, updates);
  }, [updateNode]);

  const addSandboxNode = useCallback(async (type, position) => {
    const newId = Date.now().toString();
    const sandboxPosition = position;
    
    // Similar to addXXX but with position
    // Implemented simplistically here reusing addXXX where possible or creating new object
    
    // For full implementation, we would need separate create functions accepting position
    // Or update the addXXX functions to accept optional params
    
    // Leaving this as TODO/Future improvement since Sandbox might need refactoring
    console.warn('addSandboxNode not fully implemented with Supabase yet');
    
    return newId;
  }, []);

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
    // Import only updates local state for viewing? Or should it upload to Supabase?
    // For safety, maybe disable import or make it only local visualization
    alert('Import is disabled in Supabase mode to prevent data overwrites.');
  }, []);

  const restoreData = useCallback((restoredData) => {
     // Same as import
     alert('Restore is disabled in Supabase mode.');
  }, []);

  return {
    data: safeData,
    isLoading,
    error,
    // CRUD operations
    addBrand,
    addLocation,
    addInfluence,
    addNewRestaurant,
    addYear,
    addVision,
    addTheme,
    addInitiative,
    addProject,
    updateNode,
    deleteNode,
    moveItem,
    // Sandbox
    addSandboxNode,
    // Signals
    addSignal,
    updateSignal,
    deleteSignal,
    convertSignalToProject,
    // Import/Export
    exportData,
    importData,
    restoreData
  };
}
