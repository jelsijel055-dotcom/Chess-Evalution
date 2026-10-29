import React from 'react';
import { Piece, Position, SpecialAbility } from '../types/chess';
import { getAbilitiesForPiece } from '../engine/evolutionAbilities';
import {
  Zap,
  Shield,
  Feather,
  Sparkles,
  RefreshCw,
  Crosshair,
  Flame,
  ShieldAlert,
  Eye,
  Orbit,
  Crown,
  Volume2,
} from 'lucide-react';

interface AbilityPanelProps {
  selectedPiece: Piece | null;
  selectedPos: Position | null;
  currentSP: number;
  maxSP?: number;
  activeAbilityId: string | null;
  isPlayerTurn: boolean;
  language?: 'id' | 'en';
  onSelectAbility: (ability: SpecialAbility) => void;
  onCancelAbility: () => void;
}

export const AbilityPanel: React.FC<AbilityPanelProps> = ({
  selectedPiece,
  currentSP,
  maxSP = 10,
  activeAbilityId,
  isPlayerTurn,
  language = 'id',
  onSelectAbility,
  onCancelAbility,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-cyan-400" />;
      case 'Feather':
        return <Feather className="w-4 h-4 text-sky-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-yellow-300" />;
      case 'RefreshCw':
        return <RefreshCw className="w-4 h-4 text-emerald-400" />;
      case 'Crosshair':
        return <Crosshair className="w-4 h-4 text-rose-400" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4 text-blue-400" />;
      case 'Eye':
        return <Eye className="w-4 h-4 text-purple-400" />;
      case 'Orbit':
        return <Orbit className="w-4 h-4 text-pink-400" />;
      case 'Crown':
        return <Crown className="w-4 h-4 text-amber-300" />;
      case 'Volume2':
        return <Volume2 className="w-4 h-4 text-teal-400" />;
      default:
        return <Zap className="w-4 h-4 text-amber-400" />;
    }
  };

  const abilities = selectedPiece ? getAbilitiesForPiece(selectedPiece) : [];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl">
      {/* SP Energy Meter Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {language === 'id' ? 'Energi Skill (SP)' : 'Skill Points (SP)'}
            </div>
            <div className="text-sm font-bold font-mono text-amber-400 tabular-nums">
              {currentSP} <span className="text-xs text-slate-500 font-normal">/ {maxSP}</span>
            </div>
          </div>
        </div>

        {/* SP Progress Bar */}
        <div className="w-32 sm:w-44 h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-300"
            style={{ width: `${Math.min(100, (currentSP / maxSP) * 100)}%` }}
          />
        </div>
      </div>

      {/* Selected Piece Info & Ability List */}
      {selectedPiece ? (
        <div>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200 capitalize">
                {selectedPiece.type === 'pawn'
                  ? 'Bidak Pion'
                  : selectedPiece.type === 'knight'
                  ? 'Ksatria Kuda'
                  : selectedPiece.type === 'bishop'
                  ? 'Peluncur Gajah'
                  : selectedPiece.type === 'rook'
                  ? 'Benteng'
                  : selectedPiece.type === 'queen'
                  ? 'Ratu'
                  : 'Raja'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                Tingkat {selectedPiece.level}
              </span>
            </div>

            {activeAbilityId && (
              <button
                onClick={onCancelAbility}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
              >
                {language === 'id' ? 'Batal Gunakan Skill' : 'Cancel Skill'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {abilities.map((ability) => {
              const isOnCooldown =
                selectedPiece.cooldown && selectedPiece.cooldown > 0;
              const hasEnoughSP = currentSP >= ability.spCost;
              const isSelected = activeAbilityId === ability.id;
              const canActivate =
                isPlayerTurn && !isOnCooldown && hasEnoughSP && !selectedPiece.stunned;

              return (
                <button
                  key={ability.id}
                  disabled={!canActivate}
                  onClick={() =>
                    isSelected ? onCancelAbility() : onSelectAbility(ability)
                  }
                  className={`text-left p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                      : canActivate
                      ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-slate-600'
                      : 'bg-slate-900/60 border-slate-800/60 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-100">
                      {getIcon(ability.icon)}
                      <span className="truncate">
                        {language === 'id' ? ability.nameIndo : ability.nameEng}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {ability.spCost} SP
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {language === 'id' ? ability.nameIndo : ability.nameEng}:{' '}
                    {language === 'id'
                      ? ability.descriptionIndo
                      : ability.descriptionEng}
                  </p>

                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    {isOnCooldown ? (
                      <span className="text-rose-400 font-mono">
                        Cooldown: {selectedPiece.cooldown} putaran
                      </span>
                    ) : !hasEnoughSP ? (
                      <span className="text-amber-500/80">Butuh {ability.spCost} SP</span>
                    ) : (
                      <span className="text-cyan-400 font-medium">
                        {isSelected ? 'Klik target di papan' : 'Siap Digunakan'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-3 text-center text-xs text-slate-500">
          {language === 'id'
            ? 'Pilih salah satu bidak di papan untuk melihat kemampuan spesial dan tingkat evolusinya.'
            : 'Select any piece on the board to view its special abilities and evolution tier.'}
        </div>
      )}
    </div>
  );
};
