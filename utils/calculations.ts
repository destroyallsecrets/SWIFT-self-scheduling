import { Shift, Earnings } from '../types';
import { HOURLY_RATE, TOTAL_TAX_RATE } from '../constants';

export const calculateDurationHours = (start: string, end: string): number => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max(0, (e - s) / (1000 * 60 * 60));
};

export const calculateEarnings = (hours: number): Earnings => {
  const gross = hours * HOURLY_RATE;
  const deductions = gross * TOTAL_TAX_RATE;
  const net = gross - deductions;

  return {
    hours,
    gross,
    net,
    deductions
  };
};

export const getEarningsForShifts = (shifts: Shift[]): Earnings => {
  let totalHours = 0;
  shifts.forEach(shift => {
    totalHours += calculateDurationHours(shift.startDate, shift.endDate);
  });
  return calculateEarnings(totalHours);
};

export const filterShiftsByPeriod = (shifts: Shift[], period: 'day' | 'week' | 'month' | 'year', referenceDate: Date = new Date()): Shift[] => {
  return shifts.filter(shift => {
    const d = new Date(shift.startDate);
    
    if (period === 'day') {
      return d.toDateString() === referenceDate.toDateString();
    }
    
    if (period === 'week') {
      // Assuming week starts on Monday for pay period standard, or Sunday. 
      // Let's use simple ISO week logic or +/- days.
      // Simple logic: Is it in the same ISO week?
      const dTime = d.getTime();
      const currentDay = referenceDate.getDay(); // 0 is Sunday
      const diffToMonday = currentDay === 0 ? 6 : currentDay - 1; 
      const monday = new Date(referenceDate);
      monday.setHours(0,0,0,0);
      monday.setDate(referenceDate.getDate() - diffToMonday);
      
      const nextMonday = new Date(monday);
      nextMonday.setDate(monday.getDate() + 7);
      
      return dTime >= monday.getTime() && dTime < nextMonday.getTime();
    }

    if (period === 'month') {
      return d.getMonth() === referenceDate.getMonth() && d.getFullYear() === referenceDate.getFullYear();
    }

    if (period === 'year') {
      return d.getFullYear() === referenceDate.getFullYear();
    }

    return false;
  });
};