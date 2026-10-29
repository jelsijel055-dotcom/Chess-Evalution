/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BoardState,
  Position,
  Piece,
  PieceColor,
  PieceType,
  GameMode,
  AIDifficulty,
  PlayerStats,
  Quest,
  SpecialAbility,
} from './types/chess';
import {
  createInitialBoard,
  getLegalMoves,
  applyMove,
  isKingInCheck,
  hasAnyLegalMoves,
  findKingPosition,
  CastlingRights,
  cloneBoard,
} from './engine/chessEngine';
import {
  SPECIAL_ABILITIES,
  getAbilityTargetPositions,
} from './engine/evolutionAbilities';
import { findBestAIMove, AI_PERSONALITIES } from './engine/aiEngine';
import { INITIAL_QUESTS, BOARD_SKINS, PIECE_SKINS } from './data/shopData';
import { soundManager } from './utils/audio';

import { ChessBoard } from './components/ChessBoard';
import { AbilityPanel } from './components/AbilityPanel';
import { ShopModal } from './components/ShopModal';
import { RewardedAdModal } from './components/RewardedAdModal';
import { CodexModal } from './components/CodexModal';
import { QuestsModal } from './components/QuestsModal';
import { MultiplayerModal } from './components/MultiplayerModal';
import { VictoryModal } from './components/VictoryModal';
import { PieceIcon } from './components/PieceIcon';
import { FloatingCombatText, CombatAlert } from './components/FloatingCombatText';
import { EmoteWheel } from './components/EmoteWheel';
import { PuzzleModal } from './components/PuzzleModal';

import {
  Volume2,
  VolumeX,
  Music,
  Smartphone,
  Maximize2,
  ShoppingBag,
  Target,
  BookOpen,
  Users,
  RotateCcw,
  Flag,
  Sparkles,
  Zap,
  Coins,
  Gem,
  Swords,
  Bot,
  Globe,
  Clock,
  Shield,
  Award,
  Lightbulb,
  Flame,
} from 'lucide-react';

export default function App() {
  // Game State
  const [board, setBoard] = useState<BoardState>(createInitialBoard);
  const [turn, setTurn] = useState<PieceColor>('white');
  const [gameMode, setGameMode] = useState<GameMode>('evolution');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Castling & En Passant
  const [castlingRights, setCastlingRights] = useState<CastlingRights>({
    whiteKingMoved: false,
    whiteRookKMoved: false,
    whiteRookQMoved: false,
    blackKingMoved: false,
    blackRookKMoved: false,
    blackRookQMoved: false,
  });
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null);

  // Interaction State
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [activeAbility, setActiveAbility] = useState<SpecialAbility | null>(null);
  const [abilityTargets, setAbilityTargets] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [kingInCheckPos, setKingInCheckPos] = useState<Position | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Position; to: Position } | null>(null);

  // SP (Skill Points / Energy)
  const [whiteSP, setWhiteSP] = useState<number>(4);
  const [blackSP, setBlackSP] = useState<number>(4);

  // Ultimate Awakening Gauges (0 - 100%)
  const [whiteAwakening, setWhiteAwakening] = useState<number>(30);
  const [blackAwakening, setBlackAwakening] = useState<number>(20);

  // Floating Combat Notifications
  const [combatAlerts, setCombatAlerts] = useState<CombatAlert[]>([]);

  // Speech bubble emotes
  const [playerEmote, setPlayerEmote] = useState<string | null>(null);
  const [opponentEmote, setOpponentEmote] = useState<string | null>(null);

  // Captures & Move Log
  const [whiteCaptures, setWhiteCaptures] = useState<Piece[]>([]);
  const [blackCaptures, setBlackCaptures] = useState<Piece[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [screenShake, setScreenShake] = useState(false);

  // Game Timers (seconds)
  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Match Status
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<PieceColor | 'draw' | null>(null);
  const [gameEndReason, setGameEndReason] = useState<'checkmate' | 'stalemate' | 'resign' | 'timeout'>('checkmate');

  // Player Economy & Profile Stats
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    gold: 1450,
    gems: 95,
    rankPoints: 1280,
    level: 3,
    xp: 480,
    equippedBoardSkin: 'cyber_neon',
    equippedPieceSkin: 'cyber_mecha',
    ownedSkins: ['cyber_neon', 'cyber_mecha'],
    isVipPass: false,
    passTier: 2,
    passXp: 210,
    soundEnabled: true,
    vibrationEnabled: true,
    language: 'id',
  });

  const [isBgmActive, setIsBgmActive] = useState(false);

  // Quests
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);

  // Online Match State
  const [onlineOpponent, setOnlineOpponent] = useState<{ name: string; rating: number } | null>(null);

  // Device view framing (Android mobile mockup vs Widescreen)
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Modals
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);

  // Add floating combat notification helper
  const addCombatAlert = (text: string, type: CombatAlert['type']) => {
    const newAlert: CombatAlert = { id: `${Date.now()}_${Math.random()}`, text, type };
    setCombatAlerts((prev) => [...prev.slice(-2), newAlert]);
    setTimeout(() => {
      setCombatAlerts((prev) => prev.filter((a) => a.id !== newAlert.id));
    }, 2200);
  };

  // Turn timer countdown
  useEffect(() => {
    if (gameOver || !isTimerRunning) return;

    const timer = setInterval(() => {
      if (turn === 'white') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            handleTimeout('black');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            handleTimeout('white');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, gameOver, isTimerRunning]);

  const handleTimeout = (victor: PieceColor) => {
    setGameOver(true);
    setWinner(victor);
    setGameEndReason('timeout');
    setIsVictoryOpen(true);
    soundManager.playVictory();
  };

  // Trigger screen shake effect
  const triggerShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 380);
  };

  // Check state calculation after every turn
  useEffect(() => {
    const kingPos = findKingPosition(board, turn);
    if (isKingInCheck(board, turn)) {
      setKingInCheckPos(kingPos);
      soundManager.playCheck();
      addCombatAlert(`👑 SKAK! RAJA ${turn === 'white' ? 'PUTIH' : 'HITAM'} TERANCAM!`, 'check');

      // Check for checkmate
      if (!hasAnyLegalMoves(board, turn, enPassantTarget, castlingRights)) {
        setGameOver(true);
        const matchWinner: PieceColor = turn === 'white' ? 'black' : 'white';
        setWinner(matchWinner);
        setGameEndReason('checkmate');
        setIsVictoryOpen(true);
        soundManager.playVictory();
        addCombatAlert(`🏆 SKAKMAT! KEMENANGAN ${matchWinner === 'white' ? 'PUTIH' : 'HITAM'}!`, 'awakening');

        if (matchWinner === 'white') {
          updateQuestProgress('q3', 1);
        }
      }
    } else {
      setKingInCheckPos(null);
      // Check for stalemate
      if (!hasAnyLegalMoves(board, turn, enPassantTarget, castlingRights)) {
        setGameOver(true);
        setWinner('draw');
        setGameEndReason('stalemate');
        setIsVictoryOpen(true);
      }
    }
  }, [board, turn, enPassantTarget, castlingRights]);

  // Update Quest Progress helper
  const updateQuestProgress = (questId: string, amount: number) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          const updated = q.current + amount;
          return {
            ...q,
            current: updated,
            completed: updated >= q.max,
          };
        }
        return q;
      })
    );
  };

  // Claim Quest Reward
  const handleClaimQuest = (questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q || q.claimed || q.current < q.max) return;

    setPlayerStats((prev) => ({
      ...prev,
      gold: prev.gold + q.rewardGold,
      gems: prev.gems + q.rewardGems,
      passXp: prev.passXp + 60,
    }));

    setQuests((prev) =>
      prev.map((item) => (item.id === questId ? { ...item, claimed: true } : item))
    );
    addCombatAlert(`🎁 +${q.rewardGold} KOIN & +${q.rewardGems} PERMATA!`, 'evolution');
  };

  // Rewarded Ad claim
  const handleRewardClaimed = (gold: number, gems: number, xp: number) => {
    setPlayerStats((prev) => {
      const newXp = prev.passXp + xp;
      const nextTier = Math.floor(newXp / 150) + 1;
      return {
        ...prev,
        gold: prev.gold + gold,
        gems: prev.gems + gems,
        passXp: newXp,
        passTier: Math.max(prev.passTier, nextTier),
      };
    });
    addCombatAlert(`✨ KLAIM IKLAN: +${gold} KOIN & +${gems} PERMATA!`, 'awakening');
  };

  // AI Turn Trigger
  useEffect(() => {
    if (gameOver || turn !== 'black') return;
    if (gameMode !== 'ai') return;

    setIsAiThinking(true);
    const thinkingTime = aiDifficulty === 'easy' ? 600 : aiDifficulty === 'medium' ? 850 : 1100;

    const timer = setTimeout(() => {
      // Check if AI can use Awakening
      if (blackAwakening >= 100 && Math.random() < 0.6) {
        handleTriggerAwakening('black');
      }

      const bestMove = findBestAIMove(
        board,
        'black',
        enPassantTarget,
        castlingRights,
        aiDifficulty,
        blackSP,
        true
      );

      if (bestMove) {
        if (bestMove.abilityId) {
          executeAbilityAction(bestMove.from, bestMove.to, bestMove.abilityId);
        } else {
          makeBoardMove(bestMove.from, bestMove.to, 'queen');
        }
      }
      setIsAiThinking(false);
    }, thinkingTime);

    return () => clearTimeout(timer);
  }, [turn, gameOver, gameMode, board, enPassantTarget, castlingRights, blackSP, aiDifficulty, blackAwakening]);

  // Execute a standard move on the board
  const makeBoardMove = (
    from: Position,
    to: Position,
    promoChoice: PieceType = 'queen'
  ) => {
    const movingPiece = board[from.row][from.col];
    if (!movingPiece) return;

    const res = applyMove(
      board,
      from,
      to,
      enPassantTarget,
      castlingRights,
      promoChoice
    );

    if (res.capturedPiece) {
      soundManager.playCapture();
      triggerShake();
      addCombatAlert(`💥 ${movingPiece.type.toUpperCase()} MENANGKAP ${res.capturedPiece.type.toUpperCase()}!`, 'capture');

      if (movingPiece.color === 'white') {
        setWhiteCaptures((prev) => [...prev, res.capturedPiece!]);
        setWhiteSP((sp) => Math.min(10, sp + 2));
        setWhiteAwakening((a) => Math.min(100, a + 25));
      } else {
        setBlackCaptures((prev) => [...prev, res.capturedPiece!]);
        setBlackSP((sp) => Math.min(10, sp + 2));
        setBlackAwakening((a) => Math.min(100, a + 25));
      }
    } else {
      soundManager.playMove();
      if (movingPiece.color === 'white') {
        setWhiteAwakening((a) => Math.min(100, a + 10));
      } else {
        setBlackAwakening((a) => Math.min(100, a + 10));
      }
    }

    if (res.leveledUp) {
      soundManager.playSpecialAbility();
      addCombatAlert(`🔥 EVOLUSI! ${movingPiece.type.toUpperCase()} NAIK TINGKAT ${movingPiece.level + 1}!`, 'evolution');
    }

    setBoard(res.newBoard);
    setEnPassantTarget(res.newEnPassant);
    setCastlingRights(res.newCastlingRights);
    setLastMove({ from, to });
    setMoveHistory((prev) => [...prev, res.algebraic]);

    // Reset interaction states
    setSelectedPos(null);
    setValidMoves([]);
    setActiveAbility(null);
    setAbilityTargets([]);
    setPendingPromotion(null);

    // Turn switch & replenish 1 SP
    if (turn === 'white') {
      setTurn('black');
      setBlackSP((sp) => Math.min(10, sp + 1));
    } else {
      setTurn('white');
      setWhiteSP((sp) => Math.min(10, sp + 1));
      if (gameMode === 'evolution') {
        updateQuestProgress('q1', 1);
      }
    }
  };

  // Execute special ability action
  const executeAbilityAction = (from: Position, targetPos: Position, abilityId: string) => {
    const ability = SPECIAL_ABILITIES[abilityId];
    if (!ability) return;

    soundManager.playSpecialAbility();
    triggerShake();
    addCombatAlert(`⚡ JURUS AKTIF: ${ability.nameIndo.toUpperCase()}!`, 'ability');

    const newBoard = cloneBoard(board);
    const piece = newBoard[from.row][from.col]!;
    piece.cooldown = ability.cooldownTurns;

    // Deduct SP
    if (piece.color === 'white') {
      setWhiteSP((sp) => Math.max(0, sp - ability.spCost));
      setWhiteAwakening((a) => Math.min(100, a + 15));
      updateQuestProgress('q2', 1);
    } else {
      setBlackSP((sp) => Math.max(0, sp - ability.spCost));
      setBlackAwakening((a) => Math.min(100, a + 15));
    }

    if (abilityId === 'berserk_rush' || abilityId === 'pegasus_leap' || abilityId === 'phase_blink') {
      newBoard[targetPos.row][targetPos.col] = piece;
      newBoard[from.row][from.col] = null;
    } else if (abilityId === 'vanguard_shield' || abilityId === 'iron_bastion' || abilityId === 'royal_aegis') {
      piece.shielded = true;
      addCombatAlert('🛡️ PERISAI KELANGSUNGAN AKTIF!', 'shield');
    } else if (abilityId === 'thunder_stun') {
      const enemy = newBoard[targetPos.row][targetPos.col];
      if (enemy) enemy.stunned = true;
      addCombatAlert('⚡ MUSUH TERSETUM 1 PUTARAN!', 'ability');
    } else if (abilityId === 'astral_swap') {
      const friendlyPawn = newBoard[targetPos.row][targetPos.col];
      if (friendlyPawn) {
        newBoard[targetPos.row][targetPos.col] = piece;
        newBoard[from.row][from.col] = friendlyPawn;
      }
    } else if (abilityId === 'diagonal_beam') {
      const snipePawn = newBoard[targetPos.row][targetPos.col];
      if (snipePawn) {
        newBoard[targetPos.row][targetPos.col] = null;
        if (piece.color === 'white') setWhiteCaptures((p) => [...p, snipePawn]);
        else setBlackCaptures((p) => [...p, snipePawn]);
        addCombatAlert('🎯 SINAR SUCI MELENYAPKAN PION MUSUH!', 'capture');
      }
    } else if (abilityId === 'meteor_charge') {
      const enemy = newBoard[targetPos.row][targetPos.col];
      if (enemy) {
        const dr = targetPos.row - from.row;
        const dc = targetPos.col - from.col;
        const pushR = targetPos.row + Math.sign(dr);
        const pushC = targetPos.col + Math.sign(dc);
        if (pushR < 0 || pushR > 7 || pushC < 0 || pushC > 7 || newBoard[pushR][pushC]) {
          newBoard[targetPos.row][targetPos.col] = piece;
          newBoard[from.row][from.col] = null;
          if (piece.color === 'white') setWhiteCaptures((p) => [...p, enemy]);
          else setBlackCaptures((p) => [...p, enemy]);
          addCombatAlert('💥 METEOR CHARGE: MUSUH HANCUR TERBENTUR!', 'capture');
        } else {
          newBoard[pushR][pushC] = enemy;
          newBoard[targetPos.row][targetPos.col] = piece;
          newBoard[from.row][from.col] = null;
          addCombatAlert('💨 MUSUH TERDORONG MUNDUR 1 PETAK!', 'ability');
        }
      }
    } else if (abilityId === 'commanders_rally') {
      if (piece.color === 'white') setWhiteSP((sp) => Math.min(10, sp + 3));
      else setBlackSP((sp) => Math.min(10, sp + 3));
      addCombatAlert('📣 SERUAN KOMANDAN: +3 SP INSTAN!', 'ability');
    }

    setBoard(newBoard);
    setMoveHistory((prev) => [...prev, `⚡ ${ability.nameIndo}`]);
    setSelectedPos(null);
    setValidMoves([]);
    setActiveAbility(null);
    setAbilityTargets([]);

    // Turn switch
    if (turn === 'white') {
      setTurn('black');
      setBlackSP((sp) => Math.min(10, sp + 1));
    } else {
      setTurn('white');
      setWhiteSP((sp) => Math.min(10, sp + 1));
    }
  };

  // Trigger Ultimate Awakening
  const handleTriggerAwakening = (color: PieceColor) => {
    soundManager.playUltimateAwakening();
    triggerShake();
    addCombatAlert(`👑 AWAKENING OVERDRIVE DIAKTIFKAN OLEH ${color.toUpperCase()}!`, 'awakening');

    if (color === 'white') {
      setWhiteAwakening(0);
      setWhiteSP(10);
    } else {
      setBlackAwakening(0);
      setBlackSP(10);
    }

    // Reset piece cooldowns and add divine shield to most advanced piece
    setBoard((prevBoard) => {
      const nextBoard = cloneBoard(prevBoard);
      let targetPiece: Piece | null = null;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = nextBoard[r][c];
          if (p && p.color === color) {
            p.cooldown = 0;
            if (!targetPiece || (color === 'white' ? r < 4 : r > 3)) {
              targetPiece = p;
            }
          }
        }
      }
      if (targetPiece) {
        targetPiece.shielded = true;
      }
      return nextBoard;
    });
  };

  // Send Emote
  const handleSendEmote = (text: string) => {
    setPlayerEmote(text);
    setTimeout(() => setPlayerEmote(null), 3000);

    // Opponent reply in AI mode
    if (gameMode === 'ai') {
      setTimeout(() => {
        const botReplies = [
          'Taktikmu menarik, tapi aku sudah menghitungnya! 🤖',
          'Serangan balikku tidak akan mudah dihadapi! 🔥',
          'Pertandingan yang luar biasa! 🤝',
          'Mari kita lihat siapa yang akan bertahan! 👑',
        ];
        const chosen = botReplies[Math.floor(Math.random() * botReplies.length)];
        setOpponentEmote(chosen);
        soundManager.playEmote();
        setTimeout(() => setOpponentEmote(null), 3500);
      }, 1200);
    }
  };

  // Square Click Handler
  const handleSquareClick = (r: number, c: number) => {
    if (gameOver) return;
    if (gameMode === 'ai' && turn === 'black') return;

    const clickedPiece = board[r][c];

    // If active ability targeting is in progress
    if (activeAbility && selectedPos) {
      const isTarget = abilityTargets.some((pos) => pos.row === r && pos.col === c);
      if (isTarget) {
        executeAbilityAction(selectedPos, { row: r, col: c }, activeAbility.id);
        return;
      } else {
        setActiveAbility(null);
        setAbilityTargets([]);
      }
    }

    // If destination is one of the legal moves for selected piece
    if (selectedPos && validMoves.some((m) => m.row === r && m.col === c)) {
      const movingPiece = board[selectedPos.row][selectedPos.col];

      // Check for pawn promotion
      if (
        movingPiece?.type === 'pawn' &&
        ((movingPiece.color === 'white' && r === 0) ||
          (movingPiece.color === 'black' && r === 7))
      ) {
        setPendingPromotion({ from: selectedPos, to: { row: r, col: c } });
        return;
      }

      makeBoardMove(selectedPos, { row: r, col: c });
      return;
    }

    // Select piece
    if (clickedPiece && clickedPiece.color === turn) {
      soundManager.playClick();
      setSelectedPos({ row: r, col: c });
      const legal = getLegalMoves(board, { row: r, col: c }, enPassantTarget, castlingRights);
      setValidMoves(legal);
      setActiveAbility(null);
      setAbilityTargets([]);
    } else {
      setSelectedPos(null);
      setValidMoves([]);
      setActiveAbility(null);
      setAbilityTargets([]);
    }
  };

  // Select Special Ability for piece
  const handleSelectAbility = (ability: SpecialAbility) => {
    if (!selectedPos) return;
    const piece = board[selectedPos.row][selectedPos.col];
    if (!piece) return;

    soundManager.playClick();
    setActiveAbility(ability);
    const targets = getAbilityTargetPositions(ability, selectedPos, board, piece);
    setAbilityTargets(targets);

    if (ability.targetType === 'self') {
      executeAbilityAction(selectedPos, selectedPos, ability.id);
    }
  };

  // Reset Game / Play Again
  const handleResetGame = () => {
    setBoard(createInitialBoard());
    setTurn('white');
    setSelectedPos(null);
    setValidMoves([]);
    setActiveAbility(null);
    setAbilityTargets([]);
    setLastMove(null);
    setKingInCheckPos(null);
    setPendingPromotion(null);
    setWhiteSP(4);
    setBlackSP(4);
    setWhiteAwakening(30);
    setBlackAwakening(20);
    setWhiteCaptures([]);
    setBlackCaptures([]);
    setMoveHistory([]);
    setWhiteTime(600);
    setBlackTime(600);
    setGameOver(false);
    setWinner(null);
    setIsVictoryOpen(false);
    setCastlingRights({
      whiteKingMoved: false,
      whiteRookKMoved: false,
      whiteRookQMoved: false,
      blackKingMoved: false,
      blackRookKMoved: false,
      blackRookQMoved: false,
    });
    setEnPassantTarget(null);
  };

  // Resign
  const handleResign = () => {
    soundManager.playClick();
    setGameOver(true);
    const oppWinner: PieceColor = turn === 'white' ? 'black' : 'white';
    setWinner(oppWinner);
    setGameEndReason('resign');
    setIsVictoryOpen(true);
  };

  // Start Online Match handler
  const handleStartOnlineMatch = (name: string, rating: number) => {
    setOnlineOpponent({ name, rating });
    setGameMode('online_match');
    handleResetGame();
  };

  // Solve Puzzle Reward
  const handleSolvePuzzleReward = (gold: number, gems: number) => {
    setPlayerStats((prev) => ({
      ...prev,
      gold: prev.gold + gold,
      gems: prev.gems + gems,
      passXp: prev.passXp + 90,
    }));
    addCombatAlert(`🧩 PUZZLE SELESAI: +${gold} KOIN & +${gems} PERMATA!`, 'awakening');
  };

  const selectedPiece = selectedPos ? board[selectedPos.row][selectedPos.col] : null;
  const currentSP = turn === 'white' ? whiteSP : blackSP;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate live formation synergies
  const livingWhitePawns = board.flat().filter((p) => p && p.color === 'white' && p.type === 'pawn').length;
  const livingWhiteKnights = board.flat().filter((p) => p && p.color === 'white' && p.type === 'knight').length;
  const livingWhiteBishops = board.flat().filter((p) => p && p.color === 'white' && p.type === 'bishop').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Top Bar Contract (3 zones separated by gap-8: Brand wordmark, 4 clean nav links, 1 primary action) */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <span className="text-lg font-black tracking-tight text-slate-100 font-display whitespace-nowrap">
            Catur Evolution
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setIsShopOpen(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Toko Skin
          </button>
          <button
            onClick={() => setIsPuzzleOpen(true)}
            className="hover:text-yellow-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" /> Teka-Teki Taktis
          </button>
          <button
            onClick={() => setIsQuestsOpen(true)}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Target className="w-3.5 h-3.5" /> Misi Harian
          </button>
          <button
            onClick={() => setIsCodexOpen(true)}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" /> Panduan Skill
          </button>
          <button
            onClick={() => setIsMultiplayerOpen(true)}
            className="hover:text-purple-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" /> Multiplayer
          </button>
        </nav>

        {/* Zone 3: Wallet Currency & Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Gold & Gems Badges */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsShopOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-bold font-mono text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
              title="Koin Emas"
            >
              <Coins className="w-3.5 h-3.5" />
              {playerStats.gold.toLocaleString()}
            </button>
            <button
              onClick={() => setIsShopOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-bold font-mono text-purple-300 hover:bg-purple-500/20 transition-colors cursor-pointer"
              title="Permata Ungu"
            >
              <Gem className="w-3.5 h-3.5" />
              {playerStats.gems}
            </button>
          </div>

          {/* Ambient BGM Synthesizer Button */}
          <button
            onClick={() => {
              const active = soundManager.toggleBGM();
              setIsBgmActive(active);
            }}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isBgmActive
                ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100'
            }`}
            title={isBgmActive ? 'Matikan Musik Latar (BGM)' : 'Nyalakan Musik Taktis BGM'}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !playerStats.soundEnabled;
              soundManager.enabled = next;
              setPlayerStats((prev) => ({ ...prev, soundEnabled: next }));
            }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            title={playerStats.soundEnabled ? 'Matikan Suara SFX' : 'Nyalakan Suara SFX'}
          >
            {playerStats.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Mobile Phone Mockup Frame Toggle */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="hidden sm:flex p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            title={isMobileFrame ? 'Mode Layar Penuh' : 'Mode Bingkai Android'}
          >
            {isMobileFrame ? (
              <Maximize2 className="w-4 h-4 text-amber-400" />
            ) : (
              <Smartphone className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => setIsRewardedAdOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg transition-colors shadow flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            +250 Koin Gratis
          </button>
        </div>
      </header>

      {/* Main Container - Conditional Mobile Android Frame vs Full Responsive Layout */}
      <main
        className={`w-full flex-1 flex flex-col items-center justify-start py-4 px-2 sm:px-4 ${
          screenShake ? 'animate-screen-shake' : ''
        }`}
      >
        <div
          className={`w-full transition-all duration-300 ${
            isMobileFrame
              ? 'max-w-[440px] rounded-[42px] border-[6px] border-slate-800 bg-slate-950 shadow-2xl p-4 my-2 overflow-hidden ring-4 ring-slate-900'
              : 'max-w-6xl'
          }`}
        >
          {/* Android Mobile Mockup Status Bar */}
          {isMobileFrame && (
            <div className="flex items-center justify-between px-3 pt-1 pb-3 text-[11px] font-mono text-slate-400 border-b border-slate-800/80 mb-3">
              <span>09:41</span>
              <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto" />
              <span>5G · 98%</span>
            </div>
          )}

          {/* Mode Selector Segmented Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4 bg-slate-900/70 p-1.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setGameMode('evolution');
                  handleResetGame();
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  gameMode === 'evolution'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Mode Evolution
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setGameMode('classic');
                  handleResetGame();
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  gameMode === 'classic'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Swords className="w-3.5 h-3.5" /> Catur Klasik
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setGameMode('ai');
                  handleResetGame();
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  gameMode === 'ai'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" /> Lawan AI
              </button>

              <button
                onClick={() => setIsMultiplayerOpen(true)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  gameMode === 'online_match'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Online
              </button>
            </div>

            {/* AI Difficulty Selector if in AI mode */}
            {gameMode === 'ai' && (
              <div className="flex items-center gap-1 text-xs">
                {(['easy', 'medium', 'master', 'grandmaster'] as AIDifficulty[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      soundManager.playClick();
                      setAiDifficulty(lvl);
                    }}
                    className={`px-2 py-1 rounded-lg font-mono capitalize text-[11px] font-bold cursor-pointer transition-colors ${
                      aiDifficulty === lvl
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Game Workspace Grid: Left Board Area, Right HUD & Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Center / Left: Opponent HUD, Chess Board, Player HUD */}
            <div className="lg:col-span-8 flex flex-col items-center space-y-3">
              {/* Opponent (Black) HUD Card */}
              <div
                className={`w-full max-w-[540px] flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border relative transition-all ${
                  turn === 'black'
                    ? 'bg-slate-900 border-rose-500/60 ring-1 ring-rose-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                {/* Opponent Speech Bubble Emote */}
                {opponentEmote && (
                  <div className="absolute -top-10 left-12 bg-rose-500 text-white font-bold text-xs py-1 px-3 rounded-xl shadow-lg border border-rose-300 animate-bounce z-30">
                    {opponentEmote}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 relative">
                    <img
                      src={
                        gameMode === 'ai'
                          ? AI_PERSONALITIES[aiDifficulty].avatar
                          : onlineOpponent
                          ? 'https://api.dicebear.com/7.x/bottts/svg?seed=OnlineRival'
                          : 'https://api.dicebear.com/7.x/bottts/svg?seed=BlackPlayer'
                      }
                      alt="Opponent"
                      className="w-full h-full object-cover"
                    />
                    {isAiThinking && (
                      <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-100">
                        {gameMode === 'ai'
                          ? AI_PERSONALITIES[aiDifficulty].name
                          : onlineOpponent
                          ? onlineOpponent.name
                          : 'Pemain Hitam (Black)'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {gameMode === 'ai'
                          ? `Rating ${AI_PERSONALITIES[aiDifficulty].rating}`
                          : onlineOpponent
                          ? `Rating ${onlineOpponent.rating}`
                          : '1500'}
                      </span>
                    </div>

                    {/* Captured pieces tray */}
                    <div className="flex items-center gap-1 mt-1 min-h-[18px]">
                      {whiteCaptures.map((p, idx) => (
                        <div key={idx} className="w-4 h-4 opacity-80">
                          <PieceIcon piece={p} skinId={playerStats.equippedPieceSkin} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Energy Meter if Evolution Mode */}
                  {gameMode === 'evolution' && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-bold text-amber-400">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {blackSP}/10 SP
                    </div>
                  )}

                  {/* Timer */}
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                      turn === 'black'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(blackTime)}
                  </div>
                </div>
              </div>

              {/* The Chess Board Component Container with Floating Combat FX */}
              <div className="relative w-full max-w-[540px]">
                <ChessBoard
                  board={board}
                  selectedPos={selectedPos}
                  validMoves={validMoves}
                  abilityTargets={abilityTargets}
                  lastMove={lastMove}
                  kingInCheckPos={kingInCheckPos}
                  boardSkinId={playerStats.equippedBoardSkin}
                  pieceSkinId={playerStats.equippedPieceSkin}
                  playerColor="white"
                  onSquareClick={handleSquareClick}
                  pendingPromotion={pendingPromotion}
                  onPromote={(choice) => {
                    if (pendingPromotion) {
                      makeBoardMove(pendingPromotion.from, pendingPromotion.to, choice);
                    }
                  }}
                />
                <FloatingCombatText alerts={combatAlerts} />
              </div>

              {/* Player (White) HUD Card */}
              <div
                className={`w-full max-w-[540px] flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border relative transition-all ${
                  turn === 'white'
                    ? 'bg-slate-900 border-cyan-500/60 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                {/* Player Speech Bubble Emote */}
                {playerEmote && (
                  <div className="absolute -top-10 left-12 bg-amber-400 text-slate-950 font-bold text-xs py-1 px-3 rounded-xl shadow-lg border border-amber-200 animate-bounce z-30">
                    {playerEmote}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 relative">
                    <img
                      src="/src/assets/images/avatar_grandmaster_1793271847778.jpg"
                      alt="Player"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-100">
                        Komandan Anda (Putih)
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400">
                        Tingkat {playerStats.level} · Rating {playerStats.rankPoints}
                      </span>
                    </div>

                    {/* Captured pieces tray */}
                    <div className="flex items-center gap-1 mt-1 min-h-[18px]">
                      {blackCaptures.map((p, idx) => (
                        <div key={idx} className="w-4 h-4 opacity-80">
                          <PieceIcon piece={p} skinId={playerStats.equippedPieceSkin} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Emote Button */}
                  <EmoteWheel onSendEmote={handleSendEmote} />

                  {/* Energy Meter if Evolution Mode */}
                  {gameMode === 'evolution' && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-bold text-amber-400">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {whiteSP}/10 SP
                    </div>
                  )}

                  {/* Timer */}
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                      turn === 'white'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(whiteTime)}
                  </div>
                </div>
              </div>

              {/* Ultimate Awakening Overdrive Gauge */}
              {gameMode === 'evolution' && (
                <div className="w-full max-w-[540px] bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shrink-0">
                      <Flame className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                        <span>Awakening Overdrive</span>
                        <span className="font-mono text-yellow-400">{whiteAwakening}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-300"
                          style={{ width: `${whiteAwakening}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={whiteAwakening < 100 || turn !== 'white'}
                    onClick={() => handleTriggerAwakening('white')}
                    className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${
                      whiteAwakening >= 100 && turn === 'white'
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 animate-pulse hover:scale-105 active:scale-95'
                        : 'bg-slate-800 text-slate-600 border border-slate-700/50 cursor-not-allowed'
                    }`}
                  >
                    {whiteAwakening >= 100 ? '🔥 Overdrive!' : 'Isi Meter'}
                  </button>
                </div>
              )}

              {/* Special Ability Control Panel (In Evolution or AI Mode) */}
              {(gameMode === 'evolution' || gameMode === 'ai') && (
                <div className="w-full max-w-[540px]">
                  <AbilityPanel
                    selectedPiece={selectedPiece}
                    selectedPos={selectedPos}
                    currentSP={currentSP}
                    activeAbilityId={activeAbility ? activeAbility.id : null}
                    isPlayerTurn={gameMode === 'ai' ? turn === 'white' : true}
                    onSelectAbility={handleSelectAbility}
                    onCancelAbility={() => {
                      setActiveAbility(null);
                      setAbilityTargets([]);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Move Notation, Formation Synergies, Quick Action Tools */}
            <div className="lg:col-span-4 space-y-4">
              {/* Quick Game Action Bar */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2">
                <button
                  onClick={handleResetGame}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Atur Ulang
                </button>

                <button
                  onClick={handleResign}
                  disabled={gameOver}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Flag className="w-3.5 h-3.5" /> Menyerah
                </button>
              </div>

              {/* Active Formation Synergies Bar (Keunggulan Taktis Baru) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    Sinergi Formasi Aktif
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Pasukan Putih
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      🐎 Kavaleri Ksatria ({livingWhiteKnights} Kuda)
                    </span>
                    <span className="text-[11px] font-bold text-amber-400">
                      {livingWhiteKnights >= 1 ? '+15% Mobilitas' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      🔮 Oraculum Kembar ({livingWhiteBishops} Gajah)
                    </span>
                    <span className="text-[11px] font-bold text-purple-400">
                      {livingWhiteBishops >= 2 ? '+1 SP / 3 Turn' : '1 Gajah Aktif'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      🛡️ Benteng Pelopor ({livingWhitePawns} Pion)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400">
                      {livingWhitePawns >= 4 ? 'Formasi Kokoh' : 'Menipis'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Move History / Algebraic Notation Log */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Catatan Notasi Langkah
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {moveHistory.length} langkah
                  </span>
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1 font-mono text-xs pr-1">
                  {moveHistory.length === 0 ? (
                    <div className="py-4 text-center text-slate-500 text-[11px] font-sans">
                      Langkah bidak akan tercatat di sini.
                    </div>
                  ) : (
                    moveHistory.map((mv, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-2 py-1 rounded-lg ${
                          idx % 2 === 0 ? 'bg-slate-800/40' : 'bg-transparent'
                        }`}
                      >
                        <span className="text-slate-500 w-8">{idx + 1}.</span>
                        <span className="font-semibold text-slate-200 flex-1">{mv}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Daily Puzzle & Rewarded Ad Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setIsPuzzleOpen(true)}
                  className="p-3 rounded-2xl bg-gradient-to-br from-yellow-950/40 to-slate-900 border border-yellow-500/40 text-left hover:border-yellow-400 transition-colors cursor-pointer"
                >
                  <Lightbulb className="w-5 h-5 text-yellow-400 mb-1.5" />
                  <div className="font-bold text-xs text-slate-100">
                    Teka-Teki Taktis
                  </div>
                  <div className="text-[10px] text-yellow-300/80">
                    Hadiah +500 Koin
                  </div>
                </button>

                <button
                  onClick={() => setIsRewardedAdOpen(true)}
                  className="p-3 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/40 text-left hover:border-cyan-400 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-cyan-400 mb-1.5" />
                  <div className="font-bold text-xs text-slate-100">
                    Putaran Hadiah
                  </div>
                  <div className="text-[10px] text-cyan-300/80">
                    +250 Koin Gratis
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ShopModal
        stats={playerStats}
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onUpdateStats={(newStats) => setPlayerStats((prev) => ({ ...prev, ...newStats }))}
        onShowRewardedAd={() => {
          setIsShopOpen(false);
          setIsRewardedAdOpen(true);
        }}
      />

      <RewardedAdModal
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        onRewardClaimed={handleRewardClaimed}
      />

      <CodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        language={playerStats.language}
      />

      <QuestsModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        quests={quests}
        onClaimQuest={handleClaimQuest}
        stats={playerStats}
      />

      <MultiplayerModal
        isOpen={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
        onStartOnlineMatch={handleStartOnlineMatch}
      />

      <PuzzleModal
        isOpen={isPuzzleOpen}
        onClose={() => setIsPuzzleOpen(false)}
        onSolvePuzzle={handleSolvePuzzleReward}
      />

      <VictoryModal
        isOpen={isVictoryOpen}
        winner={winner}
        reason={gameEndReason}
        totalMoves={moveHistory.length}
        whiteCapturesCount={whiteCaptures.length}
        blackCapturesCount={blackCaptures.length}
        onPlayAgain={handleResetGame}
        onClose={() => setIsVictoryOpen(false)}
      />
    </div>
  );
}
