import React from 'react';
import { SPECIAL_ABILITIES } from '../engine/evolutionAbilities';
import { PieceIcon } from './PieceIcon';
import { PieceType, Piece } from '../types/chess';
import { BookOpen, Sparkles, Zap, Shield, X, Award } from 'lucide-react';

interface CodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'id' | 'en';
}

export const CodexModal: React.FC<CodexModalProps> = ({
  isOpen,
  onClose,
  language = 'id',
}) => {
  if (!isOpen) return null;

  const piecesList: { type: PieceType; nameId: string; nameEn: string }[] = [
    { type: 'pawn', nameId: 'Bidak (Pawn)', nameEn: 'Pawn' },
    { type: 'knight', nameId: 'Ksatria (Knight)', nameEn: 'Knight' },
    { type: 'bishop', nameId: 'Peluncur (Bishop)', nameEn: 'Bishop' },
    { type: 'rook', nameId: 'Benteng (Rook)', nameEn: 'Rook' },
    { type: 'queen', nameId: 'Ratu (Queen)', nameEn: 'Queen' },
    { type: 'king', nameId: 'Raja (King)', nameEn: 'King' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">
                {language === 'id' ? 'Kodeks Catur Evolution' : 'Evolution Chess Codex'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'id'
                  ? 'Panduan lengkap kemampuan spesial dan sistem leveling bidak'
                  : 'Complete guide to special abilities and piece leveling'}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Leveling Mechanics Overview */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-800/40 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Sistem Evolusi & Level Bidak</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Setiap kali bidakmu berhasil memakan bidak lawan atau berhasil melakukan promosi, bidak tersebut mengalami <strong>Evolusi</strong> dari Tingkat 1 (Standard) hingga Tingkat 3 (Radiant). Bidak yang berevolusi memancarkan aura berpijar, mendapatkan pengurangan cooldown, dan memberi bonus +2 Energi SP!
            </p>
          </div>

          {/* List of Pieces & Their Abilities */}
          <div className="space-y-4">
            {piecesList.map((p) => {
              const abilities = Object.values(SPECIAL_ABILITIES).filter(
                (a) => a.pieceType === p.type
              );
              const previewPiece: Piece = {
                id: `preview_${p.type}`,
                type: p.type,
                color: 'white',
                level: 2,
              };

              return (
                <div
                  key={p.type}
                  className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1">
                      <PieceIcon piece={previewPiece} skinId="cyber_mecha" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">
                        {language === 'id' ? p.nameId : p.nameEn}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {abilities.length} Kemampuan Spesial Aktif
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {abilities.map((ability) => (
                      <div
                        key={ability.id}
                        className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">
                            {language === 'id' ? ability.nameIndo : ability.nameEng}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                            {ability.spCost} SP
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {language === 'id'
                            ? ability.descriptionIndo
                            : ability.descriptionEng}
                        </p>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Cooldown: {ability.cooldownTurns} putaran
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
