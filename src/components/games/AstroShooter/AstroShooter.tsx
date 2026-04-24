// AstroShooter.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AstroShooterEngine } from './engine/AstroShooterEngine';
import type { GameState } from './engine/types';
import { drawGame } from './engine/renderers';
import './AstroShooter.css';

const AstroShooter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AstroShooterEngine>(new AstroShooterEngine());
  const isInitializedRef = useRef(false);
  const animationIdRef = useRef<number | null>(null);

  // UI 状态
  const [gameState, setGameState] = useState<GameState>({
    gameRunning: true,
    score: 0,
    playerHealth: 3,
    gameTimeSeconds: 0,
    powerLevel: 1,
    bombCount: 0,
    bestScore: parseInt(localStorage.getItem('astroBestScore') || '0')
  });

  // 处理状态变化 - 优化避免循环
  const handleStateChange = useCallback((state: Partial<GameState>) => {
    setGameState(prev => {
      const newState = { ...prev, ...state };
      // 更新最佳分数
      if (state.score !== undefined && state.score > prev.bestScore) {
        const newBest = Math.floor(state.score);
        localStorage.setItem('astroBestScore', String(newBest));
        newState.bestScore = newBest;
      }
      return newState;
    });
  }, []);

  // 处理爆炸
  const handleExplosion = useCallback((x: number, y: number, size: number) => {
    const canvas = canvasRef.current;
    if (canvas && size > 10) {
      canvas.classList.add('explosion-flash');
      setTimeout(() => {
        canvas?.classList.remove('explosion-flash');
      }, 60);
    }
  }, []);

  // 初始化引擎 - 只执行一次
  useEffect(() => {
    if (isInitializedRef.current) return;

    engineRef.current.setCallbacks(handleStateChange, handleExplosion);
    engineRef.current.restart();
    isInitializedRef.current = true;
  }, [handleStateChange, handleExplosion]);

  // 游戏循环 - 独立 effect，不依赖任何会变化的状态
  useEffect(() => {
    if (!isInitializedRef.current) return;

    const gameLoop = () => {
      // 更新游戏逻辑
      engineRef.current.update();

      // 渲染
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const objects = engineRef.current.getGameObjects();
          drawGame(ctx, canvas.width, canvas.height, objects);
        }
      }

      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, []); // 空依赖，只运行一次

  // 鼠标/触摸移动
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!engineRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;
    engineRef.current.updatePlayerPosition(canvasX, canvasY);
  }, []);

  // 炸弹
  const handleBomb = useCallback((e?: KeyboardEvent | React.MouseEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    engineRef.current.useBomb();
  }, []);

  // 键盘事件
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyB') {
        e.preventDefault();
        engineRef.current.useBomb();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // 重启游戏
  const restartGame = useCallback(() => {
    engineRef.current.restart();
  }, []);

  // 双指触摸放炸弹
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      engineRef.current.useBomb();
    }
  }, []);

  return (
    <div className="astro-container">
      <div className="game-wrapper">
        <canvas
          ref={canvasRef}
          width={480}
          height={640}
          className="game-canvas"
          onMouseMove={handleMove}
          onTouchMove={handleMove}
          onTouchStart={(e) => {
            handleMove(e);
            handleTouchStart(e);
          }}
          onMouseDown={(e) => { if (e.button === 1) handleBomb(e); }}
        />

        <div className="info-panel">
          <div className="info-item best">🏆 {gameState.bestScore}</div>
          <div className="info-item score">💥 {Math.floor(gameState.score)}</div>
          <div className="info-item timer">⏱️ {Math.floor(gameState.gameTimeSeconds)}s</div>
          <div className="info-item power">⚡ {gameState.powerLevel}</div>
          <div className="info-item bomb">💣 {gameState.bombCount}</div>
          <div className="info-item health">🛡️ {gameState.playerHealth}</div>
          <button className="restart-btn" onClick={restartGame}>🚀 重启</button>
        </div>

        <div className="instruction">
          🖱️ 鼠标/手指移动 | 💣 空格/B键/鼠标中键/双指点击放炸弹
        </div>

        {!gameState.gameRunning && (
          <div className="game-overlay">
            <div className="game-over-text">GAME OVER</div>
            <button className="restart-btn overlay-btn" onClick={restartGame}>重新起飞</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AstroShooter;