import React, { useState } from 'react';
import { soundManager } from '../utils/audio';
import { Lightbulb, Trophy, CheckCircle, Coins, Gem, ArrowRight, X } from 'lucide-react';

interface PuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSolvePuzzle: (rewardGold: number, rewardGems: number) => void;
}

interface PuzzleItem {
  id: string;
  title: string;
  piece: string;
  description: string;
  solutionHint: string;
  rewardGold: number;
  rewardGems: number;
}

const PUZZLES: PuzzleItem[] = [
  {
    id: 'p1',
    title: 'Teka-Teki #1: Lompatan Pegasus Skakmat',
    piece: 'Ksatria (Knight)',
    description: 'Raja hitam terjepit di sudut h8 di balik benteng pertahanan. Gunakan Lompatan Pegasus Ksatria untuk melompati rintangan dan menyergap Raja langsung!',
    solutionHint: 'Aktifkan Pegasus Leap pada Ksatria putih di f3 menuju petak h6!',
    rewardGold: 300,
    rewardGems: 15,
  },
  {
    id: 'p2',
    title: 'Teka-Teki #2: Benturan Meteor Pembobol',
    piece: 'Benteng (Rook)',
    description: 'Peluncur hitam menjaga diagonal penting menuju Raja. Tabrak dan dorong peluncur lawan ke tepi papan dengan Tabrakan Meteor agar pertahanannya hancur!',
    solutionHint: 'Aktifkan Meteor Charge pada Benteng putih di e1!',
    rewardGold: 400,
    rewardGems: 25,
  },
  {
    id: 'p3',
    title: 'Teka-Teki #3: Sinar Suci Tanpa Gerak',
    piece: 'Peluncur (Bishop)',
    description: 'Pion hitam melindungi sayap menteri lawan. Tembakkan Sinar Suci Diagonal dari jarak aman untuk melenyapkan pion tersebut tanpa meninggalkan posisi penjagaanmu!',
    solutionHint: 'Gunakan Diagonal Beam Peluncur putih di c1 menuju c7!',
    rewardGold: 500,
    rewardGems: 30,
  },
];

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  isOpen,
  onClose,
  onSolvePuzzle,
}) => {
  const [solvedList, setSolvedList] = useState<string[]>([]);
  const [activePuzzleId, setActivePuzzleId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateSolve = (p: PuzzleItem) => {
    if (solvedList.includes(p.id)) return;
    soundManager.playVictory();
    setSolvedList((prev) => [...prev, p.id]);
    onSolvePuzzle(p.rewardGold, p.rewardGems);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">
                Tantangan Teka-Teki Taktis
              </h2>
              <p className="text-xs text-slate-400">
                Pecahkan puzzle skakmat berbasis kemampuan spesial untuk hadiah instan
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

        {/* Puzzle List */}
        <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto max-h-[70vh]">
          {PUZZLES.map((puzzle) => {
            const isSolved = solvedList.includes(puzzle.id);
            const isExpanded = activePuzzleId === puzzle.id;

            return (
              <div
                key={puzzle.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isSolved
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      Fokus: {puzzle.piece}
                    </span>
                    <h3 className="font-bold text-sm text-slate-100 mt-1.5">
                      {puzzle.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-bold font-mono text-amber-400">
                      <Coins className="w-3.5 h-3.5" /> +{puzzle.rewardGold}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold font-mono text-purple-400">
                      <Gem className="w-3.5 h-3.5" /> +{puzzle.rewardGems}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {puzzle.description}
                </p>

                {isExpanded && (
                  <div className="p-3 mb-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs text-amber-300 font-mono">
                    💡 Petunjuk Taktis: {puzzle.solutionHint}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={() =>
                      setActivePuzzleId(isExpanded ? null : puzzle.id)
                    }
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
                  >
                    {isExpanded ? 'Sembunyikan Petunjuk' : 'Lihat Solusi Taktis'}
                  </button>

                  {isSolved ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Berhasil Dipecahkan!
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSimulateSolve(puzzle)}
                      className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95"
                    >
                      Selesaikan Puzzle
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
