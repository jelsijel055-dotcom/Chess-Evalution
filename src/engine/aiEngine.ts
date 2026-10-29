import {
  BoardState,
  Position,
  Piece,
  PieceColor,
  AIDifficulty,
  AIPersonality,
} from '../types/chess';
import {
  getLegalMoves,
  applyMove,
  isKingInCheck,
  hasAnyLegalMoves,
  CastlingRights,
  cloneBoard,
} from './chessEngine';
import { SPECIAL_ABILITIES, getAbilityTargetPositions } from './evolutionAbilities';

export const AI_PERSONALITIES: Record<AIDifficulty, AIPersonality> = {
  easy: {
    id: 'easy',
    name: 'Rookie Bintang',
    title: 'Pelajar Catur',
    rating: 800,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rookie800',
    description: 'Bermain santai, cocok untuk pemula yang baru belajar catur dan kemampuan spesial.',
    quote: 'Mari kita bertanding santai dan bersenang-senang!',
    depth: 1,
  },
  medium: {
    id: 'medium',
    name: 'Taktisi Neo',
    title: 'Kapten Taktik',
    rating: 1400,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Tactician1400',
    description: 'Memahami dasar pertahanan dan serangan cepat. Rajin memanfaatkan kemampuan spesial.',
    quote: 'Setiap petak adalah kesempatan untuk berkembang.',
    depth: 2,
  },
  master: {
    id: 'master',
    name: 'GM Cassandra',
    title: 'Grandmaster Senior',
    rating: 2000,
    avatar: '/src/assets/images/avatar_grandmaster_1793271847778.jpg',
    description: 'Kalkulasi mendalam, ahli kontrol tengah papan dan pertahanan kokoh.',
    quote: 'Keberuntungan ada pada persiapan yang matang.',
    depth: 3,
  },
  grandmaster: {
    id: 'grandmaster',
    name: 'Overlord Mecha-X',
    title: 'Entitas AI Tertinggi',
    rating: 2600,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=OverlordMecha',
    description: 'Master strategi evolusi, mengeksploitasi combo skill dan checkmate tanpa ampun.',
    quote: 'Kekalahanmu telah terhitung dalam 100 kemungkinan.',
    depth: 3,
  },
};

const PIECE_VALUES: Record<string, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

// Piece-Square Position tables for white (mirrored for black)
const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

function evaluateBoard(board: BoardState): number {
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      let val = PIECE_VALUES[piece.type] || 0;
      val += (piece.level - 1) * 25; // Evolved bonus

      if (piece.shielded) val += 40;

      // Position bonus
      if (piece.type === 'pawn') {
        const tableR = piece.color === 'white' ? r : 7 - r;
        val += PAWN_TABLE[tableR][c];
      } else if (piece.type === 'knight') {
        const tableR = piece.color === 'white' ? r : 7 - r;
        val += KNIGHT_TABLE[tableR][c];
      }

      if (piece.color === 'white') {
        score += val;
      } else {
        score -= val;
      }
    }
  }

  return score;
}

export interface BestAIMove {
  from: Position;
  to: Position;
  abilityId?: string;
}

export function findBestAIMove(
  board: BoardState,
  aiColor: PieceColor,
  enPassantTarget: Position | null,
  castlingRights: CastlingRights,
  difficulty: AIDifficulty,
  aiSP: number = 3,
  isEvolutionMode: boolean = true
): BestAIMove | null {
  const personality = AI_PERSONALITIES[difficulty];
  const allMoves: { from: Position; to: Position; score: number; abilityId?: string }[] = [];

  // 1. Check if an evolution ability is favorable
  if (isEvolutionMode && aiSP >= 3 && Math.random() < (difficulty === 'easy' ? 0.3 : 0.75)) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === aiColor && (!piece.cooldown || piece.cooldown <= 0)) {
          // Check Knight Pegasus Leap or Rook Charge
          if (piece.type === 'knight' && aiSP >= 3) {
            const targets = getAbilityTargetPositions(
              SPECIAL_ABILITIES.pegasus_leap,
              { row: r, col: c },
              board,
              piece
            );
            if (targets.length > 0) {
              // Pick an advanced central square
              const sorted = targets.sort((a, b) => {
                const distA = Math.abs(a.row - (aiColor === 'black' ? 6 : 1));
                const distB = Math.abs(b.row - (aiColor === 'black' ? 6 : 1));
                return distA - distB;
              });
              if (sorted[0]) {
                allMoves.push({
                  from: { row: r, col: c },
                  to: sorted[0],
                  score: 450,
                  abilityId: 'pegasus_leap',
                });
              }
            }
          } else if (piece.type === 'pawn' && aiSP >= 2) {
            const targets = getAbilityTargetPositions(
              SPECIAL_ABILITIES.berserk_rush,
              { row: r, col: c },
              board,
              piece
            );
            if (targets.length > 0) {
              allMoves.push({
                from: { row: r, col: c },
                to: targets[0],
                score: 200,
                abilityId: 'berserk_rush',
              });
            }
          }
        }
      }
    }
  }

  // 2. Standard Legal Moves
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === aiColor) {
        const legal = getLegalMoves(board, { row: r, col: c }, enPassantTarget, castlingRights);
        for (const to of legal) {
          const targetPiece = board[to.row][to.col];
          let moveScore = 0;

          if (targetPiece) {
            moveScore = (PIECE_VALUES[targetPiece.type] || 0) * 10 - (PIECE_VALUES[piece.type] || 0);
          }

          // Advance towards center
          const centerDist = Math.abs(to.row - 3.5) + Math.abs(to.col - 3.5);
          moveScore -= centerDist * 3;

          // Check simulated result
          const sim = applyMove(board, { row: r, col: c }, to, enPassantTarget, castlingRights);
          const oppColor: PieceColor = aiColor === 'white' ? 'black' : 'white';
          if (!hasAnyLegalMoves(sim.newBoard, oppColor, sim.newEnPassant, sim.newCastlingRights)) {
            if (isKingInCheck(sim.newBoard, oppColor)) {
              moveScore += 100000; // Checkmate winning move!
            }
          } else if (isKingInCheck(sim.newBoard, oppColor)) {
            moveScore += 50; // Check
          }

          const boardVal = evaluateBoard(sim.newBoard);
          const finalScore = aiColor === 'black' ? -boardVal + moveScore : boardVal + moveScore;

          allMoves.push({
            from: { row: r, col: c },
            to,
            score: finalScore,
          });
        }
      }
    }
  }

  if (allMoves.length === 0) return null;

  // Sort by score descending
  allMoves.sort((a, b) => b.score - a.score);

  if (personality.id === 'easy') {
    // Easy AI chooses from top 5 randomly
    const sample = allMoves.slice(0, Math.min(5, allMoves.length));
    return sample[Math.floor(Math.random() * sample.length)];
  } else if (personality.id === 'medium') {
    // Medium AI chooses from top 2
    const sample = allMoves.slice(0, Math.min(2, allMoves.length));
    return sample[Math.floor(Math.random() * sample.length)];
  }

  // Master & Grandmaster pick absolute top
  return allMoves[0];
}
