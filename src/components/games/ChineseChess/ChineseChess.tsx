// ChineseChess.tsx
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import './ChineseChess.css';

interface Piece {
  type: string;
  color: 'r' | 'b';
}

interface Move {
  from: { row: number; col: number };
  to: { row: number; col: number };
  piece: Piece;
}

const BOARD_COLS = 9;
const BOARD_ROWS = 10;
const CELL_SIZE = 70;
const PADDING = 50;

// 初始化棋盘
const initBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));

  // 黑方（上方）
  board[0][0] = { type: 'rook', color: 'b' };
  board[0][8] = { type: 'rook', color: 'b' };
  board[0][1] = { type: 'knight', color: 'b' };
  board[0][7] = { type: 'knight', color: 'b' };
  board[0][2] = { type: 'bishop', color: 'b' };
  board[0][6] = { type: 'bishop', color: 'b' };
  board[0][3] = { type: 'guard', color: 'b' };
  board[0][5] = { type: 'guard', color: 'b' };
  board[0][4] = { type: 'king', color: 'b' };
  board[2][1] = { type: 'cannon', color: 'b' };
  board[2][7] = { type: 'cannon', color: 'b' };
  for (let j = 0; j < 5; j++) board[3][2 * j] = { type: 'pawn', color: 'b' };

  // 红方（下方）
  board[9][0] = { type: 'rook', color: 'r' };
  board[9][8] = { type: 'rook', color: 'r' };
  board[9][1] = { type: 'knight', color: 'r' };
  board[9][7] = { type: 'knight', color: 'r' };
  board[9][2] = { type: 'bishop', color: 'r' };
  board[9][6] = { type: 'bishop', color: 'r' };
  board[9][3] = { type: 'guard', color: 'r' };
  board[9][5] = { type: 'guard', color: 'r' };
  board[9][4] = { type: 'king', color: 'r' };
  board[7][1] = { type: 'cannon', color: 'r' };
  board[7][7] = { type: 'cannon', color: 'r' };
  for (let j = 0; j < 5; j++) board[6][2 * j] = { type: 'pawn', color: 'r' };

  return board;
};

const copyBoard = (board: (Piece | null)[][]) => {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
};

const findKing = (board: (Piece | null)[][], color: 'r' | 'b'): [number, number] | null => {
  for (let i = 0; i < BOARD_ROWS; i++) {
    for (let j = 0; j < BOARD_COLS; j++) {
      const p = board[i][j];
      if (p && p.type === 'king' && p.color === color) return [i, j];
    }
  }
  return null;
};

const ChineseChess: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isAiMovingRef = useRef(false);
  const transpositionTable = useRef<Map<string, { depth: number; score: number }>>(new Map());
  const killerMoves = useRef<Map<number, Move[]>>(new Map());
  const historyTable = useRef<Map<string, number>>(new Map());

  // Game state
  const [currentTurn, setCurrentTurn] = useState<'r' | 'b'>('r');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'r' | 'b' | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number; piece: Piece } | null>(null);
  const [gameBoard, setGameBoard] = useState<(Piece | null)[][]>(() => copyBoard(initBoard()));
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([]);

  const BOARD_WIDTH = (BOARD_COLS - 1) * CELL_SIZE;
  const BOARD_HEIGHT = (BOARD_ROWS - 1) * CELL_SIZE;
  const WIDTH = BOARD_WIDTH + PADDING * 2;
  const HEIGHT = BOARD_HEIGHT + PADDING * 2;
  const radius = 28;

  const getX = useCallback((col: number) => PADDING + col * CELL_SIZE, []);
  const getY = useCallback((row: number) => PADDING + row * CELL_SIZE, []);

  // 棋子价值表
  const pieceValue = useMemo(() => ({
    'king': 9000, 'rook': 500, 'knight': 120,
    'bishop': 120, 'guard': 100, 'cannon': 105, 'pawn': 30
  } as Record<string, number>), []);

  // 棋子位置价值表
  const pawnPositionBlack = useMemo(() => [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 15, 20, 25, 20, 15, 10, 5],
    [10, 15, 20, 25, 30, 25, 20, 15, 10],
    [15, 20, 25, 30, 35, 30, 25, 20, 15],
    [10, 15, 20, 25, 30, 25, 20, 15, 10],
    [5, 10, 15, 20, 25, 20, 15, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ], []);

  const pawnPositionRed = useMemo(() => [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 15, 20, 25, 20, 15, 10, 5],
    [10, 15, 20, 25, 30, 25, 20, 15, 10],
    [15, 20, 25, 30, 35, 30, 25, 20, 15],
    [10, 15, 20, 25, 30, 25, 20, 15, 10],
    [5, 10, 15, 20, 25, 20, 15, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ], []);

  const knightPosition = useMemo(() => [
    [10, 10, 10, 10, 10, 10, 10, 10, 10],
    [15, 20, 20, 20, 20, 20, 20, 20, 15],
    [15, 25, 30, 30, 30, 30, 30, 25, 15],
    [15, 25, 30, 35, 35, 35, 30, 25, 15],
    [10, 20, 25, 30, 30, 30, 25, 20, 10],
    [10, 15, 20, 25, 25, 25, 20, 15, 10],
    [5, 10, 15, 20, 20, 20, 15, 10, 5],
    [0, 5, 10, 15, 15, 15, 10, 5, 0],
    [0, 0, 5, 10, 10, 10, 5, 0, 0],
    [0, 0, 0, 5, 5, 5, 0, 0, 0]
  ], []);

  const cannonPosition = useMemo(() => [
    [5, 5, 5, 5, 5, 5, 5, 5, 5],
    [8, 10, 10, 10, 10, 10, 10, 10, 8],
    [8, 12, 15, 15, 15, 15, 15, 12, 8],
    [8, 12, 15, 20, 25, 20, 15, 12, 8],
    [5, 8, 12, 15, 20, 15, 12, 8, 5],
    [5, 8, 12, 15, 20, 15, 12, 8, 5],
    [3, 5, 8, 10, 15, 10, 8, 5, 3],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ], []);

  const rookPosition = useMemo(() => [
    [20, 18, 16, 14, 12, 14, 16, 18, 20],
    [18, 16, 14, 12, 10, 12, 14, 16, 18],
    [16, 14, 12, 10, 8, 10, 12, 14, 16],
    [14, 12, 10, 8, 6, 8, 10, 12, 14],
    [12, 10, 8, 6, 4, 6, 8, 10, 12],
    [10, 8, 6, 4, 2, 4, 6, 8, 10],
    [8, 6, 4, 2, 0, 2, 4, 6, 8],
    [6, 4, 2, 0, -2, 0, 2, 4, 6],
    [4, 2, 0, -2, -4, -2, 0, 2, 4],
    [2, 0, -2, -4, -6, -4, -2, 0, 2]
  ], []);

  const getPieceSymbol = useCallback((piece: Piece) => {
    const map: Record<string, Record<string, string>> = {
      'rook': { b: '車', r: '車' }, 'knight': { b: '馬', r: '馬' },
      'bishop': { b: '象', r: '相' }, 'guard': { b: '士', r: '士' },
      'king': { b: '將', r: '帥' }, 'cannon': { b: '炮', r: '炮' },
      'pawn': { b: '卒', r: '兵' }
    };
    return map[piece.type][piece.color];
  }, []);

  const inPalace = useCallback((row: number, col: number, color: 'r' | 'b') => {
    if (color === 'r') return row >= 7 && row <= 9 && col >= 3 && col <= 5;
    return row >= 0 && row <= 2 && col >= 3 && col <= 5;
  }, []);

  const isValidBishop = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number, color: 'r' | 'b', board: (Piece | null)[][]) => {
    if (Math.abs(toRow - fromRow) !== 2 || Math.abs(toCol - fromCol) !== 2) return false;
    const midRow = (fromRow + toRow) / 2;
    const midCol = (fromCol + toCol) / 2;
    if (board[midRow][midCol] !== null) return false;
    if (color === 'r') return toRow >= 5;
    return toRow <= 4;
  }, []);

  const isKnightBlocked = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number, board: (Piece | null)[][]) => {
    const dr = toRow - fromRow;
    const dc = toCol - fromCol;
    if (Math.abs(dr) === 2 && Math.abs(dc) === 1) {
      const legRow = fromRow + dr / 2;
      return board[legRow][fromCol] === null;
    } else if (Math.abs(dr) === 1 && Math.abs(dc) === 2) {
      const legCol = fromCol + dc / 2;
      return board[fromRow][legCol] === null;
    }
    return false;
  }, []);

  const isValidCannon = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number, board: (Piece | null)[][]) => {
    const target = board[toRow][toCol];
    if (fromRow === toRow) {
      const step = fromCol < toCol ? 1 : -1;
      let cnt = 0;
      for (let c = fromCol + step; c !== toCol; c += step) {
        if (board[fromRow][c] !== null) cnt++;
      }
      if (!target) return cnt === 0;
      return cnt === 1;
    } else if (fromCol === toCol) {
      const step = fromRow < toRow ? 1 : -1;
      let cnt = 0;
      for (let r = fromRow + step; r !== toRow; r += step) {
        if (board[r][fromCol] !== null) cnt++;
      }
      if (!target) return cnt === 0;
      return cnt === 1;
    }
    return false;
  }, []);

  const isValidMoveBasic = useCallback((piece: Piece, fromRow: number, fromCol: number, toRow: number, toCol: number, board: (Piece | null)[][]) => {
    const target = board[toRow][toCol];
    if (target && target.color === piece.color) return false;

    const dr = toRow - fromRow;
    const dc = toCol - fromCol;
    const absDR = Math.abs(dr);
    const absDC = Math.abs(dc);

    switch (piece.type) {
      case 'king':
        if (absDR + absDC !== 1) return false;
        return inPalace(toRow, toCol, piece.color);
      case 'guard':
        if (!(absDR === 1 && absDC === 1)) return false;
        return inPalace(toRow, toCol, piece.color);
      case 'bishop':
        return isValidBishop(fromRow, fromCol, toRow, toCol, piece.color, board);
      case 'knight':
        if ((absDR === 2 && absDC === 1) || (absDR === 1 && absDC === 2)) {
          return isKnightBlocked(fromRow, fromCol, toRow, toCol, board);
        }
        return false;
      case 'rook':
        if (fromRow !== toRow && fromCol !== toCol) return false;
        if (fromRow === toRow) {
          const step = fromCol < toCol ? 1 : -1;
          for (let c = fromCol + step; c !== toCol; c += step) {
            if (board[fromRow][c] !== null) return false;
          }
        } else {
          const step = fromRow < toRow ? 1 : -1;
          for (let r = fromRow + step; r !== toRow; r += step) {
            if (board[r][fromCol] !== null) return false;
          }
        }
        return true;
      case 'cannon':
        return isValidCannon(fromRow, fromCol, toRow, toCol, board);
      case 'pawn': {
        const forward = piece.color === 'r' ? -1 : 1;
        const overRiver = piece.color === 'r' ? fromRow <= 4 : fromRow >= 5;
        if (absDR + absDC !== 1) return false;
        if (dr === forward && dc === 0) return true;
        if (overRiver && Math.abs(dc) === 1 && dr === 0) return true;
        return false;
      }
      default:
        return false;
    }
  }, [inPalace, isValidBishop, isKnightBlocked, isValidCannon]);

  const isFlyingKing = useCallback((board: (Piece | null)[][], color: 'r' | 'b') => {
    let kingPos: [number, number] | null = null;
    let oppKingPos: [number, number] | null = null;
    for (let i = 0; i < BOARD_ROWS; i++) {
      for (let j = 0; j < BOARD_COLS; j++) {
        const p = board[i][j];
        if (p && p.type === 'king' && p.color === color) kingPos = [i, j];
        if (p && p.type === 'king' && p.color !== color) oppKingPos = [i, j];
      }
    }
    if (!kingPos || !oppKingPos || kingPos[1] !== oppKingPos[1]) return false;
    const minR = Math.min(kingPos[0], oppKingPos[0]);
    const maxR = Math.max(kingPos[0], oppKingPos[0]);
    for (let r = minR + 1; r < maxR; r++) {
      if (board[r][kingPos[1]] !== null) return false;
    }
    return true;
  }, []);

  const isSquareAttacked = useCallback((board: (Piece | null)[][], row: number, col: number, color: 'r' | 'b') => {
    for (let i = 0; i < BOARD_ROWS; i++) {
      for (let j = 0; j < BOARD_COLS; j++) {
        const p = board[i][j];
        if (p && p.color !== color && isValidMoveBasic(p, i, j, row, col, board)) {
          return true;
        }
      }
    }
    return false;
  }, [isValidMoveBasic]);

  const isAfterMoveSafe = useCallback((board: (Piece | null)[][], fromRow: number, fromCol: number, toRow: number, toCol: number, color: 'r' | 'b') => {
    const newBoard = copyBoard(board);
    const piece = newBoard[fromRow][fromCol];
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    let kingRow = -1, kingCol = -1;
    for (let i = 0; i < BOARD_ROWS; i++) {
      for (let j = 0; j < BOARD_COLS; j++) {
        const p = newBoard[i][j];
        if (p && p.type === 'king' && p.color === color) {
          kingRow = i;
          kingCol = j;
          break;
        }
      }
    }
    if (kingRow === -1) return false;

    if (isSquareAttacked(newBoard, kingRow, kingCol, color)) return false;
    if (isFlyingKing(newBoard, color)) return false;
    return true;
  }, [isSquareAttacked, isFlyingKing]);

  const canMove = useCallback((piece: Piece, fromRow: number, fromCol: number, toRow: number, toCol: number, board: (Piece | null)[][]) => {
    if (!isValidMoveBasic(piece, fromRow, fromCol, toRow, toCol, board)) return false;
    return isAfterMoveSafe(board, fromRow, fromCol, toRow, toCol, piece.color);
  }, [isValidMoveBasic, isAfterMoveSafe]);

  const getValidMovesForPiece = useCallback((row: number, col: number, piece: Piece, board: (Piece | null)[][]) => {
    const moves: { row: number; col: number }[] = [];
    for (let i = 0; i < BOARD_ROWS; i++) {
      for (let j = 0; j < BOARD_COLS; j++) {
        if (canMove(piece, row, col, i, j, board)) {
          moves.push({ row: i, col: j });
        }
      }
    }
    return moves;
  }, [canMove]);

  const getAllMoves = useCallback((board: (Piece | null)[][], color: 'r' | 'b') => {
    const moves: Move[] = [];
    for (let i = 0; i < BOARD_ROWS; i++) {
      for (let j = 0; j < BOARD_COLS; j++) {
        const p = board[i][j];
        if (p && p.color === color) {
          for (let ti = 0; ti < BOARD_ROWS; ti++) {
            for (let tj = 0; tj < BOARD_COLS; tj++) {
              if (canMove(p, i, j, ti, tj, board)) {
                moves.push({ from: { row: i, col: j }, to: { row: ti, col: tj }, piece: p });
              }
            }
          }
        }
      }
    }
    return moves;
  }, [canMove]);

  // 局面哈希
  const boardHash = useCallback((board: (Piece | null)[][]) => {
    let hash = '';
    for (let i = 0; i < BOARD_ROWS; i++) {
      for (let j = 0; j < BOARD_COLS; j++) {
        const p = board[i][j];
        if (!p) hash += '00';
        else hash += p.type[0] + p.color + (p.type === 'pawn' ? (p.color === 'r' ? 'p' : 'P') : '');
      }
    }
    return hash;
  }, []);

  // 增强估值函数
  const evaluateBoardAdvanced = useCallback((board: (Piece | null)[][]) => {
    let score = 0;

    for (let i = 0; i < BOARD_ROWS; i++) {
      for (let j = 0; j < BOARD_COLS; j++) {
        const p = board[i][j];
        if (!p) continue;

        let value = pieceValue[p.type] || 0;

        if (p.type === 'pawn') {
          value += p.color === 'b' ? pawnPositionBlack[i][j] : pawnPositionRed[i][j];
          const crossed = p.color === 'r' ? i <= 4 : i >= 5;
          if (crossed) value *= 1.5;
        } else if (p.type === 'knight') {
          value += knightPosition[i][j];
        } else if (p.type === 'cannon') {
          value += cannonPosition[i][j];
        } else if (p.type === 'rook') {
          value += rookPosition[i][j];
        }

        if (p.color === 'b') score += value;
        else score -= value;
      }
    }

    const mobilityB = getAllMoves(board, 'b').length;
    const mobilityR = getAllMoves(board, 'r').length;
    score += (mobilityB - mobilityR) * 2;

    const redKing = findKing(board, 'r');
    const blackKing = findKing(board, 'b');
    if (redKing && isSquareAttacked(board, redKing[0], redKing[1], 'r')) score += 150;
    if (blackKing && isSquareAttacked(board, blackKing[0], blackKing[1], 'b')) score -= 150;

    return score;
  }, [pieceValue, pawnPositionBlack, pawnPositionRed, knightPosition, cannonPosition, rookPosition, getAllMoves, isSquareAttacked]);

  // 检查是否将军
  const isCheck = useCallback((board: (Piece | null)[][], color: 'r' | 'b') => {
    const kingPos = findKing(board, color);
    if (!kingPos) return false;
    return isSquareAttacked(board, kingPos[0], kingPos[1], color);
  }, [isSquareAttacked]);

  // 启发式排序
  const orderMoves = useCallback((moves: Move[], board: (Piece | null)[][], color: 'r' | 'b', depth: number = 0) => {
    return moves.sort((a, b) => {
      const targetA = board[a.to.row][a.to.col];
      const targetB = board[b.to.row][b.to.col];

      let scoreA = 0, scoreB = 0;
      if (targetA && targetA.color !== color) {
        scoreA = (pieceValue[targetA.type] || 0) * 10 - (pieceValue[a.piece.type] || 0);
      }
      if (targetB && targetB.color !== color) {
        scoreB = (pieceValue[targetB.type] || 0) * 10 - (pieceValue[b.piece.type] || 0);
      }

      const killers = killerMoves.current.get(depth) || [];
      const isKillerA = killers.some(k => k.from.row === a.from.row && k.from.col === a.from.col && k.to.row === a.to.row && k.to.col === a.to.col);
      const isKillerB = killers.some(k => k.from.row === b.from.row && k.from.col === b.from.col && k.to.row === b.to.row && k.to.col === b.to.col);
      if (isKillerA) scoreA += 5000;
      if (isKillerB) scoreB += 5000;

      const historyA = historyTable.current.get(`${a.from.row},${a.from.col}`) || 0;
      const historyB = historyTable.current.get(`${b.from.row},${b.from.col}`) || 0;
      scoreA += historyA;
      scoreB += historyB;

      return scoreB - scoreA;
    });
  }, [pieceValue]);

  // 静止搜索
  const quiescenceSearch = useCallback(function quiescenceSearch(
    board: (Piece | null)[][],
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    const standPat = evaluateBoardAdvanced(board);
    const currentEval = typeof standPat === 'number' && !isNaN(standPat) ? standPat : 0;

    if (isMaximizing) {
      if (currentEval >= beta) return beta;
    } else {
      if (currentEval <= alpha) return alpha;
    }

    const color = isMaximizing ? 'b' : 'r';
    let moves = getAllMoves(board, color).filter(m => board[m.to.row][m.to.col] !== null);
    moves = orderMoves(moves, board, color, 0);

    let newAlpha = alpha;
    let newBeta = beta;

    for (const move of moves.slice(0, 8)) {
      const newBoard = copyBoard(board);
      const piece = newBoard[move.from.row][move.from.col];
      newBoard[move.to.row][move.to.col] = piece;
      newBoard[move.from.row][move.from.col] = null;

      const score = quiescenceSearch(newBoard, newAlpha, newBeta, !isMaximizing);
      const validScore = typeof score === 'number' && !isNaN(score) ? score : currentEval;

      if (isMaximizing) {
        if (validScore >= newBeta) return newBeta;
        if (validScore > newAlpha) newAlpha = validScore;
      } else {
        if (validScore <= newAlpha) return newAlpha;
        if (validScore < newBeta) newBeta = validScore;
      }
    }

    return isMaximizing ? newAlpha : newBeta;
  }, [evaluateBoardAdvanced, getAllMoves, orderMoves]);

  // Minimax + Alpha-Beta + TT
  const minimax = useCallback(function minimax(
    board: (Piece | null)[][],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    const hash = boardHash(board);
    const ttEntry = transpositionTable.current.get(hash);

    if (ttEntry && ttEntry.depth >= depth) {
      return ttEntry.score;
    }

    if (depth === 0) {
      return quiescenceSearch(board, alpha, beta, isMaximizing);
    }

    const color = isMaximizing ? 'b' : 'r';
    let moves = getAllMoves(board, color);

    if (moves.length === 0) {
      return isMaximizing ? -100000 : 100000;
    }

    moves = orderMoves(moves, board, color, depth);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const newBoard = copyBoard(board);
        const piece = newBoard[move.from.row][move.from.col];
        newBoard[move.to.row][move.to.col] = piece;
        newBoard[move.from.row][move.from.col] = null;

        const evalScore = minimax(newBoard, depth - 1, alpha, beta, false);
        const validScore = typeof evalScore === 'number' && !isNaN(evalScore) ? evalScore : -100000;

        maxEval = Math.max(maxEval, validScore);
        alpha = Math.max(alpha, validScore);

        if (beta <= alpha) {
          const killers = killerMoves.current.get(depth) || [];
          if (!killers.some(k => k.from.row === move.from.row && k.to.row === move.to.row)) {
            killers.push(move);
            killerMoves.current.set(depth, killers.slice(0, 2));
          }
          const key = `${move.from.row},${move.from.col}`;
          historyTable.current.set(key, (historyTable.current.get(key) || 0) + depth * depth);
          break;
        }
      }
      const finalScore = typeof maxEval === 'number' && !isNaN(maxEval) ? maxEval : 0;
      transpositionTable.current.set(hash, { depth, score: finalScore });
      return finalScore;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const newBoard = copyBoard(board);
        const piece = newBoard[move.from.row][move.from.col];
        newBoard[move.to.row][move.to.col] = piece;
        newBoard[move.from.row][move.from.col] = null;

        const evalScore = minimax(newBoard, depth - 1, alpha, beta, true);
        const validScore = typeof evalScore === 'number' && !isNaN(evalScore) ? evalScore : 100000;

        minEval = Math.min(minEval, validScore);
        beta = Math.min(beta, validScore);

        if (beta <= alpha) {
          const killers = killerMoves.current.get(depth) || [];
          if (!killers.some(k => k.from.row === move.from.row && k.to.row === move.to.row)) {
            killers.push(move);
            killerMoves.current.set(depth, killers.slice(0, 2));
          }
          const key = `${move.from.row},${move.from.col}`;
          historyTable.current.set(key, (historyTable.current.get(key) || 0) + depth * depth);
          break;
        }
      }
      const finalScore = typeof minEval === 'number' && !isNaN(minEval) ? minEval : 0;
      transpositionTable.current.set(hash, { depth, score: finalScore });
      return finalScore;
    }
  }, [boardHash, getAllMoves, orderMoves, quiescenceSearch]);


  const getOpeningMove = (board: (Piece | null)[][]) => {
    // 默认
    let opening = "unknown";
    let detail = "";

    // === 中炮 ===
    const redCenterCannon =
      (board[7][3]?.type === "cannon" && board[7][3]?.color === "r") ||
      (board[7][5]?.type === "cannon" && board[7][5]?.color === "r");

    if (redCenterCannon && board[6][4]?.type !== "king") {
      opening = "center_cannon";
      detail = "中炮体系";
    }

    // === 仙人指路（只看兵推进，不用 or）===
    const pawnPush =
      [0, 2, 4, 6, 8].some((j) => board[6][j] === null);

    if (pawnPush && opening === "unknown") {
      opening = "pawn_advance";
      detail = "仙人指路";
    }

    // === 飞象（结构判断）===
    if (
      (board[9][2]?.type === "bishop" && board[7][4]?.type === "bishop") ||
      (board[9][6]?.type === "bishop" && board[7][4]?.type === "bishop")
    ) {
      if (opening === "unknown") {
        opening = "elephant";
        detail = "飞象局";
      }
    }

    // === 起马 ===
    if (
      (board[9][1]?.type === "knight" && board[7][2]?.type === "knight") ||
      (board[9][7]?.type === "knight" && board[7][6]?.type === "knight")
    ) {
      if (opening === "unknown") {
        opening = "horse_opening";
        detail = "起马局";
      }
    }

    return { opening, detail };
  };

  const getOpeningResponse = useCallback((board: (Piece | null)[][]) => {
    const moves = getAllMoves(board, "b");

    const { opening, detail } = getOpeningMove(board);

    // === 候选池（评分系统）===
    const candidates: {
      from: [number, number];
      to: [number, number];
      score: number;
    }[] = [];

    const add = (from: [number, number], to: [number, number], score: number) => {
      candidates.push({ from, to, score });
    };

    // =========================
    // 1. 中炮应对（稳定版）
    // =========================
    if (opening === "center_cannon") {
      add([0, 7], [2, 6], 100); // 马八进七
      add([0, 1], [2, 2], 100); // 马二进三
      add([2, 7], [3, 5], 95);  // 炮八平五
      add([2, 1], [3, 3], 95);
      add([3, 6], [4, 6], 90);  // 卒
    }

    // =========================
    // 2. 仙人指路
    // =========================
    if (opening === "pawn_advance") {
      add([2, 7], [3, 5], 100);
      add([2, 1], [3, 3], 95);
      add([0, 7], [2, 6], 90);
      add([3, 6], [4, 6], 85);
    }

    // =========================
    // 3. 飞象局
    // =========================
    if (opening === "elephant") {
      add([2, 7], [3, 5], 100);
      add([0, 7], [2, 6], 95);
      add([0, 1], [2, 2], 95);
    }

    // =========================
    // 4. 起马局
    // =========================
    if (opening === "horse_opening") {
      add([2, 7], [3, 5], 95);
      add([0, 7], [2, 6], 90);
      add([3, 6], [4, 6], 85);
    }

    // =========================
    // 5. 通用兜底（关键修复点）
    // =========================
    if (opening === "unknown") {
      add([0, 7], [2, 6], 80);
      add([0, 1], [2, 2], 80);
      add([2, 7], [3, 5], 75);
    }

    // =========================
    // 选择最佳 move（关键修复）
    // =========================
    let bestMove = null;
    let bestScore = -Infinity;

    for (const c of candidates) {
      const match = moves.find(
        (m) =>
          m.from.row === c.from[0] &&
          m.from.col === c.from[1] &&
          m.to.row === c.to[0] &&
          m.to.col === c.to[1]
      );

      if (match && c.score > bestScore) {
        bestScore = c.score;
        bestMove = match;
      }
    }

    if (bestMove) {
      console.log(`开局应对: ${detail || opening}, score=${bestScore}`);
      return bestMove;
    }

    return null;
  }, [getAllMoves]);

  // 获取最佳 AI 走法
  const getMasterAIMove = useCallback((board: (Piece | null)[][]) => {
    // ========== 第一优先级：开局应对策略 ==========
    const responseMove = getOpeningResponse(board);
    if (responseMove) {
      console.log("使用开局应对策略");
      return responseMove;
    }

    let bestMove: Move | null = null;
    let bestScore = -Infinity;

    transpositionTable.current.clear();

    const maxDepth = 3;
    const moves = orderMoves(getAllMoves(board, 'b'), board, 'b', 0);

    if (moves.length === 0) {
      return null;
    }

    for (const move of moves) {
      const newBoard = copyBoard(board);
      const piece = newBoard[move.from.row][move.from.col];
      newBoard[move.to.row][move.to.col] = piece;
      newBoard[move.from.row][move.from.col] = null;

      let score = minimax(newBoard, maxDepth - 1, -Infinity, Infinity, false);

      if (typeof score !== 'number' || isNaN(score)) {
        score = 0;
      }

      if (isCheck(newBoard, 'r')) {
        score += 500;
      }

      const target = board[move.to.row][move.to.col];
      if (target) {
        score += (pieceValue[target.type] || 0) * 0.5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }, [getAllMoves, orderMoves, isCheck, minimax, pieceValue]);

  const executeMove = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    if (gameOver) return false;
    const piece = gameBoard[fromRow][fromCol];
    if (!piece || piece.color !== currentTurn) return false;
    if (!canMove(piece, fromRow, fromCol, toRow, toCol, gameBoard)) return false;

    const newBoard = copyBoard(gameBoard);
    const captured = newBoard[toRow][toCol];
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;
    setGameBoard(newBoard);
    setValidMoves([]);
    setSelectedPiece(null);

    if (captured && captured.type === 'king') {
      setGameOver(true);
      setWinner(currentTurn);
      return true;
    }

    const nextTurn = currentTurn === 'r' ? 'b' : 'r';
    setCurrentTurn(nextTurn);

    setTimeout(() => {
      if (!gameOver) {
        const moves = getAllMoves(newBoard, nextTurn);
        if (moves.length === 0) {
          console.log(`${nextTurn === 'r' ? '红方' : '黑方'}无步可走，${nextTurn === 'r' ? '黑方' : '红方'}胜利！`);
          setGameOver(true);
          setWinner(nextTurn === 'r' ? 'b' : 'r');
        }
      }
    }, 50);

    return true;
  }, [gameOver, gameBoard, currentTurn, canMove, getAllMoves]);

  // AI 移动
  useEffect(() => {
    if (currentTurn === 'b' && !gameOver && !isAiMovingRef.current) {
      isAiMovingRef.current = true;

      // 使用 setTimeout 让 UI 有机会更新
      setTimeout(() => {
        const allMoves = getAllMoves(gameBoard, 'b');
        if (allMoves.length === 0) {
          console.log('黑方无步可走，红方胜利！');
          setGameOver(true);
          setWinner('r');
          setCurrentTurn('r');
          isAiMovingRef.current = false;
          return;
        }

        const move = getMasterAIMove(gameBoard);
        if (!move) {
          isAiMovingRef.current = false;
          return;
        }

        const newBoard = copyBoard(gameBoard);
        const captured = newBoard[move.to.row][move.to.col];
        const piece = newBoard[move.from.row][move.from.col];

        if (!piece) {
          isAiMovingRef.current = false;
          return;
        }

        newBoard[move.to.row][move.to.col] = piece;
        newBoard[move.from.row][move.from.col] = null;

        if (captured && captured.type === 'king') {
          setGameOver(true);
          setWinner('b');
        }

        setGameBoard(newBoard);
        setCurrentTurn('r');
        setValidMoves([]);
        setSelectedPiece(null);
        isAiMovingRef.current = false;
      }, 10);
    }
  }, [currentTurn, gameOver, getAllMoves, getMasterAIMove, gameBoard]);

  const resetGame = useCallback(() => {
    setGameBoard(copyBoard(initBoard()));
    setCurrentTurn('r');
    setSelectedPiece(null);
    setValidMoves([]);
    setGameOver(false);
    setWinner(null);
    isAiMovingRef.current = false;
    transpositionTable.current.clear();
    killerMoves.current.clear();
    historyTable.current.clear();
  }, []);

  // 绘制棋盘
  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = "#e7dbb0";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const riverTop = getY(4);
    const riverBottom = getY(5);
    const riverHeight = riverBottom - riverTop;

    const riverGradient = ctx.createLinearGradient(0, riverTop, 0, riverBottom);
    riverGradient.addColorStop(0, '#7cb5d6');
    riverGradient.addColorStop(0.5, '#5a9bc2');
    riverGradient.addColorStop(1, '#7cb5d6');
    ctx.fillStyle = riverGradient;
    ctx.fillRect(getX(0), riverTop, getX(BOARD_COLS - 1) - getX(0), riverHeight);

    ctx.beginPath();
    ctx.strokeStyle = '#ffffff80';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const waveY = riverTop + riverHeight * (0.25 + i * 0.25);
      ctx.beginPath();
      ctx.moveTo(getX(0), waveY);
      for (let x = 0; x <= BOARD_COLS - 1; x += 0.5) {
        const waveX = getX(x);
        const waveOffset = Math.sin(x * Math.PI * 1.5) * 3;
        ctx.lineTo(waveX, waveY + waveOffset);
      }
      ctx.stroke();
    }

    const blackPalaceTop = getY(0);
    const blackPalaceBottom = getY(2);
    const blackPalaceLeft = getX(3);
    const blackPalaceRight = getX(5);
    const blackPalaceWidth = blackPalaceRight - blackPalaceLeft;
    const blackPalaceHeight = blackPalaceBottom - blackPalaceTop;

    const blackPalaceGradient = ctx.createLinearGradient(
      blackPalaceLeft, blackPalaceTop,
      blackPalaceRight, blackPalaceBottom
    );
    blackPalaceGradient.addColorStop(0, '#c9a87b80');
    blackPalaceGradient.addColorStop(1, '#b8956a80');
    ctx.fillStyle = blackPalaceGradient;
    ctx.fillRect(blackPalaceLeft, blackPalaceTop, blackPalaceWidth, blackPalaceHeight);

    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(blackPalaceLeft, blackPalaceTop, blackPalaceWidth, blackPalaceHeight);

    const redPalaceTop = getY(7);
    const redPalaceBottom = getY(9);
    const redPalaceLeft = getX(3);
    const redPalaceRight = getX(5);
    const redPalaceWidth = redPalaceRight - redPalaceLeft;
    const redPalaceHeight = redPalaceBottom - redPalaceTop;

    const redPalaceGradient = ctx.createLinearGradient(
      redPalaceLeft, redPalaceTop,
      redPalaceRight, redPalaceBottom
    );
    redPalaceGradient.addColorStop(0, '#c9a87b80');
    redPalaceGradient.addColorStop(1, '#b8956a80');
    ctx.fillStyle = redPalaceGradient;
    ctx.fillRect(redPalaceLeft, redPalaceTop, redPalaceWidth, redPalaceHeight);

    ctx.strokeStyle = '#8b5a2b';
    ctx.strokeRect(redPalaceLeft, redPalaceTop, redPalaceWidth, redPalaceHeight);

    ctx.beginPath();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#2f2a1f";

    for (let i = 0; i < BOARD_ROWS; i++) {
      ctx.moveTo(getX(0), getY(i));
      ctx.lineTo(getX(BOARD_COLS - 1), getY(i));
      ctx.stroke();
    }

    for (let i = 0; i < BOARD_COLS; i++) {
      ctx.moveTo(getX(i), getY(0));
      ctx.lineTo(getX(i), getY(BOARD_ROWS - 1));
      ctx.stroke();
    }

    const riverCenterX = getX(4);
    const riverCenterY = (getY(4) + getY(5)) / 2;

    ctx.font = "bold 32px 'KaiTi'";
    ctx.fillStyle = "#f5e6c4";
    ctx.shadowBlur = 2;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.fillText("楚河", riverCenterX - 35, riverCenterY - 5);
    ctx.fillText("汉界", riverCenterX - 35, riverCenterY + 30);
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(getX(3), getY(0));
    ctx.lineTo(getX(5), getY(2));
    ctx.stroke();
    ctx.moveTo(getX(5), getY(0));
    ctx.lineTo(getX(3), getY(2));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(getX(3), getY(7));
    ctx.lineTo(getX(5), getY(9));
    ctx.stroke();
    ctx.moveTo(getX(5), getY(7));
    ctx.lineTo(getX(3), getY(9));
    ctx.stroke();

    ctx.fillStyle = "#8b5a2b80";
    ctx.beginPath();
    ctx.arc(getX(4), getY(1), 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(getX(4), getY(8), 4, 0, 2 * Math.PI);
    ctx.fill();
  }, [getX, getY, WIDTH, HEIGHT]);

  const drawPieces = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (validMoves.length > 0 && selectedPiece) {
      for (const move of validMoves) {
        const x = getX(move.col);
        const y = getY(move.row);
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.4, 0, 2 * Math.PI);
        ctx.fillStyle = '#4caf50';
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = '#4caf5080';
        ctx.fill();
      }
    }

    for (let i = 0; i < BOARD_ROWS; i++) {
      for (let j = 0; j < BOARD_COLS; j++) {
        const p = gameBoard[i][j];
        if (!p) continue;

        const x = getX(j);
        const y = getY(i);

        ctx.shadowBlur = 3;
        ctx.shadowColor = "rgba(0,0,0,0.3)";

        const grad = ctx.createRadialGradient(x - 6, y - 6, 5, x, y, radius);
        grad.addColorStop(0, p.color === 'r' ? '#e33c3c' : '#4a4a4a');
        grad.addColorStop(1, p.color === 'r' ? '#a12222' : '#2a2a2a');

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = p.color === 'r' ? "#ffcc88" : "#dddddd";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = `bold ${radius - 6}px "KaiTi"`;
        ctx.fillStyle = p.color === 'r' ? "#fff5cc" : "#f0f0f0";
        ctx.shadowBlur = 1;
        ctx.fillText(getPieceSymbol(p), x - 12, y + 9);

        ctx.beginPath();
        ctx.arc(x - 5, y - 5, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;

    if (selectedPiece) {
      const x = getX(selectedPiece.col);
      const y = getY(selectedPiece.row);
      ctx.beginPath();
      ctx.arc(x, y, radius + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }, [gameBoard, getPieceSymbol, selectedPiece, getX, getY, validMoves]);

  const drawFullBoard = useCallback(() => {
    drawBoard();
    drawPieces();
    if (gameOver && winner) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.font = "bold 32px monospace";
      ctx.fillStyle = "#ffef80";
      ctx.shadowBlur = 0;
      ctx.fillText(winner === 'r' ? "红方胜利!" : "AI胜利!", getX(3.5), getY(5));
    }
  }, [drawBoard, drawPieces, gameOver, winner, getX, getY]);

  const handleCanvasClick = useCallback(async (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (gameOver || currentTurn !== 'r') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    if (canvasX < PADDING - radius || canvasX > WIDTH - PADDING + radius ||
        canvasY < PADDING - radius || canvasY > HEIGHT - PADDING + radius) return;

    const col = Math.round((canvasX - PADDING) / CELL_SIZE);
    const row = Math.round((canvasY - PADDING) / CELL_SIZE);
    if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) return;

    const piece = gameBoard[row][col];

    if (selectedPiece !== null) {
      if (selectedPiece.row === row && selectedPiece.col === col) {
        setSelectedPiece(null);
        setValidMoves([]);
        drawFullBoard();
        return;
      }

      if (piece && piece.color === 'r') {
        setSelectedPiece({ row, col, piece });
        const moves = getValidMovesForPiece(row, col, piece, gameBoard);
        setValidMoves(moves);
        drawFullBoard();
        return;
      }

      const success = executeMove(selectedPiece.row, selectedPiece.col, row, col);
      if (success) {
        drawFullBoard();
      } else {
        setSelectedPiece(null);
        setValidMoves([]);
        drawFullBoard();
      }
      return;
    }

    if (piece && piece.color === 'r') {
      setSelectedPiece({ row, col, piece });
      const moves = getValidMovesForPiece(row, col, piece, gameBoard);
      setValidMoves(moves);
      drawFullBoard();
    }
  }, [gameOver, currentTurn, gameBoard, selectedPiece, executeMove, drawFullBoard, getValidMovesForPiece, WIDTH, HEIGHT, radius]);

  useEffect(() => {
    if (gameBoard.length > 0) {
      drawFullBoard();
    }
  }, [drawFullBoard, gameBoard, selectedPiece, currentTurn, gameOver, validMoves]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleCanvasClick(e);
  }, [handleCanvasClick]);

  return (
    <div className="chess-wrapper">
      <div className="chess-container">
        <div className="chess-header">
          <div className="chess-stats">
            <div className="chess-turn">
              {gameOver ? (winner === 'r' ? "🏆 红方胜利！🏆" : "🏆 黑方AI胜利！🏆") : (currentTurn === 'r' ? "🔴 红方走子" : "🤔 AI 深度思考中...")}
            </div>
            <div className="chess-status">
              {currentTurn === 'r' ? "🐉 红方执帅 · 挑战AI" : "🤖 大师级AI · 深度搜索"}
            </div>
          </div>
          <button onClick={resetGame} className="chess-reset-btn">⚡ 新的一局</button>
        </div>
        <div className="chess-canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="chess-canvas"
            style={{ display: 'block', margin: '0 auto' }}
            onClick={handleCanvasClick}
            onTouchStart={handleTouchStart}
          />
        </div>
        <div className="chess-footer">
           <div className="chess-instructions">🧠 红方(你) vs AI | 点击棋子 + 落子 | AI 智能选择最优走法</div>
        </div>
      </div>
    </div>
  );
};

export default ChineseChess;