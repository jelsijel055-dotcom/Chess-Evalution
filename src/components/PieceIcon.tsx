import React from 'react';
import { Piece, PieceColor, PieceType } from '../types/chess';
import { Shield, Sparkles } from 'lucide-react';

interface PieceIconProps {
  piece: Piece;
  skinId?: string;
  size?: number | string;
}

export const PieceIcon: React.FC<PieceIconProps> = ({
  piece,
  skinId = 'cyber_mecha',
  size = '100%',
}) => {
  const isWhite = piece.color === 'white';

  // Base fill & stroke depending on skin and color
  let fillGradient = isWhite
    ? 'url(#white-piece-grad)'
    : 'url(#black-piece-grad)';
  let strokeColor = isWhite ? '#38bdf8' : '#f43f5e';
  let glowColor = isWhite ? 'rgba(56, 189, 248, 0.4)' : 'rgba(244, 63, 94, 0.4)';

  if (skinId === 'imperial_mythic') {
    fillGradient = isWhite ? 'url(#imperial-white-grad)' : 'url(#imperial-black-grad)';
    strokeColor = isWhite ? '#fbbf24' : '#e11d48';
    glowColor = isWhite ? 'rgba(251, 191, 36, 0.5)' : 'rgba(225, 29, 72, 0.5)';
  } else if (skinId === 'astral_monarch') {
    fillGradient = isWhite ? 'url(#astral-white-grad)' : 'url(#astral-black-grad)';
    strokeColor = isWhite ? '#c084fc' : '#ec4899';
    glowColor = isWhite ? 'rgba(192, 132, 252, 0.6)' : 'rgba(236, 72, 153, 0.6)';
  }

  const renderSVGPath = (type: PieceType) => {
    switch (type) {
      case 'pawn':
        return (
          <path
            d="M 22 38 C 22 36 24 35 27 34 C 26 31 25 27 25 24 C 22 22 21 19 21 16 C 21 12 24 9 27.5 9 C 31 9 34 12 34 16 C 34 19 33 22 30 24 C 30 27 29 31 28 34 C 31 35 33 36 33 38 Z"
            fill={fillGradient}
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        );
      case 'knight':
        return (
          <path
            d="M 17 38 L 33 38 C 33 35 32 33 29 31 C 32 28 33 24 33 20 C 33 16 31 11 25 9 C 23 8 20 8 18 10 C 17 12 16 16 17 19 C 15 19 13 21 13 23 C 13 25 15 27 18 28 C 17 31 16 35 17 38 Z"
            fill={fillGradient}
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        );
      case 'bishop':
        return (
          <g>
            <path
              d="M 18 38 L 32 38 C 32 35 30 33 28 31 C 30 29 32 25 32 20 C 32 14 29 11 25 10 C 21 11 18 14 18 20 C 18 25 20 29 22 31 C 20 33 18 35 18 38 Z"
              fill={fillGradient}
              stroke={strokeColor}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="25" cy="8" r="2" fill={strokeColor} />
            <path d="M 21 18 L 29 18" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M 25 14 L 25 24" stroke={strokeColor} strokeWidth="1.5" />
          </g>
        );
      case 'rook':
        return (
          <g>
            <path
              d="M 16 38 L 34 38 L 33 31 C 32 31 31 30 30 27 L 30 18 L 33 18 L 33 12 L 29 12 L 29 15 L 26.5 15 L 26.5 12 L 23.5 12 L 23.5 15 L 21 15 L 21 12 L 17 12 L 17 18 L 20 18 L 20 27 C 19 30 18 31 17 31 Z"
              fill={fillGradient}
              stroke={strokeColor}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </g>
        );
      case 'queen':
        return (
          <g>
            <path
              d="M 15 38 L 35 38 C 34 33 32 31 30 28 L 33 18 L 28 22 L 25 13 L 22 22 L 17 18 L 20 28 C 18 31 16 33 15 38 Z"
              fill={fillGradient}
              stroke={strokeColor}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="17" cy="16" r="1.5" fill={strokeColor} />
            <circle cx="25" cy="11" r="1.8" fill={strokeColor} />
            <circle cx="33" cy="16" r="1.5" fill={strokeColor} />
          </g>
        );
      case 'king':
        return (
          <g>
            <path
              d="M 16 38 L 34 38 C 33 33 31 31 29 28 C 31 26 33 23 33 18 C 33 14 30 13 25 13 C 20 13 17 14 17 18 C 17 23 19 26 21 28 C 19 31 17 33 16 38 Z"
              fill={fillGradient}
              stroke={strokeColor}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Royal Cross */}
            <path d="M 25 6 L 25 12" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
            <path d="M 22 8 L 28 8" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 50 50"
        className={`w-full h-full transition-transform duration-150 ${
          piece.level > 1 ? 'evolved-glow' : ''
        }`}
        style={{
          filter: `drop-shadow(0 4px 6px ${glowColor})`,
        }}
      >
        <defs>
          {/* Cyber White */}
          <linearGradient id="white-piece-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          {/* Cyber Black */}
          <linearGradient id="black-piece-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="60%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
          {/* Imperial Gold */}
          <linearGradient id="imperial-white-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="imperial-black-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="50%" stopColor="#292524" />
            <stop offset="100%" stopColor="#0c0a09" />
          </linearGradient>
          {/* Astral Void */}
          <linearGradient id="astral-white-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <linearGradient id="astral-black-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b0764" />
            <stop offset="50%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>
        </defs>

        {renderSVGPath(piece.type)}
      </svg>

      {/* Evolution Level Indicator Badge */}
      {piece.level > 1 && (
        <div
          className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[9px] font-bold w-4 h-4 shadow-sm tabular-nums ${
            piece.level === 3
              ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 ring-1 ring-amber-300'
              : 'bg-gradient-to-r from-sky-400 to-cyan-500 text-slate-950 ring-1 ring-sky-300'
          }`}
          title={`Evolved Level ${piece.level}`}
        >
          {piece.level === 3 ? '★' : '✦'}
        </div>
      )}

      {/* Shield Protection Visual Aura */}
      {piece.shielded && (
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400 bg-cyan-400/20 animate-pulse pointer-events-none flex items-center justify-center">
          <Shield className="w-4 h-4 text-cyan-300 drop-shadow" />
        </div>
      )}

      {/* Stunned Visual Indicator */}
      {piece.stunned && (
        <div className="absolute inset-0 rounded-full border border-amber-400 bg-amber-400/30 flex items-center justify-center pointer-events-none">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      )}
    </div>
  );
};
