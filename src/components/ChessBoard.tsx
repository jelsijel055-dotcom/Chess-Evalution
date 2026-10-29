import React from 'react';
import { BoardState, Position, Piece, PieceColor, PieceType } from '../types/chess';
import { PieceIcon } from './PieceIcon';
import { BOARD_SKINS } from '../data/shopData';

interface ChessBoardProps {
  board: BoardState;
  selectedPos: Position | null;
  validMoves: Position[];
  abilityTargets: Position[];
  lastMove: { from: Position; to: Position } | null;
  kingInCheckPos: Position | null;
  boardSkinId: string;
  pieceSkinId: string;
  playerColor?: PieceColor;
  onSquareClick: (row: number, col: number) => void;
  pendingPromotion: { from: Position; to: Position } | null;
  onPromote: (choice: PieceType) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedPos,
  validMoves,
  abilityTargets,
  lastMove,
  kingInCheckPos,
  boardSkinId,
  pieceSkinId,
  playerColor = 'white',
  onSquareClick,
  pendingPromotion,
  onPromote,
}) => {
  const skin = BOARD_SKINS.find((s) => s.id === boardSkinId) || BOARD_SKINS[0];

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Check if position is in validMoves
  const isValidMove = (r: number, c: number) =>
    validMoves.some((m) => m.row === r && m.col === c);

  // Check if position is an ability target
  const isAbilityTarget = (r: number, c: number) =>
    abilityTargets.some((m) => m.row === r && m.col === c);

  // Check if position was part of the last move
  const isLastMove = (r: number, c: number) =>
    lastMove &&
    ((lastMove.from.row === r && lastMove.from.col === c) ||
      (lastMove.to.row === r && lastMove.to.col === c));

  // Check if King in check
  const isCheckedKing = (r: number, c: number) =>
    kingInCheckPos && kingInCheckPos.row === r && kingInCheckPos.col === c;

  return (
    <div className="relative select-none aspect-square w-full max-w-[540px] mx-auto p-2 sm:p-3 rounded-2xl bg-slate-900/90 shadow-2xl border border-slate-800">
      {/* Board Frame & Grid */}
      <div
        className="w-full h-full grid grid-cols-8 grid-rows-8 rounded-xl overflow-hidden border-2 shadow-inner"
        style={{ borderColor: skin.colors?.border || '#0284c7' }}
      >
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 8 }).map((_, c) => {
            const piece = board[r][c];
            const isLightSquare = (r + c) % 2 === 0;
            const isSelected = selectedPos?.row === r && selectedPos?.col === c;
            const canMoveTo = isValidMove(r, c);
            const canAbilityTo = isAbilityTarget(r, c);
            const hasRecentMove = isLastMove(r, c);
            const inCheck = isCheckedKing(r, c);

            // Base square background
            const baseBg = isLightSquare
              ? skin.colors?.light || '#1e293b'
              : skin.colors?.dark || '#0f172a';

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => onSquareClick(r, c)}
                className="relative flex items-center justify-center p-1 sm:p-2 cursor-pointer transition-colors duration-150 focus:outline-none"
                style={{
                  backgroundColor: baseBg,
                }}
              >
                {/* Last Move Overlay */}
                {hasRecentMove && (
                  <div className="absolute inset-0 bg-amber-400/25 pointer-events-none" />
                )}

                {/* Selected Square Glow */}
                {isSelected && (
                  <div
                    className="absolute inset-0 ring-2 ring-inset pointer-events-none z-10"
                    style={{
                      borderColor: skin.colors?.accent || '#06b6d4',
                      backgroundColor: `${skin.colors?.accent || '#06b6d4'}22`,
                    }}
                  />
                )}

                {/* King in Check Red Alert */}
                {inCheck && (
                  <div className="absolute inset-0 bg-red-600/40 ring-4 ring-red-500 animate-pulse pointer-events-none z-10" />
                )}

                {/* Valid Standard Move Indicators */}
                {canMoveTo && !piece && (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-cyan-400/80 shadow-md ring-2 ring-cyan-200/50 pointer-events-none z-10" />
                )}
                {canMoveTo && piece && (
                  <div className="absolute inset-1 rounded-full border-2 sm:border-3 border-rose-500 bg-rose-500/20 pointer-events-none z-10 animate-pulse" />
                )}

                {/* Special Ability Target Indicators */}
                {canAbilityTo && (
                  <div className="absolute inset-1.5 rounded-lg border-2 border-dashed border-amber-400 bg-amber-400/25 pointer-events-none z-10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  </div>
                )}

                {/* Render Chess Piece */}
                {piece && (
                  <div className="w-full h-full flex items-center justify-center relative z-20 hover:scale-105 active:scale-95 transition-transform duration-100">
                    <PieceIcon piece={piece} skinId={pieceSkinId} />
                  </div>
                )}

                {/* Coordinate Labels: File on row 7, Rank on col 0 */}
                {c === 0 && (
                  <span
                    className="absolute top-0.5 left-1 text-[9px] font-mono font-semibold opacity-60 pointer-events-none"
                    style={{ color: isLightSquare ? '#94a3b8' : '#cbd5e1' }}
                  >
                    {ranks[r]}
                  </span>
                )}
                {r === 7 && (
                  <span
                    className="absolute bottom-0.5 right-1 text-[9px] font-mono font-semibold opacity-60 pointer-events-none"
                    style={{ color: isLightSquare ? '#94a3b8' : '#cbd5e1' }}
                  >
                    {files[c]}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 z-30">
          <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Promosi Pion / Evolution
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Pilih wujud evolusi baru untuk pion yang menembus pertahanan:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {(['queen', 'rook', 'bishop', 'knight'] as PieceType[]).map((type) => {
                const dummyPiece: Piece = {
                  id: `promo_${type}`,
                  type,
                  color: playerColor,
                  level: 2,
                };
                return (
                  <button
                    key={type}
                    onClick={() => onPromote(type)}
                    className="flex flex-col items-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-400 transition-colors"
                  >
                    <div className="w-10 h-10 mb-1">
                      <PieceIcon piece={dummyPiece} skinId={pieceSkinId} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200 capitalize">
                      {type === 'queen'
                        ? 'Ratu'
                        : type === 'rook'
                        ? 'Benteng'
                        : type === 'bishop'
                        ? 'Gajah'
                        : 'Kuda'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
