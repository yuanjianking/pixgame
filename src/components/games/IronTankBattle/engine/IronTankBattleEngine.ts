// src/components/IronTankBattle/engine/IronTankBattleEngine.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BASE_POS,
  BULLET_SIZE,
  BULLET_SPEED,
  ENEMY_SPAWN_INTERVAL_FRAMES,
  ENEMY_TYPES,
  HEIGHT,
  PLAYER_SHOOT_DELAY,
  PLAYER_SIZE,
  WIDTH,
  type GameState,
  type Player,
  type Enemy,
  type Bullet,
  type Wall,
  type Direction,
  PLAYER_SPAWN_X,
  PLAYER_SPAWN_Y
} from './gameTypes';
import { rectCollide } from './renderers';

// 固定三个出生点（左上、上中、右上）
const ENEMY_SPAWN_POINTS = [
  { x: 40, y: 40 },
  { x: WIDTH / 2 - PLAYER_SIZE / 2, y: 40 },
  { x: WIDTH - PLAYER_SIZE - 40, y: 40 }
];

// 生成随机墙体
function generateRandomWalls(level: number): { steelWalls: Wall[]; brickWalls: Wall[] } {
  const steelCount = Math.min(20, 6 + Math.floor(level * 1.2) + Math.floor(Math.random() * 6));
  const steelWalls: Wall[] = [];
  const safeZone = { x: WIDTH / 2 - 110, y: HEIGHT - 140, w: 220, h: 110 };
  const baseSafe = { x: BASE_POS.x - 50, y: BASE_POS.y - 45, w: BASE_POS.w + 100, h: BASE_POS.h + 80 };

  for (let i = 0; i < steelCount; i++) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const w = 32 + Math.floor(Math.random() * 16);
      const h = 32 + Math.floor(Math.random() * 16);
      const x = 15 + Math.random() * (WIDTH - w - 30);
      const y = 25 + Math.random() * (HEIGHT - h - 100);
      const rect = { x, y, w, h };
      if (rectCollide(rect, safeZone) || rectCollide(rect, baseSafe)) continue;
      let overlap = false;
      for (const existing of steelWalls) {
        if (rectCollide(rect, { x: existing.x, y: existing.y, w: existing.w, h: existing.h })) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        steelWalls.push({ x, y, w, h, type: 'steel' });
        break;
      }
    }
  }

  const brickCount = Math.min(30, 8 + Math.floor(level * 1.5) + Math.floor(Math.random() * 8));
  const brickWalls: Wall[] = [];
  for (let i = 0; i < brickCount; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const w = 28 + Math.floor(Math.random() * 14);
      const h = 28 + Math.floor(Math.random() * 14);
      const x = 15 + Math.random() * (WIDTH - w - 30);
      const y = 25 + Math.random() * (HEIGHT - h - 100);
      const rect = { x, y, w, h };
      if (rectCollide(rect, safeZone) || rectCollide(rect, baseSafe)) continue;
      let overlap = false;
      for (const sw of steelWalls) {
        if (rectCollide(rect, { x: sw.x, y: sw.y, w: sw.w, h: sw.h })) {
          overlap = true;
          break;
        }
      }
      for (const bw of brickWalls) {
        if (rectCollide(rect, { x: bw.x, y: bw.y, w: bw.w, h: bw.h })) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        brickWalls.push({ x, y, w, h, active: true, type: 'brick' });
        break;
      }
    }
  }
  return { steelWalls, brickWalls };
}

function initBaseWalls(): Wall[] {
  const walls: Wall[] = [];
  const bx = BASE_POS.x, by = BASE_POS.y;
  for (let i = 0; i < 5; i++) {
    walls.push({ x: bx + i * 12, y: by - 10, w: 12, h: 10, active: true, type: 'baseWall' });
    if (i === 0 || i === 4) walls.push({ x: bx + i * 12, y: by + 30, w: 12, h: 10, active: true, type: 'baseWall' });
  }
  walls.push({ x: bx - 10, y: by - 5, w: 10, h: 40, active: true, type: 'baseWall' });
  walls.push({ x: bx + 60, y: by - 5, w: 10, h: 40, active: true, type: 'baseWall' });
  walls.push({ x: bx + 15, y: by + 30, w: 12, h: 10, active: true, type: 'baseWall' });
  walls.push({ x: bx + 33, y: by + 30, w: 12, h: 10, active: true, type: 'baseWall' });
  return walls;
}

// 每关坦克数量：第1关10个，之后每关+5
function getTotalEnemiesForLevel(level: number): number {
  return 10 + (level - 1) * 5;
}

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

// 检查位置是否合法
function isValidSpawn(
  x: number,
  y: number,
  w: number,
  h: number,
  player: Player,
  enemies: Enemy[],
  steelWalls: Wall[],
  breakableWalls: Wall[],
  baseWalls: Wall[]
): boolean {
  const rect = { x, y, w, h };

  if (rectCollide(rect, BASE_POS)) return false;

  if (player.active) {
    const dx = x + w / 2 - (player.x + PLAYER_SIZE / 2);
    const dy = y + h / 2 - (player.y + PLAYER_SIZE / 2);
    if (Math.hypot(dx, dy) < 100) return false;
  }

  for (const wall of steelWalls) {
    if (rectCollide(rect, { x: wall.x, y: wall.y, w: wall.w, h: wall.h })) return false;
  }

  for (const wall of breakableWalls) {
    if (rectCollide(rect, { x: wall.x, y: wall.y, w: wall.w, h: wall.h })) return false;
  }

  for (const wall of baseWalls) {
    if (wall.active && rectCollide(rect, { x: wall.x, y: wall.y, w: wall.w, h: wall.h })) return false;
  }

  for (const enemy of enemies) {
    if (enemy.active && rectCollide(rect, { x: enemy.x, y: enemy.y, w: enemy.width, h: enemy.height })) return false;
  }

  return true;
}

// 在指定出生点生成敌人
function spawnEnemyAtPoint(
  spawnIndex: number,
  currentLevel: number,
  steelWalls: Wall[],
  breakableWalls: Wall[],
  baseWalls: Wall[],
  player: Player,
  existingEnemies: Enemy[]
): Enemy {
  const r = Math.random();
  let type;
  if (currentLevel >= 7) {
    if (r < 0.4) type = ENEMY_TYPES.NORMAL;
    else if (r < 0.7) type = ENEMY_TYPES.HEAVY;
    else type = ENEMY_TYPES.FAST;
  } else if (currentLevel >= 4) {
    if (r < 0.5) type = ENEMY_TYPES.NORMAL;
    else if (r < 0.75) type = ENEMY_TYPES.HEAVY;
    else type = ENEMY_TYPES.FAST;
  } else {
    if (r < 0.6) type = ENEMY_TYPES.NORMAL;
    else if (r < 0.8) type = ENEMY_TYPES.HEAVY;
    else type = ENEMY_TYPES.FAST;
  }

  const spawnPoint = ENEMY_SPAWN_POINTS[spawnIndex % ENEMY_SPAWN_POINTS.length];
  let x = spawnPoint.x;
  let y = spawnPoint.y;
  const w = type.width;
  const h = type.height;

  let attempts = 0;
  while (!isValidSpawn(x, y, w, h, player, existingEnemies, steelWalls, breakableWalls, baseWalls) && attempts < 30) {
    const offsetX = (attempts % 3 - 1) * 12;
    const offsetY = Math.floor(attempts / 3) * 12;
    x = spawnPoint.x + offsetX;
    y = spawnPoint.y + offsetY;
    attempts++;
  }

  return {
    x, y, width: w, height: h,
    direction: DIRECTIONS[Math.floor(Math.random() * 4)],
    active: true,
    type,
    health: type.health,
    shootCooldown: 10,
    invincibleTimer: 45
  };
}

function getTankBounds(tank: { x: number; y: number; width: number; height: number }) {
  return { x: tank.x, y: tank.y, w: tank.width, h: tank.height };
}

function resolveBaseCoreCollision(
  entity: { x: number; y: number; width: number; height: number },
  baseActive: boolean
): void {
  if (!baseActive) return;
  const bounds = getTankBounds(entity);
  const baseBounds = { x: BASE_POS.x, y: BASE_POS.y, w: BASE_POS.w, h: BASE_POS.h };

  if (!rectCollide(bounds, baseBounds)) return;

  const overlapX = Math.min(bounds.x + bounds.w - baseBounds.x, baseBounds.x + baseBounds.w - bounds.x);
  const overlapY = Math.min(bounds.y + bounds.h - baseBounds.y, baseBounds.y + baseBounds.h - bounds.y);

  if (overlapX < overlapY) {
    if (bounds.x < baseBounds.x) entity.x = baseBounds.x - entity.width;
    else entity.x = baseBounds.x + baseBounds.w;
  } else {
    if (bounds.y < baseBounds.y) entity.y = baseBounds.y - entity.height;
    else entity.y = baseBounds.y + baseBounds.h;
  }
}

function resolveWallCollision(
  entity: { x: number; y: number; width: number; height: number },
  steelWalls: Wall[],
  breakableWalls: Wall[],
  baseWalls: Wall[]
): void {
  const bounds = getTankBounds(entity);

  for (const w of steelWalls) {
    const wallBounds = { x: w.x, y: w.y, w: w.w, h: w.h };
    if (rectCollide(bounds, wallBounds)) {
      const overlapX = Math.min(bounds.x + bounds.w - wallBounds.x, wallBounds.x + wallBounds.w - bounds.x);
      const overlapY = Math.min(bounds.y + bounds.h - wallBounds.y, wallBounds.y + wallBounds.h - bounds.y);
      if (overlapX < overlapY) {
        if (bounds.x < wallBounds.x) entity.x = wallBounds.x - entity.width;
        else entity.x = wallBounds.x + wallBounds.w;
      } else {
        if (bounds.y < wallBounds.y) entity.y = wallBounds.y - entity.height;
        else entity.y = wallBounds.y + wallBounds.h;
      }
      return;
    }
  }

  for (const w of breakableWalls) {
    const wallBounds = { x: w.x, y: w.y, w: w.w, h: w.h };
    if (rectCollide(bounds, wallBounds)) {
      const overlapX = Math.min(bounds.x + bounds.w - wallBounds.x, wallBounds.x + wallBounds.w - bounds.x);
      const overlapY = Math.min(bounds.y + bounds.h - wallBounds.y, wallBounds.y + wallBounds.h - bounds.y);
      if (overlapX < overlapY) {
        if (bounds.x < wallBounds.x) entity.x = wallBounds.x - entity.width;
        else entity.x = wallBounds.x + wallBounds.w;
      } else {
        if (bounds.y < wallBounds.y) entity.y = wallBounds.y - entity.height;
        else entity.y = wallBounds.y + wallBounds.h;
      }
      return;
    }
  }

  for (const w of baseWalls) {
    if (!w.active) continue;
    const wallBounds = { x: w.x, y: w.y, w: w.w, h: w.h };
    if (rectCollide(bounds, wallBounds)) {
      const overlapX = Math.min(bounds.x + bounds.w - wallBounds.x, wallBounds.x + wallBounds.w - bounds.x);
      const overlapY = Math.min(bounds.y + bounds.h - wallBounds.y, wallBounds.y + wallBounds.h - bounds.y);
      if (overlapX < overlapY) {
        if (bounds.x < wallBounds.x) entity.x = wallBounds.x - entity.width;
        else entity.x = wallBounds.x + wallBounds.w;
      } else {
        if (bounds.y < wallBounds.y) entity.y = wallBounds.y - entity.height;
        else entity.y = wallBounds.y + wallBounds.h;
      }
      return;
    }
  }
}

function resolveTankCollision(t1: Player | Enemy, t2: Player | Enemy, isPlayerVsEnemy: boolean = false): void {
  const bounds1 = getTankBounds(t1);
  const bounds2 = getTankBounds(t2);

  if (!rectCollide(bounds1, bounds2)) return;

  const overlapX = Math.min(bounds1.x + bounds1.w - bounds2.x, bounds2.x + bounds2.w - bounds1.x);
  const overlapY = Math.min(bounds1.y + bounds1.h - bounds2.y, bounds2.y + bounds2.h - bounds1.y);

  if (isPlayerVsEnemy) {
    if (overlapX < overlapY) {
      if (t2.x < t1.x) t2.x -= overlapX;
      else t2.x += overlapX;
    } else {
      if (t2.y < t1.y) t2.y -= overlapY;
      else t2.y += overlapY;
    }
    const dx = t2.x - t1.x;
    const dy = t2.y - t1.y;
    const len = Math.hypot(dx, dy);
    if (len > 0.01) {
      const nx = dx / len;
      const ny = dy / len;
      t2.x += nx * 4;
      t2.y += ny * 4;
    }
  } else {
    if (overlapX < overlapY) {
      const push = overlapX / 2;
      if (t1.x < t2.x) { t1.x -= push; t2.x += push; }
      else { t1.x += push; t2.x -= push; }
    } else {
      const push = overlapY / 2;
      if (t1.y < t2.y) { t1.y -= push; t2.y += push; }
      else { t1.y += push; t2.y -= push; }
    }
  }
}

function applyBoundary(entity: { x: number; y: number; width: number; height: number }): void {
  if (entity.x < 0) entity.x = 0;
  if (entity.y < 0) entity.y = 0;
  if (entity.x + entity.width > WIDTH) entity.x = WIDTH - entity.width;
  if (entity.y + entity.height > HEIGHT) entity.y = HEIGHT - entity.height;
}

export function useIronTankBattleEngine() {
  // 刷怪计数器（每帧递减）
  const spawnCounterRef = useRef(10);
  const totalSpawnedRef = useRef(0);
  const totalToSpawnRef = useRef(getTotalEnemiesForLevel(1));
  const levelClearedRef = useRef(false);
  const currentSpawnIndexRef = useRef(0);
  const frameIdRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>(() => {
    const { steelWalls, brickWalls } = generateRandomWalls(1);
    const baseWalls = initBaseWalls();
    const player: Player = {
      x: PLAYER_SPAWN_X,
      y: PLAYER_SPAWN_Y,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      direction: 'up',
      active: true,
      invincibleTimer: 65,
      shootCooldown: 0
    };

    const totalToSpawn = getTotalEnemiesForLevel(1);
    let totalSpawned = 0;

    const initialEnemies: Enemy[] = [];
    for (let spawnIdx = 0; spawnIdx < ENEMY_SPAWN_POINTS.length && totalSpawned < totalToSpawn; spawnIdx++) {
      const enemy = spawnEnemyAtPoint(spawnIdx, 1, steelWalls, brickWalls, baseWalls, player, initialEnemies);
      initialEnemies.push(enemy);
      totalSpawned++;
    }

    console.log(`🎮 第1关: 需要 ${totalToSpawn} 个敌人，初始生成 ${totalSpawned}`);

    return {
      player,
      enemies: initialEnemies,
      bullets: [],
      steelWalls,
      breakableWalls: brickWalls,
      baseWalls,
      baseActive: true,
      score: 0,
      lives: 3,
      enemiesDestroyed: 0,
      currentLevel: 1,
      gameOver: false,
      waveActive: true
    };
  });

  const resetGame = useCallback(() => {
    const { steelWalls, brickWalls } = generateRandomWalls(1);
    const baseWalls = initBaseWalls();
    const player: Player = {
      x: PLAYER_SPAWN_X,
      y: PLAYER_SPAWN_Y,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      direction: 'up',
      active: true,
      invincibleTimer: 65,
      shootCooldown: 0
    };

    totalToSpawnRef.current = getTotalEnemiesForLevel(1);
    totalSpawnedRef.current = 0;
    spawnCounterRef.current = 10;
    currentSpawnIndexRef.current = 0;
    levelClearedRef.current = false;

    const initialEnemies: Enemy[] = [];
    for (let spawnIdx = 0; spawnIdx < ENEMY_SPAWN_POINTS.length && totalSpawnedRef.current < totalToSpawnRef.current; spawnIdx++) {
      const enemy = spawnEnemyAtPoint(spawnIdx, 1, steelWalls, brickWalls, baseWalls, player, initialEnemies);
      initialEnemies.push(enemy);
      totalSpawnedRef.current++;
    }

    console.log(`🔄 重置: 第1关需要 ${totalToSpawnRef.current} 个敌人，初始生成 ${totalSpawnedRef.current}`);

    setGameState({
      player,
      enemies: initialEnemies,
      bullets: [],
      steelWalls,
      breakableWalls: brickWalls,
      baseWalls,
      baseActive: true,
      score: 0,
      lives: 3,
      enemiesDestroyed: 0,
      currentLevel: 1,
      gameOver: false,
      waveActive: true
    });
  }, []);

  const startLevel = useCallback((level: number) => {
    const { steelWalls, brickWalls } = generateRandomWalls(level);
    const baseWalls = initBaseWalls();
    const player: Player = {
      x: PLAYER_SPAWN_X,
      y: PLAYER_SPAWN_Y,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      direction: 'up',
      active: true,
      invincibleTimer: 65,
      shootCooldown: 0
    };

    totalToSpawnRef.current = getTotalEnemiesForLevel(level);
    totalSpawnedRef.current = 0;
    spawnCounterRef.current = 10;
    currentSpawnIndexRef.current = 0;
    levelClearedRef.current = false;

    const initialEnemies: Enemy[] = [];
    for (let spawnIdx = 0; spawnIdx < ENEMY_SPAWN_POINTS.length && totalSpawnedRef.current < totalToSpawnRef.current; spawnIdx++) {
      const enemy = spawnEnemyAtPoint(spawnIdx, level, steelWalls, brickWalls, baseWalls, player, initialEnemies);
      initialEnemies.push(enemy);
      totalSpawnedRef.current++;
    }

    console.log(`🎯 第${level}关: 需要 ${totalToSpawnRef.current} 个敌人，初始生成 ${totalSpawnedRef.current}`);

    setGameState(prev => ({
      ...prev,
      player,
      enemies: initialEnemies,
      bullets: [],
      steelWalls,
      breakableWalls: brickWalls,
      baseWalls,
      baseActive: true,
      currentLevel: level,
      gameOver: false,
      waveActive: true,
      score: prev.score,
      lives: prev.lives,
      enemiesDestroyed: prev.enemiesDestroyed
    }));
  }, []);

  const handleShoot = useCallback(() => {
    setGameState(prev => {
      if (prev.gameOver || !prev.player.active || prev.player.shootCooldown !== 0) return prev;
      const player = prev.player;
      const cx = player.x + player.width / 2, cy = player.y + player.height / 2;
      let vx = 0, vy = 0, bx = cx - BULLET_SIZE / 2, by = cy - BULLET_SIZE / 2;
      if (player.direction === 'up') { vx = 0; vy = -BULLET_SPEED; by = player.y - 8; }
      else if (player.direction === 'down') { vx = 0; vy = BULLET_SPEED; by = player.y + player.height - 4; }
      else if (player.direction === 'left') { vx = -BULLET_SPEED; vy = 0; bx = player.x - 8; }
      else { vx = BULLET_SPEED; vy = 0; bx = player.x + player.width - 2; }
      const newBullet: Bullet = {
        x: bx, y: by, w: BULLET_SIZE, h: BULLET_SIZE, vx, vy,
        owner: 'player', active: true, damage: 1
      };
      return {
        ...prev,
        bullets: [...prev.bullets, newBullet],
        player: { ...player, shootCooldown: PLAYER_SHOOT_DELAY }
      };
    });
  }, []);

  const movePlayer = useCallback((dx: number, dy: number, direction: Direction) => {
    setGameState(prev => {
      if (prev.gameOver || !prev.player.active) return prev;

      const newPlayer = { ...prev.player, direction };
      const steps = Math.max(Math.abs(dx), Math.abs(dy));

      if (steps > 0) {
        const stepX = dx / steps;
        const stepY = dy / steps;
        for (let i = 0; i < steps; i++) {
          newPlayer.x += stepX;
          newPlayer.y += stepY;

          resolveWallCollision(newPlayer, prev.steelWalls, prev.breakableWalls, prev.baseWalls);
          resolveBaseCoreCollision(newPlayer, prev.baseActive);

          for (const e of prev.enemies) {
            if (e.active && rectCollide(getTankBounds(newPlayer), getTankBounds(e))) {
              newPlayer.x -= stepX;
              newPlayer.y -= stepY;
              break;
            }
          }
        }
      }

      applyBoundary(newPlayer);
      resolveBaseCoreCollision(newPlayer, prev.baseActive);

      return { ...prev, player: newPlayer };
    });
  }, []);

  // 游戏主循环 - 包含刷怪逻辑（统一驱动）
  const updateGame = useCallback(() => {
    setGameState(prev => {
      if (prev.gameOver) return prev;

      const newState = { ...prev };

      // 玩家冷却递减
      if (newState.player.shootCooldown > 0) newState.player.shootCooldown--;
      if (newState.player.invincibleTimer > 0) newState.player.invincibleTimer--;

      // 敌人无敌帧递减
      for (const e of newState.enemies) {
        if (e.invincibleTimer && e.invincibleTimer > 0) {
          e.invincibleTimer--;
        }
      }

      // ========== 刷怪逻辑（统一在游戏循环中处理）==========
      if (!newState.gameOver && newState.waveActive && totalSpawnedRef.current < totalToSpawnRef.current) {
        spawnCounterRef.current--;

        if (spawnCounterRef.current <= 0) {
          const spawnIndex = currentSpawnIndexRef.current % ENEMY_SPAWN_POINTS.length;
          const newEnemy = spawnEnemyAtPoint(
            spawnIndex,
            newState.currentLevel,
            newState.steelWalls,
            newState.breakableWalls,
            newState.baseWalls,
            newState.player,
            newState.enemies
          );

          currentSpawnIndexRef.current++;
          totalSpawnedRef.current++;
          spawnCounterRef.current = ENEMY_SPAWN_INTERVAL_FRAMES;
          console.log(`✨ 生成敌人 ${totalSpawnedRef.current}/${totalToSpawnRef.current}`);

          newState.enemies.push(newEnemy);
        }
      }
      // ==================================================

      // 敌人移动
      for (const e of newState.enemies) {
        if (!e.active) continue;
        if (Math.random() < 0.02) {
          e.direction = DIRECTIONS[Math.floor(Math.random() * 4)];
        }
        let dx = 0, dy = 0;
        const spd = e.type.speed;
        if (e.direction === 'up') dy = -spd;
        else if (e.direction === 'down') dy = spd;
        else if (e.direction === 'left') dx = -spd;
        else dx = spd;

        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        if (steps > 0) {
          const stepX = dx / steps;
          const stepY = dy / steps;
          for (let i = 0; i < steps; i++) {
            e.x += stepX;
            e.y += stepY;
            resolveWallCollision(e, newState.steelWalls, newState.breakableWalls, newState.baseWalls);
            resolveBaseCoreCollision(e, newState.baseActive);
          }
        }
        applyBoundary(e);
      }

      // 敌人之间碰撞
      for (let iter = 0; iter < 5; iter++) {
        for (let i = 0; i < newState.enemies.length; i++) {
          for (let j = i + 1; j < newState.enemies.length; j++) {
            resolveTankCollision(newState.enemies[i], newState.enemies[j], false);
          }
        }
      }

      // 玩家与敌人碰撞
      for (const e of newState.enemies) {
        if (e.active && rectCollide(getTankBounds(newState.player), getTankBounds(e))) {
          resolveTankCollision(newState.player, e, true);
        }
      }
      applyBoundary(newState.player);
      resolveBaseCoreCollision(newState.player, newState.baseActive);

      // 敌人射击
      for (const e of newState.enemies) {
        if (!e.active) continue;

        if (e.invincibleTimer && e.invincibleTimer > 0) continue;

        if (e.shootCooldown <= 0 && !newState.gameOver && newState.player.active) {
          const cx = e.x + e.width / 2, cy = e.y + e.height / 2;
          let vx = 0, vy = 0, bx = cx - BULLET_SIZE / 2, by = cy - BULLET_SIZE / 2;
          if (e.direction === 'up') { vx = 0; vy = -BULLET_SPEED; by = e.y - 6; }
          else if (e.direction === 'down') { vx = 0; vy = BULLET_SPEED; by = e.y + e.height - 6; }
          else if (e.direction === 'left') { vx = -BULLET_SPEED; vy = 0; bx = e.x - 6; }
          else { vx = BULLET_SPEED; vy = 0; bx = e.x + e.width - 2; }
          newState.bullets.push({
            x: bx, y: by, w: BULLET_SIZE, h: BULLET_SIZE, vx, vy,
            owner: 'enemy', active: true, damage: 1
          });
          e.shootCooldown = e.type.shootDelay;
        } else {
          e.shootCooldown--;
        }
      }

      // 子弹更新
      for (let i = 0; i < newState.bullets.length; i++) {
        const b = newState.bullets[i];
        if (!b.active) continue;
        b.x += b.vx;
        b.y += b.vy;
        if (b.x + b.w < 0 || b.x > WIDTH || b.y + b.h < 0 || b.y > HEIGHT) {
          b.active = false;
          continue;
        }

        let hit = false;

        for (const wall of newState.steelWalls) {
          if (rectCollide({ x: b.x, y: b.y, w: b.w, h: b.h }, { x: wall.x, y: wall.y, w: wall.w, h: wall.h })) {
            hit = true;
            break;
          }
        }
        if (hit) { b.active = false; continue; }

        for (let j = 0; j < newState.breakableWalls.length; j++) {
          if (rectCollide({ x: b.x, y: b.y, w: b.w, h: b.h }, { x: newState.breakableWalls[j].x, y: newState.breakableWalls[j].y, w: newState.breakableWalls[j].w, h: newState.breakableWalls[j].h })) {
            newState.breakableWalls.splice(j, 1);
            hit = true;
            break;
          }
        }
        if (hit) { b.active = false; continue; }

        for (const wall of newState.baseWalls) {
          if (wall.active && rectCollide({ x: b.x, y: b.y, w: b.w, h: b.h }, { x: wall.x, y: wall.y, w: wall.w, h: wall.h })) {
            wall.active = false;
            hit = true;
            break;
          }
        }
        if (hit) { b.active = false; continue; }

        if (newState.baseActive && rectCollide({ x: b.x, y: b.y, w: b.w, h: b.h }, BASE_POS)) {
          newState.baseActive = false;
          newState.gameOver = true;
          b.active = false;
          continue;
        }

        if (b.owner === 'player') {
          for (const e of newState.enemies) {
            if (e.invincibleTimer && e.invincibleTimer > 0) continue;
            if (e.active && rectCollide({ x: b.x, y: b.y, w: b.w, h: b.h }, { x: e.x, y: e.y, w: e.width, h: e.height })) {
              e.health -= b.damage;
              if (e.health <= 0) {
                e.active = false;
                newState.score += e.type.score;
                newState.enemiesDestroyed++;
              }
              b.active = false;
              break;
            }
          }
        } else if (b.owner === 'enemy' && newState.player.active && !newState.gameOver) {
          if (newState.player.invincibleTimer === 0 && rectCollide({ x: b.x, y: b.y, w: b.w, h: b.h }, { x: newState.player.x, y: newState.player.y, w: newState.player.width, h: newState.player.height })) {
            b.active = false;
            newState.lives--;
            if (newState.lives <= 0) {
              newState.gameOver = true;
              newState.player.active = false;
            } else {
              newState.player.x = PLAYER_SPAWN_X;
              newState.player.y = PLAYER_SPAWN_Y;
              newState.player.invincibleTimer = 60;
              newState.player.active = true;
            }
          }
        }
      }

      newState.bullets = newState.bullets.filter(b => b.active);
      newState.enemies = newState.enemies.filter(e => e.active);

      // 过关检测
      const allSpawned = totalSpawnedRef.current >= totalToSpawnRef.current;
      const allCleared = newState.enemies.length === 0;
      if (allCleared && allSpawned && !levelClearedRef.current) {
        levelClearedRef.current = true;
        console.log(`🎉 过关! 第${newState.currentLevel}关完成，共生成 ${totalSpawnedRef.current} 个敌人`);
        if (newState.currentLevel < 10) {
          setTimeout(() => startLevel(newState.currentLevel + 1), 500);
        } else {
          newState.gameOver = true;
          newState.waveActive = false;
        }
      }

      return newState;
    });
  }, [startLevel]);

  // 游戏循环 - 唯一的驱动源
  useEffect(() => {
    const loop = () => {
      updateGame();
      frameIdRef.current = requestAnimationFrame(loop);
    };
    frameIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [updateGame]);

  return {
    gameState,
    movePlayer,
    handleShoot,
    resetGame
  };
}