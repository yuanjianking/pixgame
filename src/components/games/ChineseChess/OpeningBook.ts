// OpeningBook.ts

// 定义 Piece 接口（与 ChineseChess.tsx 中保持一致）
interface Piece {
  type: string;
  color: 'r' | 'b';
}

interface OpeningBookMove {
  from: [number, number];
  to: [number, number];
  chineseNotation: string;
  priority: number; // 0-100
  description: string;
}

class OpeningBook {
  private book: Map<string, OpeningBookMove[]> = new Map();
  private maxOpeningMoves: number = 12; // 前12步使用开局库

  constructor() {
    this.loadAllOpenings();
  }

  // 设置最多使用多少步开局库（默认12步=6回合）
  setMaxOpeningMoves(moves: number) {
    this.maxOpeningMoves = moves;
  }

  // 加载所有开局变例
  private loadAllOpenings() {
    // ==========================================
    // 1. 应对中炮（炮二平五 或 炮八平五）
    // ==========================================

    // 1.1 屏风马（最主流，优先级最高）
    this.addResponse("center_cannon", {
      from: [0, 7], to: [2, 6],
      chineseNotation: "马8进7",
      priority: 100,
      description: "屏风马 - 最稳健的应法"
    });

    this.addResponse("center_cannon", {
      from: [0, 1], to: [2, 2],
      chineseNotation: "马2进3",
      priority: 98,
      description: "跳马 - 对称出子"
    });

    // 1.2 顺炮（对攻激烈）
    this.addResponse("center_cannon", {
      from: [2, 7], to: [3, 5],
      chineseNotation: "炮8平5",
      priority: 85,
      description: "顺炮 - 对攻激烈"
    });

    // 1.3 列炮
    this.addResponse("center_cannon", {
      from: [2, 1], to: [3, 3],
      chineseNotation: "炮2平5",
      priority: 80,
      description: "列炮 - 针锋相对"
    });

    // 1.4 起横车
    this.addResponse("center_cannon", {
      from: [0, 0], to: [1, 0],
      chineseNotation: "车9进1",
      priority: 75,
      description: "起横车 - 另辟蹊径"
    });

    // ==========================================
    // 2. 应对仙人指路（兵三进一 或 兵七进一）
    // ==========================================

    // 2.1 对兵局
    this.addResponse("pawn_advance", {
      from: [3, 6], to: [4, 6],
      chineseNotation: "卒7进1",
      priority: 100,
      description: "对兵局 - 针锋相对"
    });

    this.addResponse("pawn_advance", {
      from: [3, 0], to: [4, 0],
      chineseNotation: "卒3进1",
      priority: 98,
      description: "卒3进1 - 对称应法"
    });

    // 2.2 卒底炮
    this.addResponse("pawn_advance", {
      from: [2, 1], to: [3, 3],
      chineseNotation: "炮2平5",
      priority: 95,
      description: "卒底炮 - 还架中炮"
    });

    this.addResponse("pawn_advance", {
      from: [2, 7], to: [3, 5],
      chineseNotation: "炮8平5",
      priority: 93,
      description: "卒底炮左架"
    });

    // 2.3 跳马
    this.addResponse("pawn_advance", {
      from: [0, 7], to: [2, 6],
      chineseNotation: "马8进7",
      priority: 85,
      description: "跳马 - 稳步出子"
    });

    // ==========================================
    // 3. 应对飞相局（相三进五 或 相七进五）
    // ==========================================

    // 3.1 左中炮
    this.addResponse("elephant", {
      from: [2, 7], to: [3, 5],
      chineseNotation: "炮8平5",
      priority: 100,
      description: "左中炮 - 直接反击"
    });

    // 3.2 右中炮
    this.addResponse("elephant", {
      from: [2, 1], to: [3, 3],
      chineseNotation: "炮2平5",
      priority: 95,
      description: "右中炮"
    });

    // 3.3 跳马
    this.addResponse("elephant", {
      from: [0, 7], to: [2, 6],
      chineseNotation: "马8进7",
      priority: 90,
      description: "跳左马"
    });

    this.addResponse("elephant", {
      from: [0, 1], to: [2, 2],
      chineseNotation: "马2进3",
      priority: 88,
      description: "跳右马"
    });

    // 3.4 进卒
    this.addResponse("elephant", {
      from: [3, 6], to: [4, 6],
      chineseNotation: "卒7进1",
      priority: 85,
      description: "进7卒"
    });

    // ==========================================
    // 4. 应对起马局（马二进三 或 马八进七）
    // ==========================================

    // 4.1 中炮
    this.addResponse("horse_opening", {
      from: [2, 7], to: [3, 5],
      chineseNotation: "炮8平5",
      priority: 100,
      description: "左中炮反击"
    });

    this.addResponse("horse_opening", {
      from: [2, 1], to: [3, 3],
      chineseNotation: "炮2平5",
      priority: 95,
      description: "右中炮"
    });

    // 4.2 对起马
    this.addResponse("horse_opening", {
      from: [0, 7], to: [2, 6],
      chineseNotation: "马8进7",
      priority: 90,
      description: "对称起马"
    });

    // 4.3 进卒
    this.addResponse("horse_opening", {
      from: [3, 6], to: [4, 6],
      chineseNotation: "卒7进1",
      priority: 85,
      description: "活通马路"
    });

    // ==========================================
    // 5. 应对过宫炮（炮二平六）
    // ==========================================

    this.addResponse("palace_cannon", {
      from: [0, 7], to: [2, 6],
      chineseNotation: "马8进7",
      priority: 100,
      description: "跳左马"
    });

    this.addResponse("palace_cannon", {
      from: [2, 1], to: [3, 3],
      chineseNotation: "炮2平5",
      priority: 95,
      description: "还架中炮"
    });

    // ==========================================
    // 6. 应对士角炮（炮二平四）
    // ==========================================

    this.addResponse("corner_cannon", {
      from: [0, 7], to: [2, 6],
      chineseNotation: "马8进7",
      priority: 100,
      description: "跳左马"
    });

    this.addResponse("corner_cannon", {
      from: [2, 7], to: [4, 7],
      chineseNotation: "炮8平6",
      priority: 90,
      description: "顺手炮"
    });

    // ==========================================
    // 7. 应对金钩炮（炮二平七）
    // ==========================================

    this.addResponse("hook_cannon", {
      from: [0, 7], to: [2, 6],
      chineseNotation: "马8进7",
      priority: 100,
      description: "跳左马"
    });

    // ==========================================
    // 8. 应对巡河炮
    // ==========================================

    this.addResponse("river_cannon", {
      from: [0, 7], to: [2, 6],
      chineseNotation: "马8进7",
      priority: 100,
      description: "跳马"
    });
  }

  // 添加应对走法
  private addResponse(openingType: string, move: OpeningBookMove) {
    if (!this.book.has(openingType)) {
      this.book.set(openingType, []);
    }
    this.book.get(openingType)!.push(move);
  }

  // 获取最佳应对（按优先级排序）
  getBestResponse(openingType: string): OpeningBookMove | null {
    const responses = this.book.get(openingType);
    if (!responses || responses.length === 0) return null;

    // 按优先级降序排序，返回最高优先级
    return [...responses].sort((a, b) => b.priority - a.priority)[0];
  }

  // 获取所有应对（用于多样性）
  getAllResponses(openingType: string): OpeningBookMove[] {
    return this.book.get(openingType) || [];
  }

  // 随机获取一个应对（增加AI多样性）
  getRandomResponse(openingType: string): OpeningBookMove | null {
    const responses = this.book.get(openingType);
    if (!responses || responses.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  // 根据优先级权重选择
  getWeightedResponse(openingType: string): OpeningBookMove | null {
    const responses = this.book.get(openingType);
    if (!responses || responses.length === 0) return null;

    // 计算总优先级
    const totalPriority = responses.reduce((sum, m) => sum + m.priority, 0);
    let random = Math.random() * totalPriority;

    for (const move of responses) {
      if (random <= move.priority) return move;
      random -= move.priority;
    }

    return responses[0];
  }

  // 检测红方开局类型
  detectOpening(board: (Piece | null)[][]): string {
    // 检查中炮
    if (this.isCenterCannon(board)) return "center_cannon";

    // 检查仙人指路
    if (this.isPawnAdvance(board)) return "pawn_advance";

    // 检查飞相局
    if (this.isElephant(board)) return "elephant";

    // 检查起马局
    if (this.isHorseOpening(board)) return "horse_opening";

    // 检查过宫炮
    if (this.isPalaceCannon(board)) return "palace_cannon";

    // 检查士角炮
    if (this.isCornerCannon(board)) return "corner_cannon";

    // 检查金钩炮
    if (this.isHookCannon(board)) return "hook_cannon";

    // 检查巡河炮
    if (this.isRiverCannon(board)) return "river_cannon";

    return "unknown";
  }

  // 中炮检测：红方炮在(7,3)或(7,5)位置，且没有移动过
  private isCenterCannon(board: (Piece | null)[][]): boolean {
    // 检查左中炮（炮二平五）：炮从(7,7)移动到(7,5)
    const leftCannon = board[7][5]?.type === "cannon" && board[7][5]?.color === "r";
    // 检查右中炮（炮八平五）：炮从(7,1)移动到(7,3)
    const rightCannon = board[7][3]?.type === "cannon" && board[7][3]?.color === "r";

    // 检查原始位置是否已空（说明移动过）
    const leftOriginal = board[7][7] === null;
    const rightOriginal = board[7][1] === null;

    return (leftCannon && leftOriginal) || (rightCannon && rightOriginal);
  }

  // 仙人指路检测：红方兵从(6,0)/(6,2)/(6,4)/(6,6)/(6,8)向前移动了一步
  private isPawnAdvance(board: (Piece | null)[][]): boolean {
    // 检查红方兵是否从原始位置移动了
    const pawnPositions = [[6, 0], [6, 2], [6, 4], [6, 6], [6, 8]];

    for (const [row, col] of pawnPositions) {
      // 原始位置空了，说明兵移动了
      if (board[row][col] === null) {
        // 检查兵现在在哪里（向前移动了一格）
        const forwardRow = row - 1;
        if (forwardRow >= 0 && board[forwardRow][col]?.type === "pawn" && board[forwardRow][col]?.color === "r") {
          return true;
        }
      }
    }
    return false;
  }

  // 飞相局检测：红方相从(9,2)或(9,6)移动到(7,4)（飞中相）
  private isElephant(board: (Piece | null)[][]): boolean {
    // 左相飞中
    const leftElephant = board[7][4]?.type === "bishop" && board[7][4]?.color === "r";
    const leftOriginal = board[9][2] === null;

    // 右相飞中
    const rightElephant = board[7][4]?.type === "bishop" && board[7][4]?.color === "r";
    const rightOriginal = board[9][6] === null;

    return (leftElephant && leftOriginal) || (rightElephant && rightOriginal);
  }

  // 起马局检测：红方马从(9,1)或(9,7)向前跳了一步
  private isHorseOpening(board: (Piece | null)[][]): boolean {
    // 左马跳出
    const leftKnight = (board[7][2]?.type === "knight" && board[7][2]?.color === "r") ||
                       (board[7][0]?.type === "knight" && board[7][0]?.color === "r");
    const leftOriginal = board[9][1] === null;

    // 右马跳出
    const rightKnight = (board[7][6]?.type === "knight" && board[7][6]?.color === "r") ||
                        (board[7][8]?.type === "knight" && board[7][8]?.color === "r");
    const rightOriginal = board[9][7] === null;

    return (leftKnight && leftOriginal) || (rightKnight && rightOriginal);
  }

  // 过宫炮检测：红方炮二平六（炮从(7,7)平到(7,4)）
  private isPalaceCannon(board: (Piece | null)[][]): boolean {
    const cannonAtFour = board[7][4]?.type === "cannon" && board[7][4]?.color === "r";
    const cannonOriginal = board[7][7] === null;
    return cannonAtFour && cannonOriginal;
  }

  // 士角炮检测：红方炮二平四（炮从(7,7)平到(7,3)）
  private isCornerCannon(board: (Piece | null)[][]): boolean {
    const cannonAtThree = board[7][3]?.type === "cannon" && board[7][3]?.color === "r";
    const cannonOriginal = board[7][7] === null;
    return cannonAtThree && cannonOriginal;
  }

  // 金钩炮检测：红方炮二平七（炮从(7,7)平到(7,0)）
  private isHookCannon(board: (Piece | null)[][]): boolean {
    const cannonAtZero = board[7][0]?.type === "cannon" && board[7][0]?.color === "r";
    const cannonOriginal = board[7][7] === null;
    return cannonAtZero && cannonOriginal;
  }

  // 巡河炮检测：红方炮进河沿
  private isRiverCannon(board: (Piece | null)[][]): boolean {
    // 检查红方炮是否在河界位置（row=5）
    for (let col = 0; col < 9; col++) {
      if (board[5][col]?.type === "cannon" && board[5][col]?.color === "r") {
        return true;
      }
    }
    return false;
  }

  // 获取开局库说明
  getOpeningDescription(openingType: string): string {
    const descriptions: Record<string, string> = {
      "center_cannon": "中炮开局 - 黑方应以屏风马",
      "pawn_advance": "仙人指路 - 黑方应以对兵局",
      "elephant": "飞相局 - 黑方应以左中炮",
      "horse_opening": "起马局 - 黑方应以中炮",
      "palace_cannon": "过宫炮 - 黑方应以跳马",
      "corner_cannon": "士角炮 - 黑方应以跳马",
      "hook_cannon": "金钩炮 - 黑方应以跳马",
      "river_cannon": "巡河炮 - 黑方应以跳马",
      "unknown": "未知开局 - 使用默认出子"
    };
    return descriptions[openingType] || descriptions["unknown"];
  }

  // 检查是否应该继续使用开局库
  shouldUseOpeningBook(moveCount: number): boolean {
    return moveCount <= this.maxOpeningMoves;
  }
}

// 导出单例
export const openingBook = new OpeningBook();