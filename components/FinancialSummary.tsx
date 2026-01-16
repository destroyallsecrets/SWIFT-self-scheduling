import React from 'react';
import { Shift } from '../types';
import { getEarningsForShifts, filterShiftsByPeriod } from '../utils/calculations';

interface FinancialSummaryProps {
  shifts: Shift[];
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ shifts }) => {
  const weekShifts = filterShiftsByPeriod(shifts, 'week');
  const monthShifts = filterShiftsByPeriod(shifts, 'month');

  const weekEarnings = getEarningsForShifts(weekShifts);
  const monthEarnings = getEarningsForShifts(monthShifts);

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-indigo-600 to-wish-accent p-6 rounded-[2rem] shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
        {/* Decorative background circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold text-indigo-100/70 uppercase tracking-widest mb-1">Total Net This Week</p>
              <h2 className="text-4xl font-extrabold text-white tracking-tight">
                ${weekEarnings.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/10 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] font-bold text-indigo-100/50 uppercase mb-1">Hours Logged</p>
              <p className="text-lg font-bold text-white">{weekEarnings.hours.toFixed(1)}h</p>
            </div>
            <div className="bg-black/10 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] font-bold text-indigo-100/50 uppercase mb-1">Monthly Goal</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-white">${monthEarnings.net.toFixed(0)}</p>
                <div className="flex-grow h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;