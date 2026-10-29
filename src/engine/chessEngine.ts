import { BoardState, Piece, PieceColor, PieceType, Position, Move } from '../types/chess';
import { SPECIAL_ABILITIES } from './evolutionAbilities';

export interface CastlingRights {
  whiteKingMoved: boolean;
  whiteRookKMoved: boolean;
  whiteRookQMoved: boolean;
  blackKingMoved: boolean;
  blackRookKMoved: boolean;
  blackRookQMoved: boolean;
}

export function createInitialBoard(): BoardState {
  const board: BoardState = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Back ranks
  const majorPieces: PieceType[] = [
    'rook',
    'knight',
    'bishop',
    'queen',
    'king',
    'bishop',
    'knight',
    'rook',
  ];

  for (let c = 0; c < 8; c++) {
    // Black major pieces (row 0)
    board[0][c] = {
      id: `b_${majorPieces[c]}_${c}`,
      type: majorPieces[c],
      color: 'black',
      level: 1,
      cooldown: 0,
    };

    // Black pawns (row 1)
    board[1][c] = {
      id: `b_pawn_${c}`,
      type: 'pawn',
      color: 'black',
      level: 1,
      cooldown: 0,
    };

    // White pawns (row 6)
    board[6][c] = {
      id: `w_pawn_${c}`,
      type: 'pawn',
      color: 'white',
      level: 1,
      cooldown: 0,
    };

    // White major pieces (row 7)
    board[7][c] = {
      id: `w_${majorPieces[c]}_${c}`,
      type: majorPieces[c],
      color: 'white',
      level: 1,
      cooldown: 0,
    };
  }

  return board;
}

export function cloneBoard(board: BoardState): BoardState {
  return board.map((row) =>
    row.map((cell) => (cell ? { ...cell } : null))
  );
}

export function findKingPosition(board: BoardState, color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

/**
 * Checks if a specific square is under attack by the opponent
 */
export function isSquareAttacked(
  board: BoardState,
  targetPos: Position,
  byColor: PieceColor
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === byColor) {
        if (canAttackSquare(board, { row: r, col: c }, targetPos, piece)) {
          return true;
        }
      }
    }
  }
  return false;
}

function canAttackSquare(
  board: BoardState,
  from: Position,
  to: Position,
  piece: Piece
): boolean {
  const dr = to.row - from.row;
  const dc = to.col - from.col;

  switch (piece.type) {
    case 'pawn': {
      const forward = piece.color === 'white' ? -1 : 1;
      return dr === forward && Math.abs(dc) === 1;
    }
    case 'knight': {
      return (
        (Math.abs(dr) === 2 && Math.abs(dc) === 1) ||
        (Math.abs(dr) === 1 && Math.abs(dc) === 2)
      );
    }
    case 'bishop': {
      if (Math.abs(dr) !== Math.abs(dc) || dr === 0) return false;
      return isLineClear(board, from, to);
    }
    case 'rook': {
      if ((dr !== 0 && dc !== 0) || (dr === 0 && dc === 0)) return false;
      return isLineClear(board, from, to);
    }
    case 'queen': {
      if (Math.abs(dr) === Math.abs(dc) || dr === 0 || dc === 0) {
        if (dr === 0 && dc === 0) return false;
        return isLineClear(board, from, to);
      }
      return false;
    }
    case 'king': {
      return Math.max(Math.abs(dr), Math.abs(dc)) === 1;
    }
  }
}

function isLineClear(board: BoardState, from: Position, to: Position): boolean {
  const stepR = Math.sign(to.row - from.row);
  const stepC = Math.sign(to.col - from.col);

  let curR = from.row + stepR;
  let curC = from.col + stepC;

  while (curR !== to.row || curC !== to.col) {
    if (board[curR][curC] !== null) return false;
    curR += stepR;
    curC += stepC;
  }
  return true;
}

export function isKingInCheck(board: BoardState, color: PieceColor): boolean {
  const kingPos = findKingPosition(board, color);
  if (!kingPos) return false;
  const opponentColor: PieceColor = color === 'white' ? 'black' : 'white';
  return isSquareAttacked(board, kingPos, opponentColor);
}

/**
 * Generates all pseudo-legal moves for a piece (without check validation)
 */
export function getPseudoLegalMoves(
  board: BoardState,
  from: Position,
  piece: Piece,
  enPassantTarget: Position | null,
  castlingRights: CastlingRights
): Position[] {
  if (piece.stunned) return [];

  const moves: Position[] = [];
  const { row, col } = from;
  const color = piece.color;
  const opponent = color === 'white' ? 'black' : 'white';

  switch (piece.type) {
    case 'pawn': {
      const dir = color === 'white' ? -1 : 1;
      const startRow = color === 'white' ? 6 : 1;

      // 1 step forward
      const f1 = row + dir;
      if (f1 >= 0 && f1 <= 7 && !board[f1][col]) {
        moves.push({ row: f1, col });

        // 2 steps forward from start
        const f2 = row + dir * 2;
        if (row === startRow && !board[f2][col]) {
          moves.push({ row: f2, col });
        }
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const nc = col + dc;
        if (nc >= 0 && nc <= 7 && f1 >= 0 && f1 <= 7) {
          const target = board[f1][nc];
          if (target && target.color === opponent) {
            moves.push({ row: f1, col: nc });
          } else if (
            enPassantTarget &&
            enPassantTarget.row === f1 &&
            enPassantTarget.col === nc
          ) {
            moves.push({ row: f1, col: nc });
          }
        }
      }
      break;
    }

    case 'knight': {
      const jumps = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2],  [1, 2],  [2, -1],  [2, 1],
      ];
      for (const [dr, dc] of jumps) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = board[nr][nc];
          if (!target || target.color === opponent) {
            moves.push({ row: nr, col: nc });
          }
        }
      }
      break;
    }

    case 'bishop': {
      const diags = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of diags) {
        let step = 1;
        while (true) {
          const nr = row + dr * step;
          const nc = col + dc * step;
          if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
          const target = board[nr][nc];
          if (!target) {
            moves.push({ row: nr, col: nc });
          } else {
            if (target.color === opponent) moves.push({ row: nr, col: nc });
            break;
          }
          step++;
        }
      }
      break;
    }

    case 'rook': {
      const straights = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of straights) {
        let step = 1;
        while (true) {
          const nr = row + dr * step;
          const nc = col + dc * step;
          if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
          const target = board[nr][nc];
          if (!target) {
            moves.push({ row: nr, col: nc });
          } else {
            if (target.color === opponent) moves.push({ row: nr, col: nc });
            break;
          }
          step++;
        }
      }
      break;
    }

    case 'queen': {
      const dirs = [
        [-1, -1], [-1, 1], [1, -1], [1, 1],
        [-1, 0],  [1, 0],  [0, -1], [0, 1],
      ];
      for (const [dr, dc] of dirs) {
        let step = 1;
        while (true) {
          const nr = row + dr * step;
          const nc = col + dc * step;
          if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
          const target = board[nr][nc];
          if (!target) {
            moves.push({ row: nr, col: nc });
          } else {
            if (target.color === opponent) moves.push({ row: nr, col: nc });
            break;
          }
          step++;
        }
      }
      break;
    }

    case 'king': {
      const steps = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      for (const [dr, dc] of steps) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = board[nr][nc];
          if (!target || target.color === opponent) {
            moves.push({ row: nr, col: nc });
          }
        }
      }

      // Castling
      const kingMoved = color === 'white' ? castlingRights.whiteKingMoved : castlingRights.blackKingMoved;
      if (!kingMoved && !isKingInCheck(board, color)) {
        const baseRow = color === 'white' ? 7 : 0;
        if (row === baseRow && col === 4) {
          // Kingside
          const rookKMoved = color === 'white' ? castlingRights.whiteRookKMoved : castlingRights.blackRookKMoved;
          if (
            !rookKMoved &&
            !board[baseRow][5] &&
            !board[baseRow][6] &&
            board[baseRow][7]?.type === 'rook' &&
            !isSquareAttacked(board, { row: baseRow, col: 5 }, opponent) &&
            !isSquareAttacked(board, { row: baseRow, col: 6 }, opponent)
          ) {
            moves.push({ row: baseRow, col: 6 });
          }

          // Queenside
          const rookQMoved = color === 'white' ? castlingRights.whiteRookQMoved : castlingRights.blackRookQMoved;
          if (
            !rookQMoved &&
            !board[baseRow][1] &&
            !board[baseRow][2] &&
            !board[baseRow][3] &&
            board[baseRow][0]?.type === 'rook' &&
            !isSquareAttacked(board, { row: baseRow, col: 3 }, opponent) &&
            !isSquareAttacked(board, { row: baseRow, col: 2 }, opponent)
          ) {
            moves.push({ row: baseRow, col: 2 });
          }
        }
      }
      break;
    }
  }

  return moves;
}

/**
 * Returns strictly legal moves (moves that do not leave own king in check)
 */
export function getLegalMoves(
  board: BoardState,
  from: Position,
  enPassantTarget: Position | null,
  castlingRights: CastlingRights
): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const pseudoMoves = getPseudoLegalMoves(board, from, piece, enPassantTarget, castlingRights);
  const legalMoves: Position[] = [];

  for (const to of pseudoMoves) {
    // Simulate move
    const testBoard = cloneBoard(board);
    executeSimulatedMove(testBoard, from, to, piece, enPassantTarget);

    if (!isKingInCheck(testBoard, piece.color)) {
      legalMoves.push(to);
    }
  }

  return legalMoves;
}

function executeSimulatedMove(
  board: BoardState,
  from: Position,
  to: Position,
  piece: Piece,
  enPassantTarget: Position | null
) {
  // En passant removal
  if (
    piece.type === 'pawn' &&
    enPassantTarget &&
    to.row === enPassantTarget.row &&
    to.col === enPassantTarget.col
  ) {
    const captureRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
    board[captureRow][to.col] = null;
  }

  // Castling rook move
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    if (to.col === 6) {
      // Kingside
      board[from.row][5] = board[from.row][7];
      board[from.row][7] = null;
    } else if (to.col === 2) {
      // Queenside
      board[from.row][3] = board[from.row][0];
      board[from.row][0] = null;
    }
  }

  board[to.row][to.col] = { ...piece };
  board[from.row][from.col] = null;
}

/**
 * Checks if the specified player has any legal moves available
 */
export function hasAnyLegalMoves(
  board: BoardState,
  color: PieceColor,
  enPassantTarget: Position | null,
  castlingRights: CastlingRights
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const moves = getLegalMoves(board, { row: r, col: c }, enPassantTarget, castlingRights);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
}

/**
 * Make an official move on the game board
 */
export function applyMove(
  board: BoardState,
  from: Position,
  to: Position,
  enPassantTarget: Position | null,
  castlingRights: CastlingRights,
  promotionChoice: PieceType = 'queen'
): {
  newBoard: BoardState;
  capturedPiece: Piece | null;
  newEnPassant: Position | null;
  newCastlingRights: CastlingRights;
  leveledUp: boolean;
  algebraic: string;
} {
  const newBoard = cloneBoard(board);
  const piece = newBoard[from.row][from.col]!;
  let capturedPiece = newBoard[to.row][to.col];
  let leveledUp = false;

  const newCastling = { ...castlingRights };
  let newEnPassant: Position | null = null;

  // Handle Shield protection
  if (capturedPiece?.shielded) {
    // Shield absorbs the capture completely!
    capturedPiece.shielded = false;
    newBoard[from.row][from.col] = null;
    newBoard[to.row][to.col] = piece; // replaces, but the shield piece was defended
    // Piece wasn't destroyed
  } else if (capturedPiece) {
    // Regular capture
    if (piece.level < 3) {
      piece.level += 1;
      leveledUp = true;
    }
  }

  // Handle En Passant
  if (
    piece.type === 'pawn' &&
    enPassantTarget &&
    to.row === enPassantTarget.row &&
    to.col === enPassantTarget.col
  ) {
    const epRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
    capturedPiece = newBoard[epRow][to.col];
    newBoard[epRow][to.col] = null;
  }

  // Set new en passant target if double pawn step
  if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
    newEnPassant = {
      row: (from.row + to.row) / 2,
      col: from.col,
    };
  }

  // Handle Castling
  let isCastling = false;
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    isCastling = true;
    if (to.col === 6) {
      newBoard[from.row][5] = newBoard[from.row][7];
      newBoard[from.row][7] = null;
    } else if (to.col === 2) {
      newBoard[from.row][3] = newBoard[from.row][0];
      newBoard[from.row][0] = null;
    }
  }

  // Update castling rights
  if (piece.type === 'king') {
    if (piece.color === 'white') newCastling.whiteKingMoved = true;
    else newCastling.blackKingMoved = true;
  }
  if (from.row === 7 && from.col === 7) newCastling.whiteRookKMoved = true;
  if (from.row === 7 && from.col === 0) newCastling.whiteRookQMoved = true;
  if (from.row === 0 && from.col === 7) newCastling.blackRookKMoved = true;
  if (from.row === 0 && from.col === 0) newCastling.blackRookQMoved = true;

  // Move piece to destination
  piece.hasMoved = true;
  if (piece.cooldown && piece.cooldown > 0) piece.cooldown -= 1;
  piece.stunned = false;

  // Handle Promotion
  const promotionRow = piece.color === 'white' ? 0 : 7;
  if (piece.type === 'pawn' && to.row === promotionRow) {
    piece.type = promotionChoice;
    piece.level = 2; // Evolved upon promotion
    leveledUp = true;
  }

  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;

  // Reduce cooldowns for other pieces of this color
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = newBoard[r][c];
      if (p && p.color === piece.color && p.id !== piece.id && p.cooldown && p.cooldown > 0) {
        p.cooldown -= 1;
      }
    }
  }

  // Notation
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const toSquare = `${files[to.col]}${8 - to.row}`;
  let notation = '';

  if (isCastling) {
    notation = to.col === 6 ? 'O-O' : 'O-O-O';
  } else {
    const pieceChar = piece.type === 'pawn' ? '' : piece.type[0].toUpperCase();
    const captureChar = capturedPiece ? 'x' : '';
    const fromCol = piece.type === 'pawn' && capturedPiece ? files[from.col] : '';
    notation = `${pieceChar || fromCol}${captureChar}${toSquare}`;
  }

  const oppColor: PieceColor = piece.color === 'white' ? 'black' : 'white';
  if (isKingInCheck(newBoard, oppColor)) {
    if (!hasAnyLegalMoves(newBoard, oppColor, newEnPassant, newCastling)) {
      notation += '#';
    } else {
      notation += '+';
    }
  }

  return {
    newBoard,
    capturedPiece,
    newEnPassant,
    newCastlingRights: newCastling,
    leveledUp,
    algebraic: notation,
  };
}

/**
 * Execute a special evolution ability
 */
export function applySpecialAbility(
  board: BoardState,
  from: Position,
  targetPos: Position,
  abilityId: string
): {
  newBoard: BoardState;
  abilityName: string;
  capturedPiece: Piece | null;
  message: string;
} {
  const newBoard = cloneBoard(board);
  const piece = newBoard[from.row][from.col]!;
  const ability = SPECIAL_ABILITIES[abilityId];
  let capturedPiece: Piece | null = null;
  let message = '';

  piece.cooldown = ability.cooldownTurns;

  if (abilityId === 'berserk_rush' || abilityId === 'pegasus_leap' || abilityId === 'phase_blink') {
    newBoard[targetPos.row][targetPos.col] = piece;
    newBoard[from.row][from.col] = null;
    message = `${piece.color === 'white' ? 'Putih' : 'Hitam'} menggunakan ${ability.nameIndo}!`;
  } else if (abilityId === 'vanguard_shield' || abilityId === 'iron_bastion' || abilityId === 'royal_aegis') {
    piece.shielded = true;
    message = `${piece.color === 'white' ? 'Putih' : 'Hitam'} mengaktifkan ${ability.nameIndo}!`;
  } else if (abilityId === 'thunder_stun') {
    const target = newBoard[targetPos.row][targetPos.col];
    if (target) {
      target.stunned = true;
      message = `${target.type} disetrum dan tidak bisa bergerak 1 giliran!`;
    }
  } else if (abilityId === 'astral_swap') {
    const targetPawn = newBoard[targetPos.row][targetPos.col];
    if (targetPawn) {
      newBoard[targetPos.row][targetPos.col] = piece;
      newBoard[from.row][from.col] = targetPawn;
      message = `${ability.nameIndo}: Posisi Gajah dan Bidak berhasil ditukar!`;
    }
  } else if (abilityId === 'diagonal_beam') {
    capturedPiece = newBoard[targetPos.row][targetPos.col];
    newBoard[targetPos.row][targetPos.col] = null;
    message = `${ability.nameIndo}: Pion target tereliminasi oleh sinar suci!`;
  } else if (abilityId === 'meteor_charge') {
    const enemy = newBoard[targetPos.row][targetPos.col];
    if (enemy) {
      const dr = targetPos.row - from.row;
      const dc = targetPos.col - from.col;
      const pushRow = targetPos.row + Math.sign(dr);
      const pushCol = targetPos.col + Math.sign(dc);

      if (pushRow < 0 || pushRow > 7 || pushCol < 0 || pushCol > 7 || newBoard[pushRow][pushCol]) {
        // Crushed against wall or obstacle
        capturedPiece = enemy;
        newBoard[targetPos.row][targetPos.col] = piece;
        newBoard[from.row][from.col] = null;
        message = `${ability.nameIndo}: Musuh terdorong ke tembok dan hancur!`;
      } else {
        // Pushed back
        newBoard[pushRow][pushCol] = enemy;
        newBoard[targetPos.row][targetPos.col] = piece;
        newBoard[from.row][from.col] = null;
        message = `${ability.nameIndo}: Musuh terdorong mundur 1 petak!`;
      }
    }
  } else if (abilityId === 'gravity_nova') {
    // Pull adjacent enemy pieces in radius 2 closer
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = newBoard[r][c];
        if (p && p.color !== piece.color && p.type !== 'king') {
          const dist = Math.max(Math.abs(r - from.row), Math.abs(c - from.col));
          if (dist === 2) {
            const stepR = Math.sign(from.row - r);
            const stepC = Math.sign(from.col - c);
            const nextR = r + stepR;
            const nextC = c + stepC;
            if (!newBoard[nextR][nextC]) {
              newBoard[nextR][nextC] = p;
              newBoard[r][c] = null;
            }
          }
        }
      }
    }
    message = `${ability.nameIndo}: Semua bidak lawan tersedot ke arah Ratu!`;
  } else if (abilityId === 'commanders_rally') {
    message = `${ability.nameIndo}: Moral tentara bangkit! +3 SP ditambahkan!`;
  }

  return {
    newBoard,
    abilityName: ability.nameIndo,
    capturedPiece,
    message,
  };
}
