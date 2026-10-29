import React from 'react';
import { PieceColor } from '../types/chess';
import { soundManager } from '../utils/audio';
import { Trophy, RotateCcw, Award, Coins, Flame, X } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  winner: PieceColor | 'draw' | null;
  reason: 'checkmate' | 'stalemate' | 'resign' | 'timeout';
  totalMoves: number;
  whiteCapturesCount: number;
  blackCapturesCount: number;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  winner,
  reason,
  totalMoves,
  whiteCapturesCount,
  blackCapturesCount,
  onPlayAgain,
  onClose,
}) => {
  if (!isOpen) return null;

  const isDraw = winner === 'draw';
  const winnerTitle = isDraw
    ? 'Hasil Imbang (Draw)'
    : winner === 'white'
    ? 'Kemenangan Pasukan Putih!'
    : 'Kemenangan Pasukan Hitam!';

  const reasonDesc =
    reason === 'checkmate'
      ? 'Skakmat! Raja musuh tidak memiliki petak pelarian lagi.'
      : reason === 'stalemate'
      ? 'Remis (Stalemate)! Tidak ada langkah legal yang dapat dijalankan.'
      : reason === 'resign'
      ? 'Lawan menyerah dan mengakui keunggulan taktikmu.'
      : 'Waktu habis!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-center p-6 sm:p-8 space-y-5 animate-scale-up">
        {/* Trophy / Result Icon */}
        <div
          className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border shadow-xl ${
            isDraw
              ? 'bg-slate-800 border-slate-700 text-slate-300'
              : 'bg-amber-500/20 border-amber-400/50 text-amber-400'
          }`}
        >
          <Trophy className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display">
            {winnerTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {reasonDesc}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
              Total Langkah
            </span>
            <span className="text-base font-bold font-mono text-slate-200">
              {totalMoves}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
              Hadiah Emas
            </span>
            <span className="text-base font-bold font-mono text-amber-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> +150
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
              Pass XP
            </span>
            <span className="text-base font-bold font-mono text-cyan-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> +65
            </span>
          </div>
        </div>

        {/* Play Again Action Button */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Main Lagi
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Kembali ke Papan
          </button>
        </div>
      </div>
    </div>
  );
};
