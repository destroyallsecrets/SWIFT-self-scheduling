import React, { useMemo, useState } from 'react';
import { Shift } from '../types';
import { getEarningsForShifts } from '../utils/calculations';
import { CITY_TAX_PRESETS } from '../constants';

interface FinancialSummaryProps {
  shifts: Shift[];
  taxRate: number;
  onTaxChange: (rate: number) => void;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ shifts, taxRate, onTaxChange }) => {
  const [goal, setGoal] = useState<number>(2000);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);
  const [isCustomTax, setIsCustomTax] = useState(false);
  const [showTargetBar, setShowTargetBar] = useState(false);
  
  const totalEarnings = useMemo(() => getEarningsForShifts(shifts, taxRate), [shifts, taxRate]);
  const progress = Math.min(100, (totalEarnings.net / goal) * 100);

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rate = parseFloat(e.target.value);
    onTaxChange(rate);
    setIsCustomTax(false);
  };

  const handleCustomTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onTaxChange(val / 100);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Income Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-wish-accent to-indigo-700 p-6 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-indigo-100/70 uppercase tracking-[0.2em] mb-1">Projected Net Income</p>
              <h2 className="text-4xl font-black text-white tracking-tighter">
                ${totalEarnings.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <button 
              onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
              className={`p-2.5 rounded-2xl backdrop-blur-md transition-all border ${showTaxBreakdown ? 'bg-white text-wish-accent border-white' : 'bg-white/10 hover:bg-white/20 border-white/10'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>

          {showTargetBar && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-indigo-100/60 uppercase tracking-widest">Target:</span>
                  <input 
                    type="number" 
                    value={goal} 
                    onChange={(e) => setGoal(Number(e.target.value))}
                    className="bg-black/20 border-none text-[10px] font-black text-white w-16 px-2 py-0.5 rounded-lg outline-none focus:ring-1 focus:ring-white/30 transition-all"
                  />
                </div>
                <span className="text-xs font-black text-white">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-black/20 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tax Engine & Settings */}
      {showTaxBreakdown && (
        <div className="bg-wish-900 border border-wish-800 rounded-[2rem] p-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Tax Settings (24h Sync)</h3>
            <button 
              onClick={() => setIsCustomTax(!isCustomTax)}
              className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border transition-all ${isCustomTax ? 'bg-wish-accent border-wish-accent text-white' : 'border-wish-700 text-gray-500'}`}
            >
              {isCustomTax ? 'Custom Mode' : 'Presets'}
            </button>
          </div>
          
          <div className="space-y-5">
            {/* Target Bar Visibility Toggle */}
            <div className="flex items-center justify-between p-4 bg-wish-800/50 rounded-2xl border border-wish-800">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Show Income Goal</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={showTargetBar}
                  onChange={(e) => setShowTargetBar(e.target.checked)}
                />
                <div className="w-9 h-5 bg-wish-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-wish-accent"></div>
              </label>
            </div>

            {!isCustomTax ? (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">City Preset</label>
                <select 
                  onChange={handleCitySelect}
                  value={taxRate}
                  className="w-full bg-wish-800 border border-wish-700 rounded-2xl p-4 text-sm font-bold text-white outline-none appearance-none cursor-pointer"
                >
                  {CITY_TAX_PRESETS.map(city => (
                    <option key={city.name} value={city.totalRate}>
                      {city.name} ({(city.totalRate * 100).toFixed(1)}%)
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-gray-600 ml-2 italic">
                  * includes estimated Federal, FICA, State, and County.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Custom Total Withholding (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    value={(taxRate * 100).toFixed(1)}
                    onChange={handleCustomTaxChange}
                    className="w-full bg-wish-800 border border-wish-700 rounded-2xl p-4 text-xl font-black text-white outline-none focus:border-wish-accent transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-wish-accent font-black">%</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-wish-800 mt-2">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium text-gray-500">Gross (Untaxed)</span>
                <span className="text-xs font-bold text-white">${totalEarnings.gross.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium text-gray-500">Estimated Deductions</span>
                <span className="text-xs font-bold text-red-400">-${totalEarnings.deductions.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center bg-wish-800/50 p-3 rounded-xl border border-wish-800">
                <span className="text-[10px] font-black text-wish-accent uppercase">Net Take Home</span>
                <span className="text-base font-black text-wish-success">${totalEarnings.net.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialSummary;