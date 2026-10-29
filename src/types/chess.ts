export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
  level: number; // 1, 2, or 3 (evolved status)
  shielded?: boolean; // Protected against 1 capture
  stunned?: boolean; // Cannot move this turn
  cooldown?: number; // Turns until ability ready
}

export type BoardState = (Piece | null)[][];

export interface Position {
  row: number; // 0-7
  col: number; // 0-7
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece | null;
  promotion?: PieceType;
  isEnPassant?: boolean;
  isCastling?: 'kingside' | 'queenside';
  isAbility?: string; // name of ability used
  algebraic?: string;
}

export type GameMode = 'evolution' | 'classic' | 'ai' | 'pass_and_play' | 'online_match';

export type AIDifficulty = 'easy' | 'medium' | 'master' | 'grandmaster';

export interface AIPersonality {
  id: AIDifficulty;
  name: string;
  title: string;
  rating: number;
  avatar: string;
  description: string;
  quote: string;
  depth: number;
}

export interface SpecialAbility {
  id: string;
  pieceType: PieceType;
  nameIndo: string;
  nameEng: string;
  spCost: number;
  cooldownTurns: number;
  icon: string;
  descriptionIndo: string;
  descriptionEng: string;
  targetType: 'move' | 'adjacent_enemy' | 'friendly_pawn' | 'self' | 'any_empty';
}

export interface PlayerStats {
  gold: number;
  gems: number;
  rankPoints: number;
  level: number;
  xp: number;
  equippedBoardSkin: string;
  equippedPieceSkin: string;
  ownedSkins: string[];
  isVipPass: boolean;
  passTier: number;
  passXp: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  language: 'id' | 'en';
}

export interface Quest {
  id: string;
  titleIndo: string;
  titleEng: string;
  descriptionIndo: string;
  descriptionEng: string;
  rewardGold: number;
  rewardGems: number;
  current: number;
  max: number;
  completed: boolean;
  claimed: boolean;
}

export interface SkinItem {
  id: string;
  name: string;
  type: 'board' | 'piece';
  priceGold?: number;
  priceGems?: number;
  isPremium?: boolean;
  previewUrl?: string;
  colors?: {
    light: string;
    dark: string;
    accent: string;
    border: string;
  };
  description: string;
}
