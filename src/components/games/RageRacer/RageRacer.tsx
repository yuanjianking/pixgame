// RageRacer.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './RageRacer.css';

const LANE_COUNT = 3;
const END_DISTANCE = 2000;
const MAX_CAR = 4;
const MAX_HOLE = 1;
const HOUSE_COUNT = 5;
const TREE_COUNT = 8;
const MIN_CAR_DISTANCE = 100;

interface Player {
  lane: number;
  y: number;
  w: number;
  h: number;
  color: string;
  speed: number;
  maxSpeed: number;
  acc: number;
  rotate: number;
  flameTimer: number;
  finished: boolean;
}

interface Car {
  lane: number;
  y: number;
  w: number;
  h: number;
  col: string;
  type: string;
  dir: number;
}

interface Hole {
  lane: number;
  y: number;
  r: number;
}

interface House {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Tree {
  x: number;
  y: number;
  r: number;
}

interface GameState {
  player: Player;
  cars: Car[];
  holes: Hole[];
  houses: House[];
  trees: Tree[];
  gameTime: number;
  gameRun: boolean;
  gameFinish: boolean;
  worldPos: number;
  roadOffset: number;
  countDown: number;
  lastTime: number;
  keyState: { left: boolean; right: boolean };
  bestTime: number | null;
  roadStartX: number;
  roadTotalW: number;
  laneW: number;
  playerFixedY: number;
  canvasWidth: number;
  canvasHeight: number;
}

const RageRacer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    player: {
      lane: 1,
      y: 0,
      w: 0,
      h: 75,
      color: '#e74c3c',
      speed: 0,
      maxSpeed: 15,
      acc: 0.25,
      rotate: 0,
      flameTimer: 0,
      finished: false
    },
    cars: [],
    holes: [],
    houses: [],
    trees: [],
    gameTime: 0,
    gameRun: false,
    gameFinish: false,
    worldPos: 0,
    roadOffset: 0,
    countDown: 3,
    lastTime: 0,
    keyState: { left: false, right: false },
    bestTime: null,
    roadStartX: 0,
    roadTotalW: 0,
    laneW: 0,
    playerFixedY: 0,
    canvasWidth: 320,
    canvasHeight: 600
  });

  const [timeDisplay, setTimeDisplay] = useState('0.00');
  const [speedDisplay, setSpeedDisplay] = useState('0');
  const [countDownDisplay, setCountDownDisplay] = useState('3');
  const [showCountDown, setShowCountDown] = useState(true);
  const [showLockTip, setShowLockTip] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [endTime, setEndTime] = useState('0.00');
  const [bestTimeDisplay, setBestTimeDisplay] = useState('--');
  const [bestTimeDisplay2, setBestTimeDisplay2] = useState('--');
  const [remainDist, setRemainDist] = useState(END_DISTANCE);
  const [progressPercent, setProgressPercent] = useState(0);

  // RageRacer.tsx 中的 resizeCanvas
    const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = gameStateRef.current;
    state.canvasWidth = 320;
    state.canvasHeight = 600; // 固定600高度
    canvas.width = state.canvasWidth;
    canvas.height = state.canvasHeight;

    state.roadTotalW = state.canvasWidth * 0.75;
    state.laneW = state.roadTotalW / LANE_COUNT;
    state.roadStartX = (state.canvasWidth - state.roadTotalW) / 2;
    state.playerFixedY = state.canvasHeight * 0.8;
    state.player.y = state.playerFixedY;
    state.player.w = state.laneW * 0.35;
    }, []);

  const isPositionBlockedByOthers = useCallback((lane: number, y: number, excludeIndex: number = -1): boolean => {
    const state = gameStateRef.current;
    for (let i = 0; i < state.cars.length; i++) {
      if (i === excludeIndex) continue;
      const car = state.cars[i];
      if (car.lane === lane && Math.abs(car.y - y) < MIN_CAR_DISTANCE) {
        return true;
      }
    }
    return false;
  }, []);

  const hasCarInFront = useCallback((lane: number, y: number): boolean => {
    const state = gameStateRef.current;
    for (const car of state.cars) {
      if (car.lane === lane && car.y > y && car.y - y < MIN_CAR_DISTANCE * 2) {
        return true;
      }
    }
    return false;
  }, []);

  const spawnInitialCars = useCallback(() => {
    const state = gameStateRef.current;
    let attempts = 0;
    let spawned = 0;

    while (spawned < 3 && attempts < 50) {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const y = 150 + spawned * 250 + Math.random() * 200;

      if (lane !== state.player.lane && Math.abs(y - state.player.y) > 200) {
        if (!isPositionBlockedByOthers(lane, y) && !hasCarInFront(lane, y)) {
          const typeRand = Math.random();
          let type: string, w: number, h: number, col: string;

          if (typeRand < 0.33) {
            type = "truck";
            w = state.laneW * 0.6;
            h = 90;
            col = "#555555";
          } else if (typeRand < 0.66) {
            type = "fast";
            w = state.laneW * 0.35;
            h = 75;
            col = "#ff0000";
          } else {
            type = "normal";
            w = state.laneW * 0.35;
            h = 75;
            col = "#3498db";
          }

          state.cars.push({ lane, y, w, h, col, type, dir: 1 });
          spawned++;
        }
      }
      attempts++;
    }
  }, [isPositionBlockedByOthers, hasCarInFront]);

  const initScenery = useCallback(() => {
    const state = gameStateRef.current;
    state.cars = [];
    state.holes = [];
    state.houses = [];
    state.trees = [];
    state.roadOffset = 0;

    for (let i = 0; i < HOUSE_COUNT; i++) {
      const isLeft = i % 2 === 0;
      const x = isLeft ? state.roadStartX * 0.3 : state.canvasWidth - state.roadStartX * 0.3;
      state.houses.push({ x, y: 100 + i * 150 + Math.random() * 200, w: 40, h: 50 });
    }

    for (let i = 0; i < TREE_COUNT; i++) {
      const isLeft = i % 2 === 0;
      const x = isLeft ? state.roadStartX * 0.6 : state.canvasWidth - state.roadStartX * 0.6;
      state.trees.push({ x, y: 50 + i * 120 + Math.random() * 150, r: 18 });
    }

    spawnInitialCars();
  }, [spawnInitialCars]);

  const spawnCar = useCallback(() => {
    const state = gameStateRef.current;
    if (state.cars.length >= MAX_CAR) return;

    const occupiedLanes = new Set<number>();
    for (const car of state.cars) {
      if (Math.abs(car.y - state.player.y) < MIN_CAR_DISTANCE) {
        occupiedLanes.add(car.lane);
      }
    }

    if (occupiedLanes.size >= LANE_COUNT) return;

    const availableLanes: number[] = [];
    for (let i = 0; i < LANE_COUNT; i++) {
      if (!occupiedLanes.has(i)) {
        availableLanes.push(i);
      }
    }

    const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    const newY = -150;

    if (hasCarInFront(lane, newY) || isPositionBlockedByOthers(lane, newY)) {
      return;
    }

    const r = Math.random();
    let type: string, w: number, h: number, col: string;

    if (r < 0.33) {
      type = "truck";
      w = state.laneW * 0.6;
      h = 90;
      col = "#555555";
    } else if (r < 0.66) {
      type = "fast";
      w = state.laneW * 0.35;
      h = 75;
      col = "#ff0000";
    } else {
      type = "normal";
      w = state.laneW * 0.35;
      h = 75;
      col = "#3498db";
    }

    state.cars.push({ lane, y: newY, w, h, col, type, dir: 1 });
  }, [isPositionBlockedByOthers, hasCarInFront]);

  const spawnHole = useCallback(() => {
    const state = gameStateRef.current;
    if (state.holes.length >= MAX_HOLE) return;

    if (Math.random() < 0.3) {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const overlap = state.holes.some(h => h.lane === lane && Math.abs(h.y - (-150)) < 50);
      if (!overlap && lane !== state.player.lane) {
        state.holes.push({ lane, y: -150, r: state.laneW * 0.15 });
      }
    }
  }, []);

  const resetGame = useCallback(() => {
    const state = gameStateRef.current;
    state.player.lane = 1;
    state.player.y = state.playerFixedY;
    state.player.speed = 0;
    state.player.rotate = 0;
    state.player.flameTimer = 0;
    state.player.finished = false;

    state.worldPos = 0;
    state.gameTime = 0;
    state.gameRun = false;
    state.gameFinish = false;
    state.countDown = 3;

    setShowGameOver(false);
    setShowCountDown(true);
    setCountDownDisplay('3');
    setShowLockTip(false);
    setTimeDisplay('0.00');
    setSpeedDisplay('0');
    setRemainDist(END_DISTANCE);
    setProgressPercent(0);

    initScenery();
  }, [initScenery]);

  const drawSingleFlame = useCallback((ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, flameW: number, carH: number, time: number, side: number) => {
    ctx.save();
    ctx.translate(offsetX, offsetY);

    for (let i = 0; i < 4; i++) {
      const waveX = (Math.sin(time * 10 + i * 1.5 + side) * flameW * 0.4);
      const flameH = carH * 0.35 + Math.sin(time * 8 + i) * carH * 0.15;
      const w = flameW * 0.25 + Math.random() * flameW * 0.1;

      const gradient = ctx.createLinearGradient(waveX, 0, waveX, flameH);
      gradient.addColorStop(0, '#ff4400');
      gradient.addColorStop(0.3, '#ff8800');
      gradient.addColorStop(0.6, '#ffcc00');
      gradient.addColorStop(1, 'rgba(255,200,0,0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(waveX - w, 0);
      ctx.quadraticCurveTo(waveX - w * 1.2, flameH * 0.6, waveX, flameH);
      ctx.quadraticCurveTo(waveX + w * 1.2, flameH * 0.6, waveX + w, 0);
      ctx.fill();
    }

    const centerFlame = carH * 0.3 + Math.sin(time * 12) * carH * 0.08;
    const gradient2 = ctx.createLinearGradient(0, 0, 0, centerFlame);
    gradient2.addColorStop(0, '#fff');
    gradient2.addColorStop(0.2, '#ffaa00');
    gradient2.addColorStop(0.5, '#ff4400');
    gradient2.addColorStop(1, 'rgba(255,50,0,0)');

    ctx.fillStyle = gradient2;
    ctx.beginPath();
    ctx.moveTo(-flameW * 0.06, 0);
    ctx.quadraticCurveTo(-flameW * 0.04, centerFlame * 0.5, 0, centerFlame);
    ctx.quadraticCurveTo(flameW * 0.04, centerFlame * 0.5, flameW * 0.06, 0);
    ctx.fill();

    ctx.restore();
  }, []);

  const drawDoubleFlame = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, time: number) => {
    ctx.save();
    ctx.translate(x, y);

    drawSingleFlame(ctx, -w * 0.25, 0, w * 0.3, h, time, -1);
    drawSingleFlame(ctx, w * 0.25, 0, w * 0.3, h, time, 1);

    ctx.restore();
  }, [drawSingleFlame]);

  const drawCar = useCallback((ctx: CanvasRenderingContext2D, lane: number, y: number, w: number, h: number, color: string, isPlayer: boolean = false, rot: number = 0, flameTime: number = 0) => {
    const state = gameStateRef.current;
    const cx = state.roadStartX + lane * state.laneW + state.laneW / 2;
    ctx.save();
    ctx.translate(cx, y);

    if (!isPlayer) {
      ctx.rotate(Math.PI);
    } else {
      ctx.rotate(rot * Math.PI / 180);
    }

    if (isPlayer && flameTime > 0) {
      drawDoubleFlame(ctx, 0, h / 2 + 2, w, h, flameTime);
    }

    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h / 2, w, h);

    ctx.fillStyle = "#222";
    ctx.fillRect(-w / 3, -h / 3, w * 0.6, h * 0.35);

    ctx.fillStyle = "#111";
    ctx.fillRect(-w / 2 - 3, -h / 3, 4, h * 0.3);
    ctx.fillRect(-w / 2 - 3, h / 6, 4, h * 0.3);
    ctx.fillRect(w / 2 - 1, -h / 3, 4, h * 0.3);
    ctx.fillRect(w / 2 - 1, h / 6, 4, h * 0.3);

    if (isPlayer) {
      ctx.fillStyle = "#ffaa00";
      ctx.fillRect(-w / 3, h / 2 - 8, w * 0.6, 6);

      ctx.fillStyle = "#ff0000";
      ctx.fillRect(-w / 3, h / 2 - 4, w * 0.2, 4);
      ctx.fillRect(w / 3 - w * 0.2, h / 2 - 4, w * 0.2, 4);

      ctx.fillStyle = "#888";
      ctx.fillRect(-w * 0.3, h / 2 - 2, w * 0.12, 4);
      ctx.fillRect(w * 0.18, h / 2 - 2, w * 0.12, 4);
    }

    ctx.restore();
  }, [drawDoubleFlame]);

  const drawHole = useCallback((ctx: CanvasRenderingContext2D, hole: Hole) => {
    const state = gameStateRef.current;
    const cx = state.roadStartX + hole.lane * state.laneW + state.laneW / 2;

    ctx.fillStyle = "#5bc0de";
    ctx.beginPath();
    ctx.arc(cx, hole.y, hole.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#3a8ba0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, hole.y, hole.r * 0.8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - hole.r * 0.7, hole.y);
    ctx.lineTo(cx + hole.r * 0.7, hole.y);
    ctx.moveTo(cx, hole.y - hole.r * 0.7);
    ctx.lineTo(cx, hole.y + hole.r * 0.7);
    ctx.stroke();
  }, []);

  const drawHouse = useCallback((ctx: CanvasRenderingContext2D, house: House) => {
    ctx.fillStyle = "#d4a76a";
    ctx.fillRect(house.x - house.w / 2, house.y, house.w, house.h);

    ctx.fillStyle = "#965a3e";
    ctx.beginPath();
    ctx.moveTo(house.x - house.w / 2 - 5, house.y);
    ctx.lineTo(house.x + house.w / 2 + 5, house.y);
    ctx.lineTo(house.x, house.y - 30);
    ctx.fill();

    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(house.x - 8, house.y + 10, 8, 8);
    ctx.fillRect(house.x + 2, house.y + 10, 8, 8);
  }, []);

  const drawTree = useCallback((ctx: CanvasRenderingContext2D, tree: Tree) => {
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(tree.x - 6, tree.y, 12, 25);

    ctx.fillStyle = "#228B22";
    ctx.beginPath();
    ctx.arc(tree.x, tree.y - 5, tree.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2ecc71";
    ctx.beginPath();
    ctx.arc(tree.x - 3, tree.y - 8, tree.r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawRoad = useCallback((ctx: CanvasRenderingContext2D) => {
    const state = gameStateRef.current;

    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);

    ctx.fillStyle = "#4a8c3f";
    ctx.fillRect(0, 0, state.roadStartX, state.canvasHeight);
    ctx.fillRect(state.roadStartX + state.roadTotalW, 0, state.roadStartX, state.canvasHeight);

    ctx.fillStyle = "#444";
    ctx.fillRect(state.roadStartX, 0, state.roadTotalW, state.canvasHeight);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -state.roadOffset;
    for (let i = 1; i < LANE_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(state.roadStartX + state.laneW * i, 0);
      ctx.lineTo(state.roadStartX + state.laneW * i, state.canvasHeight);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.strokeStyle = "#ff0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(state.roadStartX, 0);
    ctx.lineTo(state.roadStartX, state.canvasHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(state.roadStartX + state.roadTotalW, 0);
    ctx.lineTo(state.roadStartX + state.roadTotalW, state.canvasHeight);
    ctx.stroke();

    if (state.gameFinish || state.worldPos >= END_DISTANCE) {
      const endLineY = state.playerFixedY - 30;

      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(state.roadStartX - 5, endLineY);
      ctx.lineTo(state.roadStartX + state.roadTotalW + 5, endLineY);
      ctx.stroke();

      ctx.fillStyle = "#000";
      for (let x = state.roadStartX; x < state.roadStartX + state.roadTotalW; x += 20) {
        ctx.fillRect(x, endLineY - 4, 10, 8);
      }

      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 22px sans-serif";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.strokeText("终 点 站", state.canvasWidth / 2, endLineY - 18);
      ctx.fillText("终 点 站", state.canvasWidth / 2, endLineY - 18);
    }

    ctx.textAlign = "left";
  }, []);

  const update = useCallback((dt: number) => {
    const state = gameStateRef.current;

    if (state.countDown > 0) {
      state.countDown -= dt;
      if (state.countDown <= 0) {
        setShowCountDown(false);
        state.gameRun = true;
      } else {
        setCountDownDisplay(String(Math.ceil(state.countDown)));
      }
    }

    if (!state.gameRun || state.gameFinish) return;

    state.gameTime += dt;
    setTimeDisplay(state.gameTime.toFixed(2));

    if (state.keyState.left && state.player.lane > 0 && !state.player.finished) {
      state.player.lane--;
      state.keyState.left = false;
    }
    if (state.keyState.right && state.player.lane < LANE_COUNT - 1 && !state.player.finished) {
      state.player.lane++;
      state.keyState.right = false;
    }

    if (state.player.speed > 5 && !state.player.finished) {
      state.player.flameTimer += dt;
    } else {
      state.player.flameTimer = Math.max(0, state.player.flameTimer - dt * 2);
    }

    if (Math.abs(state.player.rotate) > 0.1) {
      state.player.rotate *= 0.9;
    } else {
      state.player.rotate = 0;
    }

    if (!state.player.finished) {
      if (state.player.speed < state.player.maxSpeed) {
        state.player.speed += state.player.acc;
      }
      if (state.player.speed < 4) state.player.speed = 4;
      if (state.player.speed > state.player.maxSpeed) state.player.speed = state.player.maxSpeed;
    } else {
      state.player.speed = 0;
    }

    setSpeedDisplay(String(Math.round(state.player.speed)));

    const visualSpeed = state.player.speed * 2.2;

    if (!state.player.finished) {
      state.worldPos += state.player.speed * dt;
    }
    state.roadOffset += visualSpeed * dt;

    const remain = Math.max(0, END_DISTANCE - state.worldPos);
    const pct = Math.min(100, (state.worldPos / END_DISTANCE) * 100);
    setRemainDist(Math.round(remain));
    setProgressPercent(pct);

    if (state.worldPos >= END_DISTANCE && !state.player.finished) {
      state.player.finished = true;
      state.player.y = state.playerFixedY - 30;
      state.gameFinish = true;
      const t = parseFloat(state.gameTime.toFixed(2));
      setEndTime(String(t));
      if (state.bestTime === null || t < state.bestTime) {
        state.bestTime = t;
        setBestTimeDisplay(String(t));
        setBestTimeDisplay2(String(t));
      } else {
        setBestTimeDisplay(String(state.bestTime));
        setBestTimeDisplay2(String(state.bestTime));
      }
      setShowGameOver(true);
      return;
    }

    if (!state.player.finished) {
      if (Math.random() < 0.02) spawnCar();
      if (Math.random() < 0.005) spawnHole();
    }

    // 更新车辆
    for (let i = state.cars.length - 1; i >= 0; i--) {
      const car = state.cars[i];
      let spd = visualSpeed * 0.4;

      if (car.type === "truck") {
        spd *= 0.3;
      } else if (car.type === "fast") {
        spd *= 1.8;
      }

      let newY = car.y + spd;

      for (let j = 0; j < state.cars.length; j++) {
        if (i === j) continue;
        const other = state.cars[j];
        if (car.lane === other.lane) {
          if (other.y > car.y && other.y - newY < MIN_CAR_DISTANCE) {
            newY = other.y - MIN_CAR_DISTANCE;
          }
        }
      }

      car.y = newY;

      if (car.y > state.canvasHeight + 200) {
        state.cars.splice(i, 1);
      }

      if (!state.player.finished && car.lane === state.player.lane && Math.abs(car.y - state.player.y) < 60) {
        if (car.type === "truck") {
          state.player.speed = Math.max(3, state.player.speed - 6);
          state.player.rotate += 15;
        } else {
          state.player.speed = Math.max(4, state.player.speed - 4);
        }
        setShowLockTip(true);
        setTimeout(() => setShowLockTip(false), 800);
      }
    }

    // 更新坑洞
    for (let i = state.holes.length - 1; i >= 0; i--) {
      const hole = state.holes[i];
      hole.y += visualSpeed;

      if (hole.y > state.canvasHeight + 100) {
        state.holes.splice(i, 1);
      }

      if (!state.player.finished && hole.lane === state.player.lane && Math.abs(hole.y - state.player.y) < 60) {
        state.player.speed = Math.max(4, state.player.speed - 4);
        setShowLockTip(true);
        setTimeout(() => setShowLockTip(false), 800);
      }
    }

    // 更新房屋
    state.houses.forEach(house => {
      house.y += visualSpeed * 0.3;
      if (house.y > state.canvasHeight + 100) {
        house.y = -100 - Math.random() * 100;
        house.x = Math.random() < 0.5 ? state.roadStartX * 0.3 : state.canvasWidth - state.roadStartX * 0.3;
      }
    });

    // 更新树木
    state.trees.forEach(tree => {
      tree.y += visualSpeed * 0.3;
      if (tree.y > state.canvasHeight + 100) {
        tree.y = -80 - Math.random() * 100;
        tree.x = Math.random() < 0.5 ? state.roadStartX * 0.6 : state.canvasWidth - state.roadStartX * 0.6;
      }
    });
  }, [spawnCar, spawnHole]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const state = gameStateRef.current;

    drawRoad(ctx);
    state.trees.forEach(tree => drawTree(ctx, tree));
    state.houses.forEach(house => drawHouse(ctx, house));
    state.holes.forEach(hole => drawHole(ctx, hole));
    state.cars.forEach(car => drawCar(ctx, car.lane, car.y, car.w, car.h, car.col));
    drawCar(ctx, state.player.lane, state.player.y, state.player.w, state.player.h, state.player.color, true, state.player.rotate, state.player.flameTimer);
  }, [drawRoad, drawTree, drawHouse, drawHole, drawCar]);

  useEffect(() => {
    resizeCanvas();
    initScenery();

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    let animationId: number;
    const gameLoop = (time: number) => {
      const state = gameStateRef.current;
      const dt = Math.min((time - state.lastTime) / 1000, 0.05);
      state.lastTime = time;
      update(dt);
      render();
      animationId = requestAnimationFrame(gameLoop);
    };

    gameStateRef.current.lastTime = performance.now();
    animationId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [resizeCanvas, initScenery, update, render]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a") state.keyState.left = true;
      if (e.key === "ArrowRight" || e.key === "d") state.keyState.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a") state.keyState.left = false;
      if (e.key === "ArrowRight" || e.key === "d") state.keyState.right = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="rage-racer">
      <div className="game-title">暴力赛车</div>

      <div className="distance-ui">
        <div>总距离：<span>{END_DISTANCE}</span> m</div>
        <div>剩余：<span>{remainDist}</span> m</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div style={{ marginTop: '4px' }}>最短纪录：<span>{bestTimeDisplay}</span> s</div>
      </div>

      <div className="info">
        用时：<span>{timeDisplay}</span> s
        时速：<span>{speedDisplay}</span>/15 km/h
      </div>

      {showCountDown && (
        <div className="countdown">{countDownDisplay}</div>
      )}

      {showLockTip && (
        <div className="lockTip">撞车减速</div>
      )}

      {showGameOver && (
        <div className="gameOver">
            <div>🏁 抵达终点！</div>
            <div style={{ margin: '10px 0' }}>本次用时：<span>{endTime}</span> 秒</div>
            <div style={{ margin: '10px 0' }}>最短纪录：<span>{bestTimeDisplay2}</span> 秒</div>
            <button onClick={resetGame}>再来一局</button>
        </div>
        )}

      <canvas ref={canvasRef}></canvas>

      <button
        className="rage-btn rage-left-btn"
        onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.keyState.left = true; }}
        onTouchEnd={(e) => { e.preventDefault(); gameStateRef.current.keyState.left = false; }}
        onMouseDown={(e) => { e.preventDefault(); gameStateRef.current.keyState.left = true; }}
        onMouseUp={(e) => { e.preventDefault(); gameStateRef.current.keyState.left = false; }}
      >
        ←
      </button>

      <button
        className="rage-btn rage-right-btn"
        onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.keyState.right = true; }}
        onTouchEnd={(e) => { e.preventDefault(); gameStateRef.current.keyState.right = false; }}
        onMouseDown={(e) => { e.preventDefault(); gameStateRef.current.keyState.right = true; }}
        onMouseUp={(e) => { e.preventDefault(); gameStateRef.current.keyState.right = false; }}
      >
        →
      </button>
    </div>
  );
};

export default RageRacer;