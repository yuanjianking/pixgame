// Sokoban.tsx - 修复 ref 在 render 中访问的问题
import React, { useRef, useState, useEffect, useCallback } from 'react';
import './Sokoban.css';
import SokobanLevels from './SokobanLevels.json';

// ==================== 类型定义 ====================
interface LevelData {
  id: number;
  name: string;
  boxes: number;
  map: number[][];
}

interface GameState {
  map: number[][];
  playerPos: { x: number; y: number };
  stepCount: number;
  boxesOnTarget: number;
  totalTargets: number;
  isWin: boolean;
}


interface SavedGameState {
  levelIndex: number;
  gameState: GameState;
  rows: number;
  cols: number;
  savedAt: number;
}

// ==================== 游戏引擎类 ====================
class SokobanEngine {
  private state: GameState;
  private history: GameState[];
  private historyIndex: number;

  constructor() {
    this.state = {
      map: [],
      playerPos: { x: 0, y: 0 },
      stepCount: 0,
      boxesOnTarget: 0,
      totalTargets: 0,
      isWin: false
    };
    this.history = [];
    this.historyIndex = -1;
  }

  getSnapshot(): GameState {
    return {
      map: this.state.map.map(row => [...row]),
      playerPos: { ...this.state.playerPos },
      stepCount: this.state.stepCount,
      boxesOnTarget: this.state.boxesOnTarget,
      totalTargets: this.state.totalTargets,
      isWin: this.state.isWin
    };
  }

  canUndo(): boolean {
    return this.historyIndex > 0 && !this.state.isWin;
  }

  isWin(): boolean {
    return this.state.isWin;
  }

  private countBoxesOnTarget(map: number[][]): number {
    let count = 0;
    for (let r = 0; r < map.length; r++) {
      for (let c = 0; c < map[0].length; c++) {
        if (map[r][c] === 6) count++;
      }
    }
    return count;
  }

  private buildFromRawMap(rawMap: number[][]): Omit<GameState, 'stepCount' | 'isWin'> {
    const newMap = rawMap.map(row => [...row]);
    let player = { x: 0, y: 0 };
    let targets = 0;

    for (let i = 0; i < newMap.length; i++) {
      for (let j = 0; j < newMap[0].length; j++) {
        if (newMap[i][j] === 2) player = { x: j, y: i };
        if (newMap[i][j] === 4) targets++;
      }
    }

    const boxesOnTarget = this.countBoxesOnTarget(newMap);

    return {
      map: newMap,
      playerPos: player,
      boxesOnTarget,
      totalTargets: targets
    };
  }

  loadLevel(rawMap: number[][]): GameState {
    const { map, playerPos, boxesOnTarget, totalTargets } = this.buildFromRawMap(rawMap);

    this.state = {
      map,
      playerPos,
      stepCount: 0,
      boxesOnTarget,
      totalTargets,
      isWin: false
    };

    this.history = [];
    this.historyIndex = -1;
    this.saveToHistory();

    return this.getSnapshot();
  }

  restoreState(savedState: GameState): GameState {
    this.state = {
      map: savedState.map.map(row => [...row]),
      playerPos: { ...savedState.playerPos },
      stepCount: savedState.stepCount,
      boxesOnTarget: savedState.boxesOnTarget,
      totalTargets: savedState.totalTargets,
      isWin: savedState.isWin
    };

    this.history = [];
    this.historyIndex = -1;
    this.saveToHistory();

    return this.getSnapshot();
  }

  private saveToHistory(): void {
    const snapshot: GameState = {
      map: this.state.map.map(row => [...row]),
      playerPos: { ...this.state.playerPos },
      stepCount: this.state.stepCount,
      boxesOnTarget: this.state.boxesOnTarget,
      totalTargets: this.state.totalTargets,
      isWin: this.state.isWin
    };

    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(snapshot);
    this.historyIndex++;

    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  move(dx: number, dy: number): { success: boolean; newState: GameState | null } {
    if (this.state.isWin) return { success: false, newState: null };

    const { map, playerPos, stepCount, boxesOnTarget, totalTargets } = this.state;
    const px = playerPos.x;
    const py = playerPos.y;
    const nx = px + dx;
    const ny = py + dy;
    const maxRows = map.length;
    const maxCols = map[0].length;

    if (ny < 0 || ny >= maxRows || nx < 0 || nx >= maxCols) {
      return { success: false, newState: null };
    }

    const cell = map[ny][nx];
    if (cell === 1) return { success: false, newState: null };

    const newMap = map.map(row => [...row]);
    let newPlayerPos = { x: px, y: py };
    let newBoxesOnTarget = boxesOnTarget;
    let moved = false;

    if (cell === 3 || cell === 6) {
      const nnx = nx + dx;
      const nny = ny + dy;
      if (nny < 0 || nny >= maxRows || nnx < 0 || nnx >= maxCols) {
        return { success: false, newState: null };
      }

      const beyond = newMap[nny][nnx];
      if (beyond === 1 || beyond === 3 || beyond === 6) {
        return { success: false, newState: null };
      }

      const wasBoxOnTarget = (cell === 6);
      const isPlayerOnTarget = (newMap[py][px] === 5);

      newMap[py][px] = isPlayerOnTarget ? 4 : 0;

      const isBeyondTarget = (beyond === 4);
      newMap[nny][nnx] = isBeyondTarget ? 6 : 3;
      newMap[ny][nx] = wasBoxOnTarget ? 5 : 2;

      newPlayerPos = { x: nx, y: ny };

      if (wasBoxOnTarget) newBoxesOnTarget--;
      if (isBeyondTarget) newBoxesOnTarget++;

      moved = true;
    }
    else if (cell === 0 || cell === 4) {
      const isPlayerOnTarget = (newMap[py][px] === 5);
      newMap[py][px] = isPlayerOnTarget ? 4 : 0;
      newMap[ny][nx] = (cell === 4) ? 5 : 2;
      newPlayerPos = { x: nx, y: ny };
      moved = true;
    }

    if (!moved) return { success: false, newState: null };

    const newStepCount = stepCount + 1;
    const isWin = (newBoxesOnTarget === totalTargets && totalTargets > 0);

    this.state = {
      map: newMap,
      playerPos: newPlayerPos,
      stepCount: newStepCount,
      boxesOnTarget: newBoxesOnTarget,
      totalTargets,
      isWin
    };

    this.saveToHistory();

    return { success: true, newState: this.getSnapshot() };
  }

  undo(): GameState | null {
    if (this.state.isWin) return null;
    if (this.historyIndex <= 0) return null;

    this.historyIndex--;
    const prev = this.history[this.historyIndex];

    this.state = {
      map: prev.map.map(row => [...row]),
      playerPos: { ...prev.playerPos },
      stepCount: prev.stepCount,
      boxesOnTarget: prev.boxesOnTarget,
      totalTargets: prev.totalTargets,
      isWin: false
    };

    return this.getSnapshot();
  }

  reset(rawMap: number[][]): GameState {
    return this.loadLevel(rawMap);
  }
}

// ==================== React组件 ====================
const Sokoban: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SokobanEngine>(new SokobanEngine());
  const isInitializedRef = useRef(false);

  // UI 状态 - 包含所有需要渲染的信息
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    map: [],
    playerPos: { x: 0, y: 0 },
    stepCount: 0,
    boxesOnTarget: 0,
    totalTargets: 0,
    isWin: false
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [hasSavedGame, setHasSavedGame] = useState(() => {
    return !!localStorage.getItem('sokoban_saved_game');
  });

  // 关卡数据
  const [levels] = useState<LevelData[]>(SokobanLevels.levels);

  // 防止胜利重复触发的锁
  const winProcessingRef = useRef(false);

  // 更新 canUndo 状态
  const updateCanUndo = useCallback(() => {
    setCanUndo(engineRef.current.canUndo());
  }, []);

  // 渲染 canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { map, isWin } = gameState;
    const currentRows = map.length;
    const currentCols = map[0]?.length || 0;
    if (currentRows === 0 || currentCols === 0) return;

    const maxCanvasSize = Math.min(
      window.innerWidth - 80,
      window.innerHeight - 200,
      700
    );
    const dynamicTileSize = Math.floor(maxCanvasSize / Math.max(currentRows, currentCols));

    const newWidth = dynamicTileSize * currentCols;
    const newHeight = dynamicTileSize * currentRows;

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
    }

    ctx.fillStyle = '#2a2418';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < currentRows; row++) {
      for (let col = 0; col < currentCols; col++) {
        const type = map[row]?.[col];
        const x = col * dynamicTileSize;
        const y = row * dynamicTileSize;
        const s = dynamicTileSize;

        if (type === 1) {
          ctx.fillStyle = '#5d3a1a';
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = '#7c532a';
          ctx.fillRect(x + 4, y + 4, s - 8, s - 8);
        } else if (type === 0) {
          ctx.fillStyle = '#e9d6af';
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = '#dbbc87';
          ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
        } else if (type === 4) {
          ctx.fillStyle = '#f3deba';
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = '#e6b86e';
          ctx.beginPath();
          ctx.arc(x + s/2, y + s/2, s * 0.22, 0, 2 * Math.PI);
          ctx.fill();
        } else if (type === 2) {
          ctx.fillStyle = '#e9d6af';
          ctx.fillRect(x, y, s, s);
          const cx = x + s/2;
          const cy = y + s/2;
          ctx.fillStyle = '#cc6b2c';
          ctx.beginPath();
          ctx.ellipse(cx - 2, cy - s/4, s/5.3, s/6.8, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#ffd6aa';
          ctx.beginPath();
          ctx.arc(cx - 2, cy - s/12, s/4.8, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#2f241b';
          ctx.beginPath();
          ctx.arc(cx - s/6.8, cy - s/6.8, s/24, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + s/48, cy - s/6.8, s/24, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#487c5c';
          ctx.fillRect(cx - s/6, cy - s/48, s/3, s/4);
        } else if (type === 5) {
          ctx.fillStyle = '#f3deba';
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = '#e6b86e';
          ctx.beginPath();
          ctx.arc(x + s/2, y + s/2, s * 0.22, 0, 2 * Math.PI);
          ctx.fill();
          const cx = x + s/2;
          const cy = y + s/2;
          ctx.fillStyle = '#cc6b2c';
          ctx.beginPath();
          ctx.ellipse(cx - 2, cy - s/4, s/5.3, s/6.8, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#ffd6aa';
          ctx.beginPath();
          ctx.arc(cx - 2, cy - s/12, s/4.8, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#2f241b';
          ctx.beginPath();
          ctx.arc(cx - s/6.8, cy - s/6.8, s/24, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + s/48, cy - s/6.8, s/24, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#487c5c';
          ctx.fillRect(cx - s/6, cy - s/48, s/3, s/4);
        } else if (type === 3) {
          ctx.fillStyle = '#e9d6af';
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = '#b97f44';
          ctx.fillRect(x + s/6, y + s/6, s - s/3, s - s/3);
          ctx.fillStyle = '#9b5e2c';
          ctx.fillRect(x + s/4.8, y + s/4.8, s - s/2.4, s - s/2.4);
          ctx.fillStyle = '#6d3f1a';
          ctx.fillRect(x + s/2 - 3, y + s/4, 6, s - s/2);
          ctx.fillRect(x + s/4, y + s/2 - 3, s - s/2, 6);
        } else if (type === 6) {
          ctx.fillStyle = '#f3deba';
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = '#e6b86e';
          ctx.beginPath();
          ctx.arc(x + s/2, y + s/2, s * 0.22, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#ffc857';
          ctx.fillRect(x + s/6, y + s/6, s - s/3, s - s/3);
          ctx.fillStyle = '#e5a128';
          ctx.fillRect(x + s/4.8, y + s/4.8, s - s/2.4, s - s/2.4);
          ctx.fillStyle = '#f0a500';
          ctx.beginPath();
          ctx.arc(x + s/2, y + s/2, s/8, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // 网格线
    ctx.beginPath();
    ctx.strokeStyle = '#ad8b54';
    ctx.lineWidth = 1;
    for (let i = 0; i <= currentCols; i++) {
      ctx.moveTo(i * dynamicTileSize, 0);
      ctx.lineTo(i * dynamicTileSize, canvas.height);
      ctx.moveTo(0, i * dynamicTileSize);
      ctx.lineTo(canvas.width, i * dynamicTileSize);
      ctx.stroke();
    }

    // 胜利特效
    if (isWin && showLevelUp) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `bold ${Math.min(28, dynamicTileSize * 1.5)}px monospace`;
      ctx.fillStyle = '#ffd966';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffaa00';
      const currentLevelNum = levelIndex + 1;
      const totalLevels = levels.length;
      const msg = currentLevelNum >= totalLevels
        ? `✨ 恭喜通关！ ✨`
        : `✨ 通关！进入第 ${currentLevelNum + 1}/${totalLevels} 关 ✨`;
      ctx.fillText(msg, canvas.width/2 - ctx.measureText(msg).width/2, canvas.height/2);
      ctx.shadowBlur = 0;
    }
  }, [gameState, showLevelUp, levelIndex, levels.length]);

  // 同步 UI 到 canvas
  useEffect(() => {
    renderCanvas();
  }, [gameState, renderCanvas]);

  // 加载关卡
  const loadLevel = useCallback((index: number) => {
    if (levels.length === 0) return;

    const levelData = levels[index % levels.length];
    const rawMap = levelData.map.map(row => [...row]);
    const currentRows = rawMap.length;
    const currentCols = rawMap[0].length;

    setRows(currentRows);
    setCols(currentCols);

    const newState = engineRef.current.loadLevel(rawMap);
    setGameState(newState);
    setLevelIndex(index);
    setShowLevelUp(false);
    winProcessingRef.current = false;
    updateCanUndo();
  }, [levels, updateCanUndo]);

  // 处理胜利
  const handleWinIfNeeded = useCallback((newState: GameState) => {
    if (newState.isWin && !winProcessingRef.current) {
      winProcessingRef.current = true;
      setShowLevelUp(true);

      setTimeout(() => {
        setShowLevelUp(false);
        const nextIndex = levelIndex + 1;
        if (nextIndex < levels.length) {
          loadLevel(nextIndex);
        }
        winProcessingRef.current = false;
        updateCanUndo();
      }, 1500);
    }
  }, [levelIndex, levels.length, loadLevel, updateCanUndo]);

  // 移动
  const tryMove = useCallback((dx: number, dy: number) => {
    const result = engineRef.current.move(dx, dy);
    if (result.success && result.newState) {
      setGameState(result.newState);
      handleWinIfNeeded(result.newState);
      updateCanUndo();
    }
  }, [handleWinIfNeeded, updateCanUndo]);

  // 撤销
  const undo = useCallback(() => {
    const newState = engineRef.current.undo();
    if (newState) {
      setGameState(newState);
      setShowLevelUp(false);
      updateCanUndo();
    }
  }, [updateCanUndo]);

  // 重置
  const resetLevel = useCallback(() => {
    const levelData = levels[levelIndex];
    const rawMap = levelData.map.map(row => [...row]);
    const newState = engineRef.current.reset(rawMap);
    setGameState(newState);
    setShowLevelUp(false);
    winProcessingRef.current = false;
    updateCanUndo();
  }, [levelIndex, levels, updateCanUndo]);

  // 上一关
  const prevLevel = useCallback(() => {
    if (levelIndex > 0) {
      loadLevel(levelIndex - 1);
    }
  }, [levelIndex, loadLevel]);

  // 下一关
  const nextLevel = useCallback(() => {
    if (levelIndex + 1 < levels.length) {
      loadLevel(levelIndex + 1);
    }
  }, [levelIndex, levels.length, loadLevel]);

  // 保存游戏
  const saveGame = useCallback(() => {
    try {
      const savedState: SavedGameState = {
        levelIndex,
        gameState: engineRef.current.getSnapshot(),
        rows,
        cols,
        savedAt: Date.now(),
      };
      localStorage.setItem('sokoban_saved_game', JSON.stringify(savedState));
      setHasSavedGame(true);
    } catch (error) {
      console.error('保存失败:', error);
    }
  }, [levelIndex, rows, cols]);

  // 加载存档
  const loadGame = useCallback(() => {
    try {
      const savedData = localStorage.getItem('sokoban_saved_game');
      if (!savedData) return;

      const saved: SavedGameState = JSON.parse(savedData);

      if (!saved.gameState || !saved.gameState.map || !Array.isArray(saved.gameState.map)) {
        localStorage.removeItem('sokoban_saved_game');
        setHasSavedGame(false);
        return;
      }

      setRows(saved.rows);
      setCols(saved.cols);
      setLevelIndex(saved.levelIndex);
      setShowLevelUp(false);
      setHasSavedGame(true);
      winProcessingRef.current = false;

      const restoredState = engineRef.current.restoreState(saved.gameState);
      setGameState(restoredState);
      updateCanUndo();
    } catch (error) {
      console.error('加载失败:', error);
      localStorage.removeItem('sokoban_saved_game');
      setHasSavedGame(false);
    }
  }, [updateCanUndo]);

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.key === 'ArrowUp') { tryMove(0, -1); e.preventDefault(); }
      else if (e.key === 'ArrowDown') { tryMove(0, 1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { tryMove(-1, 0); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { tryMove(1, 0); e.preventDefault(); }
      else if (e.key === 'r' || e.key === 'R') { resetLevel(); e.preventDefault(); }
      else if (e.key === 'z' || e.key === 'Z') { undo(); e.preventDefault(); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tryMove, resetLevel, undo]);

  // 窗口大小适配
  useEffect(() => {
    const handleResize = () => {
      renderCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  // 初始化 - 使用 ref 和 setTimeout 避免在 effect 中同步调用 setState
  useEffect(() => {
    if (!isInitializedRef.current && levels.length > 0 && gameState.map.length === 0) {
      isInitializedRef.current = true;
      setTimeout(() => {
        loadLevel(0);
      }, 0);
    }
  }, [levels, gameState.map.length, loadLevel]);

  const currentLevel = levels[levelIndex];
  const totalLevels = levels.length;
  const isLastLevel = levelIndex + 1 >= totalLevels;
  const isWin = gameState.isWin;

  return (
    <div className="sokoban-wrapper">
      <div className="sokoban-container">
        <div className="sokoban-header">
          <div className="sokoban-stats">
            <div className="sokoban-level">
              📦 {currentLevel?.name || `第${levelIndex + 1}关`}
            </div>
            <div className="sokoban-level-info">
              第 {levelIndex + 1} / {totalLevels} 关
            </div>
            <div className="sokoban-steps">🚶 步数: {gameState.stepCount}</div>
            <div className="sokoban-targets">🎯 剩余: {gameState.totalTargets - gameState.boxesOnTarget}</div>
            <div className="sokoban-boxes">📦 箱子: {currentLevel?.boxes || 0}</div>
          </div>
        </div>

        <div className="sokoban-canvas-wrapper">
          <canvas ref={canvasRef} className="sokoban-canvas" />
        </div>

        <div className="sokoban-controls">
          <div className="sokoban-direction-buttons">
            <button onClick={() => tryMove(0, -1)} className="dir-btn" disabled={isWin}>▲</button>
            <div className="dir-row">
              <button onClick={() => tryMove(-1, 0)} className="dir-btn" disabled={isWin}>◀</button>
              <button onClick={() => tryMove(0, 1)} className="dir-btn" disabled={isWin}>▼</button>
              <button onClick={() => tryMove(1, 0)} className="dir-btn" disabled={isWin}>▶</button>
            </div>
          </div>

          <div className="sokoban-action-buttons">
            <button onClick={undo} className="action-btn undo-btn" disabled={!canUndo || isWin}>
              ↩️ 撤销
            </button>
            <button onClick={prevLevel} className="action-btn" disabled={levelIndex === 0}>
              ◀ 上一关
            </button>
            <button onClick={resetLevel} className="action-btn">🔄 重置</button>
            <button onClick={nextLevel} className="action-btn" disabled={isLastLevel}>
              下一关 ▶
            </button>
            <button onClick={saveGame} className="action-btn save-btn">💾 存档</button>
            <button onClick={loadGame} className="action-btn load-btn" disabled={!hasSavedGame}>
              📜 读档
            </button>
          </div>
        </div>

        <div className="sokoban-instructions">
          🎮 方向键移动 | Z 撤销 | R 重置 | 将箱子推到⭐目标点即可过关
        </div>
      </div>
    </div>
  );
};

export default Sokoban;