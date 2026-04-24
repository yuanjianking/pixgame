// AstroShooter.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AstroShooterEngine } from './engine/AstroShooterEngine';
import type { GameState } from './engine/types';
import { drawGame } from './engine/renderers';
import './AstroShooter.css';

const AstroShooter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AstroShooterEngine>(new AstroShooterEngine());
  const isInitializedRef = useRef(false);  // 改为 useRef

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

  // 更新最佳分数
  const updateBestScore = useCallback((score: number) => {
    if (score > gameState.bestScore) {
      const newBest = Math.floor(score);
      localStorage.setItem('astroBestScore', String(newBest));
      setGameState(prev => ({ ...prev, bestScore: newBest }));
    }
  }, [gameState.bestScore]);

  // 处理状态变化
  const handleStateChange = useCallback((state: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...state }));
    if (state.score !== undefined) updateBestScore(state.score);
  }, [updateBestScore]);

  // 处理爆炸
  const handleExplosion = useCallback((x: number, y: number, size: number) => {
    // 1. 创建额外的粒子效果（在 Canvas 上已有爆炸效果，这里是额外控制）

    // 2. 根据爆炸大小产生不同程度的屏幕轻微闪烁（可选）
    if (size > 20) {
      // 大爆炸可以添加未来扩展效果
      console.log(`💥 大爆炸 at (${Math.floor(x)}, ${Math.floor(y)}), 威力: ${size}`);
    }

    // 3. 可选：添加震动反馈（需要用户交互授权）
    // 注意：浏览器需要用户先与页面交互才能使用震动 API
    if ('vibrate' in navigator && window.navigator.vibrate && size > 15) {
      // 轻微震动 50ms
      window.navigator.vibrate(50);
    }

    // 4. 可选：播放爆炸音效（需要加载音频文件）
    // 注意：实际使用时需要先加载音频文件
    // const audio = new Audio('/sounds/explosion.mp3');
    // audio.volume = 0.3;
    // audio.play().catch(e => console.log('音频播放失败:', e));

    // 5. 可选：添加闪光效果（通过 CSS 类）
    const canvas = canvasRef.current;
    if (canvas && size > 15) {
      canvas.classList.add('explosion-flash');
      setTimeout(() => {
        canvas?.classList.remove('explosion-flash');
      }, 50);
    }
  }, []);

  // 初始化引擎 - 不再调用 setState
  useEffect(() => {
    engineRef.current.setCallbacks(handleStateChange, handleExplosion);
    engineRef.current.restart();
    isInitializedRef.current = true;
  }, [handleStateChange, handleExplosion]);

  // 游戏循环
  useEffect(() => {
    if (!isInitializedRef.current) return;

    let animationId: number;

    const gameLoop = () => {
      engineRef.current.update();

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const objects = engineRef.current.getGameObjects();
          drawGame(ctx, canvas.width, canvas.height, objects);
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, []);

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

  // 双指触摸放炸弹（手机）
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