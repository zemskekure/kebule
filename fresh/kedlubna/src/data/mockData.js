// Mock data store - everything is local, no API calls
// This will be replaced with Supabase later

export const mockZnacky = [
  { id: 'z1', name: 'Burger King', color: '#FF8C00' },
  { id: 'z2', name: 'KFC', color: '#E31837' },
  { id: 'z3', name: 'Pizza Hut', color: '#EE3A23' },
];

export const mockTemata = [
  { id: 't1', title: 'Marketing', color: '#E8BC6A', year: 2026 },
  { id: 't2', title: 'Provoz', color: '#81C784', year: 2026 },
  { id: 't3', title: 'Tým', color: '#64B5F6', year: 2026 },
];

export const mockDrobky = [
  {
    id: 'd1',
    title: 'Chybí propagační materiály',
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    priority: 'high',
    author_name: 'Jana Nová',
    znacka_id: 'z1',
    tema_id: null
  },
  {
    id: 'd2',
    title: 'Nefunguje klimatizace',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    priority: null,
    author_name: 'Petr Malý',
    znacka_id: 'z2',
    tema_id: null
  },
  {
    id: 'd3',
    title: 'Potřebujeme nové uniformy',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    priority: null,
    author_name: 'Marie K.',
    znacka_id: 'z1',
    tema_id: 't3' // already assigned to Tým
  },
  {
    id: 'd4',
    title: 'Instagram posty nefungují',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    priority: 'high',
    author_name: 'Tomáš H.',
    znacka_id: 'z3',
    tema_id: 't1' // assigned to Marketing
  },
  {
    id: 'd5',
    title: 'Dodavatel zpozdil dodávku',
    date: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
    priority: null,
    author_name: 'Lenka P.',
    znacka_id: 'z2',
    tema_id: null
  },
];
