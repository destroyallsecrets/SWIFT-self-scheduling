
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
 * Pay Date: Friday after the Sunday.
 */
export const getPayDateDetails = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0=Sun, 1=Mon... 6=Sat
  
  // Calculate end of work week (Sunday)
  // If Mon(1), need +6 days. If Sun(0), need +0 days.
  const daysToSunday = day === 0 ? 0 : 7 - day;
  
  const endOfWeek = new Date(d);
  endOfWeek.setDate(d.getDate() + daysToSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfWeek = new Date(endOfWeek);
  startOfWeek.setDate(endOfWeek.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  // Pay Date is Friday after End of Week (Sunday + 5 days)
  const payDate = new Date(endOfWeek);
  payDate.setDate(endOfWeek.getDate() + 5);
  payDate.setHours(0, 0, 0, 0);

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

  // 1. Group shifts into Pay Periods (Pay Dates)
  shifts.forEach(shift => {
    const { payDate, startOfWeek, endOfWeek } = getPayDateDetails(shift.startDate);
    const payDateIso = toLocalYMD(payDate);
    
    if (!periods[payDateIso]) {
      const payLabel = payDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const weekStartStr = startOfWeek.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      const weekEndStr = endOfWeek.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      
      periods[payDateIso] = {
        payDateIso,
        payDateLabel: payLabel,
        workWeekLabel: `Week: ${weekStartStr} - ${weekEndStr}`,
        shifts: [],
        earnings: { hours: 0, gross: 0, net: 0, deductions: 0 }
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
