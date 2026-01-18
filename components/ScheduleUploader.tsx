import React, { useState, useRef } from 'react';
import { Shift } from '../types';
import { parseScheduleFromImage } from '../services/geminiService';

interface ScheduleUploaderProps {
  onImport: (shifts: Shift[]) => void;
  onClose: () => void;
}

const ScheduleUploader: React.FC<ScheduleUploaderProps> = ({ onImport, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const shifts = await parseScheduleFromImage(base64String);
        if (shifts.length === 0) {
          setError("No shifts found in that image. Try a clearer screenshot.");
        } else {
          onImport(shifts);
          onClose();
        }
      } catch (err) {
        setError("AI failed to read image. Ensure your API Key is valid and the image is clear.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* "Bottom Sheet" */}
      <div className="bg-wish-900 w-full max-w-xl rounded-t-[2.5rem] border-t border-wish-700 shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom duration-300">
        {/* Handle bar */}
        <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto my-4"></div>

        <div className="px-6 pb-14">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Sync Schedule</h2>
              <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">AI Screenshot Extraction</p>
            </div>
            <button onClick={onClose} className="p-2 bg-wish-800 rounded-full text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="min-h-[260px] flex flex-col justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-300">
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-wish-accent/10"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-wish-accent border-t-transparent animate-spin"></div>
                  <div className="absolute inset-4 rounded-full bg-wish-accent/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-wish-accent animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Scanning Schedule...</h3>
                <p className="text-wish-accent font-bold animate-pulse uppercase tracking-widest text-[10px]">Gemini AI Multimodal Vision Active</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3 animate-in shake-1 duration-300">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <p className="text-red-400 text-xs font-bold leading-relaxed">{error}</p>
                  </div>
                )}

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group border-2 border-dashed border-wish-700 hover:border-wish-accent rounded-[2.5rem] p-12 flex flex-col items-center justify-center bg-wish-800/20 hover:bg-wish-accent/5 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-wish-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="w-20 h-20 bg-wish-accent/10 rounded-3xl flex items-center justify-center mb-6 text-wish-accent group-hover:scale-110 group-hover:bg-wish-accent/20 transition-all duration-500">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-white font-extrabold text-xl mb-2 text-center">Upload Schedule Image</h3>
                  <p className="text-gray-500 text-sm text-center max-w-[240px] leading-relaxed mb-1">
                    Take a screenshot of your calendar or printed schedule.
                  </p>
                  <span className="text-wish-accent text-[10px] font-black uppercase tracking-[0.2em]">High Precision OCR</span>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                </div>

                <p className="mt-8 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest px-10">
                  Securely processed by Gemini AI. Your data stays in local storage.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleUploader;