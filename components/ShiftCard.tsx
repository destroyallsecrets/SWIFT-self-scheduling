import React from 'react';
import { Shift } from '../types';
import { calculateDurationHours, calculateEarnings } from '../utils/calculations';

interface ShiftCardProps {
  shift: Shift;
  actionType?: 'NONE' | 'REQUEST' | 'APPROVE';
  onAction?: (shift: Shift) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  taxRate: number;
}

const ShiftCard: React.FC<ShiftCardProps> = ({ shift, actionType = 'NONE', onAction, onDelete, isLoading = false, taxRate }) => {
  const start = new Date(shift.startDate);
  const end = new Date(shift.endDate);

  const month = start.toLocaleDateString('en-US', { month: 'short' });
  const day = start.getDate().toString();
  const weekday = start.toLocaleDateString('en-US', { weekday: 'short' });
  
  // Set hour12 to false for strict 24-hour time formatting
  const timeFormat: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: false };
  const startTime = start.toLocaleTimeString('en-US', timeFormat);
  const endTime = end.toLocaleTimeString('en-US', timeFormat);

  const hours = calculateDurationHours(shift.startDate, shift.endDate);
  const earnings = calculateEarnings(hours, taxRate);

  const getStatusBadge = () => {
    switch (shift.status) {
      case 'AVAILABLE':
        return <span className="text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg text-[9px] font-black border border-blue-500/20 tracking-widest">OPEN</span>;
      case 'REQUESTED':
        return <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg text-[9px] font-black border border-amber-500/20 tracking-widest uppercase">Requested</span>;
      case 'CONFIRMED':
        return <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg text-[9px] font-black border border-emerald-500/20 tracking-widest uppercase">Booked</span>;
      default:
        return null;
    }
  };

  return (
    <div className="group bg-wish-900/50 border border-wish-800 hover:border-wish-700/80 rounded-[2rem] p-5 shadow-sm active:scale-[0.98] transition-all relative">
      
      {onDelete && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(shift.id); }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-wish-800 text-gray-500 rounded-full border border-wish-700 flex items-center justify-center opacity-0 group-hover:opacity-100 active:scale-90 transition-all hover:bg-red-500 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}

      <div className="flex items-start gap-5">
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-wish-950 rounded-2xl w-16 h-16 border border-wish-800 shadow-xl group-hover:border-wish-accent transition-colors">
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter leading-none">{weekday}</span>
          <span className="text-2xl font-black text-white leading-none my-1 tracking-tighter">{day}</span>
          <span className="text-[10px] text-wish-accent font-black uppercase tracking-tighter leading-none">{month}</span>
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-black text-white leading-tight truncate mr-2 tracking-tight">{shift.jobName}</h3>
            <div className="text-right flex-shrink-0">
              <span className="text-wish-success font-black text-base tracking-tighter block">
                +${earnings.net.toFixed(2)}
              </span>
              <span className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Net</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-wish-800/40 px-3 py-1.5 rounded-xl border border-wish-800">
               <svg className="w-3.5 h-3.5 text-wish-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <span className="text-xs font-black text-gray-100 font-mono tracking-tighter">
                  {startTime} — {endTime}
               </span>
            </div>
            <span className="text-[10px] font-black text-gray-500">
              {hours.toFixed(1)}h
            </span>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center text-[11px] text-gray-500 truncate min-w-0">
              <svg className="w-3.5 h-3.5 mr-1.5 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="truncate font-medium">{shift.venueName}</span>
            </div>
            {getStatusBadge()}
          </div>

          {(actionType !== 'NONE') && (
            <div className="mt-4 pt-4 border-t border-wish-800/50">
              {actionType === 'REQUEST' && shift.status === 'AVAILABLE' && (
                <button 
                  onClick={() => onAction && onAction(shift)}
                  disabled={isLoading}
                  className="w-full bg-wish-accent hover:bg-indigo-600 text-white py-3 rounded-2xl text-[11px] font-black tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  {isLoading ? '...' : 'CLAIM SHIFT'}
                </button>
              )}

              {actionType === 'APPROVE' && shift.status === 'REQUESTED' && (
                <button 
                  onClick={() => onAction && onAction(shift)}
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-[11px] font-black tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  {isLoading ? '...' : 'APPROVE WORKER'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftCard;