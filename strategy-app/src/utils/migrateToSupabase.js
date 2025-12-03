import { supabase } from '../services/supabaseClient';

/**
 * Migrate data from localStorage to Supabase
 * This is a one-time migration utility
 */

const STORAGE_KEY = 'strategieAmbiente_v8';

export async function migrateLocalStorageToSupabase() {
  try {
    console.log('🔄 Starting migration from localStorage to Supabase...');

    // Get data from localStorage
    const localData = localStorage.getItem(STORAGE_KEY);
    if (!localData) {
      console.log('⚠️  No localStorage data found');
      return { success: false, message: 'No data to migrate' };
    }

    const data = JSON.parse(localData);
    console.log('📦 Found localStorage data:', {
      brands: data.brands?.length || 0,
      locations: data.locations?.length || 0,
      years: data.years?.length || 0,
      visions: data.visions?.length || 0,
      themes: data.themes?.length || 0,
      projects: data.projects?.length || 0,
      newRestaurants: data.newRestaurants?.length || 0,
      influences: data.influences?.length || 0
    });

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    const userId = session.user.id;
    console.log('👤 Migrating for user:', session.user.email);

    // Migrate each table
    const results = {};

    // Brands
    if (data.brands?.length > 0) {
      const brandsToInsert = data.brands.map(b => ({
        id: b.id,
        name: b.name,
        color: b.color || null,
        foundation_year: b.foundationYear || null,
        concept_short: b.conceptShort || null,
        description: b.description || null,
        logo_url: b.logoUrl || null,
        social_links: b.socialLinks || null,
        contact: b.contact || null,
        account_manager: b.accountManager || null,
        created_by: userId,
        updated_by: userId
      }));
      const { data: inserted, error } = await supabase
        .from('brands')
        .upsert(brandsToInsert, { onConflict: 'id' })
        .select();
      
      if (error) throw new Error(`Brands migration failed: ${error.message}`);
      results.brands = inserted.length;
    }

    // Locations
    if (data.locations?.length > 0) {
      const locationsToInsert = data.locations.map(l => ({
        id: l.id,
        brand_id: l.brandId,
        name: l.name,
        address: l.address || null,
        created_by: userId,
        updated_by: userId
      }));
      const { data: inserted, error } = await supabase
        .from('locations')
        .upsert(locationsToInsert, { onConflict: 'id' })
        .select();
      
      if (error) throw new Error(`Locations migration failed: ${error.message}`);
      results.locations = inserted.length;
    }

    // Years
    if (data.years?.length > 0) {
      const yearsToInsert = data.years.map(y => ({
        id: y.id,
        title: y.title || y.year, // Handle both formats
        sandbox_position: y.sandboxPosition || null,
        created_by: userId,
        updated_by: userId
      }));
      const { data: inserted, error } = await supabase
        .from('years')
        .upsert(yearsToInsert, { onConflict: 'id' })
        .select();
      
      if (error) throw new Error(`Years migration failed: ${error.message}`);
      results.years = inserted.length;
    }

    // Visions
    if (data.visions?.length > 0) {
      const visionsToInsert = data.visions.map(v => ({
        id: v.id,
        title: v.title,
        description: v.description,
        year_id: v.yearId,
        brand_ids: v.brandIds || [],
        location_ids: v.locationIds || [],
        sandbox_position: v.sandboxPosition || null,
        created_by: userId,
        updated_by: userId
      }));
      const { data: inserted, error } = await supabase
        .from('visions')
        .upsert(visionsToInsert, { onConflict: 'id' })
        .select();
      
      if (error) throw new Error(`Visions migration failed: ${error.message}`);
      results.visions = inserted.length;
    }

    // Themes
    if (data.themes?.length > 0) {
      const themesToInsert = data.themes.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        vision_id: t.visionId,
        priority: t.priority || 'Medium',
        brand_ids: t.brandIds || [],
        location_ids: t.locationIds || [],
        sandbox_position: t.sandboxPosition || null,
        created_by: userId,
        updated_by: userId
      }));
      const { data: inserted, error } = await supabase
        .from('themes')
        .upsert(themesToInsert, { onConflict: 'id' })
        .select();
      
      if (error) throw new Error(`Themes migration failed: ${error.message}`);
      results.themes = inserted.length;
    }

    // Projects
    if (data.projects?.length > 0) {
      const projectsToInsert = data.projects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        theme_id: p.themeId,
        status: p.status || 'planned',
        priority: p.priority || 'medium',
        type: p.type || 'standard',
        start_date: p.startDate,
        end_date: p.endDate,
        budget: p.budget,
        brand_ids: p.brandIds || [],
        location_ids: p.locationIds || [],
        sandbox_position: p.sandboxPosition || null,
        created_by: userId,
        updated_by: userId
      }));
      const { data: inserted, error } = await supabase
        .from('projects')
        .upsert(projectsToInsert, { onConflict: 'id' })
        .select();
      
      if (error) throw new Error(`Projects migration failed: ${error.message}`);
      results.projects = inserted.length;
    }

    // New Restaurants
    if (data.newRestaurants?.length > 0) {
      const restaurantsToInsert = data.newRestaurants.map(r => ({
        id: r.id,
        title: r.title || r.name, // Handle both
        description: r.description,
        status: r.status || 'planned',
        category: r.category || 'new',
        location_id: r.locationId,
        opening_date: r.openingDate,
        phase: r.phase,
        concept_summary: r.conceptSummary,
        social_links: r.socialLinks || null,
        contact: r.contact,
        account_manager: r.accountManager,
        brand_ids: r.brandIds || [],
        location_ids: r.locationIds || [],
        sandbox_position: r.sandboxPosition || null,
        created_by: userId,
        updated_by: userId
      }));
      const { data: inserted, error } = await supabase
        .from('new_restaurants')
        .upsert(restaurantsToInsert, { onConflict: 'id' })
        .select();
      
      if (error) throw new Error(`New restaurants migration failed: ${error.message}`);
      results.newRestaurants = inserted.length;
    }

    // Influences
    if (data.influences?.length > 0) {
      const influencesToInsert = data.influences.map(i => ({
        id: i.id,
        title: i.title,
        description: i.description,
        type: i.type || 'external',
        impact: i.impact || 'medium',
        connected_theme_ids: i.connectedThemeIds || [],
        connected_project_ids: i.connectedProjectIds || [],
        sandbox_position: i.sandboxPosition || null,
        created_by: userId,
        updated_by: userId
      }));
      const { data: inserted, error } = await supabase
        .from('influences')
        .upsert(influencesToInsert, { onConflict: 'id' })
        .select();
      
      if (error) throw new Error(`Influences migration failed: ${error.message}`);
      results.influences = inserted.length;
    }

    console.log('✅ Migration completed successfully:', results);

    // Backup localStorage data before clearing
    localStorage.setItem(`${STORAGE_KEY}_backup_${Date.now()}`, localData);
    
    return {
      success: true,
      message: 'Migration completed successfully',
      results
    };

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      message: error.message,
      error
    };
  }
}

/**
 * Check if migration is needed
 */
export function needsMigration() {
  const localData = localStorage.getItem(STORAGE_KEY);
  return !!localData;
}
