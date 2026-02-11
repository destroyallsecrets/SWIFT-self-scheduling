
import React from 'react';
import { Shift } from '../types';
import { groupShiftsByPayPeriod } from '../utils/calculations';

interface IncomeHistoryProps {
  shifts: Shift[];
  taxRate: number;
}

const IncomeHistory: React.FC<IncomeHistoryProps> = ({ shifts, taxRate }) => {
  const monthlyData = groupShiftsByPayPeriod(shifts, taxRate);

  if (shifts.length === 0) {
    return (
      <div className="p-8 text-center bg-wish-900/50 rounded-3xl border border-wish-800 border-dashed animate-in fade-in zoom-in duration-500">
        <p className="text-gray-500 font-medium text-sm">No past shifts in archive yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {monthlyData.map((month) => (
        <div key={month.monthLabel} className="bg-wish-800 border border-wish-700/50 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-xl">
          <div className="bg-wish-900/80 p-5 flex justify-between items-center border-b border-wish-700/50 backdrop-blur-md">
            <div>
              <h3 className="text-white font-black text-xl tracking-tight">{month.monthLabel}</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Cash Basis • {month.payPeriods.length} Checks</p>
            </div>
            <div className="text-right">
               <span className="text-2xl font-black text-white block tracking-tighter">${month.totalEarnings.net.toFixed(2)}</span>
               <span className="text-[9px] text-wish-success font-black uppercase tracking-[0.2em]">Total Net</span>
            </div>
          </div>

          <div className="divide-y divide-wish-700/30">
            {month.payPeriods.map((period) => (
              <div key={period.payDateIso} className="p-4 hover:bg-white/5 transition-colors group relative overflow-hidden">
                {/* Visual Status Indicator Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    period.status === 'PAID' ? 'bg-emerald-500' : 
                    period.status === 'PROCESSING' ? 'bg-amber-400' : 'bg-wish-accent'
                }`}></div>

                <div className="flex justify-between items-start mb-3 pl-3">
                    <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg ${
                            period.status === 'PAID' 
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                            : period.status === 'PROCESSING'
                            ? 'bg-amber-500/80 text-white shadow-amber-500/20'
                            : 'bg-wish-accent text-white shadow-indigo-500/20'
                        }`}>
                            {period.status === 'PAID' ? 'CSC Pay' : (period.status === 'PROCESSING' ? 'Processing' : 'Waiting 1 Wk')}
                        </span>
                        <span className="text-white font-bold text-sm tracking-tight">{period.payDateLabel}</span>
                    </div>
                    <div className="text-right">
                        <span className={`block font-black text-lg tracking-tighter ${
                            period.status === 'PAID' ? 'text-emerald-400' : 
                            period.status === 'PROCESSING' ? 'text-amber-300' : 'text-wish-accent'
                        }`}>
                            ${period.earnings.net.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="pl-3 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Work Week</p>
                        <p className="text-xs font-mono font-medium text-gray-300 bg-wish-900/50 px-2 py-1 rounded-lg inline-block border border-wish-800">
                            {period.workWeekLabel}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Hours</p>
                        <p className="text-xs font-mono font-medium text-gray-300">
                            {period.earnings.hours.toFixed(1)} HRS
                        </p>
                    </div>
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
