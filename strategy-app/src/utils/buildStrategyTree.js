/**
 * Builds a normalized hierarchical tree structure from flat strategy data.
 * 
 * @param {Object} data - The flat data object containing years, visions, themes, projects
 * @returns {Array} - Hierarchical tree: [{ year, visions: [{ vision, themes: [{ theme, projects: [...] }] }] }]
 */
export function buildStrategyTree(data) {
  const { years = [], visions = [], themes = [], projects = [] } = data;

  return years.map(year => ({
    ...year,
    visions: visions
      .filter(v => v.yearId === year.id)
      .map(vision => ({
        ...vision,
        themes: themes
          .filter(t => t.visionId === vision.id)
          .map(theme => ({
            ...theme,
            projects: projects.filter(p => p.themeId === theme.id)
          }))
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
 * Gets the full hierarchy path for a given node
 * Useful for breadcrumbs or navigation
 */
export function getNodePath(data, nodeType, nodeId) {
  const path = [];
  
  if (nodeType === 'project') {
    const project = data.projects?.find(p => p.id === nodeId);
    if (project) {
      path.unshift({ type: 'project', ...project });
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
