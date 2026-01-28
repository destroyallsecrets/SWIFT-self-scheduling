import React, { useState } from 'react';
import { Shift } from '../types';

interface ScheduleUploaderProps {
  onImport: (shifts: Shift[]) => void;
  onClose: () => void;
}

const PRESET_VENUES = [
  "Lucas Oil Stadium",
  "Gainbridge Fieldhouse",
  "TCU Amphitheater",
  "Indy Motor Speedway",
  "Victory Field",
  "Convention Center"
];

const PRESET_ROLES = [
  "Server",
  "Bartender",
  "Security",
  "Concessions",
  "Ticket Taker",
  "Vibe Host"
];

const ScheduleUploader: React.FC<ScheduleUploaderProps> = ({ onImport, onClose }) => {
  const [jobName, setJobName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('23:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);
    
    // Handle overnight shifts
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const newShift: Shift = {
      id: crypto.randomUUID(),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      jobName: jobName || "Event Shift",
      venueName: venueName || "Local Venue",
      address: "Indianapolis, IN",
      status: 'CONFIRMED',
      source: 'MANUAL'
    };

    onImport([newShift]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end justify-center">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-wish-950 w-full max-w-xl rounded-t-[3rem] border-t border-wish-700 shadow-2xl relative animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh]">
        <div className="w-12 h-1.5 bg-wish-800 rounded-full mx-auto my-4 flex-shrink-0"></div>

        <div className="px-6 pb-12 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter">Add Shift</h2>
              <p className="text-[10px] text-wish-accent font-black uppercase tracking-[0.2em] mt-1">Manual Quick Sync</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-wish-900 rounded-full flex items-center justify-center text-gray-500 border border-wish-800 active:scale-90 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Job Selection */}
            <section>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">What is your role?</label>
              <input 
                type="text" 
                placeholder="e.g. VIP Server"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                className="w-full bg-wish-900 border-b-2 border-wish-800 focus:border-wish-accent p-4 text-xl font-bold text-white outline-none transition-colors rounded-xl mb-4"
              />
              <div className="flex flex-wrap gap-2">
                {PRESET_ROLES.map(role => (
                  <button 
                    key={role}
                    type="button"
                    onClick={() => setJobName(role)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${jobName === role ? 'bg-wish-accent border-wish-accent text-white' : 'bg-wish-900 border-wish-800 text-gray-400'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </section>

            {/* Venue Selection */}
            <section>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Where are you working?</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_VENUES.map(venue => (
                  <button 
                    key={venue}
                    type="button"
                    onClick={() => setVenueName(venue)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${venueName === venue ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-wish-900 border-wish-800 text-gray-400'}`}
                  >
                    {venue}
                  </button>
                ))}
              </div>
            </section>

            {/* Date and Time */}
            <section className="bg-wish-900 p-6 rounded-[2rem] border border-wish-800">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Date & Time</label>
              <div className="space-y-6">
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-wish-800 p-4 rounded-2xl text-white font-bold outline-none border border-wish-700 focus:border-wish-accent"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-600 uppercase ml-2">Start</span>
                    <input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-wish-800 p-4 rounded-2xl text-white font-mono font-bold outline-none border border-wish-700 focus:border-wish-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-600 uppercase ml-2">End</span>
                    <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-wish-800 p-4 rounded-2xl text-white font-mono font-bold outline-none border border-wish-700 focus:border-wish-accent"
                    />
                  </div>
                </div>
              </div>
            </section>

            <button 
              type="submit"
              className="w-full bg-wish-accent hover:bg-indigo-500 text-white font-black py-5 rounded-[2rem] text-lg shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              Confirm Shift
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleUploader;