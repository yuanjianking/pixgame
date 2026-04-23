// OpeningBook.ts
import openingBookJson from './openingBook.json';

interface Piece {
  type: string;
  color: 'r' | 'b';
}

interface OpeningBookMove {
  from: [number, number];
  to: [number, number];
  chineseNotation: string;
  priority: number;
  description: string;
  moveNumber: number;
}

// 宽松的 nextResponses 类型 - 使用 Record<string, unknown> 然后转换
interface RawNextResponse {
  moveNumber: number;
  from: number[];
  to: number[];
  notation: string;
  priority: number;
  description: string;
  nextResponses?: Record<string, RawNextResponse>;
}



// 转换后的类型
interface NextResponse {
  moveNumber: number;
  from: [number, number];
  to: [number, number];
  notation: string;
  priority: number;
  description: string;
  nextResponses?: Record<string, NextResponse>;
}

interface OpeningResponse {
  moveNumber: number;
  from: [number, number];
  to: [number, number];
  notation: string;
  priority: number;
  description: string;
  nextResponses?: Record<string, NextResponse>;
}

interface OpeningData {
  name: string;
  firstMove: {
    from: [number, number];
    to: [number, number];
    notation: string;
  };
  responses: OpeningResponse[];
}

function toTuple(pair: number[]): [number, number] {
  return [pair[0], pair[1]];
}

// 类型守卫：检查对象是否是有效的 RawNextResponse
function isRawNextResponse(obj: unknown): obj is RawNextResponse {
  if (!obj || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;
  return typeof candidate.moveNumber === 'number' &&
         Array.isArray(candidate.from) &&
         Array.isArray(candidate.to) &&
         typeof candidate.notation === 'string' &&
         typeof candidate.priority === 'number' &&
         typeof candidate.description === 'string';
}

class OpeningBook {
  private book: Map<string, OpeningData> = new Map();
  private maxOpeningMoves: number = 4;
  private lastRedMove: string = '';

  constructor() {
    this.loadFromJson();
  }

  private loadFromJson() {
    // 使用类型断言，因为 JSON 结构是正确的
    const jsonData = openingBookJson as {
      maxOpeningMoves: number;
      openings: Record<string, {
        name: string;
        firstMove: { from: number[]; to: number[]; notation: string };
        responses: Array<{
          moveNumber: number;
          from: number[];
          to: number[];
          notation: string;
          priority: number;
          description: string;
          nextResponses?: Record<string, unknown>;
        }>;
      }>;
    };

    this.maxOpeningMoves = jsonData.maxOpeningMoves;

    for (const [key, value] of Object.entries(jsonData.openings)) {
      // 转换 firstMove
      const convertedFirstMove = {
        from: toTuple(value.firstMove.from),
        to: toTuple(value.firstMove.to),
        notation: value.firstMove.notation
      };

      // 转换 responses
      const convertedResponses: OpeningResponse[] = value.responses.map((response) => {
        const converted: OpeningResponse = {
          moveNumber: response.moveNumber,
          from: toTuple(response.from),
          to: toTuple(response.to),
          notation: response.notation,
          priority: response.priority,
          description: response.description
        };

        // 转换 nextResponses
        if (response.nextResponses) {
          converted.nextResponses = {};
          for (const [moveKey, moveValue] of Object.entries(response.nextResponses)) {
            if (isRawNextResponse(moveValue)) {
              converted.nextResponses[moveKey] = {
                moveNumber: moveValue.moveNumber,
                from: toTuple(moveValue.from),
                to: toTuple(moveValue.to),
                notation: moveValue.notation,
                priority: moveValue.priority,
                description: moveValue.description,
                nextResponses: moveValue.nextResponses
                  ? this.convertNextResponses(moveValue.nextResponses)
                  : undefined
              };
            }
          }
        }

        return converted;
      });

      this.book.set(key, {
        name: value.name,
        firstMove: convertedFirstMove,
        responses: convertedResponses
      });
    }

    console.log(`开局库加载完成，共 ${this.book.size} 个开局类型`);
  }

  private convertNextResponses(responses: Record<string, RawNextResponse>): Record<string, NextResponse> {
    const converted: Record<string, NextResponse> = {};
    for (const [moveKey, moveValue] of Object.entries(responses)) {
      converted[moveKey] = {
        moveNumber: moveValue.moveNumber,
        from: toTuple(moveValue.from),
        to: toTuple(moveValue.to),
        notation: moveValue.notation,
        priority: moveValue.priority,
        description: moveValue.description,
        nextResponses: moveValue.nextResponses
          ? this.convertNextResponses(moveValue.nextResponses)
          : undefined
      };
    }
    return converted;
  }

  setMaxOpeningMoves(moves: number) {
    this.maxOpeningMoves = moves;
  }

  recordRedMove(notation: string) {
    this.lastRedMove = notation;
  }

  resetHistory() {
    this.lastRedMove = '';
  }

  detectOpening(board: (Piece | null)[][]): string {
    if (this.isCenterCannon(board)) return "center_cannon";
    if (this.isPawnAdvance(board)) return "pawn_advance";
    if (this.isElephant(board)) return "elephant";
    if (this.isHorseOpening(board)) return "horse_opening";
    if (this.isPalaceCannon(board)) return "palace_cannon";
    if (this.isCornerCannon(board)) return "corner_cannon";
    if (this.isHookCannon(board)) return "hook_cannon";
    return "unknown";
  }

  getBestResponse(openingType: string, moveCount: number): OpeningBookMove | null {
    const openingData = this.book.get(openingType);
    if (!openingData) return null;

    if (moveCount === 1) {
      const bestResponse = [...openingData.responses].sort((a, b) => b.priority - a.priority)[0];
      return {
        from: bestResponse.from,
        to: bestResponse.to,
        chineseNotation: bestResponse.notation,
        priority: bestResponse.priority,
        description: bestResponse.description,
        moveNumber: bestResponse.moveNumber
      };
    }

    if (moveCount === 3 && this.lastRedMove) {
      for (const response of openingData.responses) {
        if (response.nextResponses && response.nextResponses[this.lastRedMove]) {
          const nextResponse = response.nextResponses[this.lastRedMove];
          return {
            from: nextResponse.from,
            to: nextResponse.to,
            chineseNotation: nextResponse.notation,
            priority: nextResponse.priority,
            description: nextResponse.description,
            moveNumber: nextResponse.moveNumber
          };
        }
      }
    }

    return null;
  }

  getOpeningDescription(openingType: string): string {
    const openingData = this.book.get(openingType);
    if (openingData) {
      return `${openingData.name} - 黑方应以开局库应对`;
    }
    return "未知开局 - 使用默认出子";
  }

  shouldUseOpeningBook(moveCount: number): boolean {
    return moveCount <= this.maxOpeningMoves;
  }

  // ========== 开局检测方法 ==========

  private isCenterCannon(board: (Piece | null)[][]): boolean {
    const leftCannon = board[7][5]?.type === "cannon" && board[7][5]?.color === "r";
    const rightCannon = board[7][3]?.type === "cannon" && board[7][3]?.color === "r";
    const leftOriginal = board[7][7] === null;
    const rightOriginal = board[7][1] === null;
    return (leftCannon && leftOriginal) || (rightCannon && rightOriginal);
  }

  private isPawnAdvance(board: (Piece | null)[][]): boolean {
    const pawnPositions = [[6, 0], [6, 2], [6, 4], [6, 6], [6, 8]];
    for (const [row, col] of pawnPositions) {
      if (board[row][col] === null) {
        const forwardRow = row - 1;
        if (forwardRow >= 0 && board[forwardRow][col]?.type === "pawn" && board[forwardRow][col]?.color === "r") {
          return true;
        }
      }
    }
    return false;
  }

  private isElephant(board: (Piece | null)[][]): boolean {
    const elephantAtCenter = board[7][4]?.type === "bishop" && board[7][4]?.color === "r";
    const leftOriginal = board[9][2] === null;
    const rightOriginal = board[9][6] === null;
    return elephantAtCenter && (leftOriginal || rightOriginal);
  }

  private isHorseOpening(board: (Piece | null)[][]): boolean {
    const leftKnight = (board[7][2]?.type === "knight" && board[7][2]?.color === "r") ||
                       (board[7][0]?.type === "knight" && board[7][0]?.color === "r");
    const leftOriginal = board[9][1] === null;
    const rightKnight = (board[7][6]?.type === "knight" && board[7][6]?.color === "r") ||
                        (board[7][8]?.type === "knight" && board[7][8]?.color === "r");
    const rightOriginal = board[9][7] === null;
    return (leftKnight && leftOriginal) || (rightKnight && rightOriginal);
  }

  private isPalaceCannon(board: (Piece | null)[][]): boolean {
    const cannonAtFour = board[7][4]?.type === "cannon" && board[7][4]?.color === "r";
    const cannonOriginal = board[7][7] === null;
    return cannonAtFour && cannonOriginal;
  }

  private isCornerCannon(board: (Piece | null)[][]): boolean {
    const cannonAtThree = board[7][3]?.type === "cannon" && board[7][3]?.color === "r";
    const cannonOriginal = board[7][7] === null;
    return cannonAtThree && cannonOriginal;
  }

  private isHookCannon(board: (Piece | null)[][]): boolean {
    const cannonAtZero = board[7][0]?.type === "cannon" && board[7][0]?.color === "r";
    const cannonOriginal = board[7][7] === null;
    return cannonAtZero && cannonOriginal;
  }
}

// 导出单例
export const openingBook = new OpeningBook();