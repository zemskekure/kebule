import { useState } from 'react';
import './Projects.css';

function Projects({
  projects,
  topics,
  brands,
  signals,
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    due_date: '',
    status: 'active'
  });

  const getTopicsForProject = (project) => {
    return topics.filter(t => project.topic_ids?.includes(t.id));
  };

  const getBrandsForProject = (project) => {
    return brands.filter(b => project.brand_ids?.includes(b.id));
  };

  const getSignalsForProject = (projectId) => {
    return signals.filter(s => s.project_id === projectId);
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) return;
    try {
      await onCreateProject({
        name: formData.name,
        description: formData.description,
        dueDate: formData.due_date || null,
        topicIds: [],
        brandIds: []
      });
      setFormData({ name: '', description: '', due_date: '', status: 'active' });
      setShowAdd(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    await onUpdateProject(projectId, { status: newStatus });
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name || '',
      description: project.description || '',
      due_date: project.due_date ? project.due_date.split('T')[0] : '',
      status: project.status || 'active'
    });
  };

  const handleSaveEdit = async () => {
    try {
      await onUpdateProject(editingId, {
        name: formData.name,
        description: formData.description,
        due_date: formData.due_date || null
      });
      setEditingId(null);
      setFormData({ name: '', description: '', due_date: '', status: 'active' });
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', due_date: '', status: 'active' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Smazat tento projekt?')) {
      await onDeleteProject(id);
    }
  };

  const getDrobkyCount = (count) => {
    if (count === 1) return '1 drobek';
    if (count >= 2 && count <= 4) return `${count} drobky`;
    return `${count} drobků`;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Aktivní';
      case 'zadano': return 'Zadáno';
      case 'completed': return 'Hotovo';
      case 'failed': return 'Neúspěšný';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#64B5F6';
      case 'zadano': return '#E8BC6A';
      case 'completed': return '#81C784';
      case 'failed': return '#E57373';
      default: return '#8B8680';
    }
  };

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'zadano');
  const completedProjects = projects.filter(p => p.status === 'completed' || p.status === 'failed');

  return (
    <div className="projects">
      <div className="projects-header">
        <div>
          <h2>Projekty</h2>
          <p className="projects-subtitle">
            {activeProjects.length} aktivních, {completedProjects.length} dokončených
          </p>
        </div>
        <button className="add-project-btn" onClick={() => setShowAdd(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nový projekt
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="project-form">
          <h3>Nový projekt</h3>
          <div className="form-group">
            <label>Název projektu</label>
            <input
              type="text"
              placeholder="např. Redesign menu"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Popis</label>
            <textarea
              placeholder="Co je cílem projektu..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Termín</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button className="save-btn" onClick={handleAdd}>Vytvořit</button>
            <button className="cancel-btn" onClick={() => { setShowAdd(false); setFormData({ name: '', description: '', due_date: '', status: 'active' }); }}>Zrušit</button>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="projects-list">
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>Zatím žádné projekty</p>
            <p className="empty-hint">Vytvořte první projekt nebo přiřaďte signály k projektu</p>
          </div>
        ) : (
          <>
            {activeProjects.length > 0 && (
              <div className="projects-section">
                <h4 className="section-title">Aktivní projekty</h4>
                <div className="projects-grid">
                  {activeProjects.map(project => {
                    const projectTopics = getTopicsForProject(project);
                    const projectBrands = getBrandsForProject(project);
                    const projectSignals = getSignalsForProject(project.id);
                    const isEditing = editingId === project.id;

                    return (
                      <div key={project.id} className={`project-card ${project.status === 'zadano' ? 'zadano' : ''}`}>
                        {isEditing ? (
                          // Edit Mode
                          <div className="project-edit-form">
                            <div className="form-group">
                              <label>Název</label>
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              />
                            </div>
                            <div className="form-group">
                              <label>Popis</label>
                              <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                              />
                            </div>
                            <div className="form-group">
                              <label>Termín</label>
                              <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                              />
                            </div>
                            <div className="form-actions">
                              <button className="save-btn" onClick={handleSaveEdit}>Uložit</button>
                              <button className="cancel-btn" onClick={handleCancelEdit}>Zrušit</button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className="project-header">
                              <h3>{project.name}</h3>
                              {project.status === 'zadano' && (
                                <span className="status-badge" style={{ color: getStatusColor('zadano') }}>
                                  {getStatusLabel('zadano')}
                                </span>
                              )}
                              <div className="project-actions">
                                <button
                                  className="edit-btn"
                                  onClick={() => handleEdit(project)}
                                  title="Upravit"
                                >
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 1.5L12.5 3.5L4 12H2V10L10.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                                <button
                                  className="status-btn complete"
                                  onClick={() => handleStatusChange(project.id, 'completed')}
                                  title="Označit jako hotové"
                                >
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                                <button
                                  className="status-btn fail"
                                  onClick={() => handleStatusChange(project.id, 'failed')}
                                  title="Označit jako neúspěšný"
                                >
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                                </button>
                                <button
                                  className="delete-btn"
                                  onClick={() => handleDelete(project.id)}
                                  title="Smazat"
                                >
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4H12M4 4V3C4 2.44772 4.44772 2 5 2H9C9.55228 2 10 2.44772 10 3V4M5 6V10M9 6V10M3 4L4 12C4 12.5523 4.44772 13 5 13H9C9.55228 13 10 12.5523 10 12L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                              </div>
                            </div>

                            {project.description && (
                              <p className="project-description">{project.description}</p>
                            )}

                            {project.due_date && (
                              <div className="project-due">
                                Termín: {new Date(project.due_date).toLocaleDateString('cs-CZ')}
                              </div>
                            )}

                            <div className="project-meta">
                              {projectTopics.length > 0 && (
                                <div className="project-tags">
                                  {projectTopics.map(t => (
                                    <span key={t.id} className="tag" style={{ background: t.color }}>{t.name}</span>
                                  ))}
                                </div>
                              )}
                              {projectBrands.length > 0 && (
                                <div className="project-brands">
                                  {projectBrands.map(b => (
                                    <span key={b.id} className="brand-name">{b.name}</span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {projectSignals.length > 0 && (
                              <div className="project-signals">
                                <div className="signals-header">
                                  <span className="signals-count">{getDrobkyCount(projectSignals.length)}</span>
                                </div>
                                <div className="signals-list">
                                  {projectSignals.slice(0, 3).map(s => (
                                    <div key={s.id} className="signal-preview">
                                      <span className="signal-title">{s.title}</span>
                                      <span className="signal-author">{s.author_name}</span>
                                    </div>
                                  ))}
                                  {projectSignals.length > 3 && (
                                    <div className="signals-more">+{projectSignals.length - 3} dalších</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {completedProjects.length > 0 && (
              <div className="projects-section">
                <h4 className="section-title">Dokončené</h4>
                <div className="projects-grid completed">
                  {completedProjects.map(project => (
                    <div key={project.id} className={`project-card ${project.status}`}>
                      <div className="project-header">
                        <h3>{project.name}</h3>
                        <span className="status-badge" style={{ color: getStatusColor(project.status) }}>
                          {getStatusLabel(project.status)}
                        </span>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(project.id)}
                          title="Smazat"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4H12M4 4V3C4 2.44772 4.44772 2 5 2H9C9.55228 2 10 2.44772 10 3V4M5 6V10M9 6V10M3 4L4 12C4 12.5523 4.44772 13 5 13H9C9.55228 13 10 12.5523 10 12L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Projects;
