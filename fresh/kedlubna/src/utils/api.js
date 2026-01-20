import { supabase } from '../services/supabase';

// ============ SIGNALS ============

export async function fetchSignals() {
  const { data, error } = await supabase
    .from('signals')
    .select(`
      *,
      signal_topics(topic_id),
      signal_brands(brand_id)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Transform to include topic_ids and brand_ids arrays
  return data.map(signal => ({
    ...signal,
    topic_ids: signal.signal_topics?.map(st => st.topic_id) || [],
    brand_ids: signal.signal_brands?.map(sb => sb.brand_id) || []
  }));
}

export async function updateSignal(id, updates) {
  const { data, error } = await supabase
    .from('signals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSignal(id) {
  const { error } = await supabase
    .from('signals')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function assignSignalToTopic(signalId, topicId) {
  // First check if already assigned
  const { data: existing } = await supabase
    .from('signal_topics')
    .select('*')
    .eq('signal_id', signalId)
    .eq('topic_id', topicId)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('signal_topics')
    .insert({ signal_id: signalId, topic_id: topicId })
    .select()
    .single();

  if (error) throw error;

  // Update signal status to assigned
  await supabase
    .from('signals')
    .update({ status: 'assigned', updated_at: new Date().toISOString() })
    .eq('id', signalId);

  return data;
}

export async function unassignSignalFromTopic(signalId, topicId) {
  const { error } = await supabase
    .from('signal_topics')
    .delete()
    .eq('signal_id', signalId)
    .eq('topic_id', topicId);

  if (error) throw error;

  // Check if signal has any remaining topic assignments
  const { data: remaining } = await supabase
    .from('signal_topics')
    .select('*')
    .eq('signal_id', signalId);

  // If no more topics, set status back to inbox
  if (!remaining || remaining.length === 0) {
    await supabase
      .from('signals')
      .update({ status: 'inbox', updated_at: new Date().toISOString() })
      .eq('id', signalId);
  }
}

export async function assignSignalToBrand(signalId, brandId) {
  const { data: existing } = await supabase
    .from('signal_brands')
    .select('*')
    .eq('signal_id', signalId)
    .eq('brand_id', brandId)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('signal_brands')
    .insert({ signal_id: signalId, brand_id: brandId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unassignSignalFromBrand(signalId, brandId) {
  const { error } = await supabase
    .from('signal_brands')
    .delete()
    .eq('signal_id', signalId)
    .eq('brand_id', brandId);

  if (error) throw error;
}

// ============ TOPICS ============

export async function fetchTopics() {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createTopic(name, color) {
  const { data, error } = await supabase
    .from('topics')
    .insert({ name, color, year: 2026 })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTopic(id) {
  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ BRANDS ============

export async function fetchBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function createBrand({ name, vision, description, color }) {
  const { data, error } = await supabase
    .from('brands')
    .insert({ name, vision, description, color })
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

// ============ PROJECTS ============

export async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_topics(topic_id),
      project_brands(brand_id),
      owner:profiles(id, name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(project => ({
    ...project,
    topic_ids: project.project_topics?.map(pt => pt.topic_id) || [],
    brand_ids: project.project_brands?.map(pb => pb.brand_id) || []
  }));
}

export async function createProject({ name, description, topicIds, brandIds, ownerId, dueDate }) {
  // Create project
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      owner_id: ownerId,
      due_date: dueDate,
      status: 'active'
    })
    .select()
    .single();

  if (error) throw error;

  // Add topic links
  if (topicIds && topicIds.length > 0) {
    await supabase
      .from('project_topics')
      .insert(topicIds.map(topicId => ({ project_id: project.id, topic_id: topicId })));
  }

  // Add brand links
  if (brandIds && brandIds.length > 0) {
    await supabase
      .from('project_brands')
      .insert(brandIds.map(brandId => ({ project_id: project.id, brand_id: brandId })));
  }

  return project;
}

export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
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

export async function linkSignalToProject(signalId, projectId) {
  const { data, error } = await supabase
    .from('signals')
    .update({
      project_id: projectId,
      status: 'assigned',
      updated_at: new Date().toISOString()
    })
    .eq('id', signalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function resolveSignal(signalId, resolutionNote) {
  const { data, error } = await supabase
    .from('signals')
    .update({
      status: 'resolved',
      resolution_note: resolutionNote,
      updated_at: new Date().toISOString()
    })
    .eq('id', signalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function rejectSignal(signalId, resolutionNote) {
  const { data, error } = await supabase
    .from('signals')
    .update({
      status: 'rejected',
      resolution_note: resolutionNote,
      updated_at: new Date().toISOString()
    })
    .eq('id', signalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
