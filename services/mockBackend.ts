import { Shift, User, UserRole, AuthSession } from '../types';

const SHIFTS_KEY = 'swift_dev_shifts_v2';
const USERS_KEY = 'swift_dev_users_v2';
const SESSION_KEY = 'swift_dev_session';

// Default system users for development
const INITIAL_USERS: User[] = [
  { id: 'u-1', name: 'Dev Manager', email: 'manager@csc.com', role: 'MANAGER', password: 'password123' },
  { id: 'u-2', name: 'Dev Staff', email: 'staff@csc.com', role: 'STAFF', password: 'password123' }
];

const loadUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  return JSON.parse(stored);
};

const loadShifts = (): Shift[] => {
  const stored = localStorage.getItem(SHIFTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveShifts = (shifts: Shift[]) => {
  localStorage.setItem(SHIFTS_KEY, JSON.stringify(shifts));
};

export const MockBackend = {
  // --- AUTH METHODS ---
  
  login: async (email: string, password: string): Promise<AuthSession> => {
    await new Promise(r => setTimeout(r, 600)); // Simulate network latency
    const users = loadUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) throw new Error("Invalid credentials");
    
    const session: AuthSession = { 
      user: { ...user, password: undefined }, 
      token: `dev-token-${user.id}-${Date.now()}` 
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  getSession: (): AuthSession | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  // --- USER METHODS ---

  getMySchedule: async (userId: string): Promise<Shift[]> => {
    const all = loadShifts();
    return all.filter(s => s.assignedTo === userId || s.source === 'MANUAL' || s.source === 'OCR');
  },

  getAvailableShifts: async (): Promise<Shift[]> => {
    const all = loadShifts();
    return all.filter(s => s.status === 'AVAILABLE' && !s.assignedTo);
  },

  claimShift: async (shiftId: string, userId: string): Promise<void> => {
    const all = loadShifts();
    const updated = all.map(s => 
      s.id === shiftId ? { ...s, status: 'REQUESTED' as const, assignedTo: userId } : s
    );
    saveShifts(updated);
    await new Promise(r => setTimeout(r, 400));
  },

  addPersonalShift: async (shift: Omit<Shift, 'id' | 'status' | 'source'>, userId: string): Promise<void> => {
    const all = loadShifts();
    const newShift: Shift = {
      ...shift,
      id: crypto.randomUUID(),
      status: 'CONFIRMED',
      source: 'MANUAL',
      assignedTo: userId
    };
    saveShifts([...all, newShift]);
  },

  // --- MANAGER/ADMIN METHODS ---

  postMarketplaceShift: async (shift: Omit<Shift, 'id' | 'status' | 'source'>, managerId: string): Promise<void> => {
    const all = loadShifts();
    const newShift: Shift = {
      ...shift,
      id: crypto.randomUUID(),
      status: 'AVAILABLE',
      source: 'MARKETPLACE',
      postedBy: managerId
    };
    saveShifts([...all, newShift]);
    await new Promise(r => setTimeout(r, 400));
  },

  getManagerOverview: async (managerId: string): Promise<Shift[]> => {
    const all = loadShifts();
    return all.filter(s => s.postedBy === managerId || s.source === 'MARKETPLACE');
  },

  approveWorker: async (shiftId: string): Promise<void> => {
    const all = loadShifts();
    const updated = all.map(s => 
      s.id === shiftId ? { ...s, status: 'CONFIRMED' as const } : s
    );
    saveShifts(updated);
    await new Promise(r => setTimeout(r, 400));
  },

  // --- SYSTEM METHODS ---
  
  syncManualShifts: async (newShifts: Shift[], userId: string): Promise<void> => {
    const all = loadShifts();
    const toAdd = newShifts.map(s => ({
      ...s,
      id: s.id || crypto.randomUUID(),
      status: 'CONFIRMED' as const,
      source: 'OCR' as const,
      assignedTo: userId
    }));
    saveShifts([...all, ...toAdd]);
  },

  reset: () => {
    localStorage.removeItem(SHIFTS_KEY);
    localStorage.removeItem(SESSION_KEY);
  }
};