// src/components/IronTankBattle/IronTankBattle.tsx
import React, { useEffect, useRef } from 'react';
import { useIronTankBattleEngine } from './engine/IronTankBattleEngine';
import { drawGame } from './engine/renderers';
import './IronTankBattle.css';

const IronTankBattle: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, movePlayer, handleShoot, resetGame } = useIronTankBattleEngine();

  // 使用 ref 存储按键状态和方向，避免闭包问题
  const keysPressed = useRef({ w: false, s: false, a: false, d: false });
  const lastDirection = useRef<'up' | 'down' | 'left' | 'right'>(gameState.player.direction);

  // 同步方向到 ref
  useEffect(() => {
    lastDirection.current = gameState.player.direction;
  }, [gameState.player.direction]);

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.code;
      if (k === 'KeyW') { keysPressed.current.w = true; e.preventDefault(); }
      if (k === 'KeyS') { keysPressed.current.s = true; e.preventDefault(); }
      if (k === 'KeyA') { keysPressed.current.a = true; e.preventDefault(); }
      if (k === 'KeyD') { keysPressed.current.d = true; e.preventDefault(); }
      if (k === 'KeyJ') { handleShoot(); e.preventDefault(); }
      if (k === 'KeyR') { resetGame(); e.preventDefault(); }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.code;
      if (k === 'KeyW') keysPressed.current.w = false;
      if (k === 'KeyS') keysPressed.current.s = false;
      if (k === 'KeyA') keysPressed.current.a = false;
      if (k === 'KeyD') keysPressed.current.d = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleShoot, resetGame]);

  // 独立的移动循环 - 使用 requestAnimationFrame 而不是 setInterval
  useEffect(() => {
    let animationId: number;
    const MOVE_SPEED = 3.5;

    const updateMovement = () => {
      const { w, s, a, d } = keysPressed.current;

      let moveX = 0, moveY = 0;
      let direction: 'up' | 'down' | 'left' | 'right' = lastDirection.current;

      // 优先处理上下，再处理左右（禁止斜走）
      if (w && !s) {
        moveY = -1;
        direction = 'up';
      } else if (s && !w) {
        moveY = 1;
        direction = 'down';
      } else if (a && !d) {
        moveX = -1;
        direction = 'left';
      } else if (d && !a) {
        moveX = 1;
        direction = 'right';
      }

      // 只有在有移动输入且游戏未结束时才移动
      if ((moveX !== 0 || moveY !== 0) && !gameState.gameOver && gameState.player.active) {
        const len = Math.hypot(moveX, moveY);
        moveX = moveX / len * MOVE_SPEED;
        moveY = moveY / len * MOVE_SPEED;
        movePlayer(moveX, moveY, direction);
      }
    };

    const loop = () => {
      updateMovement();
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [movePlayer, gameState.gameOver, gameState.player.active]);

  // 渲染
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGame(ctx, gameState);
  }, [gameState]);

  return (
    <div className="iron-tank-battle">
      <div className="game-container">
        <canvas ref={canvasRef} width={800} height={600} className="game-canvas" />
        <div className="info-panel">
          <div className="stats">
            <div><label>🎯 关卡</label> <span>{gameState.currentLevel}</span></div>
            <div><label>💥 得分</label> <span>{gameState.score}</span></div>
            <div><label>❤️ 生命</label> <span>{gameState.lives}</span></div>
            <div><label>🎯 击毁</label> <span>{gameState.enemiesDestroyed}</span></div>
            <div><label>🏠 基地</label> <span>{gameState.baseActive ? '❤️ 健在' : '💀 失守'}</span></div>
          </div>
          <button onClick={resetGame} className="reset-btn">🚀 重新出征</button>
          <div className="controls-hint">
            <span>🕹️ <kbd>WASD</kbd> 移动 (不可斜走)</span>
            <span>🔥 <kbd>J</kbd> 开炮</span>
            <span>🔁 <kbd>R</kbd> 重来</span>
          </div>
        </div>
        <div className="level-badge">
          ⚔️ 第{gameState.currentLevel}关 · 钢墙:{gameState.steelWalls.length} 砖墙:{gameState.breakableWalls.length} 敌军:{gameState.enemies.length} ⚔️
        </div>
      </div>
    </div>
  );
};

export default IronTankBattle;