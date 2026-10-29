import React, { useState } from 'react';
import { soundManager } from '../utils/audio';
import { MessageSquare, Smile, Flame, Shield, Award, Sparkles, X } from 'lucide-react';

interface EmoteWheelProps {
  onSendEmote: (text: string) => void;
}

export const TACTICAL_EMOTES = [
  { id: 'e1', text: 'Taktik yang luar biasa! 🛡️', icon: 'Shield' },
  { id: 'e2', text: 'Serangan Balik Dimulai! 🔥', icon: 'Flame' },
  { id: 'e3', text: 'Skakmat di Depan Mata! 👑', icon: 'Award' },
  { id: 'e4', text: 'Bagus Sekali! (Good Game) 🤝', icon: 'Smile' },
  { id: 'e5', text: 'Ups, Salah Kalkulasi! 😅', icon: 'Smile' },
  { id: 'e6', text: 'Kekuatan Evolusi Sempurna! ⚡', icon: 'Sparkles' },
];

export const EmoteWheel: React.FC<EmoteWheelProps> = ({ onSendEmote }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (text: string) => {
    soundManager.playEmote();
    onSendEmote(text);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          soundManager.playClick();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
        title="Kirim Emote Taktis"
      >
        <MessageSquare className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">Emote</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-11 right-0 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2.5 z-40 space-y-1">
          <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-800 text-[11px] font-bold text-slate-400 px-1">
            <span>Pesan Emote Taktis</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {TACTICAL_EMOTES.map((e) => (
              <button
                key={e.id}
                onClick={() => handleSelect(e.text)}
                className="w-full text-left py-1.5 px-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 hover:text-amber-300 text-xs text-slate-200 transition-colors cursor-pointer truncate"
              >
                {e.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
