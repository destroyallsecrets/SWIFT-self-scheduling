import React from 'react';
import { Shift } from '../types';
import { calculateDurationHours, calculateEarnings } from '../utils/calculations';

interface ShiftCardProps {
  shift: Shift;
  actionType?: 'NONE' | 'REQUEST' | 'APPROVE';
  onAction?: (shift: Shift) => void;
  isLoading?: boolean;
}

const ShiftCard: React.FC<ShiftCardProps> = ({ shift, actionType = 'NONE', onAction, isLoading = false }) => {
  const start = new Date(shift.startDate);
  const end = new Date(shift.endDate);

  const month = start.toLocaleDateString('en-US', { month: 'short' });
  const day = start.getDate().toString();
  const weekday = start.toLocaleDateString('en-US', { weekday: 'short' });
  
  const timeFormat: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  const startTime = start.toLocaleTimeString('en-US', timeFormat);
  const endTime = end.toLocaleTimeString('en-US', timeFormat);

  const hours = calculateDurationHours(shift.startDate, shift.endDate);
  const earnings = calculateEarnings(hours);

  const getStatusBadge = () => {
    switch (shift.status) {
      case 'AVAILABLE':
        return <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-500/20">OPEN</span>;
      case 'REQUESTED':
        return <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-500/20">PENDING</span>;
      case 'CONFIRMED':
        return <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20">CONFIRMED</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`bg-wish-800 border border-wish-700/50 rounded-2xl p-4 mb-3 shadow-sm active:scale-[0.98] transition-transform`}>
      <div className="flex items-start gap-4">
        {/* Date Block */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-wish-900 rounded-xl w-14 h-14 border border-wish-700/50 shadow-inner">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{weekday}</span>
          <span className="text-xl font-bold text-white leading-none my-0.5">{day}</span>
          <span className="text-[10px] text-wish-accent font-bold uppercase tracking-tighter">{month}</span>
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start mb-0.5">
            <h3 className="text-base font-black text-white leading-tight truncate mr-2">{shift.jobName}</h3>
            <div className="text-right flex-shrink-0">
              <span className="text-wish-success font-mono text-sm font-bold block">
                +${earnings.net.toFixed(2)}
              </span>
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">NET</span>
            </div>
          </div>
          
          {/* Prominent Time Section */}
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-wish-700/30 px-2 py-1 rounded-lg border border-wish-700/50 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-wish-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-black text-gray-100 tracking-tight">
                {startTime} — {endTime}
              </span>
            </div>
            <span className="text-[10px] font-bold text-gray-500 bg-wish-900 px-1.5 py-0.5 rounded border border-wish-800">
              {hours.toFixed(1)}h
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[11px] text-gray-400 font-medium truncate flex items-center">
              {getStatusBadge()}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-wish-700/30 flex items-center justify-between gap-3">
            <div className="flex items-center text-[11px] text-gray-500 truncate min-w-0">
              <svg className="w-3 h-3 mr-1 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="truncate">{shift.venueName}</span>
            </div>

            {actionType === 'REQUEST' && shift.status === 'AVAILABLE' && (
              <button 
                onClick={() => onAction && onAction(shift)}
                disabled={isLoading}
                className="bg-wish-accent hover:bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex-shrink-0"
              >
                {isLoading ? '...' : 'CLAIM'}
              </button>
            )}

            {actionType === 'APPROVE' && shift.status === 'REQUESTED' && (
              <button 
                onClick={() => onAction && onAction(shift)}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex-shrink-0"
              >
                {isLoading ? '...' : 'ACCEPT'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftCard;