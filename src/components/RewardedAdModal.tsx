import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';
import { Sparkles, Coins, Gem, Award, CheckCircle, Play, X } from 'lucide-react';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (gold: number, gems: number, xp: number) => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [adState, setAdState] = useState<'watching' | 'spinning' | 'rewarded'>('watching');
  const [countdown, setCountdown] = useState(5);
  const [wonPrize, setWonPrize] = useState<{ gold: number; gems: number; xp: number } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setAdState('watching');
      setCountdown(5);
      setWonPrize(null);
      return;
    }

    // 5-second ad timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartSpin = () => {
    soundManager.playClick();
    setAdState('spinning');

    // Simulate wheel spin
    setTimeout(() => {
      const prizes = [
        { gold: 250, gems: 10, xp: 50 },
        { gold: 400, gems: 20, xp: 75 },
        { gold: 600, gems: 35, xp: 120 },
        { gold: 300, gems: 15, xp: 60 },
      ];
      const selected = prizes[Math.floor(Math.random() * prizes.length)];
      setWonPrize(selected);
      setAdState('rewarded');
      soundManager.playVictory();
    }, 1800);
  };

  const handleCollect = () => {
    if (wonPrize) {
      soundManager.playCoinDing();
      onRewardClaimed(wonPrize.gold, wonPrize.gems, wonPrize.xp);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-center relative">
        {/* Top bar */}
        <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Unity Ads Network · Rewarded
            </span>
          </div>
          {countdown === 0 && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {adState === 'watching' && (
          <div className="p-6 space-y-4">
            {/* Simulated Game Video Ad Frame */}
            <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 border border-cyan-800/50 flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent animate-pulse" />
              <img
                src="/src/assets/images/catur_hero_banner_1793271847176.jpg"
                alt="Ad banner"
                className="absolute inset-0 w-full h-full object-cover opacity-35"
              />
              <div className="relative z-10 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto shadow-lg">
                  <Play className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
                <h3 className="font-bold text-slate-100 text-sm font-display">
                  Catur Evolution: Mobile Alpha
                </h3>
                <p className="text-[11px] text-slate-300 max-w-xs">
                  Kuasai strategi catur klasik dengan jurus spesial epik!
                </p>
              </div>

              {/* Countdown overlay */}
              <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-mono font-bold text-amber-400 border border-slate-700">
                {countdown > 0 ? `Hadiah dalam ${countdown} dtk` : 'Hadiah Siap!'}
              </div>
            </div>

            {countdown > 0 ? (
              <p className="text-xs text-slate-400">
                Tonton hingga selesai untuk memutar Roda Keberuntungan secara gratis.
              </p>
            ) : (
              <button
                onClick={handleStartSpin}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" /> Putar Roda Hadiah!
              </button>
            )}
          </div>
        )}

        {adState === 'spinning' && (
          <div className="p-8 space-y-4">
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-amber-400 border-t-transparent mx-auto animate-spin flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100 font-display">
              Memutar Roda Keberuntungan...
            </h3>
            <p className="text-xs text-slate-400">
              Menghitung multiplier hadiah koin dan permata!
            </p>
          </div>
        )}

        {adState === 'rewarded' && wonPrize && (
          <div className="p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100 font-display">
                Hadiah Berhasil Didapatkan!
              </h3>
              <p className="text-xs text-slate-400">
                Terima kasih telah menonton iklan opsional.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex flex-col items-center">
                <Coins className="w-5 h-5 text-amber-400 mb-1" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  +{wonPrize.gold}
                </span>
                <span className="text-[10px] text-slate-500">Koin</span>
              </div>
              <div className="flex flex-col items-center">
                <Gem className="w-5 h-5 text-purple-400 mb-1" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  +{wonPrize.gems}
                </span>
                <span className="text-[10px] text-slate-500">Permata</span>
              </div>
              <div className="flex flex-col items-center">
                <Award className="w-5 h-5 text-cyan-400 mb-1" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  +{wonPrize.xp}
                </span>
                <span className="text-[10px] text-slate-500">Pass XP</span>
              </div>
            </div>

            <button
              onClick={handleCollect}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg cursor-pointer transition-transform active:scale-95"
            >
              Klaim Hadiah ke Dompet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
