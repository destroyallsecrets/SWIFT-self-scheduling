import React from 'react';
import { Shift } from '../types';
import { groupShiftsByMonthAndWeek } from '../utils/calculations';

interface IncomeHistoryProps {
  shifts: Shift[];
  taxRate: number;
}

const IncomeHistory: React.FC<IncomeHistoryProps> = ({ shifts, taxRate }) => {
  const monthlyData = groupShiftsByMonthAndWeek(shifts, taxRate);

  if (shifts.length === 0) {
    return (
      <div className="p-8 text-center bg-wish-900/50 rounded-3xl border border-wish-800 border-dashed">
        <p className="text-gray-500 font-medium text-sm">No past shifts in archive yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {monthlyData.map((month) => (
        <div key={month.monthLabel} className="bg-wish-800 border border-wish-700/50 rounded-2xl overflow-hidden animate-in fade-in duration-500">
          <div className="bg-wish-900/80 p-5 flex justify-between items-center border-b border-wish-700/50">
            <div>
              <h3 className="text-white font-bold text-lg">{month.monthLabel}</h3>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{month.shifts.length} Shifts Recorded</p>
            </div>
            <div className="text-right">
               <span className="text-2xl font-black text-white block">${month.earnings.net.toFixed(2)}</span>
               <span className="text-[10px] text-wish-success font-bold uppercase tracking-widest">Net Earned</span>
            </div>
          </div>

          <div className="divide-y divide-wish-700/30">
            {month.weeks.map((week) => (
              <div key={week.label} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-wish-700/50 flex items-center justify-center text-wish-accent">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-200">{week.label}</p>
                    <p className="text-[10px] text-gray-500 font-mono tracking-tighter">{week.earnings.hours.toFixed(1)} hrs • {week.shifts.length} shifts</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-wish-success font-mono block">+${week.earnings.net.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-600 font-medium tracking-widest">PAYOUT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IncomeHistory;