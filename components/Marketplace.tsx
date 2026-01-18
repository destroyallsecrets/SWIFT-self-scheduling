import React, { useState, useEffect } from 'react';
import { Shift } from '../types';
import { MockBackend } from '../services/mockBackend';
import ShiftCard from './ShiftCard';

interface MarketplaceProps {
  onNotify: (msg: string) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onNotify }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadShifts = async () => {
    setLoading(true);
    const data = await MockBackend.getAvailableShifts();
    // Sort by date soonest first
    setShifts(data.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const handleRequest = async (shift: Shift) => {
    setProcessingId(shift.id);
    try {
      await MockBackend.requestShift(shift.id);
      onNotify('Shift Requested! Waiting for employer approval.');
      loadShifts(); // Refresh list to remove the requested item or change its status
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && shifts.length === 0) {
    return <div className="text-center text-gray-500 py-10">Loading opportunities...</div>;
  }

  return (
    <div className="space-y-4 w-full pb-10">
      <div className="bg-gradient-to-r from-wish-800 to-wish-900 p-4 rounded-xl border border-wish-700 mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Find Work</h2>
        <p className="text-sm text-gray-400">Browse and request upcoming shifts at venues near you.</p>
      </div>

      {shifts.length === 0 ? (
        <div className="text-center py-12 px-4 border-2 border-dashed border-wish-800 rounded-2xl">
          <div className="text-4xl mb-4 grayscale">🏟️</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Open Shifts</h3>
          <p className="text-gray-400">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shifts.map(shift => (
            <ShiftCard 
              key={shift.id} 
              shift={shift} 
              actionType="REQUEST"
              isLoading={processingId === shift.id}
              onAction={handleRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;