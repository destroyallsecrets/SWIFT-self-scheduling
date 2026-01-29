
import { useState, useEffect, useMemo } from 'react';
import { Shift, AuthSession } from '../types';
import { MockBackend } from '../services/mockBackend';
import { calculateDurationHours, calculateEarnings, groupShiftsByMonth } from '../utils/calculations';

export type SortOption = 'date-desc' | 'date-asc' | 'earnings' | 'duration';

/**
 * Explicit interface for useShifts return type to prevent 'unknown' inference in consumers.
 */
export interface UseShiftsReturn {
  shifts: Shift[];
  upcomingShifts: Shift[];
  pastShifts: Shift[];
  groupedUpcoming: Record<string, Shift[]>;
  filters: {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    sortBy: SortOption;
    setSortBy: (val: SortOption) => void;
    filterDateStart: string;
    setFilterDateStart: (val: string) => void;
    filterDateEnd: string;
    setFilterDateEnd: (val: string) => void;
  };
  refreshSchedule: () => Promise<void>;
}

// Fixed: Added explicit return type UseShiftsReturn to resolve type inference issues.
export const useShifts = (session: AuthSession | null, taxRate: number): UseShiftsReturn => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  const refreshSchedule = async () => {
    if (!session?.user) return;
    const data = await MockBackend.getMySchedule(session.user.id);
    setShifts(data);
  };

  useEffect(() => {
    if (session) refreshSchedule();
  }, [session]);

  const filteredAndSortedShifts = useMemo(() => {
    let result = [...shifts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.jobName.toLowerCase().includes(q) || 
        s.venueName.toLowerCase().includes(q)
      );
    }

    if (filterDateStart) result = result.filter(s => new Date(s.startDate) >= new Date(filterDateStart));
    if (filterDateEnd) result = result.filter(s => new Date(s.startDate) <= new Date(filterDateEnd));

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'earnings':
          const earnA = calculateEarnings(calculateDurationHours(a.startDate, a.endDate), taxRate).net;
          const earnB = calculateEarnings(calculateDurationHours(b.startDate, b.endDate), taxRate).net;
          return earnB - earnA;
        case 'duration':
          const durA = calculateDurationHours(a.startDate, a.endDate);
          const durB = calculateDurationHours(b.startDate, b.endDate);
          return durB - durA;
        default: return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
    });

    return result;
  }, [shifts, searchQuery, sortBy, filterDateStart, filterDateEnd, taxRate]);

  const { upcomingShifts, pastShifts } = useMemo(() => {
    const now = new Date();
    const past = filteredAndSortedShifts.filter(s => new Date(s.endDate) < now);
    const upcoming = filteredAndSortedShifts.filter(s => new Date(s.endDate) >= now);
    if (sortBy === 'date-desc') upcoming.reverse(); 
    return { upcomingShifts: upcoming, pastShifts: past };
  }, [filteredAndSortedShifts, sortBy]);

  const groupedUpcoming = useMemo(() => groupShiftsByMonth(upcomingShifts), [upcomingShifts]);

  return {
    shifts,
    upcomingShifts,
    pastShifts,
    groupedUpcoming,
    filters: {
      searchQuery, setSearchQuery,
      sortBy, setSortBy,
      filterDateStart, setFilterDateStart,
      filterDateEnd, setFilterDateEnd
    },
    refreshSchedule
  };
};
