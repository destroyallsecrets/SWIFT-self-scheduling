import React, { useState, useEffect } from 'react';
import { Shift } from '../types';
import { MockBackend } from '../services/mockBackend';
import ShiftCard from './ShiftCard';

interface EmployerDashboardProps {
  onNotify: (msg: string) => void;
}

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onNotify }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'requests'>('create');
  
  // Form State
  const [jobName, setJobName] = useState('Event Staff');
  const [venueName, setVenueName] = useState('Lucas Oil Stadium');
  const [date, setDate] = useState('2026-06-01');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('23:00');
  const [submitting, setSubmitting] = useState(false);

  const fetchShifts = async () => {
    const data = await MockBackend.getEmployerShifts();
    setShifts(data.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    // Handle overnight shifts roughly
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    try {
      await MockBackend.postShift({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        jobName,
        venueName,
        address: 'Indianapolis, IN' // Simplified for demo
      });
      onNotify('Shift Posted to Marketplace');
      fetchShifts();
      // Reset form slightly
      setJobName('Event Staff');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (shift: Shift) => {
    await MockBackend.approveRequest(shift.id);
    onNotify(`Approved ${shift.jobName} for user`);
    fetchShifts();
  };

  const pendingRequests = shifts.filter(s => s.status === 'REQUESTED');
  const activeShifts = shifts.filter(s => s.status === 'AVAILABLE' || s.status === 'CONFIRMED');

  return (
    <div className="space-y-6">
      <div className="bg-wish-800 p-1 rounded-lg flex text-sm font-medium">
        <button 
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 rounded-md transition-all ${activeTab === 'create' ? 'bg-wish-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          Post New Shift
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 rounded-md transition-all ${activeTab === 'requests' ? 'bg-wish-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          Approvals {pendingRequests.length > 0 && <span className="ml-2 bg-red-500 text-white px-1.5 rounded-full text-xs">{pendingRequests.length}</span>}
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="bg-wish-900 border border-wish-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Create New Shift Opportunity</h2>
          <form onSubmit={handleCreateShift} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Role / Job Title</label>
              <input 
                type="text" 
                required
                value={jobName}
                onChange={e => setJobName(e.target.value)}
                className="w-full bg-wish-800 border border-wish-700 rounded p-2 text-white focus:border-wish-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Venue</label>
              <select 
                value={venueName}
                onChange={e => setVenueName(e.target.value)}
                className="w-full bg-wish-800 border border-wish-700 rounded p-2 text-white focus:border-wish-accent outline-none"
              >
                <option>Lucas Oil Stadium</option>
                <option>Gainbridge Fieldhouse</option>
                <option>TCU Amphitheater</option>
                <option>Indianapolis Motor Speedway</option>
                <option>Victory Field</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs text-gray-400 mb-1">Date</label>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-wish-800 border border-wish-700 rounded p-2 text-white text-sm focus:border-wish-accent outline-none"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs text-gray-400 mb-1">Start</label>
                <input 
                  type="time" 
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full bg-wish-800 border border-wish-700 rounded p-2 text-white text-sm focus:border-wish-accent outline-none"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs text-gray-400 mb-1">End</label>
                <input 
                  type="time" 
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full bg-wish-800 border border-wish-700 rounded p-2 text-white text-sm focus:border-wish-accent outline-none"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-wish-accent hover:bg-indigo-600 text-white font-bold py-3 rounded-lg mt-4"
            >
              {submitting ? 'Posting...' : 'Post Shift'}
            </button>
          </form>

          <div className="mt-8 border-t border-wish-800 pt-6">
            <h3 className="text-gray-400 text-sm font-semibold mb-3 uppercase">Recently Posted</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activeShifts.length === 0 ? <p className="text-gray-600 italic text-sm">No active shifts.</p> : 
                activeShifts.slice(-5).reverse().map(shift => (
                  <div key={shift.id} className="text-xs p-3 bg-wish-800 rounded border border-wish-700 flex justify-between">
                    <span className="text-gray-300">{shift.jobName} @ {shift.venueName}</span>
                    <span className={`px-2 rounded ${shift.status === 'CONFIRMED' ? 'text-green-400 bg-green-900/20' : 'text-blue-400 bg-blue-900/20'}`}>
                      {shift.status}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
           {pendingRequests.length === 0 ? (
             <div className="text-center py-12 bg-wish-900 border border-wish-800 rounded-xl">
               <p className="text-gray-500">No pending requests from workers.</p>
             </div>
           ) : (
             pendingRequests.map(shift => (
               <ShiftCard 
                 key={shift.id} 
                 shift={shift} 
                 actionType="APPROVE"
                 onAction={handleApprove}
               />
             ))
           )}
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;