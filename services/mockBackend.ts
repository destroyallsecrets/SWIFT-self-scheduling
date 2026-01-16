import { Shift } from '../types';

const DB_KEY = 'swift_backend_db_v1';

// Initial seed data to populate the marketplace if empty
const SEED_DATA: Shift[] = [
  {
    id: 'seed-1',
    startDate: '2026-05-15T16:00:00.000Z',
    endDate: '2026-05-15T23:00:00.000Z',
    jobName: 'Concession Stand Lead',
    venueName: 'Lucas Oil Stadium',
    address: '500 S Capitol Ave, Indianapolis, IN',
    status: 'AVAILABLE',
    source: 'MARKETPLACE'
  },
  {
    id: 'seed-2',
    startDate: '2026-05-16T10:00:00.000Z',
    endDate: '2026-05-16T18:00:00.000Z',
    jobName: 'Ticket Scanner',
    venueName: 'Gainbridge Fieldhouse',
    address: '125 S Pennsylvania St, Indianapolis, IN',
    status: 'AVAILABLE',
    source: 'MARKETPLACE'
  },
  {
    id: 'seed-3',
    startDate: '2026-05-20T17:00:00.000Z',
    endDate: '2026-05-20T22:00:00.000Z',
    jobName: 'Event Security',
    venueName: 'TCU Amphitheater',
    address: '801 W Washington St, Indianapolis, IN',
    status: 'AVAILABLE',
    source: 'MARKETPLACE'
  }
];

const loadDb = (): Shift[] => {
  const stored = localStorage.getItem(DB_KEY);
  if (!stored) {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(stored);
};

const saveDb = (shifts: Shift[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(shifts));
};

export const MockBackend = {
  // --- USER METHODS ---

  getMySchedule: async (): Promise<Shift[]> => {
    // Returns shifts that are confirmed (owned by user) or manually added
    const all = loadDb();
    return all.filter(s => s.status === 'CONFIRMED' || s.source === 'MANUAL' || s.source === 'OCR');
  },

  getAvailableShifts: async (): Promise<Shift[]> => {
    // Returns shifts available in the marketplace
    const all = loadDb();
    return all.filter(s => s.status === 'AVAILABLE');
  },

  requestShift: async (shiftId: string): Promise<void> => {
    const all = loadDb();
    const updated = all.map(s => s.id === shiftId ? { ...s, status: 'REQUESTED' as const } : s);
    saveDb(updated);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 400));
  },

  // --- EMPLOYER METHODS ---

  postShift: async (shift: Omit<Shift, 'id' | 'status' | 'source'>): Promise<void> => {
    const all = loadDb();
    const newShift: Shift = {
      ...shift,
      id: crypto.randomUUID(),
      status: 'AVAILABLE',
      source: 'MARKETPLACE'
    };
    saveDb([...all, newShift]);
    await new Promise(r => setTimeout(r, 400));
  },

  getEmployerShifts: async (): Promise<Shift[]> => {
    const all = loadDb();
    // Employers see everything they put in the marketplace, plus status
    return all.filter(s => s.source === 'MARKETPLACE');
  },

  approveRequest: async (shiftId: string): Promise<void> => {
    const all = loadDb();
    const updated = all.map(s => s.id === shiftId ? { ...s, status: 'CONFIRMED' as const } : s);
    saveDb(updated);
    await new Promise(r => setTimeout(r, 400));
  },

  // --- SYSTEM METHODS ---
  
  // Used when parsing OCR/Text to immediately add to schedule
  syncManualShifts: async (newShifts: Shift[]): Promise<void> => {
    const all = loadDb();
    const existingIds = new Set(all.map(s => s.id));
    const toAdd = newShifts.filter(s => !existingIds.has(s.id)).map(s => ({
      ...s,
      status: 'CONFIRMED' as const,
      source: 'OCR' as const
    }));
    
    saveDb([...all, ...toAdd]);
  },

  reset: () => {
    localStorage.removeItem(DB_KEY);
    loadDb(); // reseeds
  }
};