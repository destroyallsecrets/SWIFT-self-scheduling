
import { Shift, Earnings } from '../types';
import { HOURLY_RATE } from '../constants';

/**
 * Calculates the duration between two ISO dates in decimal hours.
 */
export const calculateDurationHours = (start: string, end: string): number => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max(0, (e - s) / (1000 * 60 * 60));
};

/**
 * Calculates gross, net, and deductions based on hours and a flat tax rate.
 */
export const calculateEarnings = (hours: number, taxRate: number): Earnings => {
  const gross = hours * HOURLY_RATE;
  const deductions = gross * taxRate;
  const net = gross - deductions;

  return {
    hours,
    gross,
    net,
    deductions
  };
};

/**
 * Aggregates earnings for an array of shifts.
 */
export const getEarningsForShifts = (shifts: Shift[], taxRate: number): Earnings => {
  let totalHours = 0;
  shifts.forEach(shift => {
    totalHours += calculateDurationHours(shift.startDate, shift.endDate);
  });
  return calculateEarnings(totalHours, taxRate);
};

/**
 * Groups shifts by Month/Year for the 'Upcoming' view.
 */
export const groupShiftsByMonth = (shifts: Shift[]): Record<string, Shift[]> => {
  const groups: Record<string, Shift[]> = {};
  shifts.forEach(shift => {
    const date = new Date(shift.startDate);
    const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(shift);
  });
  return groups;
};

// --- PAYROLL SCHEDULE LOGIC ---

export interface PayPeriodGroup {
  payDateIso: string;
  payDateLabel: string;
  workWeekLabel: string;
  shifts: Shift[];
  earnings: Earnings;
  status: 'PAID' | 'PENDING' | 'PROCESSING';
}

export interface MonthlyPayGroup {
  monthLabel: string;
  year: number;
  monthIndex: number;
  payPeriods: PayPeriodGroup[];
  totalEarnings: Earnings;
}

/**
 * Helper to format Date to YYYY-MM-DD local string to avoid UTC shifts
 */
const toLocalYMD = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculates the CSC Pay Date (Friday of the following week).
 * Work Week: Monday - Sunday.
 * Pay Date: Friday of the week AFTER the work week ends (1 week lag).
 * 
 * Logic Hardened: Uses Noon (12:00) time to avoid DST drift.
 */
export const getPayDateDetails = (dateStr: string) => {
  // Create a date object set to Noon local time to ensure date math is stable across DST
  const input = new Date(dateStr);
  const d = new Date(input.getFullYear(), input.getMonth(), input.getDate(), 12, 0, 0);
  
  const day = d.getDay(); // 0=Sun, 1=Mon... 6=Sat
  
  // Calculate end of work week (Sunday)
  // If Mon(1), need +6 days. If Sun(0), need +0 days.
  const daysToSunday = day === 0 ? 0 : 7 - day;
  
  const endOfWeek = new Date(d);
  endOfWeek.setDate(d.getDate() + daysToSunday);
  
  const startOfWeek = new Date(endOfWeek);
  startOfWeek.setDate(endOfWeek.getDate() - 6);

  // Pay Date is Friday of the FOLLOWING week.
  // End of Week (Sunday) + 12 days = Friday of next week.
  // e.g., Sun 1st + 12 = Fri 13th.
  const payDate = new Date(endOfWeek);
  payDate.setDate(endOfWeek.getDate() + 12);

  return {
    payDate,
    startOfWeek,
    endOfWeek
  };
};

/**
 * Groups shifts by Pay Period (CSC Schedule: Weekly Pay on Fridays).
 * Groups by Month of the *Pay Date*, effectively a "Cash Basis" view.
 */
export const groupShiftsByPayPeriod = (shifts: Shift[], taxRate: number): MonthlyPayGroup[] => {
  const periods: Record<string, PayPeriodGroup> = {};
  const today = new Date();
  today.setHours(0,0,0,0);

  // 1. Group shifts into Pay Periods (Pay Dates)
  shifts.forEach(shift => {
    const { payDate, startOfWeek, endOfWeek } = getPayDateDetails(shift.startDate);
    const payDateIso = toLocalYMD(payDate);
    
    if (!periods[payDateIso]) {
      const payLabel = payDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const weekStartStr = startOfWeek.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      const weekEndStr = endOfWeek.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      
      let status: 'PAID' | 'PENDING' | 'PROCESSING' = 'PAID';
      if (payDate > today) {
        // If pay date is in future
        const diffTime = Math.abs(payDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        // If within 7 days (the pay week), it's processing. Before that, it's waiting.
        status = diffDays <= 7 ? 'PROCESSING' : 'PENDING';
      }

      periods[payDateIso] = {
        payDateIso,
        payDateLabel: payLabel,
        workWeekLabel: `${weekStartStr} - ${weekEndStr}`,
        shifts: [],
        earnings: { hours: 0, gross: 0, net: 0, deductions: 0 },
        status
      };
    }
    periods[payDateIso].shifts.push(shift);
  });

  // 2. Calculate earnings for each period
  Object.values(periods).forEach(p => {
    p.earnings = getEarningsForShifts(p.shifts, taxRate);
    p.shifts.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  });

  // 3. Group Pay Periods into Months (based on Pay Date)
  const months: Record<string, MonthlyPayGroup> = {};
  
  Object.values(periods).forEach(p => {
    const dateParts = p.payDateIso.split('-');
    const year = parseInt(dateParts[0]);
    const monthIdx = parseInt(dateParts[1]) - 1; // 0-indexed
    
    // Create a date object for formatting the month label safely
    const dateObj = new Date(year, monthIdx, 1);
    const monthKey = `${year}-${monthIdx}`;
    
    if (!months[monthKey]) {
      months[monthKey] = {
        monthLabel: dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        year: year,
        monthIndex: monthIdx,
        payPeriods: [],
        totalEarnings: { hours: 0, gross: 0, net: 0, deductions: 0 }
      };
    }
    months[monthKey].payPeriods.push(p);
  });

  // 4. Calculate Month Totals and Sort
  const result = Object.values(months).map(m => {
    m.payPeriods.forEach(p => {
      m.totalEarnings.hours += p.earnings.hours;
      m.totalEarnings.gross += p.earnings.gross;
      m.totalEarnings.net += p.earnings.net;
      m.totalEarnings.deductions += p.earnings.deductions;
    });
    // Sort pay periods descending (newest paycheck first)
    m.payPeriods.sort((a, b) => b.payDateIso.localeCompare(a.payDateIso));
    return m;
  });

  // Sort months descending
  result.sort((a, b) => {
     if (a.year !== b.year) return b.year - a.year;
     return b.monthIndex - a.monthIndex;
  });

  return result;
};
