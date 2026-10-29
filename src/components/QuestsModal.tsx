import React from 'react';
import { Quest, PlayerStats } from '../types/chess';
import { soundManager } from '../utils/audio';
import { Check, Coins, Gem, Sparkles, X, Target } from 'lucide-react';

interface QuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  onClaimQuest: (questId: string) => void;
  stats: PlayerStats;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({
  isOpen,
  onClose,
  quests,
  onClaimQuest,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">
                Misi & Tugas Harian
              </h2>
              <p className="text-xs text-slate-400">
                Selesaikan misi taktis untuk mengumpulkan Koin Emas & Permata
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quest List */}
        <div className="p-4 sm:p-6 space-y-3">
          {quests.map((q) => {
            const isReady = q.current >= q.max && !q.claimed;

            return (
              <div
                key={q.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  q.claimed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : isReady
                    ? 'bg-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-slate-800/60 border-slate-700/70'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">
                      {q.titleIndo}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {q.descriptionIndo}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400 font-mono">
                      <Coins className="w-3.5 h-3.5" /> +{q.rewardGold}
                    </span>
                    {q.rewardGems > 0 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-purple-400 font-mono">
                        <Gem className="w-3.5 h-3.5" /> +{q.rewardGems}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar & Claim button */}
                <div className="flex items-center justify-between gap-4 mt-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>Progres</span>
                      <span>
                        {Math.min(q.current, q.max)} / {q.max}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (q.current / q.max) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {q.claimed ? (
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" /> Selesai
                    </span>
                  ) : (
                    <button
                      disabled={!isReady}
                      onClick={() => {
                        soundManager.playCoinDing();
                        onClaimQuest(q.id);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                        isReady
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
                      }`}
                    >
                      {isReady ? 'Klaim Hadiah' : 'Belum Selesai'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
