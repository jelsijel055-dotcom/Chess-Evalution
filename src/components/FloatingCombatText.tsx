import React from 'react';

export interface CombatAlert {
  id: string;
  text: string;
  type: 'ability' | 'capture' | 'evolution' | 'shield' | 'awakening' | 'check';
}

interface FloatingCombatTextProps {
  alerts: CombatAlert[];
}

export const FloatingCombatText: React.FC<FloatingCombatTextProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-30 overflow-hidden">
      {alerts.map((alert) => {
        let badgeStyle =
          'bg-cyan-500/90 text-slate-950 border-cyan-300 ring-4 ring-cyan-500/30';

        if (alert.type === 'awakening') {
          badgeStyle =
            'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border-amber-200 ring-8 ring-amber-400/50 scale-110';
        } else if (alert.type === 'evolution') {
          badgeStyle =
            'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-pink-300 ring-4 ring-purple-500/40';
        } else if (alert.type === 'shield') {
          badgeStyle =
            'bg-sky-500 text-slate-950 border-sky-300 ring-4 ring-sky-500/40';
        } else if (alert.type === 'check') {
          badgeStyle =
            'bg-red-600 text-white border-red-300 ring-6 ring-red-500/50';
        } else if (alert.type === 'capture') {
          badgeStyle =
            'bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-500/40';
        }

        return (
          <div
            key={alert.id}
            className={`my-1 py-1.5 px-4 rounded-2xl font-black font-display text-sm tracking-wide shadow-2xl border transition-all duration-300 animate-bounce ${badgeStyle}`}
          >
            {alert.text}
          </div>
        );
      })}
    </div>
  );
};
