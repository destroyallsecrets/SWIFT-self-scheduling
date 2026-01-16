import React, { useState, useRef } from 'react';
import { Shift } from '../types';
import { parseScheduleFromImage, parseScheduleFromText } from '../services/geminiService';

interface ScheduleUploaderProps {
  onImport: (shifts: Shift[]) => void;
  onClose: () => void;
}

const ScheduleUploader: React.FC<ScheduleUploaderProps> = ({ onImport, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ocr' | 'text'>('ocr');
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
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
        onImport(shifts);
        onClose();
      } catch (err) {
        setError("AI failed to read image. Use Smart Paste.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const shifts = await parseScheduleFromText(textInput);
      onImport(shifts);
      onClose();
    } catch (err) {
      setError("Text parsing failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* "Bottom Sheet" */}
      <div className="bg-wish-900 w-full max-w-xl rounded-t-[2.5rem] border-t border-wish-700 shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom duration-300">
        {/* Handle bar */}
        <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto my-4"></div>

        <div className="px-6 pb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-white">Sync Schedule</h2>
            <button onClick={onClose} className="p-2 bg-wish-800 rounded-full text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex bg-wish-800 p-1 rounded-2xl mb-6">
            <button 
              onClick={() => setActiveTab('ocr')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'ocr' ? 'bg-wish-accent text-white' : 'text-gray-400'}`}
            >
              📸 SCREENSHOT
            </button>
            <button 
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'text' ? 'bg-wish-accent text-white' : 'text-gray-400'}`}
            >
              📋 SMART PASTE
            </button>
          </div>

          <div className="min-h-[220px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-wish-accent/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-wish-accent border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-6 text-wish-accent font-bold animate-pulse uppercase tracking-widest text-xs">AI Processing...</p>
              </div>
            ) : (
              <>
                {error && <p className="text-red-400 text-xs font-bold mb-4 text-center">{error}</p>}

                {activeTab === 'ocr' ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-wish-700 rounded-3xl p-10 flex flex-col items-center justify-center hover:bg-wish-800 active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-14 h-14 bg-wish-accent/10 rounded-full flex items-center justify-center mb-4 text-wish-accent">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-white font-bold text-sm">Upload Screenshot</p>
                    <p className="text-gray-500 text-[10px] mt-1 font-medium">JPG or PNG</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      className="w-full h-32 bg-wish-800 text-white rounded-2xl p-4 text-sm border border-wish-700 focus:border-wish-accent outline-none resize-none font-medium placeholder:text-gray-600"
                      placeholder="Paste text like: '10/24 Lucas Oil Stadium 5pm-10pm Server'"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />
                    <button 
                      onClick={handleTextSubmit}
                      disabled={!textInput.trim()}
                      className="w-full bg-wish-accent hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      SYNC TEXT
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleUploader;