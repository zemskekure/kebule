/**
 * Builds a normalized hierarchical tree structure from flat strategy data.
 * 
 * Hierarchy: Year → Vision → Theme → Initiative → Projects
 * Projects without initiativeId appear under a synthetic "Unsorted" initiative.
 * 
 * @param {Object} data - The flat data object containing years, visions, themes, initiatives, projects
 * @returns {Array} - Hierarchical tree with initiatives nested between themes and projects
 */
export function buildStrategyTree(data) {
  const { years = [], visions = [], themes = [], initiatives = [], projects = [] } = data;

  return years.map(year => ({
    ...year,
    visions: visions
      .filter(v => v.yearId === year.id)
      .map(vision => ({
        ...vision,
        themes: themes
          .filter(t => t.visionId === vision.id)
          .map(theme => {
            // Get initiatives for this theme
            const themeInitiatives = initiatives.filter(i => i.themeId === theme.id);
            
            // Get projects for this theme
            const themeProjects = projects.filter(p => p.themeId === theme.id);
            
            // Projects assigned to initiatives
            const assignedProjects = themeProjects.filter(p => p.initiativeId);
            
            // Projects NOT assigned to any initiative (unsorted)
            const unsortedProjects = themeProjects.filter(p => !p.initiativeId);
            
            // Build initiatives with their projects
            const initiativesWithProjects = themeInitiatives.map(initiative => ({
              ...initiative,
              projects: assignedProjects.filter(p => p.initiativeId === initiative.id)
            }));
            
            // Add synthetic "Unsorted" initiative if there are unsorted projects
            if (unsortedProjects.length > 0) {
              initiativesWithProjects.push({
                id: `unsorted-${theme.id}`,
                themeId: theme.id,
                name: 'Bez cíle',
                status: 'none',
                description: 'Projekty nepřiřazené k žádnému cíli',
                isUnsorted: true, // Flag to identify synthetic initiative
                projects: unsortedProjects
              });
            }
            
            return {
              ...theme,
              initiatives: initiativesWithProjects,
              // Keep flat projects array for backward compatibility
              projects: themeProjects
            };
          })
      }))
  }));
}

/**
 * Gets visions for a specific year
 */
export function getVisionsForYear(data, yearId) {
  return (data.visions || []).filter(v => v.yearId === yearId);
}

/**
 * Gets themes for a specific vision
 */
export function getThemesForVision(data, visionId) {
  return (data.themes || []).filter(t => t.visionId === visionId);
}

/**
 * Gets projects for a specific theme
 */
export function getProjectsForTheme(data, themeId) {
  return (data.projects || []).filter(p => p.themeId === themeId);
}

/**
 * Gets initiatives for a specific theme
 */
export function getInitiativesForTheme(data, themeId) {
  return (data.initiatives || []).filter(i => i.themeId === themeId);
}

/**
 * Gets projects for a specific initiative
 */
export function getProjectsForInitiative(data, initiativeId) {
  return (data.projects || []).filter(p => p.initiativeId === initiativeId);
}

/**
 * Gets unsorted projects for a theme (projects without initiativeId)
 */
export function getUnsortedProjectsForTheme(data, themeId) {
  return (data.projects || []).filter(p => p.themeId === themeId && !p.initiativeId);
}

/**
 * Gets the full hierarchy path for a given node
 * Useful for breadcrumbs or navigation
 */
export function getNodePath(data, nodeType, nodeId) {
  const path = [];
  
  if (nodeType === 'project') {
    const project = data.projects?.find(p => p.id === nodeId);
    if (project) {
      path.unshift({ type: 'project', ...project });
      // Check if project belongs to an initiative
      if (project.initiativeId) {
        const initiative = data.initiatives?.find(i => i.id === project.initiativeId);
        if (initiative) {
          path.unshift({ type: 'initiative', ...initiative });
        }
      }
      const theme = data.themes?.find(t => t.id === project.themeId);
      if (theme) {
        path.unshift({ type: 'theme', ...theme });
        const vision = data.visions?.find(v => v.id === theme.visionId);
        if (vision) {
          path.unshift({ type: 'vision', ...vision });
          const year = data.years?.find(y => y.id === vision.yearId);
          if (year) {
            path.unshift({ type: 'year', ...year });
          }
        }
      }
    }
  } else if (nodeType === 'initiative') {
    const initiative = data.initiatives?.find(i => i.id === nodeId);
    if (initiative) {
      path.unshift({ type: 'initiative', ...initiative });
      const theme = data.themes?.find(t => t.id === initiative.themeId);
      if (theme) {
        path.unshift({ type: 'theme', ...theme });
        const vision = data.visions?.find(v => v.id === theme.visionId);
        if (vision) {
          path.unshift({ type: 'vision', ...vision });
          const year = data.years?.find(y => y.id === vision.yearId);
          if (year) {
            path.unshift({ type: 'year', ...year });
          }
        }
      }
    }
  } else if (nodeType === 'theme') {
    const theme = data.themes?.find(t => t.id === nodeId);
    if (theme) {
      path.unshift({ type: 'theme', ...theme });
      const vision = data.visions?.find(v => v.id === theme.visionId);
      if (vision) {
        path.unshift({ type: 'vision', ...vision });
        const year = data.years?.find(y => y.id === vision.yearId);
        if (year) {
          path.unshift({ type: 'year', ...year });
        }
      }
    }
  } else if (nodeType === 'vision') {
    const vision = data.visions?.find(v => v.id === nodeId);
    if (vision) {
      path.unshift({ type: 'vision', ...vision });
      const year = data.years?.find(y => y.id === vision.yearId);
      if (year) {
        path.unshift({ type: 'year', ...year });
      }
    }
  } else if (nodeType === 'year') {
    const year = data.years?.find(y => y.id === nodeId);
    if (year) {
      path.unshift({ type: 'year', ...year });
    }
  }
  
  return path;
}

/**
 * Counts items at each level for a year
 */
export function getYearStats(data, yearId) {
  const visions = getVisionsForYear(data, yearId);
  const visionIds = visions.map(v => v.id);
  const themes = (data.themes || []).filter(t => visionIds.includes(t.visionId));
  const themeIds = themes.map(t => t.id);
  const projects = (data.projects || []).filter(p => themeIds.includes(p.themeId));
  
  return {
    visionCount: visions.length,
    themeCount: themes.length,
    projectCount: projects.length,
  };
}

export default buildStrategyTree;
