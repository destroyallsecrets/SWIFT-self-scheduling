export type ShiftStatus = 'AVAILABLE' | 'REQUESTED' | 'CONFIRMED' | 'COMPLETED';
export type UserRole = 'MANAGER' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Only for local dev auth
}

export interface Shift {
  id: string;
  startDate: string; // ISO String
  endDate: string; // ISO String
  jobName: string;
  venueName: string;
  address: string;
  status: ShiftStatus;
  source?: 'MANUAL' | 'OCR' | 'MARKETPLACE';
  assignedTo?: string; // User ID
  postedBy?: string; // Manager User ID
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface TaxRates {
  federal: number;
  socialSecurity: number;
  medicare: number;
  state: number; // Indiana
  local: number; // Marion County
}

export interface Earnings {
  hours: number;
  gross: number;
  net: number;
  deductions: number;
}

export type Period = 'shift' | 'day' | 'week' | 'month' | 'year';

export interface ParseResult {
  shifts: Shift[];
  error?: string;
}