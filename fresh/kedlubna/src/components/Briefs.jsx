import { useState } from 'react';
import { jsPDF } from 'jspdf';
import './Briefs.css';

function Briefs({
  briefs,
  projects,
  brands,
  signals,
  onCreateBrief,
  onUpdateBrief,
  onDeleteBrief,
  onGeneratePDF
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    target_audience: '',
    budget: '',
    due_date: '',
    project_id: null,
    brand_id: null,
    status: 'draft'
  });

  const getProjectById = (id) => projects.find(p => p.id === id);
  const getBrandById = (id) => brands.find(b => b.id === id);
  const getSignalsForProject = (projectId) => signals.filter(s => s.project_id === projectId);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      goal: '',
      target_audience: '',
      budget: '',
      due_date: '',
      project_id: null,
      brand_id: null,
      status: 'draft'
    });
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) return;
    try {
      await onCreateBrief(formData);
      resetForm();
      setShowAdd(false);
    } catch (error) {
      console.error('Failed to create brief:', error);
    }
  };

  const handleConvertProject = (project) => {
    setSelectedProject(project);
    const projectBrand = brands.find(b => project.brand_ids?.includes(b.id));
    setFormData({
      name: `Brief: ${project.name}`,
      description: project.description || '',
      goal: '',
      target_audience: '',
      budget: '',
      due_date: project.due_date ? project.due_date.split('T')[0] : '',
      project_id: project.id,
      brand_id: projectBrand?.id || null,
      status: 'draft'
    });
    setShowConvert(true);
  };

  const handleSaveConvert = async () => {
    if (!formData.name.trim()) return;
    try {
      await onCreateBrief(formData);
      resetForm();
      setShowConvert(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to create brief from project:', error);
    }
  };

  const handleEdit = (brief) => {
    setEditingId(brief.id);
    setFormData({
      name: brief.name || '',
      description: brief.description || '',
      goal: brief.goal || '',
      target_audience: brief.target_audience || '',
      budget: brief.budget || '',
      due_date: brief.due_date ? brief.due_date.split('T')[0] : '',
      project_id: brief.project_id,
      brand_id: brief.brand_id,
      status: brief.status || 'draft'
    });
  };

  const handleSaveEdit = async () => {
    try {
      await onUpdateBrief(editingId, formData);
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update brief:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Opravdu smazat tento brief?')) {
      await onDeleteBrief(id);
    }
  };

  const handleStatusChange = async (briefId, newStatus) => {
    await onUpdateBrief(briefId, { status: newStatus });
  };

  const handleDownloadPDF = (brief) => {
    const project = getProjectById(brief.project_id);
    const brand = getBrandById(brief.brand_id);
    const projectSignals = brief.project_id ? getSignalsForProject(brief.project_id) : [];

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // Colors
    const darkColor = [45, 42, 38];
    const grayColor = [139, 134, 128];
    const lightGray = [184, 180, 174];
    const accentColor = brand?.color ? hexToRgb(brand.color) : [100, 181, 246];

    // Header line
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(3);
    doc.line(margin, y, margin + 40, y);
    y += 15;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(...darkColor);
    doc.text(brief.name, margin, y);
    y += 12;

    // Brand & Status line
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let metaText = [];
    if (brand) metaText.push(brand.name);
    metaText.push(brief.status === 'final' ? 'Finální verze' : 'Koncept');
    if (brief.due_date) metaText.push(`Termín: ${new Date(brief.due_date).toLocaleDateString('cs-CZ')}`);
    doc.setTextColor(...grayColor);
    doc.text(metaText.join('  •  '), margin, y);
    y += 20;

    // Helper function for sections
    const addSection = (title, content) => {
      if (!content) return;

      // Check if we need a new page
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      // Section title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...grayColor);
      doc.text(title.toUpperCase(), margin, y);
      y += 2;

      // Underline
      doc.setDrawColor(237, 233, 227);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // Content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...darkColor);
      const lines = doc.splitTextToSize(content, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 6 + 12;
    };

    // Add sections
    addSection('Popis', brief.description);
    addSection('Cíl', brief.goal);
    addSection('Cílová skupina', brief.target_audience);
    addSection('Rozpočet', brief.budget);

    if (project) {
      addSection('Zdrojový projekt', `${project.name}${project.description ? '\n' + project.description : ''}`);
    }

    // Signals
    if (projectSignals.length > 0) {
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...grayColor);
      doc.text(`SOUVISEJÍCÍ DROBKY (${projectSignals.length})`, margin, y);
      y += 2;
      doc.setDrawColor(237, 233, 227);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      projectSignals.slice(0, 10).forEach((signal) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...darkColor);
        doc.text(signal.title || 'Bez názvu', margin + 4, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...lightGray);
        doc.text(`${signal.author_name || 'Neznámý'} · ${new Date(signal.created_at).toLocaleDateString('cs-CZ')}`, margin + 4, y + 5);
        y += 14;
      });
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...lightGray);
    doc.text(`Vygenerováno: ${new Date().toLocaleDateString('cs-CZ')} · Kedlubna`, margin, footerY);

    // Save
    doc.save(`brief-${brief.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  // Helper to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [100, 181, 246];
  };

  // Filter projects that don't have a brief yet
  const projectsWithoutBrief = projects.filter(p =>
    p.status === 'active' && !briefs.some(b => b.project_id === p.id)
  );

  const draftBriefs = briefs.filter(b => b.status === 'draft');
  const finalBriefs = briefs.filter(b => b.status === 'final');

  return (
    <div className="briefs">
      <div className="briefs-header">
        <div>
          <h2>Zadání (Briefs)</h2>
          <p className="briefs-subtitle">
            {draftBriefs.length} konceptů, {finalBriefs.length} finálních
          </p>
        </div>
        <div className="briefs-header-actions">
          <button className="add-brief-btn" onClick={() => setShowAdd(true)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nový brief
          </button>
        </div>
      </div>

      {/* Convert from Project Section */}
      {projectsWithoutBrief.length > 0 && (
        <div className="convert-section">
          <h4>Převést projekt na brief</h4>
          <div className="projects-to-convert">
            {projectsWithoutBrief.map(project => (
              <button
                key={project.id}
                className="convert-project-btn"
                onClick={() => handleConvertProject(project)}
              >
                <span className="project-name">{project.name}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvert && selectedProject && (
        <div className="modal-overlay" onClick={() => { setShowConvert(false); setSelectedProject(null); resetForm(); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Vytvořit brief z projektu</h3>
              <button className="close-btn" onClick={() => { setShowConvert(false); setSelectedProject(null); resetForm(); }}>×</button>
            </div>
            <div className="modal-body">
              <div className="source-project">
                <span className="label">Zdrojový projekt:</span>
                <span className="value">{selectedProject.name}</span>
              </div>

              <div className="form-group">
                <label>Název briefu</label>
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
              <div className="form-row">
                <div className="form-group">
                  <label>Cíl</label>
                  <textarea
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    rows={2}
                    placeholder="Co chceme dosáhnout..."
                  />
                </div>
                <div className="form-group">
                  <label>Cílová skupina</label>
                  <textarea
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    rows={2}
                    placeholder="Pro koho je určeno..."
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Rozpočet</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="např. 50 000 Kč"
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
              </div>
              <div className="form-group">
                <label>Značka</label>
                <select
                  value={formData.brand_id || ''}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value || null })}
                >
                  <option value="">-- Vyberte značku --</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="save-btn" onClick={handleSaveConvert}>Vytvořit brief</button>
              <button className="cancel-btn" onClick={() => { setShowConvert(false); setSelectedProject(null); resetForm(); }}>Zrušit</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <div className="brief-form">
          <h3>Nový brief</h3>
          <div className="form-group">
            <label>Název</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Název briefu"
              autoFocus
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
          <div className="form-row">
            <div className="form-group">
              <label>Cíl</label>
              <textarea
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                rows={2}
              />
            </div>
            <div className="form-group">
              <label>Cílová skupina</label>
              <textarea
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Rozpočet</label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
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
          </div>
          <div className="form-group">
            <label>Značka</label>
            <select
              value={formData.brand_id || ''}
              onChange={(e) => setFormData({ ...formData, brand_id: e.target.value || null })}
            >
              <option value="">-- Vyberte značku --</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button className="save-btn" onClick={handleAdd}>Vytvořit</button>
            <button className="cancel-btn" onClick={() => { setShowAdd(false); resetForm(); }}>Zrušit</button>
          </div>
        </div>
      )}

      {/* Briefs List */}
      <div className="briefs-list">
        {briefs.length === 0 ? (
          <div className="empty-state">
            <p>Zatím žádné briefy</p>
            <p className="empty-hint">Vytvořte brief ručně nebo převeďte projekt na brief</p>
          </div>
        ) : (
          <>
            {draftBriefs.length > 0 && (
              <div className="briefs-section">
                <h4 className="section-title">Koncepty</h4>
                <div className="briefs-grid">
                  {draftBriefs.map(brief => {
                    const project = getProjectById(brief.project_id);
                    const brand = getBrandById(brief.brand_id);
                    const isEditing = editingId === brief.id;
                    const isExpanded = expandedId === brief.id;

                    return (
                      <div key={brief.id} className={`brief-card ${isExpanded ? 'expanded' : ''}`}>
                        {isEditing ? (
                          <div className="brief-edit-form">
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
                                rows={2}
                              />
                            </div>
                            <div className="form-group">
                              <label>Cíl</label>
                              <textarea
                                value={formData.goal}
                                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                rows={2}
                              />
                            </div>
                            <div className="form-group">
                              <label>Cílová skupina</label>
                              <textarea
                                value={formData.target_audience}
                                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                                rows={2}
                              />
                            </div>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Rozpočet</label>
                                <input
                                  type="text"
                                  value={formData.budget}
                                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
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
                            </div>
                            <div className="form-actions">
                              <button className="save-btn" onClick={handleSaveEdit}>Uložit</button>
                              <button className="cancel-btn" onClick={handleCancelEdit}>Zrušit</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="brief-header">
                              <div className="brief-title-row">
                                {brand && <span className="brand-dot" style={{ background: brand.color }} />}
                                <h3 onClick={() => setExpandedId(isExpanded ? null : brief.id)}>{brief.name}</h3>
                              </div>
                              <div className="brief-actions">
                                <button className="action-btn finalize" onClick={() => handleStatusChange(brief.id, 'final')} title="Finalizovat">
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                                <button className="action-btn edit" onClick={() => handleEdit(brief)} title="Upravit">
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 1.5L12.5 3.5L4 12H2V10L10.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(brief.id)} title="Smazat">
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4H12M4 4V3C4 2.44772 4.44772 2 5 2H9C9.55228 2 10 2.44772 10 3V4M5 6V10M9 6V10M3 4L4 12C4 12.5523 4.44772 13 5 13H9C9.55228 13 10 12.5523 10 12L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                              </div>
                            </div>

                            {brief.description && <p className="brief-description">{brief.description}</p>}

                            {isExpanded && (
                              <div className="brief-details">
                                {brief.goal && (
                                  <div className="detail-section">
                                    <span className="detail-label">Cíl</span>
                                    <p>{brief.goal}</p>
                                  </div>
                                )}
                                {brief.target_audience && (
                                  <div className="detail-section">
                                    <span className="detail-label">Cílová skupina</span>
                                    <p>{brief.target_audience}</p>
                                  </div>
                                )}
                                {brief.budget && (
                                  <div className="detail-section">
                                    <span className="detail-label">Rozpočet</span>
                                    <p>{brief.budget}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="brief-footer">
                              <div className="brief-meta">
                                {brand && <span className="meta-brand">{brand.name}</span>}
                                {project && <span className="meta-project">← {project.name}</span>}
                              </div>
                              {brief.due_date && (
                                <span className="brief-due">
                                  {new Date(brief.due_date).toLocaleDateString('cs-CZ')}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {finalBriefs.length > 0 && (
              <div className="briefs-section">
                <h4 className="section-title">Finální briefy</h4>
                <div className="briefs-grid">
                  {finalBriefs.map(brief => {
                    const project = getProjectById(brief.project_id);
                    const brand = getBrandById(brief.brand_id);

                    return (
                      <div key={brief.id} className="brief-card final">
                        <div className="brief-header">
                          <div className="brief-title-row">
                            {brand && <span className="brand-dot" style={{ background: brand.color }} />}
                            <h3>{brief.name}</h3>
                          </div>
                          <div className="brief-actions">
                            <button className="action-btn download" onClick={() => handleDownloadPDF(brief)} title="Stáhnout PDF">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2V9M7 9L4 6M7 9L10 6M2 12H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <button className="action-btn revert" onClick={() => handleStatusChange(brief.id, 'draft')} title="Vrátit do konceptu">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7C12 9.76142 9.76142 12 7 12C4.23858 12 2 9.76142 2 7C2 4.23858 4.23858 2 7 2C8.65685 2 10.1212 2.84285 11 4.11111M11 2V4.5H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <button className="action-btn delete" onClick={() => handleDelete(brief.id)} title="Smazat">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4H12M4 4V3C4 2.44772 4.44772 2 5 2H9C9.55228 2 10 2.44772 10 3V4M5 6V10M9 6V10M3 4L4 12C4 12.5523 4.44772 13 5 13H9C9.55228 13 10 12.5523 10 12L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </div>
                        </div>

                        {brief.description && <p className="brief-description">{brief.description}</p>}

                        <div className="brief-footer">
                          <div className="brief-meta">
                            {brand && <span className="meta-brand">{brand.name}</span>}
                            {project && <span className="meta-project">← {project.name}</span>}
                          </div>
                          {brief.due_date && (
                            <span className="brief-due">
                              {new Date(brief.due_date).toLocaleDateString('cs-CZ')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Briefs;
