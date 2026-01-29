
import React from 'react';
import { SortOption } from '../hooks/useShifts';

interface FilterPanelProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  filterDateStart: string;
  setFilterDateStart: (val: string) => void;
  filterDateEnd: string;
  setFilterDateEnd: (val: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  searchQuery, setSearchQuery,
  sortBy, setSortBy,
  filterDateStart, setFilterDateStart,
  filterDateEnd, setFilterDateEnd
}) => {
  const resetFilters = () => {
    setSearchQuery('');
    setSortBy('date-desc');
    setFilterDateStart('');
    setFilterDateEnd('');
  };

  return (
    <div className="bg-wish-900/80 border border-wish-800 p-6 rounded-[2.5rem] space-y-5 animate-in slide-in-from-top-4 duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Search Gigs</label>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Venue or role..." 
            className="w-full bg-wish-800 border border-wish-700 rounded-xl p-3 text-xs text-white outline-none focus:border-wish-accent transition-all" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Sort Order</label>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value as SortOption)} 
            className="w-full bg-wish-800 border border-wish-700 rounded-xl p-3 text-xs text-white outline-none focus:border-wish-accent appearance-none cursor-pointer transition-all"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="earnings">Highest Pay</option>
            <option value="duration">Longest Shift</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">From Date</label>
          <input type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} className="w-full bg-wish-800 border border-wish-700 rounded-xl p-3 text-xs text-white outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">To Date</label>
          <input type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} className="w-full bg-wish-800 border border-wish-700 rounded-xl p-3 text-xs text-white outline-none" />
        </div>
      </div>
      <button onClick={resetFilters} className="w-full py-2 text-[10px] font-black text-gray-500 uppercase hover:text-red-400 transition-colors tracking-[0.2em]">Reset Filters</button>
    </div>
  );
};

export default FilterPanel;
