import { useState } from 'react';
import './Organization.css';

// Format number as Czech currency
const formatCZK = (amount) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format as millions
const formatMil = (amount) => {
  return `${(amount / 1000000).toFixed(1).replace('.', ',')} mil.`;
};

// All people with colors and competences
const PEOPLE = {
  // Strategic Leadership
  karpis: {
    name: 'Tomáš Karpíšek',
    role: 'Founder',
    color: '#2D2A26',
    competences: ['Strategická vize', 'Předává mandát Janovi', 'Nezasahuje do operativy'],
    tier: 'strategic'
  },
  jan: {
    name: 'Jan Červenka',
    role: 'Creative Director',
    color: '#E8BC6A',
    competences: ['Finální schválení kreativy', 'Vize značek', 'Experimentální rozpočet (5%)'],
    tier: 'strategic'
  },

  // Management & Gatekeeping (Ambiente)
  stepanka: {
    name: 'Štěpánka Borisovová',
    role: 'CMO',
    color: '#64B5F6',
    competences: ['Tvorba briefů', 'Rozpočet Rozvoj (~3M)', 'Překlápí vize do zadání'],
    tier: 'management'
  },
  svatava: {
    name: 'Svatava Dvořáčková',
    role: 'Brand Manager',
    color: '#81C784',
    competences: ['Brand Compliance', 'Hlídá manuály', 'Konzistence značky'],
    tier: 'management',
    note: 'Check, nikoliv Blocker'
  },
  lucie: {
    name: 'Lucie Svobodová',
    role: 'Loyalty Lead',
    color: '#4DB6AC',
    competences: ['Věrnostní program (~7M)', 'CRM', 'Zákaznická retence'],
    tier: 'management'
  },
  jana: {
    name: 'Jana Ravi',
    role: 'Web Lead',
    color: '#FF8A65',
    competences: ['Weby & E-shopy', 'Maintenance budget', 'Digitální platformy'],
    tier: 'management'
  },

  // Agency - Creative
  mikulas: {
    name: 'Mikuláš Pavlík',
    role: 'Koordinátor Kreativního oddělení',
    color: '#9575CD',
    competences: ['Koordinace kreativy', 'Přijímá briefy', 'Řídí workflow'],
    tier: 'agency-creative'
  },
  jachym: {
    name: 'Jáchym Jakeš',
    role: 'Creative Lead',
    color: '#BA68C8',
    competences: ['Vedení kreativy', 'Má Janovu důvěru', 'Koncepty & design'],
    tier: 'agency-creative'
  },
  eliska: {
    name: 'Eliška Nováková',
    role: 'Creative',
    color: '#CE93D8',
    competences: ['Grafický design', 'Vizuální identita'],
    tier: 'agency-creative'
  },
  simon: {
    name: 'Šimon Marek',
    role: 'Head of Graphic Department',
    color: '#7E57C2',
    competences: ['Grafické oddělení', 'Art direction', 'Produkce materiálů'],
    tier: 'agency-creative'
  },

  // Agency - Account
  betka: {
    name: 'Bětka',
    role: 'Account Lead (A+Manual)',
    color: '#FFB74D',
    competences: ['Vedení accountů', 'Komunikace s restauracemi', 'Koordinace týmu'],
    tier: 'agency-account'
  },
  accountManager: {
    name: 'Account Managers',
    role: 'A+Manual',
    color: '#FFCC80',
    competences: ['Spojky s restauracemi', 'Sběr Drobků', 'Validace požadavků'],
    tier: 'agency-account'
  },

  // OaK
  sarka: {
    name: 'Šárka Hamanová',
    role: 'OaK Lead',
    color: '#64B5F6',
    competences: ['Obsah & komunikace', 'Sociální sítě', 'PR & media'],
    tier: 'oak'
  }
};

// Initial budget data
const INITIAL_BUDGET_DATA = [
  {
    id: 'oak',
    name: 'OaK',
    description: 'Obsah & Komunikace (paušál A+Manual)',
    amount: 21000000,
    owner: 'sarka',
    color: '#64B5F6',
    type: 'maintenance'
  },
  {
    id: 'weby',
    name: 'Weby & E-shopy',
    description: 'Webový vývoj (Maintenance)',
    amount: 4000000,
    owner: 'jana',
    color: '#FF8A65',
    type: 'maintenance'
  },
  {
    id: 'loyalty',
    name: 'Věrnostní program',
    description: 'Loyalty & CRM',
    amount: 7000000,
    owner: 'lucie',
    color: '#4DB6AC',
    type: 'growth'
  },
  {
    id: 'rozvoj',
    name: 'Rozvoj / Growth',
    description: 'Marketingové kampaně',
    amount: 3000000,
    owner: 'stepanka',
    color: '#64B5F6',
    type: 'growth'
  },
  {
    id: 'experiment',
    name: 'Experiment / Inovace',
    description: '~5% na divoké karty',
    amount: 2000000,
    owner: 'jan',
    color: '#E8BC6A',
    type: 'growth',
    highlighted: true
  },
  {
    id: 'brand-ambi',
    name: 'Ambi CZ',
    description: 'Rozvoj značky',
    amount: 1000000,
    owner: 'svatava',
    color: '#81C784',
    category: 'brands'
  },
  {
    id: 'brand-lokal',
    name: 'Lokál CZ',
    description: 'Rozvoj značky',
    amount: 2000000,
    owner: 'svatava',
    color: '#81C784',
    category: 'brands'
  }
];

// Person Card Component
function PersonCard({ person, size = 'normal' }) {
  const initials = person.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className={`person-card ${size}`} style={{ '--person-color': person.color }}>
      <div className="person-avatar" style={{ background: person.color }}>
        {initials}
      </div>
      <div className="person-info">
        <span className="person-name">{person.name}</span>
        <span className="person-role">{person.role}</span>
        {person.competences && (
          <ul className="person-competences">
            {person.competences.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
        {person.note && (
          <span className="person-note">{person.note}</span>
        )}
      </div>
    </div>
  );
}

// Workflow Section Component
function WorkflowSection() {
  return (
    <div className="workflow-section">
      {/* Organizational Hierarchy */}
      <div className="workflow-block">
        <h3 className="workflow-title">Organizační struktura</h3>
        <p className="workflow-subtitle">Hierarchie a kompetence</p>

        {/* Strategic Leadership */}
        <div className="org-tier">
          <div className="tier-header">
            <span className="tier-badge strategic">Strategic Leadership</span>
            <span className="tier-company">Ambiente</span>
          </div>
          <div className="tier-people">
            <PersonCard person={PEOPLE.karpis} />
            <div className="tier-arrow">→</div>
            <PersonCard person={PEOPLE.jan} />
          </div>
          <p className="tier-note">Karpíšek předává mandát → Jan má konečné slovo (veto rights)</p>
        </div>

        {/* Management */}
        <div className="org-tier">
          <div className="tier-header">
            <span className="tier-badge management">Management & Gatekeeping</span>
            <span className="tier-company">Ambiente</span>
          </div>
          <div className="tier-people grid">
            <PersonCard person={PEOPLE.stepanka} />
            <PersonCard person={PEOPLE.svatava} />
            <PersonCard person={PEOPLE.lucie} />
            <PersonCard person={PEOPLE.jana} />
          </div>
        </div>

        {/* Agency */}
        <div className="org-tier">
          <div className="tier-header">
            <span className="tier-badge agency">Execution Agency</span>
            <span className="tier-company">A+Manual</span>
          </div>

          <div className="agency-sections">
            {/* Creative Team */}
            <div className="agency-section">
              <span className="section-label">Kreativa</span>
              <div className="tier-people">
                <PersonCard person={PEOPLE.mikulas} />
                <PersonCard person={PEOPLE.jachym} size="small" />
                <PersonCard person={PEOPLE.eliska} size="small" />
                <PersonCard person={PEOPLE.simon} size="small" />
              </div>
            </div>

            {/* Account Team */}
            <div className="agency-section">
              <span className="section-label">Accounti</span>
              <div className="tier-people">
                <PersonCard person={PEOPLE.betka} />
                <PersonCard person={PEOPLE.accountManager} size="small" />
              </div>
            </div>
          </div>
        </div>

        {/* OaK */}
        <div className="org-tier small">
          <div className="tier-header">
            <span className="tier-badge oak">OaK (Obsah & Komunikace)</span>
          </div>
          <div className="tier-people">
            <PersonCard person={PEOPLE.sarka} size="small" />
          </div>
        </div>
      </div>

      {/* Workflow: Filtr – Brief – Nacenění – Výroba */}
      <div className="workflow-block">
        <h3 className="workflow-title">Tok zadání</h3>
        <p className="workflow-subtitle">Filtr → Brief → Nacenění → Výroba</p>

        {/* Phase 1: Capture & Qualification */}
        <div className="workflow-phase">
          <div className="phase-header">
            <span className="phase-number">1</span>
            <div className="phase-title">
              <h4>Zachycení & Kvalifikace</h4>
              <span>Account Manager rozpozná, co drží v ruce</span>
            </div>
          </div>

          <div className="phase-content">
            <div className="phase-actor" style={{ '--actor-color': PEOPLE.betka.color }}>
              <div className="actor-avatar" style={{ background: PEOPLE.betka.color }}>AM</div>
              <div className="actor-info">
                <strong>Account Manager</strong>
                <span>První filtr: Je to drobnost, nebo velká věc?</span>
              </div>
            </div>

            <div className="routing-split">
              <div className="route-card route-a">
                <div className="route-header">
                  <span className="route-badge">Cesta A</span>
                  <h5>Malá věc (Maintenance)</h5>
                </div>
                <p className="route-examples">Úprava menu, plakát na akci, polep okna, adaptace vizuálu</p>
                <div className="route-brief">
                  <span className="brief-author">Brief píše:</span>
                  <strong>Account Manager</strong>
                </div>
                <p className="route-reason">Zná detaily, nepotřebuje strategii. Šetří čas Štěpánky.</p>
              </div>

              <div className="route-card route-b">
                <div className="route-header">
                  <span className="route-badge">Cesta B</span>
                  <h5>Velký projekt (Big Picture)</h5>
                </div>
                <p className="route-examples">Nový koncept, sezónní kampaň, rebranding, strategické téma</p>
                <div className="route-brief">
                  <span className="brief-author">Brief píše:</span>
                  <strong>Štěpánka (CMO)</strong>
                </div>
                <p className="route-reason">AM dodá suroviny (insight), Štěpánka uvaří strategické zadání.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 2: Gatekeeper */}
        <div className="workflow-phase gatekeeper">
          <div className="phase-header">
            <span className="phase-number">2</span>
            <div className="phase-title">
              <h4>Gatekeeper</h4>
              <span>Než se kdokoliv dotkne myši</span>
            </div>
          </div>

          <div className="phase-content">
            <div className="gatekeeper-card">
              <div className="gatekeeper-person">
                <div className="gatekeeper-avatar" style={{ background: PEOPLE.mikulas.color }}>MP</div>
                <div className="gatekeeper-info">
                  <strong>{PEOPLE.mikulas.name}</strong>
                  <span>Traffic & Resource Manager</span>
                </div>
              </div>

              <div className="gatekeeper-checks">
                <div className="check-item">
                  <span className="check-icon">💰</span>
                  <div>
                    <strong>Nacenění</strong>
                    <span>Kolik to bude stát? (interní hodiny vs. externí)</span>
                  </div>
                </div>
                <div className="check-item">
                  <span className="check-icon">⏱️</span>
                  <div>
                    <strong>Timing</strong>
                    <span>Máme kapacitu? Kdy to reálně stihneme?</span>
                  </div>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <div>
                    <strong>Validace</strong>
                    <span>Dává brief smysl? Jsou podklady kompletní?</span>
                  </div>
                </div>
              </div>

              <div className="gatekeeper-result">
                <span className="result-note">Kreativci nedostanou nic, co není zaplacené a časově reálné</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 3: Execution */}
        <div className="workflow-phase">
          <div className="phase-header">
            <span className="phase-number">3</span>
            <div className="phase-title">
              <h4>Exekuce</h4>
              <span>Rozdělení podle typu projektu</span>
            </div>
          </div>

          <div className="phase-content">
            <div className="execution-split">
              <div className="execution-branch creative">
                <div className="branch-header">
                  <span className="branch-badge creative">Kreativa</span>
                </div>
                <div className="branch-team">
                  <div className="team-avatar" style={{ background: PEOPLE.jachym.color }}>JJ</div>
                  <div className="team-avatar" style={{ background: PEOPLE.eliska.color }}>EN</div>
                </div>
                <div className="branch-names">
                  <span>{PEOPLE.jachym.name}</span>
                  <span>{PEOPLE.eliska.name}</span>
                </div>
                <p className="branch-scope">Velké projekty od Štěpánky</p>
                <p className="branch-work">Koncepty, ideje, wording, kampaně</p>
              </div>

              <div className="execution-branch production">
                <div className="branch-header">
                  <span className="branch-badge production">Grafika / DTP</span>
                </div>
                <div className="branch-team">
                  <div className="team-avatar" style={{ background: PEOPLE.simon.color }}>ŠM</div>
                </div>
                <div className="branch-names">
                  <span>{PEOPLE.simon.name}</span>
                </div>
                <p className="branch-scope">Malé věci od Accountů</p>
                <p className="branch-work">Vizitky, meníčka, adaptace, produkce</p>
              </div>
            </div>

            <div className="brand-check">
              <div className="check-avatar" style={{ background: PEOPLE.svatava.color }}>SD</div>
              <div className="check-info">
                <strong>{PEOPLE.svatava.name}</strong>
                <span>Brand Compliance: Správné logo? Správný font?</span>
                <span className="check-note">Kontroluje technické parametry, neblokuje kreativu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="workflow-summary">
          <h4>Tok informací</h4>
          <div className="summary-flow">
            <span className="flow-step">Restaurace/Idea</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step highlight">AM (Filtr)</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">Brief (AM nebo Štěpánka)</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step highlight">Mikuláš (Validace)</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">Realizační tým</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Budget Card Component
function BudgetCard({ budget, totalBudget, onUpdate, owner }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const percentage = (budget.amount / totalBudget) * 100;

  const handleEdit = () => {
    setValue((budget.amount / 1000000).toString());
    setEditing(true);
  };

  const handleSave = () => {
    const newAmount = parseFloat(value.replace(',', '.')) * 1000000;
    if (!isNaN(newAmount) && newAmount >= 0) {
      onUpdate(budget.id, newAmount);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div
      className={`budget-card ${budget.highlighted ? 'highlighted' : ''}`}
      style={{ '--card-color': budget.color }}
    >
      <div className="budget-card-main">
        <div className="budget-card-circle" style={{ '--circle-percent': percentage }}>
          <svg viewBox="0 0 36 36" className="circular-chart">
            <path
              className="circle-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="circle-fill"
              style={{ stroke: budget.color }}
              strokeDasharray={`${percentage}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="circle-percent">{percentage.toFixed(0)}%</span>
        </div>

        <div className="budget-card-info">
          <h4>{budget.name}</h4>
          <span className="budget-description">{budget.description}</span>

          <div className="budget-card-amount">
            {editing ? (
              <div className="amount-edit">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <span className="amount-unit">mil. Kč</span>
              </div>
            ) : (
              <span className="amount-value" onClick={handleEdit} title="Klikněte pro úpravu">
                {formatCZK(budget.amount)}
              </span>
            )}
          </div>
        </div>
      </div>

      {owner && (
        <div className="budget-card-owner">
          <div className="owner-avatar" style={{ background: owner.color }}>
            {owner.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="owner-info">
            <span className="owner-name">{owner.name}</span>
            <span className="owner-role">{owner.role}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Budget Section Component
function BudgetSection({ budgets, setBudgets }) {
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const maintenanceBudgets = budgets.filter(b => b.type === 'maintenance');
  const growthBudgets = budgets.filter(b => b.type === 'growth');
  const brandBudgets = budgets.filter(b => b.category === 'brands');

  const maintenanceTotal = maintenanceBudgets.reduce((sum, b) => sum + b.amount, 0);
  const growthTotal = growthBudgets.reduce((sum, b) => sum + b.amount, 0);
  const brandTotal = brandBudgets.reduce((sum, b) => sum + b.amount, 0);

  const handleUpdate = (id, newAmount) => {
    setBudgets(budgets.map(b => b.id === id ? { ...b, amount: newAmount } : b));
  };

  return (
    <div className="budget-section">
      {/* Summary Header */}
      <div className="budget-summary-header">
        <div className="summary-main">
          <span className="summary-label">Marketing Ambi 2026</span>
          <span className="summary-total">{formatCZK(totalBudget)}</span>
        </div>
        <div className="summary-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-dot maintenance"></span>
            <span>Maintenance: {formatCZK(maintenanceTotal)}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-dot growth"></span>
            <span>Growth: {formatCZK(growthTotal)}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-dot brands"></span>
            <span>Brands: {formatCZK(brandTotal)}</span>
          </div>
        </div>
        <div className="summary-bar">
          <div
            className="bar-segment maintenance"
            style={{ width: `${(maintenanceTotal / totalBudget) * 100}%` }}
          />
          <div
            className="bar-segment growth"
            style={{ width: `${(growthTotal / totalBudget) * 100}%` }}
          />
          <div
            className="bar-segment brands"
            style={{ width: `${(brandTotal / totalBudget) * 100}%` }}
          />
        </div>
      </div>

      {/* Maintenance Section */}
      <div className="budget-category">
        <div className="category-header">
          <div className="category-title">
            <span className="category-dot maintenance"></span>
            <h3>Maintenance</h3>
          </div>
          <span className="category-total">{formatCZK(maintenanceTotal)}</span>
        </div>
        <div className="budget-grid">
          {maintenanceBudgets.map(budget => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              totalBudget={totalBudget}
              onUpdate={handleUpdate}
              owner={PEOPLE[budget.owner]}
            />
          ))}
        </div>
      </div>

      {/* Growth Section */}
      <div className="budget-category">
        <div className="category-header">
          <div className="category-title">
            <span className="category-dot growth"></span>
            <h3>Growth & Inovace</h3>
          </div>
          <span className="category-total">{formatCZK(growthTotal)}</span>
        </div>
        <div className="budget-grid">
          {growthBudgets.map(budget => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              totalBudget={totalBudget}
              onUpdate={handleUpdate}
              owner={PEOPLE[budget.owner]}
            />
          ))}
        </div>
      </div>

      {/* Brand Section */}
      <div className="budget-category">
        <div className="category-header">
          <div className="category-title">
            <span className="category-dot brands"></span>
            <h3>Značky</h3>
          </div>
          <span className="category-total">{formatCZK(brandTotal)}</span>
        </div>
        <div className="budget-grid">
          {brandBudgets.map(budget => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              totalBudget={totalBudget}
              onUpdate={handleUpdate}
              owner={PEOPLE[budget.owner]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Organization Component
function Organization() {
  const [budgets, setBudgets] = useState(INITIAL_BUDGET_DATA);
  const [activeView, setActiveView] = useState('workflow');

  return (
    <div className="organization">
      {/* Header */}
      <header className="organization-header">
        <div className="header-text">
          <h2>Organizace & Rozpočet</h2>
          <p>Workflow procesy a rozpočet marketingu</p>
        </div>

        <div className="view-toggle">
          <button
            className={`toggle-btn ${activeView === 'workflow' ? 'active' : ''}`}
            onClick={() => setActiveView('workflow')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H14M2 8H14M2 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Organizace
          </button>
          <button
            className={`toggle-btn ${activeView === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveView('budget')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Rozpočet
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="organization-content">
        {activeView === 'workflow' && <WorkflowSection />}
        {activeView === 'budget' && (
          <BudgetSection budgets={budgets} setBudgets={setBudgets} />
        )}
      </div>
    </div>
  );
}

export default Organization;
