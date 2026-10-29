import { SpecialAbility, PieceType, BoardState, Position, Piece } from '../types/chess';

export const SPECIAL_ABILITIES: Record<string, SpecialAbility> = {
  // Pawn
  berserk_rush: {
    id: 'berserk_rush',
    pieceType: 'pawn',
    nameIndo: 'Dorongan Berserk',
    nameEng: 'Berserk Rush',
    spCost: 2,
    cooldownTurns: 2,
    icon: 'Zap',
    descriptionIndo: 'Pion dapat melompat maju 2 petak sekaligus jika jalur di depannya kosong.',
    descriptionEng: 'Pawn dashes forward 2 squares if the path ahead is clear.',
    targetType: 'move',
  },
  vanguard_shield: {
    id: 'vanguard_shield',
    pieceType: 'pawn',
    nameIndo: 'Perisai Pelopor',
    nameEng: 'Vanguard Shield',
    spCost: 3,
    cooldownTurns: 3,
    icon: 'Shield',
    descriptionIndo: 'Pion mendapatkan pelindung yang menahan 1 serangan tangkap berikutnya.',
    descriptionEng: 'Pawn gains a divine shield that absorbs the next capture attack.',
    targetType: 'self',
  },

  // Knight
  pegasus_leap: {
    id: 'pegasus_leap',
    pieceType: 'knight',
    nameIndo: 'Lompatan Pegasus',
    nameEng: 'Pegasus Leap',
    spCost: 3,
    cooldownTurns: 2,
    icon: 'Feather',
    descriptionIndo: 'Kuda dapat melompat ke petak kosong mana pun dalam radius 3 petak tanpa terhalang.',
    descriptionEng: 'Knight teleports/leaps to any empty square within a 3-tile radius.',
    targetType: 'any_empty',
  },
  thunder_stun: {
    id: 'thunder_stun',
    pieceType: 'knight',
    nameIndo: 'Kejutan Petir',
    nameEng: 'Thunder Stun',
    spCost: 4,
    cooldownTurns: 3,
    icon: 'Sparkles',
    descriptionIndo: 'Menyetrum 1 bidak musuh di sekitar agar tidak bisa bergerak pada giliran berikutnya.',
    descriptionEng: 'Stuns an adjacent enemy piece, immobilizing it on its next turn.',
    targetType: 'adjacent_enemy',
  },

  // Bishop
  astral_swap: {
    id: 'astral_swap',
    pieceType: 'bishop',
    nameIndo: 'Tukar Posisi Astral',
    nameEng: 'Astral Swap',
    spCost: 3,
    cooldownTurns: 3,
    icon: 'RefreshCw',
    descriptionIndo: 'Menukar posisi langsung dengan pion kawan mana pun di papan catur.',
    descriptionEng: 'Instantly swaps positions with any friendly pawn on the board.',
    targetType: 'friendly_pawn',
  },
  diagonal_beam: {
    id: 'diagonal_beam',
    pieceType: 'bishop',
    nameIndo: 'Sinar Suci Diagonal',
    nameEng: 'Diagonal Beam',
    spCost: 5,
    cooldownTurns: 4,
    icon: 'Crosshair',
    descriptionIndo: 'Tembakkan sinar diagonal untuk menangkap pion musuh tanpa berpindah tempat.',
    descriptionEng: 'Shoots a diagonal laser to snipe an enemy pawn without moving.',
    targetType: 'move',
  },

  // Rook
  meteor_charge: {
    id: 'meteor_charge',
    pieceType: 'rook',
    nameIndo: 'Tabrakan Meteor',
    nameEng: 'Meteor Charge',
    spCost: 4,
    cooldownTurns: 3,
    icon: 'Flame',
    descriptionIndo: 'Melesat lurus dan menabrak bidak musuh, mendorongnya mundur 1 petak atau menghancurkannya.',
    descriptionEng: 'Dashes forward and pushes an enemy back 1 tile (destroys if blocked).',
    targetType: 'adjacent_enemy',
  },
  iron_bastion: {
    id: 'iron_bastion',
    pieceType: 'rook',
    nameIndo: 'Benteng Besi',
    nameEng: 'Iron Bastion',
    spCost: 4,
    cooldownTurns: 3,
    icon: 'ShieldAlert',
    descriptionIndo: 'Benteng menjadi kebal terhadap serangan tangkap selama 1 putaran penuh.',
    descriptionEng: 'Rook becomes invincible to any captures for 1 full round.',
    targetType: 'self',
  },

  // Queen
  phase_blink: {
    id: 'phase_blink',
    pieceType: 'queen',
    nameIndo: 'Kedip Dimensi',
    nameEng: 'Phase Blink',
    spCost: 4,
    cooldownTurns: 3,
    icon: 'Eye',
    descriptionIndo: 'Ratu berteleportasi secara instan ke petak kosong mana pun dalam jarak 2 petak.',
    descriptionEng: 'Queen warps instantly to any empty square within 2 tiles distance.',
    targetType: 'any_empty',
  },
  gravity_nova: {
    id: 'gravity_nova',
    pieceType: 'queen',
    nameIndo: 'Nova Gravitasi',
    nameEng: 'Gravity Nova',
    spCost: 6,
    cooldownTurns: 4,
    icon: 'Orbit',
    descriptionIndo: 'Menarik semua bidak musuh di radius 2 petak 1 langkah lebih dekat ke ratu.',
    descriptionEng: 'Pulls all enemy pieces within 2 squares 1 step closer to the Queen.',
    targetType: 'self',
  },

  // King
  royal_aegis: {
    id: 'royal_aegis',
    pieceType: 'king',
    nameIndo: 'Aegis Kerajaan',
    nameEng: 'Royal Aegis',
    spCost: 4,
    cooldownTurns: 3,
    icon: 'Crown',
    descriptionIndo: 'Memberikan perisai pelindung ilahi pada Raja atau sekutu kawan.',
    descriptionEng: 'Grants an impervious shield to the King or an ally.',
    targetType: 'self',
  },
  commanders_rally: {
    id: 'commanders_rally',
    pieceType: 'king',
    nameIndo: 'Seruan Komandan',
    nameEng: "Commander's Rally",
    spCost: 5,
    cooldownTurns: 4,
    icon: 'Volume2',
    descriptionIndo: 'Mengisi ulang +3 Skill Points (SP) secara instan untuk pasukan.',
    descriptionEng: 'Instantly grants +3 Skill Points (SP) to replenish your team energy.',
    targetType: 'self',
  },
};

/**
 * Get available abilities for a piece
 */
export function getAbilitiesForPiece(piece: Piece): SpecialAbility[] {
  return Object.values(SPECIAL_ABILITIES).filter(
    (ability) => ability.pieceType === piece.type
  );
}

/**
 * Calculate valid target positions for an ability
 */
export function getAbilityTargetPositions(
  ability: SpecialAbility,
  pos: Position,
  board: BoardState,
  piece: Piece
): Position[] {
  const targets: Position[] = [];
  const { row, col } = pos;

  if (ability.targetType === 'self') {
    targets.push(pos);
    return targets;
  }

  if (ability.id === 'berserk_rush') {
    const dir = piece.color === 'white' ? -1 : 1;
    const r1 = row + dir;
    const r2 = row + dir * 2;
    if (r2 >= 0 && r2 <= 7 && !board[r1][col] && !board[r2][col]) {
      targets.push({ row: r2, col });
    }
  } else if (ability.id === 'pegasus_leap') {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const dist = Math.max(Math.abs(r - row), Math.abs(c - col));
        if (dist > 0 && dist <= 3 && !board[r][c]) {
          targets.push({ row: r, col: c });
        }
      }
    }
  } else if (ability.id === 'thunder_stun') {
    // Adjacent enemy piece
    const dirs = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1],
    ];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const target = board[nr][nc];
        if (target && target.color !== piece.color && target.type !== 'king') {
          targets.push({ row: nr, col: nc });
        }
      }
    }
  } else if (ability.id === 'astral_swap') {
    // Swap with any friendly pawn
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const target = board[r][c];
        if (target && target.color === piece.color && target.type === 'pawn') {
          targets.push({ row: r, col: c });
        }
      }
    }
  } else if (ability.id === 'diagonal_beam') {
    // Snipes an enemy pawn along diagonal
    const diags = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diags) {
      let step = 1;
      while (true) {
        const nr = row + dr * step;
        const nc = col + dc * step;
        if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
        const target = board[nr][nc];
        if (target) {
          if (target.color !== piece.color && target.type === 'pawn') {
            targets.push({ row: nr, col: nc });
          }
          break; // Line of sight blocked
        }
        step++;
      }
    }
  } else if (ability.id === 'meteor_charge') {
    // Adjacent enemy to push
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const target = board[nr][nc];
        if (target && target.color !== piece.color && target.type !== 'king') {
          targets.push({ row: nr, col: nc });
        }
      }
    }
  } else if (ability.id === 'phase_blink') {
    // Empty square within 2 tiles
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const dist = Math.max(Math.abs(r - row), Math.abs(c - col));
        if (dist > 0 && dist <= 2 && !board[r][c]) {
          targets.push({ row: r, col: c });
        }
      }
    }
  }

  return targets;
}
