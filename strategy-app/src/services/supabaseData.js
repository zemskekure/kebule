import { supabase } from './supabaseClient';

/**
 * Supabase data service for Strategy App
 * Handles all CRUD operations for brands, locations, years, visions, themes, projects, etc.
 */

// ============================================================================
// BRANDS
// ============================================================================

export async function getBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function createBrand(brand) {
  const { data, error } = await supabase
    .from('brands')
    .insert([brand])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateBrand(id, updates) {
  const { data, error } = await supabase
    .from('brands')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteBrand(id) {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================================================
// LOCATIONS
// ============================================================================

export async function getLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function createLocation(location) {
  const { data, error } = await supabase
    .from('locations')
    .insert([location])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateLocation(id, updates) {
  const { data, error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteLocation(id) {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================================================
// YEARS
// ============================================================================

export async function getYears() {
  const { data, error } = await supabase
    .from('years')
    .select('*')
    .order('year', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createYear(year) {
  const { data, error } = await supabase
    .from('years')
    .insert([year])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateYear(id, updates) {
  const { data, error } = await supabase
    .from('years')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteYear(id) {
  const { error } = await supabase
    .from('years')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================================================
// VISIONS
// ============================================================================

export async function getVisions() {
  const { data, error } = await supabase
    .from('visions')
    .select('*')
    .order('created_at');
  
  if (error) throw error;
  return data || [];
}

export async function createVision(vision) {
  const { data, error } = await supabase
    .from('visions')
    .insert([vision])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateVision(id, updates) {
  const { data, error } = await supabase
    .from('visions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteVision(id) {
  const { error } = await supabase
    .from('visions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================================================
// THEMES
// ============================================================================

export async function getThemes() {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('created_at');
  
  if (error) throw error;
  return data || [];
}

export async function createTheme(theme) {
  const { data, error } = await supabase
    .from('themes')
    .insert([theme])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateTheme(id, updates) {
  const { data, error } = await supabase
    .from('themes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteTheme(id) {
  const { error } = await supabase
    .from('themes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================================================
// PROJECTS
// ============================================================================

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at');
  
  if (error) throw error;
  return data || [];
}

export async function createProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteProject(id) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================================================
// NEW RESTAURANTS
// ============================================================================

export async function getNewRestaurants() {
  const { data, error } = await supabase
    .from('new_restaurants')
    .select('*')
    .order('created_at');
  
  if (error) throw error;
  return data || [];
}

export async function createNewRestaurant(restaurant) {
  const { data, error } = await supabase
    .from('new_restaurants')
    .insert([restaurant])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateNewRestaurant(id, updates) {
  const { data, error } = await supabase
    .from('new_restaurants')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteNewRestaurant(id) {
  const { error } = await supabase
    .from('new_restaurants')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================================================
// INFLUENCES
// ============================================================================

export async function getInfluences() {
  const { data, error } = await supabase
    .from('influences')
    .select('*')
    .order('created_at');
  
  if (error) throw error;
  return data || [];
}

export async function createInfluence(influence) {
  const { data, error } = await supabase
    .from('influences')
    .insert([influence])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateInfluence(id, updates) {
  const { data, error } = await supabase
    .from('influences')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteInfluence(id) {
  const { error } = await supabase
    .from('influences')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================================================
// LOAD ALL DATA (for initial load)
// ============================================================================

export async function loadAllData() {
  const [
    brands,
    locations,
    years,
    visions,
    themes,
    projects,
    newRestaurants,
    influences
  ] = await Promise.all([
    getBrands(),
    getLocations(),
    getYears(),
    getVisions(),
    getThemes(),
    getProjects(),
    getNewRestaurants(),
    getInfluences()
  ]);

  return {
    brands,
    locations,
    years,
    visions,
    themes,
    projects,
    newRestaurants,
    influences,
    signals: [] // Signals come from Signal Lite API, not Supabase
  };
}
