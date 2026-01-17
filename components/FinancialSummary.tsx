import React, { useMemo } from 'react';
import { Shift } from '../types';
import { getEarningsForShifts, groupShiftsByMonthAndWeek } from '../utils/calculations';

interface FinancialSummaryProps {
  shifts: Shift[];
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ shifts }) => {
  // Calculate total earnings for the shifts passed in (Upcoming Shifts)
  const totalEarnings = getEarningsForShifts(shifts);

  const breakdown = useMemo(() => {
    if (shifts.length === 0) return [];

    // Reuse existing grouping logic which returns MonthlyGroup[]
    // Default is sorted descending (Newest first) for history.
    // For upcoming projections, we want Ascending (Soonest first).
    const grouped = groupShiftsByMonthAndWeek(shifts);
    
    // Sort months ascending
    const sortedMonths = [...grouped].sort((a, b) => {
       if (a.year !== b.year) return a.year - b.year;
       return a.monthIndex - b.monthIndex;
    });

    // Sort weeks within months ascending
    sortedMonths.forEach(m => {
        m.weeks.sort((a, b) => a.shifts[0].startDate.localeCompare(b.shifts[0].startDate));
    });

    return sortedMonths;
  }, [shifts]);

  return (
    <div className="w-full space-y-4">
      <div className="bg-gradient-to-br from-indigo-600 to-wish-accent p-6 rounded-[2rem] shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
        {/* Decorative background circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold text-indigo-100/70 uppercase tracking-widest mb-1">Projected Upcoming Pay</p>
              <h2 className="text-4xl font-extrabold text-white tracking-tight">
                ${totalEarnings.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/10 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] font-bold text-indigo-100/50 uppercase mb-1">Scheduled Hours</p>
              <p className="text-lg font-bold text-white">{totalEarnings.hours.toFixed(1)}h</p>
            </div>
            <div className="bg-black/10 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] font-bold text-indigo-100/50 uppercase mb-1">Shifts Booked</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-white">{shifts.length}</p>
                <div className="flex-grow h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 rounded-full" 
                    style={{ width: `${Math.min(100, (shifts.length / 10) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown List */}
      {breakdown.length > 0 && (
        <div className="bg-wish-900 border border-wish-800 rounded-3xl p-5 shadow-inner">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-wish-accent"></span>
             Payday Estimate
           </h3>
           <div className="space-y-4">
              {breakdown.map((month) => (
                <div key={month.monthLabel} className="relative">
                   {/* Connector Line */}
                   <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-wish-800/50 -z-10 last:hidden"></div>

                   <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-wish-800 border border-wish-700 flex items-center justify-center text-xs font-bold text-gray-400 shadow-sm">
                            {month.monthLabel.substring(0, 3)}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{month.monthLabel}</p>
                            <p className="text-[10px] text-gray-500">{month.shifts.length} shifts</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-bold text-white">${month.earnings.net.toFixed(2)}</p>
                         <p className="text-[10px] text-wish-success font-medium">MONTH TOTAL</p>
                      </div>
                   </div>

                   {/* Weeks */}
                   <div className="pl-[2.5rem] space-y-2">
                      {month.weeks.map((week) => (
                        <div key={week.label} className="flex justify-between items-center py-1.5 px-3 bg-wish-800/30 rounded-lg border border-wish-700/30">
                           <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-wish-700"></div>
                             <span className="text-xs text-gray-400 font-medium">{week.label}</span>
                           </div>
                           <span className="text-xs font-mono font-bold text-wish-success/90">+${week.earnings.net.toFixed(2)}</span>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default FinancialSummary;