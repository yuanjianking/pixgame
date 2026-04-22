// BrickBreaker2D.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import './BrickBreaker2D.css';

interface BrickBreaker2DProps {
  onBack: () => void;
  onGameStateChange?: (state: any) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  char: string;
  color: string;
}

interface LevelConfig {
  level: number;
  rows: number;
  cols: number;
  brickHpVariation: boolean; // 是否有双生命砖块
  eliteRatio: number; // 精英砖块比例
  ballSpeed: number; // 球速倍数
  paddleWidth: number; // 挡板宽度
  scoreMultiplier: number; // 分数倍数
}

const BrickBreaker2D: React.FC<BrickBreaker2DProps> = ({ onBack, onGameStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>(0);
  const mountedRef = useRef(true);

  // Game state
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameRunning, setGameRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameWin, setGameWin] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Game refs for animation loop
  const gameRunningRef = useRef(true);
  const gameOverRef = useRef(false);
  const gameWinRef = useRef(false);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const currentLevelRef = useRef(1);

  // Game constants
  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 550;
  let WIDTH = BASE_WIDTH;
  let HEIGHT = BASE_HEIGHT;
  let PADDLE_WIDTH = 110;
  const PADDLE_HEIGHT = 18;
  let paddleY = HEIGHT - PADDLE_HEIGHT - 12;
  let BRICK_ROWS = 6;
  let BRICK_COLS = 10;

  // 关卡配置
  const getLevelConfig = (level: number): LevelConfig => {
    // 基础配置
    const config: LevelConfig = {
      level: level,
      rows: Math.min(6 + Math.floor(level / 3), 10), // 每3关增加一行，最多10行
      cols: Math.min(10 + Math.floor(level / 4), 14), // 每4关增加一列，最多14列
      brickHpVariation: level >= 2, // 第2关开始出现双生命砖块
      eliteRatio: Math.min(0.1 + (level - 1) * 0.05, 0.4), // 精英比例最高40%
      ballSpeed: 1 + (level - 1) * 0.08, // 每关增加8%速度，最高2倍
      paddleWidth: Math.max(110 - Math.floor(level / 5) * 10, 70), // 挡板逐渐变窄，最低70
      scoreMultiplier: 1 + Math.floor(level / 3) * 0.5, // 每3关分数增加50%
    };
    return config;
  };

  // 动态更新游戏尺寸
  const updateGameDimensions = useCallback((level: number) => {
    const config = getLevelConfig(level);
    BRICK_ROWS = config.rows;
    BRICK_COLS = config.cols;
    PADDLE_WIDTH = config.paddleWidth;
    paddleY = HEIGHT - PADDLE_HEIGHT - 12;
  }, []);

  // Game objects refs
  const paddleXRef = useRef((WIDTH - PADDLE_WIDTH) / 2);
  const ballRef = useRef({
    x: WIDTH / 2,
    y: HEIGHT - 70,
    radius: 8,
    vx: 2.9,
    vy: -3.3
  });
  const bricksRef = useRef<any[][]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const nextParticleId = useRef(0);
  const keysRef = useRef({ ArrowLeft: false, ArrowRight: false });
  const currentLevelConfigRef = useRef<LevelConfig>(getLevelConfig(1));

  // Sync state with refs
  useEffect(() => {
    gameRunningRef.current = gameRunning;
  }, [gameRunning]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    gameWinRef.current = gameWin;
  }, [gameWin]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    currentLevelRef.current = currentLevel;
  }, [currentLevel]);

  // 初始化砖块（根据关卡）
  const initBricks = useCallback(() => {
    const config = currentLevelConfigRef.current;
    const brickWidth = (WIDTH - 30) / BRICK_COLS;
    const brickHeight = 20;
    const startX = 15;
    const startY = 68;

    const colorTheme = [
      { main: '#6f4f8f', light: '#b77eff', rune: '#e7c4ff' },
      { main: '#4f3f7f', light: '#9d6eff', rune: '#d9b0ff' },
      { main: '#3f2a6f', light: '#8a5ddf', rune: '#c99eff' },
      { main: '#2f1f5a', light: '#7749cc', rune: '#b88aff' },
      { main: '#5f3a6a', light: '#aa77dd', rune: '#e2b6ff' },
      { main: '#472f62', light: '#9966dd', rune: '#d6a8ff' },
      { main: '#7a2e6f', light: '#cc88ff', rune: '#f0ccff' }, // 新增颜色
      { main: '#8a3e7f', light: '#dd99ff', rune: '#ffddff' },
    ];

    const bricksArray: any[][] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      bricksArray[row] = [];
      for (let col = 0; col < BRICK_COLS; col++) {
        let hp = 1;

        // 根据关卡配置决定是否生成双生命砖块
        if (config.brickHpVariation) {
          // 根据精英比例随机生成双生命砖块
          const isElite = Math.random() < config.eliteRatio;
          // 特定位置也保证有精英砖块
          const isSpecialRow = (row === 2 || row === 4) && (col % 3 === 0 || col % 5 === 2);
          if (isElite || isSpecialRow) hp = 2;
          if (row === BRICK_ROWS - 1 && col % 4 === 1) hp = 2;
        }

        bricksArray[row][col] = {
          x: startX + col * brickWidth,
          y: startY + row * brickHeight,
          w: brickWidth - 2,
          h: brickHeight - 2,
          hp: hp,
          initHp: hp,
          style: colorTheme[(row + config.level) % colorTheme.length],
        };
      }
    }
    bricksRef.current = bricksArray;
  }, [BRICK_ROWS, BRICK_COLS, WIDTH]);

  // 加载下一关
  const loadNextLevel = useCallback(() => {
    const nextLevel = currentLevel + 1;
    const config = getLevelConfig(nextLevel);
    currentLevelConfigRef.current = config;

    // 更新游戏尺寸
    BRICK_ROWS = config.rows;
    BRICK_COLS = config.cols;
    PADDLE_WIDTH = config.paddleWidth;
    paddleY = HEIGHT - PADDLE_HEIGHT - 12;

    // 重置挡板位置
    paddleXRef.current = (WIDTH - PADDLE_WIDTH) / 2;

    // 重置球的位置和速度
    const baseSpeed = 2.9;
    const speedMultiplier = config.ballSpeed;
    ballRef.current = {
      x: WIDTH / 2,
      y: HEIGHT - 70,
      radius: 8,
      vx: baseSpeed * speedMultiplier * (Math.random() > 0.5 ? 1 : -1),
      vy: -3.3 * speedMultiplier
    };

    // 重新初始化砖块
    initBricks();

    // 显示关卡提示
    setShowLevelUp(true);
    setTimeout(() => setShowLevelUp(false), 2000);

    setCurrentLevel(nextLevel);
    setGameRunning(true);
    setGameWin(false);
  }, [currentLevel, initBricks, WIDTH, HEIGHT]);

  // 重置游戏（从第一关开始）
  const resetGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setCurrentLevel(1);
    setGameRunning(true);
    setGameOver(false);
    setGameWin(false);
    setShowLevelUp(false);

    const config = getLevelConfig(1);
    currentLevelConfigRef.current = config;
    BRICK_ROWS = config.rows;
    BRICK_COLS = config.cols;
    PADDLE_WIDTH = config.paddleWidth;
    paddleY = HEIGHT - PADDLE_HEIGHT - 12;

    paddleXRef.current = (WIDTH - PADDLE_WIDTH) / 2;
    ballRef.current = {
      x: WIDTH / 2,
      y: HEIGHT - 70,
      radius: 8,
      vx: 2.9 * (Math.random() > 0.5 ? 1 : -1),
      vy: -3.3
    };
    particlesRef.current = [];
    nextParticleId.current = 0;
    initBricks();
  }, [initBricks, WIDTH, HEIGHT]);

  // 添加魔法粒子
  const addMagicParticles = useCallback((x: number, y: number, color: string, isElite = false) => {
    const count = isElite ? 14 : 8;
    const chars = ['✨', '🜁', '🜂', '🜃', '🜄', '⭐', '✧'];
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: nextParticleId.current++,
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 14,
        vx: (Math.random() - 0.5) * 2.8,
        vy: (Math.random() - 0.5) * 2.5 - 1,
        life: 0.85,
        size: 3 + Math.random() * 5,
        char: chars[Math.floor(Math.random() * chars.length)],
        color: color || '#e3b2ff'
      });
    }
  }, []);

  // 碰撞检测
  const collisionRect = (r1: any, r2: any) => {
    return !(r2.x > r1.x + r1.w ||
      r2.x + r2.w < r1.x ||
      r2.y > r1.y + r1.h ||
      r2.y + r2.h < r1.y);
  };

  // 砖块碰撞处理
  const handleBrickCollision = useCallback(() => {
    const ball = ballRef.current;
    let scoreToAdd = 0;
    let bricksChanged = false;
    const config = currentLevelConfigRef.current;

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const brick = bricksRef.current[row]?.[col];
        if (!brick || brick.hp <= 0) continue;

        const ballRect = {
          x: ball.x - ball.radius,
          y: ball.y - ball.radius,
          w: ball.radius * 2,
          h: ball.radius * 2
        };
        const brickRect = {
          x: brick.x,
          y: brick.y,
          w: brick.w,
          h: brick.h
        };

        if (collisionRect(ballRect, brickRect)) {
          const overlapLeft = (ballRect.x + ballRect.w) - brickRect.x;
          const overlapRight = (brickRect.x + brickRect.w) - ballRect.x;
          const overlapTop = (ballRect.y + ballRect.h) - brickRect.y;
          const overlapBottom = (brickRect.y + brickRect.h) - ballRect.y;
          const minX = Math.min(overlapLeft, overlapRight);
          const minY = Math.min(overlapTop, overlapBottom);

          if (minX < minY) ball.vx = -ball.vx;
          else ball.vy = -ball.vy;

          brick.hp--;
          if (brick.hp <= 0) {
            const points = Math.floor((brick.initHp === 2 ? 35 : 15) * config.scoreMultiplier);
            scoreToAdd += points;
            addMagicParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, '#f0c0ff', brick.initHp === 2);
            bricksRef.current[row][col] = null;
            bricksChanged = true;
          } else {
            addMagicParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, '#d9aaff', false);
          }

          // 速度微增，但受关卡速度上限影响
          const maxSpeed = 6.2 * config.ballSpeed;
          ball.vx = Math.min(Math.max(ball.vx * 1.02, -maxSpeed), maxSpeed);
          ball.vy = Math.min(Math.max(ball.vy * 1.02, -maxSpeed), maxSpeed);

          if (scoreToAdd > 0) {
            setScore(prev => prev + scoreToAdd);
          }
          return;
        }
      }
    }
  }, [addMagicParticles, BRICK_ROWS, BRICK_COLS]);

  // 游戏更新逻辑
  const updateGame = useCallback(() => {
    if (!gameRunningRef.current) return;
    const config = currentLevelConfigRef.current;

    // 移动挡板
    if (keysRef.current.ArrowLeft && paddleXRef.current > 0) {
      paddleXRef.current -= 7.5;
    }
    if (keysRef.current.ArrowRight && paddleXRef.current < WIDTH - PADDLE_WIDTH) {
      paddleXRef.current += 7.5;
    }

    const ball = ballRef.current;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // 边界碰撞
    if (ball.x - ball.radius <= 0) {
      ball.x = ball.radius;
      ball.vx = -ball.vx;
      addMagicParticles(ball.x, ball.y, '#c89aff');
    }
    if (ball.x + ball.radius >= WIDTH) {
      ball.x = WIDTH - ball.radius;
      ball.vx = -ball.vx;
      addMagicParticles(ball.x, ball.y, '#c89aff');
    }
    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.vy = -ball.vy;
      addMagicParticles(ball.x, ball.y, '#e2bbff');
    }

    // 挡板碰撞
    if (ball.y + ball.radius >= paddleY &&
      ball.y - ball.radius <= paddleY + PADDLE_HEIGHT &&
      ball.x + ball.radius >= paddleXRef.current &&
      ball.x - ball.radius <= paddleXRef.current + PADDLE_WIDTH) {

      const hitPos = (ball.x - paddleXRef.current) / PADDLE_WIDTH;
      const angle = (hitPos - 0.5) * 1.25;
      const speed = Math.hypot(ball.vx, ball.vy);
      let newVx = Math.sin(angle) * speed;
      let newVy = -Math.cos(angle) * speed;
      ball.vx = Math.min(Math.max(newVx, -5.8 * config.ballSpeed), 5.8 * config.ballSpeed);
      ball.vy = newVy;
      if (ball.vy > -1.9) ball.vy = -2.4;
      ball.y = paddleY - ball.radius;
      addMagicParticles(ball.x, ball.y, '#eac0ff', false);
    }

    // 生命损失
    if (ball.y + ball.radius >= HEIGHT) {
      const newLives = livesRef.current - 1;
      if (newLives <= 0) {
        setGameOver(true);
        setGameRunning(false);
        return;
      }
      setLives(newLives);
      ball.x = WIDTH / 2;
      ball.y = HEIGHT - 70;
      const baseSpeed = 2.9;
      ball.vx = baseSpeed * config.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
      ball.vy = -3.2 * config.ballSpeed;
      paddleXRef.current = (WIDTH - PADDLE_WIDTH) / 2;
      addMagicParticles(ball.x, ball.y, '#ffaaee', true);
    }

    // 砖块碰撞
    handleBrickCollision();

    // 胜利判定 - 进入下一关
    let allGone = true;
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        if (bricksRef.current[row]?.[col]?.hp > 0) allGone = false;
      }
    }
    if (allGone) {
      // 通关特效
      for (let i = 0; i < 50; i++) {
        addMagicParticles(WIDTH / 2, HEIGHT / 2, '#ffd966', true);
      }
      // 加载下一关
      loadNextLevel();
      return;
    }

    // 更新粒子
    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.025;
      p.vy += 0.08;
      if (p.life <= 0 || p.y > HEIGHT + 60 || p.x < -60 || p.x > WIDTH + 60) {
        particlesRef.current.splice(i, 1);
        i--;
      }
    }
  }, [handleBrickCollision, addMagicParticles, loadNextLevel, WIDTH, HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, paddleY]);

  // 渲染函数
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas实际分辨率
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // 清空画布
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // 绘制背景
    const grad = ctx.createLinearGradient(0, 0, WIDTH * 0.8, HEIGHT);
    grad.addColorStop(0, '#0f0520');
    grad.addColorStop(0.6, '#22113a');
    grad.addColorStop(1, '#0f0622');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 星尘特效
    for (let i = 0; i < 100; i++) {
      if (Math.random() < 0.03) {
        ctx.fillStyle = `rgba(210, 150, 255, ${0.2 + Math.sin(Date.now() * 0.002 + i) * 0.1})`;
        ctx.beginPath();
        ctx.arc((i * 131) % WIDTH, (Date.now() * 0.3 + i * 55) % HEIGHT, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 绘制砖块
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const b = bricksRef.current[row]?.[col];
        if (!b || b.hp <= 0) continue;
        const { x, y, w, h, hp, style } = b;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "#bf7eff";
        ctx.fillStyle = style.main;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = style.light;
        ctx.fillRect(x + 2, y + 2, w - 4, 4);
        ctx.strokeStyle = style.rune;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

        if (hp === 2) {
          ctx.fillStyle = "#ffdf99";
          ctx.fillRect(x + 5, y + 8, w - 10, 4);
          ctx.fillStyle = "#e7b2ff";
          ctx.fillRect(x + 5, y + 8, (w - 10) / 2, 4);
        }
        ctx.font = "12px 'Segoe UI Symbol'";
        ctx.fillStyle = "#f2e0ff";
        ctx.fillText(['🜁', '🜂', '🜃', '🜄', '✧'][row % 5], x + 5, y + 16);
      }
    }
    ctx.shadowBlur = 0;

    // 绘制挡板
    const paddleX = paddleXRef.current;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#c795ff";
    const paddleGrad = ctx.createLinearGradient(paddleX, paddleY, paddleX + PADDLE_WIDTH, paddleY + PADDLE_HEIGHT);
    paddleGrad.addColorStop(0, '#6a3e8a');
    paddleGrad.addColorStop(1, '#361f52');
    ctx.fillStyle = paddleGrad;
    ctx.fillRect(paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = "#eac0ff";
    ctx.fillRect(paddleX + 8, paddleY + 4, PADDLE_WIDTH - 16, 3);
    for (let i = 0; i < 5; i++) ctx.fillRect(paddleX + 12 + i * 18, paddleY + 9, 6, 4);
    ctx.fillStyle = "#ffecb3";
    ctx.font = "bold 14px monospace";
    ctx.fillText("✦", paddleX + PADDLE_WIDTH / 2 - 6, paddleY + 13);
    ctx.shadowBlur = 0;

    // 绘制球
    const ball = ballRef.current;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#f0bcff";
    const ballGrad = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 2, ball.x, ball.y, ball.radius);
    ballGrad.addColorStop(0, '#fff2cc');
    ballGrad.addColorStop(1, '#dd99ff');
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ball.x - 2, ball.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 绘制粒子
    for (const p of particlesRef.current) {
      ctx.font = `${p.size}px "Segoe UI Symbol", monospace`;
      ctx.fillStyle = `rgba(230, 180, 255, ${p.life * 0.9})`;
      ctx.fillText(p.char, p.x, p.y);
      ctx.fillStyle = `rgba(255, 210, 255, ${p.life * 0.5})`;
      ctx.fillText(p.char, p.x - 1, p.y - 1);
    }

    // 绘制HUD
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = "#e1c2ff";
    ctx.fillText(`✦ 暗月魔晶阵 · 第${currentLevel}层 ✦`, 24, 44);
    ctx.fillStyle = "#c18eff";
    ctx.fillText("魔法弹道", WIDTH - 220, 44);

    let remaining = 0;
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        if (bricksRef.current[row]?.[col]?.hp > 0) remaining++;
      }
    }
    ctx.fillStyle = "#dbb2ff";
    ctx.fillRect(WIDTH - 150, 35, 100, 8);
    ctx.fillStyle = "#be7eff";
    ctx.fillRect(WIDTH - 150, 35, 100 * (1 - remaining / (BRICK_ROWS * BRICK_COLS)), 8);
    ctx.fillStyle = "#ffe2b3";
    ctx.fillText(`🧙 魔晶余烬: ${remaining}`, WIDTH - 450, 44);

    // 关卡升级提示
    if (showLevelUp) {
      ctx.fillStyle = "rgba(15, 5, 35, 0.7)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.font = "bold 36px monospace";
      ctx.fillStyle = "#ffd966";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ffaa00";
      const levelMsg = `✨ 进入第 ${currentLevel} 层 ✨`;
      ctx.fillText(levelMsg, WIDTH / 2 - ctx.measureText(levelMsg).width / 2, HEIGHT / 2);
      ctx.font = "20px monospace";
      ctx.fillStyle = "#e1c2ff";
      const speedMsg = `⚡ 魔法流速 +${Math.round((currentLevelConfigRef.current.ballSpeed - 1) * 100)}%`;
      ctx.fillText(speedMsg, WIDTH / 2 - ctx.measureText(speedMsg).width / 2, HEIGHT / 2 + 50);
      ctx.shadowBlur = 0;
    }

    // 游戏结束/胜利遮罩
    if (!gameRunningRef.current || gameOverRef.current) {
      ctx.fillStyle = "rgba(15, 5, 35, 0.85)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.font = "bold 32px monospace";
      ctx.fillStyle = "#f2d9ff";
      ctx.shadowBlur = 8;

      let msg = gameOverRef.current ? "💀 咒术溃败 · 重启 💀" : "🌙 沉寂法阵";
      ctx.fillText(msg, WIDTH / 2 - ctx.measureText(msg).width / 2, HEIGHT / 2 - 30);
      ctx.font = "16px monospace";
      ctx.fillStyle = "#cfb5ff";
      let sub = "点击 [吟唱重启] 继续远征";
      ctx.fillText(sub, WIDTH / 2 - ctx.measureText(sub).width / 2, HEIGHT / 2 + 35);
      ctx.shadowBlur = 0;
    }
  }, [currentLevel, showLevelUp, BRICK_ROWS, BRICK_COLS, WIDTH, HEIGHT]);

  // 游戏循环
  const gameLoop = useCallback(() => {
    if (!mountedRef.current) return;
    updateGame();
    render();
    animationIdRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, render]);

  // 启动游戏循环
  useEffect(() => {
    mountedRef.current = true;
    animationIdRef.current = requestAnimationFrame(gameLoop);
    return () => {
      mountedRef.current = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [gameLoop]);

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        keysRef.current.ArrowLeft = true;
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        keysRef.current.ArrowRight = true;
        e.preventDefault();
      } else if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        setGameRunning(prev => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        resetGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.ArrowLeft = false;
      if (e.key === 'ArrowRight') keysRef.current.ArrowRight = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetGame]);

  // 触摸屏支持
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const scaleX = WIDTH / rect.width;
      let newX = touchX * scaleX - PADDLE_WIDTH / 2;
      newX = Math.min(Math.max(newX, 0), WIDTH - PADDLE_WIDTH);
      paddleXRef.current = newX;
    };

    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchstart', (e) => e.preventDefault());
    return () => {
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [WIDTH, PADDLE_WIDTH]);

  // 通知父组件状态变化
  useEffect(() => {
    if (onGameStateChange) {
      onGameStateChange({ score, lives, gameRunning, gameOver, gameWin, currentLevel });
    }
  }, [score, lives, gameRunning, gameOver, gameWin, currentLevel, onGameStateChange]);

  // 初始化游戏
  useEffect(() => {
    updateGameDimensions(1);
    initBricks();
    resetGame();
  }, [initBricks, resetGame, updateGameDimensions]);

  return (
    <div className="brickbreaker-wrapper">
      <div className="brickbreaker-container">
        <div className="brickbreaker-header">

          <div className="brickbreaker-stats">
            <div className="brickbreaker-score">
              ✨ 魔力: <span>{score}</span>
            </div>
            <div className="brickbreaker-level">
              🏰 第 {currentLevel} 层
            </div>
            <div className="brickbreaker-lives">
              🧙 生命符文: <span>{'❤️'.repeat(lives)}</span>
            </div>
          </div>
          <button onClick={resetGame} className="brickbreaker-reset-btn">
            🌀 吟唱重启
          </button>
        </div>

        <div className="brickbreaker-canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="brickbreaker-canvas"
          />
        </div>

        <div className="brickbreaker-controls">
          <div className="brickbreaker-instructions">
            🧝 ← → 移动魔法杖 | 击碎魔晶砖块 · 暗黑魔幻纪元 | 空格暂停/继续 | R 重启
          </div>
          <button
            onClick={() => setGameRunning(!gameRunning)}
            className="brickbreaker-pause-btn"
            disabled={gameOver}
          >
            {gameRunning ? '⏸️ 暂停' : '▶️ 继续'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrickBreaker2D;