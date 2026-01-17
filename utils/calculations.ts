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

export interface MonthlyGroup {
  monthLabel: string; // e.g., "May 2026"
  year: number;
  monthIndex: number;
  shifts: Shift[];
  earnings: Earnings;
  weeks: WeeklyGroup[];
}

export interface WeeklyGroup {
  label: string; // e.g., "Week of May 4"
  shifts: Shift[];
  earnings: Earnings;
}

export const groupShiftsByMonthAndWeek = (shifts: Shift[]): MonthlyGroup[] => {
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

  // Process each month
  return Object.values(groups).map(monthGroup => {
    // Calculate Monthly Earnings
    monthGroup.earnings = getEarningsForShifts(monthGroup.shifts);

    // Group by Week inside the month
    const weeklyGroups: Record<string, WeeklyGroup> = {};
    
    monthGroup.shifts.forEach(shift => {
      const d = new Date(shift.startDate);
      // Find Monday of that week
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
      week.earnings = getEarningsForShifts(week.shifts);
      return week;
    }).sort((a, b) => b.shifts[0].startDate.localeCompare(a.shifts[0].startDate)); // Newest week first

    return monthGroup;
  }).sort((a, b) => {
    // Sort months descending (newest first)
    if (a.year !== b.year) return b.year - a.year;
    return b.monthIndex - a.monthIndex;
  });
};