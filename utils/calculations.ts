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

/**
 * Advanced grouping for the 'Archive' view, breaking down by month and week.
 */
export const groupShiftsByMonthAndWeek = (shifts: Shift[], taxRate: number): MonthlyGroup[] => {
  const groups: Record<string, MonthlyGroup> = {};

  shifts.forEach(shift => {
    const d = new Date(shift.startDate);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    const monthLabel = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    if (!groups[monthKey]) {
      groups[monthKey] = {
        monthLabel,
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        shifts: [],
        earnings: { hours: 0, gross: 0, net: 0, deductions: 0 },
        weeks: []
      };
    }

    groups[monthKey].shifts.push(shift);
  });

  return Object.values(groups).map(monthGroup => {
    monthGroup.earnings = getEarningsForShifts(monthGroup.shifts, taxRate);

    const weeklyGroups: Record<string, WeeklyGroup> = {};
    
    monthGroup.shifts.forEach(shift => {
      const d = new Date(shift.startDate);
      const currentDay = d.getDay();
      const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
      const monday = new Date(d);
      monday.setDate(d.getDate() - diffToMonday);
      monday.setHours(0,0,0,0);
      
      const weekKey = monday.toISOString();
      const weekLabel = `Week of ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      if (!weeklyGroups[weekKey]) {
        weeklyGroups[weekKey] = {
          label: weekLabel,
          shifts: [],
          earnings: { hours: 0, gross: 0, net: 0, deductions: 0 }
        };
      }
      weeklyGroups[weekKey].shifts.push(shift);
    });

    monthGroup.weeks = Object.values(weeklyGroups).map(week => {
      week.earnings = getEarningsForShifts(week.shifts, taxRate);
      return week;
    }).sort((a, b) => b.shifts[0].startDate.localeCompare(a.shifts[0].startDate));

    return monthGroup;
  }).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.monthIndex - a.monthIndex;
  });
};

export interface MonthlyGroup {
  monthLabel: string;
  year: number;
  monthIndex: number;
  shifts: Shift[];
  earnings: Earnings;
  weeks: WeeklyGroup[];
}

export interface WeeklyGroup {
  label: string;
  shifts: Shift[];
  earnings: Earnings;
}
