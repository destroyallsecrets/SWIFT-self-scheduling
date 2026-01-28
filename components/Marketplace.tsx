import React, { useState, useEffect } from 'react';
import { Shift } from '../types';
import { MockBackend } from '../services/mockBackend';
import ShiftCard from './ShiftCard';

interface MarketplaceProps {
  onNotify: (msg: string) => void;
  taxRate: number;
  userId: string;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onNotify, taxRate, userId }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadShifts = async () => {
    setLoading(true);
    const data = await MockBackend.getAvailableShifts();
    setShifts(data.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const handleRequest = async (shift: Shift) => {
    setProcessingId(shift.id);
    try {
      await MockBackend.claimShift(shift.id, userId);
      onNotify('Shift Claimed! Waiting for approval.');
      loadShifts();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && shifts.length === 0) {
    return <div className="text-center text-gray-500 py-10 font-bold uppercase tracking-widest text-xs animate-pulse">Checking Assignment Board...</div>;
  }

  return (
    <div className="space-y-4 w-full pb-10">
      <div className="bg-gradient-to-r from-wish-800 to-wish-900 p-6 rounded-[2rem] border border-wish-700 mb-6">
        <h2 className="text-xl font-black text-white mb-1">Self-Scheduling</h2>
        <p className="text-xs text-gray-400 font-medium">Claim open security assignments at CSC venues.</p>
      </div>

      {shifts.length === 0 ? (
        <div className="text-center py-20 px-4 border-2 border-dashed border-wish-800 rounded-[3rem]">
          <div className="text-4xl mb-4">👮</div>
          <h3 className="text-lg font-black text-white mb-2">Fully Staffed</h3>
          <p className="text-gray-500 text-sm">All current security details are currently filled.</p>
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
              taxRate={taxRate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;