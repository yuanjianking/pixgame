// Sokoban.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import './Sokoban.css';

// 游戏配置
const TILE_SIZE = 48;
const ROWS = 10;
const COLS = 10;
const CANVAS_WIDTH = TILE_SIZE * COLS;
const CANVAS_HEIGHT = TILE_SIZE * ROWS;

// 预置关卡库
const PRESET_LEVELS: number[][][] = [
  // 关卡1
  [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,1],
    [1,0,3,0,1,0,4,0,0,1],
    [1,0,0,0,1,0,0,0,0,1],
    [1,1,1,0,0,0,3,0,0,1],
    [1,0,0,0,4,0,0,0,0,1],
    [1,0,3,0,0,0,1,0,0,1],
    [1,0,0,0,2,0,1,0,4,1],
    [1,0,0,0,0,0,1,0,0,1],
    [1,1,1,1,1,1,1,1,1,1]
  ],
  // 关卡2
  [
    [1,1,1,1,1,1,1,1,1,1],
    [1,4,0,0,1,0,0,0,4,1],
    [1,0,3,0,1,0,3,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,2,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,3,0,1,0,0,0,0,1],
    [1,0,0,0,1,0,3,0,0,1],
    [1,4,0,0,0,0,0,0,4,1],
    [1,1,1,1,1,1,1,1,1,1]
  ],
  // 关卡3
  [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,1],
    [1,0,3,0,0,1,0,4,0,1],
    [1,0,0,1,0,0,0,0,0,1],
    [1,0,3,1,2,0,1,0,0,1],
    [1,0,0,1,0,0,1,3,0,1],
    [1,0,4,0,0,0,0,0,0,1],
    [1,0,0,0,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,4,0,1],
    [1,1,1,1,1,1,1,1,1,1]
  ],
  // 关卡4
  [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,4,0,0,0,0,0,1],
    [1,0,3,0,1,0,3,0,0,1],
    [1,0,0,0,1,0,0,0,0,1],
    [1,0,1,0,2,0,1,0,4,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,3,0,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,3,0,1],
    [1,0,0,4,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1]
  ],
  // 关卡5
  [
    [1,1,1,1,1,1,1,1,1,1],
    [1,4,0,0,0,1,0,0,4,1],
    [1,0,3,0,0,1,0,3,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,2,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,3,0,1,0,0,3,0,1],
    [1,0,0,0,1,0,0,0,0,1],
    [1,4,0,0,0,0,0,0,4,1],
    [1,1,1,1,1,1,1,1,1,1]
  ]
];

// 保存的游戏状态接口
interface SavedGameState {
  levelIndex: number;
  stepCount: number;
  map: number[][];
  playerPos: { x: number; y: number };
  boxesOnTarget: number;
  totalTargets: number;
  savedAt: number;
}

const Sokoban: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>(0);
  const isInitializedRef = useRef(false);

  // 游戏状态
  const [levelIndex, setLevelIndex] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [gameWin, setGameWin] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(() => {
    return !!localStorage.getItem('sokoban_saved_game');
  });
  const [remainingTargets, setRemainingTargets] = useState(0);

  // 游戏数据 - 这些用于游戏逻辑，不需要触发渲染
  const mapRef = useRef<number[][]>([]);
  const playerPosRef = useRef({ x: 4, y: 7 });
  const totalTargetsRef = useRef(0);
  const boxesOnTargetRef = useRef(0);
  const levelIndexRef = useRef(0);
  const stepCountRef = useRef(0);
  const gameWinRef = useRef(false);

  // 同步 state 到 ref
  useEffect(() => {
    levelIndexRef.current = levelIndex;
  }, [levelIndex]);

  useEffect(() => {
    stepCountRef.current = stepCount;
  }, [stepCount]);

  useEffect(() => {
    gameWinRef.current = gameWin;
  }, [gameWin]);

  // 辅助函数：计算在目标点上的箱子数
  const countBoxesOnTarget = (gameMap: number[][]) => {
    let count = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (gameMap[r][c] === 6) count++;
      }
    }
    return count;
  };

  // 更新剩余目标数的显示
  const updateRemainingTargets = () => {
    const remaining = totalTargetsRef.current - boxesOnTargetRef.current;
    setRemainingTargets(remaining);
  };

  // 无限关卡生成器
  const generateInfiniteLevel = (seed: number): number[][] => {
    const baseLevel = PRESET_LEVELS[seed % PRESET_LEVELS.length];
    const newLevel = baseLevel.map(row => [...row]);

    // 随机微调
    if (seed >= PRESET_LEVELS.length) {
      for (let i = 0; i < 3; i++) {
        const boxes: [number, number][] = [];
        const empties: [number, number][] = [];
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (newLevel[r][c] === 3) boxes.push([r, c]);
            if (newLevel[r][c] === 0) empties.push([r, c]);
          }
        }
        if (boxes.length > 0 && empties.length > 0) {
          const [oldR, oldC] = boxes[0];
          const [newR, newC] = empties[Math.floor(Math.random() * empties.length)];
          newLevel[oldR][oldC] = 0;
          newLevel[newR][newC] = 3;
        }
      }
    }

    return newLevel;
  };

  // 从原始地图构建运行时地图
  const buildRuntimeMap = (rawMap: number[][]) => {
    const newMap = rawMap.map(row => [...row]);
    let player = { x: 4, y: 7 };
    let targets = 0;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newMap[r][c] === 2) player = { x: c, y: r };
        if (newMap[r][c] === 4) targets++;
      }
    }

    // 确保玩家存在
    let playerExists = false;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newMap[r][c] === 2) playerExists = true;
      }
    }
    if (!playerExists) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (newMap[r][c] === 0) {
            newMap[r][c] = 2;
            player = { x: c, y: r };
            break;
          }
        }
      }
    }

    return { map: newMap, playerPos: player, totalTargets: targets };
  };

  // 加载关卡
  const loadLevel = useCallback((index: number) => {
    let rawMap: number[][];
    if (index < PRESET_LEVELS.length) {
      rawMap = PRESET_LEVELS[index];
    } else {
      rawMap = generateInfiniteLevel(index);
    }

    const { map: newMap, playerPos: newPlayer, totalTargets: targets } = buildRuntimeMap(rawMap);
    mapRef.current = newMap;
    playerPosRef.current = newPlayer;
    totalTargetsRef.current = targets;
    boxesOnTargetRef.current = countBoxesOnTarget(newMap);

    setLevelIndex(index);
    setStepCount(0);
    setGameWin(false);
    updateRemainingTargets();
  }, []);

  // 移动到下一关（胜利时调用）
  const goToNextLevel = useCallback(() => {
    const nextIndex = levelIndexRef.current + 1;
    loadLevel(nextIndex);
  }, [loadLevel]);

  // 移动逻辑
  const tryMove = useCallback((dx: number, dy: number) => {
    if (gameWinRef.current) return false;

    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;
    const nx = px + dx;
    const ny = py + dy;

    if (ny < 0 || ny >= ROWS || nx < 0 || nx >= COLS) return false;

    const cell = mapRef.current[ny][nx];

    // 撞墙
    if (cell === 1) return false;

    // 推箱子
    if (cell === 3 || cell === 6) {
      const nnx = nx + dx;
      const nny = ny + dy;
      if (nny < 0 || nny >= ROWS || nnx < 0 || nnx >= COLS) return false;

      const beyond = mapRef.current[nny][nnx];
      if (beyond === 1 || beyond === 3 || beyond === 6) return false;

      const wasBoxOnTarget = (cell === 6);
      const isPlayerOnTarget = (mapRef.current[py][px] === 5);

      // 移动玩家
      mapRef.current[py][px] = isPlayerOnTarget ? 4 : 0;

      // 移动箱子
      const isBeyondTarget = (beyond === 4);
      mapRef.current[nny][nnx] = isBeyondTarget ? 6 : 3;
      mapRef.current[ny][nx] = wasBoxOnTarget ? 5 : 2;

      playerPosRef.current = { x: nx, y: ny };

      // 更新箱子计数
      if (wasBoxOnTarget) boxesOnTargetRef.current--;
      if (isBeyondTarget) boxesOnTargetRef.current++;

      setStepCount(prev => prev + 1);
      updateRemainingTargets();

      // 检查胜利
      if (boxesOnTargetRef.current === totalTargetsRef.current && totalTargetsRef.current > 0) {
        setGameWin(true);
        setShowLevelUp(true);
        setTimeout(() => {
          setShowLevelUp(false);
          goToNextLevel();
        }, 1500);
      }

      return true;
    }

    // 普通移动
    if (cell === 0 || cell === 4) {
      const isPlayerOnTarget = (mapRef.current[py][px] === 5);
      mapRef.current[py][px] = isPlayerOnTarget ? 4 : 0;
      mapRef.current[ny][nx] = (cell === 4) ? 5 : 2;
      playerPosRef.current = { x: nx, y: ny };
      setStepCount(prev => prev + 1);
      return true;
    }

    return false;
  }, [goToNextLevel]);

  // 重置当前关卡
  const resetLevel = useCallback(() => {
    loadLevel(levelIndexRef.current);
  }, [loadLevel]);

  // 上一关
  const prevLevel = useCallback(() => {
    if (levelIndexRef.current > 0) {
      loadLevel(levelIndexRef.current - 1);
    }
  }, [loadLevel]);

  // 下一关
  const nextLevel = useCallback(() => {
    loadLevel(levelIndexRef.current + 1);
  }, [loadLevel]);

  // 保存游戏
  const saveGame = useCallback(() => {
    try {
      const savedState: SavedGameState = {
        levelIndex: levelIndexRef.current,
        stepCount: stepCountRef.current,
        map: mapRef.current.map(row => [...row]),
        playerPos: { ...playerPosRef.current },
        boxesOnTarget: boxesOnTargetRef.current,
        totalTargets: totalTargetsRef.current,
        savedAt: Date.now(),
      };
      localStorage.setItem('sokoban_saved_game', JSON.stringify(savedState));
      setHasSavedGame(true);
      return true;
    } catch (error) {
      console.error('保存失败:', error);
      return false;
    }
  }, []);

  // 加载存档
  const loadGame = useCallback(() => {
    try {
      const savedData = localStorage.getItem('sokoban_saved_game');
      if (!savedData) return false;

      const saved: SavedGameState = JSON.parse(savedData);
      mapRef.current = saved.map;
      playerPosRef.current = saved.playerPos;
      totalTargetsRef.current = saved.totalTargets;
      boxesOnTargetRef.current = saved.boxesOnTarget;

      setLevelIndex(saved.levelIndex);
      setStepCount(saved.stepCount);
      setGameWin(false);
      updateRemainingTargets();

      return true;
    } catch (error) {
      console.error('加载失败:', error);
      return false;
    }
  }, []);

  // 渲染函数
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // 背景
    ctx.fillStyle = '#2a2418';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const type = mapRef.current[row]?.[col];
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;

        // 地板
        if (type === 1) { // 墙
          ctx.fillStyle = '#5d3a1a';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#7c532a';
          ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          ctx.fillStyle = '#4a2c10';
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + 10 + i * 14, y + 12, 5, TILE_SIZE - 24);
          }
        }
        else if (type === 0) { // 空地
          ctx.fillStyle = '#e9d6af';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#dbbc87';
          ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        }
        else if (type === 4) { // 目标点
          ctx.fillStyle = '#f3deba';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#e6b86e';
          ctx.beginPath();
          ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE * 0.22, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#d4922b';
          ctx.beginPath();
          ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE * 0.1, 0, 2 * Math.PI);
          ctx.fill();
        }
        else if (type === 2) { // 玩家
          ctx.fillStyle = '#e9d6af';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          const cx = x + TILE_SIZE/2;
          const cy = y + TILE_SIZE/2;
          ctx.fillStyle = '#cc6b2c';
          ctx.beginPath();
          ctx.ellipse(cx - 2, cy - 12, 9, 7, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#ffd6aa';
          ctx.beginPath();
          ctx.arc(cx - 2, cy - 4, 10, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#2f241b';
          ctx.beginPath();
          ctx.arc(cx - 7, cy - 7, 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + 1, cy - 7, 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#487c5c';
          ctx.fillRect(cx - 8, cy - 1, 16, 12);
        }
        else if (type === 5) { // 玩家在目标点
          ctx.fillStyle = '#f3deba';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#e6b86e';
          ctx.beginPath();
          ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE * 0.22, 0, 2 * Math.PI);
          ctx.fill();
          const cx = x + TILE_SIZE/2;
          const cy = y + TILE_SIZE/2;
          ctx.fillStyle = '#cc6b2c';
          ctx.beginPath();
          ctx.ellipse(cx - 2, cy - 12, 9, 7, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#ffd6aa';
          ctx.beginPath();
          ctx.arc(cx - 2, cy - 4, 10, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#2f241b';
          ctx.beginPath();
          ctx.arc(cx - 7, cy - 7, 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + 1, cy - 7, 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#487c5c';
          ctx.fillRect(cx - 8, cy - 1, 16, 12);
        }
        else if (type === 3) { // 箱子
          ctx.fillStyle = '#e9d6af';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#b97f44';
          ctx.fillRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);
          ctx.fillStyle = '#9b5e2c';
          ctx.fillRect(x + 10, y + 10, TILE_SIZE - 20, TILE_SIZE - 20);
          ctx.fillStyle = '#6d3f1a';
          ctx.fillRect(x + TILE_SIZE/2 - 3, y + 12, 6, TILE_SIZE - 24);
          ctx.fillRect(x + 12, y + TILE_SIZE/2 - 3, TILE_SIZE - 24, 6);
        }
        else if (type === 6) { // 箱子在目标点
          ctx.fillStyle = '#f3deba';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#e6b86e';
          ctx.beginPath();
          ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE * 0.22, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#ffc857';
          ctx.fillRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);
          ctx.fillStyle = '#e5a128';
          ctx.fillRect(x + 10, y + 10, TILE_SIZE - 20, TILE_SIZE - 20);
          ctx.fillStyle = '#f0a500';
          ctx.beginPath();
          ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 6, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // 网格线
    ctx.beginPath();
    ctx.strokeStyle = '#ad8b54';
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
      ctx.moveTo(i * TILE_SIZE, 0);
      ctx.lineTo(i * TILE_SIZE, CANVAS_HEIGHT);
      ctx.moveTo(0, i * TILE_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * TILE_SIZE);
      ctx.stroke();
    }

    // 胜利特效
    if (showLevelUp) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.font = 'bold 28px monospace';
      ctx.fillStyle = '#ffd966';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffaa00';
      const msg = `✨ 通关！进入第 ${levelIndex + 2} 关 ✨`;
      ctx.fillText(msg, CANVAS_WIDTH/2 - ctx.measureText(msg).width/2, CANVAS_HEIGHT/2);
      ctx.shadowBlur = 0;
    }
  }, [showLevelUp, levelIndex]);

  // 游戏循环
  useEffect(() => {
    const loop = () => {
      render();
      animationIdRef.current = requestAnimationFrame(loop);
    };
    animationIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [render]);

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        tryMove(0, -1);
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        tryMove(0, 1);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        tryMove(-1, 0);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        tryMove(1, 0);
        e.preventDefault();
      } else if (e.key === 'r' || e.key === 'R') {
        resetLevel();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tryMove, resetLevel]);

  // 触摸屏支持
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    return () => canvas.removeEventListener('touchstart', handleTouchStart);
  }, []);

  // 初始化 - 使用 ref 确保只执行一次
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      loadLevel(0);
    }
  }, [loadLevel]);

  return (
    <div className="sokoban-wrapper">
      <div className="sokoban-container">
        <div className="sokoban-header">
          <div className="sokoban-stats">
            <div className="sokoban-level">
              📦 第 {levelIndex + 1} / ∞ 关
            </div>
            <div className="sokoban-steps">
              🚶 步数: {stepCount}
            </div>
            <div className="sokoban-targets">
              🎯 剩余: {remainingTargets}
            </div>
          </div>
        </div>

        <div className="sokoban-canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="sokoban-canvas"
          />
        </div>

        <div className="sokoban-controls">
          <div className="sokoban-direction-buttons">
            <button onClick={() => tryMove(0, -1)} className="dir-btn">▲</button>
            <div className="dir-row">
              <button onClick={() => tryMove(-1, 0)} className="dir-btn">◀</button>
              <button onClick={() => tryMove(0, 1)} className="dir-btn">▼</button>
              <button onClick={() => tryMove(1, 0)} className="dir-btn">▶</button>
            </div>
          </div>

          <div className="sokoban-action-buttons">
            <button onClick={prevLevel} className="action-btn" disabled={levelIndex === 0}>
              ◀ 上一关
            </button>
            <button onClick={resetLevel} className="action-btn">
              🔄 重置
            </button>
            <button onClick={nextLevel} className="action-btn">
              下一关 ▶
            </button>
            <button onClick={saveGame} className="action-btn save-btn">
              💾 存档
            </button>
            <button
              onClick={loadGame}
              className="action-btn load-btn"
              disabled={!hasSavedGame}
            >
              📜 读档
            </button>
          </div>
        </div>

        <div className="sokoban-instructions">
          🎮 方向键移动 | R 重置 | 将箱子推到⭐目标点即可过关
        </div>
      </div>
    </div>
  );
};

export default Sokoban;