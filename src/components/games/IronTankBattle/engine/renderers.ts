// src/components/IronTankBattle/engine/renderers.ts
import { WIDTH, HEIGHT, PLAYER_SIZE, BASE_POS, ENEMY_TYPES } from './gameTypes';
import type { GameState, Rect, Wall, Tank } from './gameTypes';

export function rectCollide(r1: Rect, r2: Rect): boolean {
  return !(r2.x > r1.x + r1.w ||
    r2.x + r2.w < r1.x ||
    r2.y > r1.y + r1.h ||
    r2.y + r2.h < r1.y);
}

export function wallsCollideWithRect(
  rect: Rect,
  steelWalls: Wall[],
  breakableWalls: Wall[],
  baseWalls: Wall[],
  baseActive: boolean
): boolean {
  for (const w of steelWalls) {
    if (rectCollide(rect, { x: w.x, y: w.y, w: w.w, h: w.h })) return true;
  }
  for (const w of breakableWalls) {
    if (rectCollide(rect, { x: w.x, y: w.y, w: w.w, h: w.h })) return true;
  }
  for (const w of baseWalls) {
    if (w.active && rectCollide(rect, { x: w.x, y: w.y, w: w.w, h: w.h })) return true;
  }
  if (baseActive && rectCollide(rect, BASE_POS)) return true;
  return false;
}

export function resolveCollision(
  entity: Tank,
  steelWalls: Wall[],
  breakableWalls: Wall[],
  baseWalls: Wall[],
  baseActive: boolean
): void {
  const maxIterations = 12;
  let iteration = 0;
  let collided = true;

  while (collided && iteration < maxIterations) {
    collided = false;
    const rect = { x: entity.x, y: entity.y, w: entity.width, h: entity.height };

    // 钢墙
    for (const w of steelWalls) {
      if (rectCollide(rect, { x: w.x, y: w.y, w: w.w, h: w.h })) {
        collided = true;
        const overlapX = Math.min(rect.x + rect.w - w.x, w.x + w.w - rect.x);
        const overlapY = Math.min(rect.y + rect.h - w.y, w.y + w.h - rect.y);
        if (overlapX < overlapY) {
          if (rect.x < w.x) entity.x = w.x - entity.width;
          else entity.x = w.x + w.w;
        } else {
          if (rect.y < w.y) entity.y = w.y - entity.height;
          else entity.y = w.y + w.h;
        }
        break;
      }
    }
    if (collided) {
      iteration++;
      continue;
    }

    // 砖墙
    for (const w of breakableWalls) {
      if (rectCollide(rect, { x: w.x, y: w.y, w: w.w, h: w.h })) {
        collided = true;
        const overlapX = Math.min(rect.x + rect.w - w.x, w.x + w.w - rect.x);
        const overlapY = Math.min(rect.y + rect.h - w.y, w.y + w.h - rect.y);
        if (overlapX < overlapY) {
          if (rect.x < w.x) entity.x = w.x - entity.width;
          else entity.x = w.x + w.w;
        } else {
          if (rect.y < w.y) entity.y = w.y - entity.height;
          else entity.y = w.y + w.h;
        }
        break;
      }
    }
    if (collided) {
      iteration++;
      continue;
    }

    // 基地围墙
    for (const w of baseWalls) {
      if (w.active && rectCollide(rect, { x: w.x, y: w.y, w: w.w, h: w.h })) {
        collided = true;
        const overlapX = Math.min(rect.x + rect.w - w.x, w.x + w.w - rect.x);
        const overlapY = Math.min(rect.y + rect.h - w.y, w.y + w.h - rect.y);
        if (overlapX < overlapY) {
          if (rect.x < w.x) entity.x = w.x - entity.width;
          else entity.x = w.x + w.w;
        } else {
          if (rect.y < w.y) entity.y = w.y - entity.height;
          else entity.y = w.y + w.h;
        }
        break;
      }
    }
    if (collided) {
      iteration++;
      continue;
    }

    // 基地核心
    if (baseActive && rectCollide(rect, BASE_POS)) {
      collided = true;
      const overlapX = Math.min(rect.x + rect.w - BASE_POS.x, BASE_POS.x + BASE_POS.w - rect.x);
      const overlapY = Math.min(rect.y + rect.h - BASE_POS.y, BASE_POS.y + BASE_POS.h - rect.y);
      if (overlapX < overlapY) {
        if (rect.x < BASE_POS.x) entity.x = BASE_POS.x - entity.width;
        else entity.x = BASE_POS.x + BASE_POS.w;
      } else {
        if (rect.y < BASE_POS.y) entity.y = BASE_POS.y - entity.height;
        else entity.y = BASE_POS.y + BASE_POS.h;
      }
    }
    iteration++;
  }

  // 边界限制
  if (entity.x < 0) entity.x = 0;
  if (entity.y < 0) entity.y = 0;
  if (entity.x + entity.width > WIDTH) entity.x = WIDTH - entity.width;
  if (entity.y + entity.height > HEIGHT) entity.y = HEIGHT - entity.height;
}

export function tryMove(
  entity: Tank,
  dx: number,
  dy: number,
  steelWalls: Wall[],
  breakableWalls: Wall[],
  baseWalls: Wall[],
  baseActive: boolean
): void {
  if (dx === 0 && dy === 0) return;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (steps > 0) {
    const stepX = dx / steps;
    const stepY = dy / steps;
    for (let i = 0; i < steps; i++) {
      entity.x += stepX;
      entity.y += stepY;
      resolveCollision(entity, steelWalls, breakableWalls, baseWalls, baseActive);
    }
  } else {
    entity.x += dx;
    entity.y += dy;
    resolveCollision(entity, steelWalls, breakableWalls, baseWalls, baseActive);
  }
}

export function drawGame(ctx: CanvasRenderingContext2D, gameState: GameState): void {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#315d2f';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < WIDTH; i += 40) {
    ctx.strokeStyle = '#3f7a3a';
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, HEIGHT);
    ctx.moveTo(0, i % HEIGHT);
    ctx.lineTo(WIDTH, i % HEIGHT);
    ctx.stroke();
  }

  // 钢墙
  for (const sw of gameState.steelWalls) {
    ctx.fillStyle = '#6b6b6b';
    ctx.fillRect(sw.x, sw.y, sw.w, sw.h);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(sw.x + 2, sw.y + 2, sw.w - 4, sw.h - 4);
    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(sw.x + 4, sw.y + 4, sw.w - 8, sw.h - 8);
  }

  // 砖墙
  for (const bw of gameState.breakableWalls) {
    ctx.fillStyle = '#b87c4f';
    ctx.fillRect(bw.x, bw.y, bw.w, bw.h);
    ctx.fillStyle = '#9b5e2e';
    ctx.fillRect(bw.x + 3, bw.y + 3, bw.w - 6, bw.h - 6);
    ctx.fillStyle = '#c98f56';
    ctx.fillRect(bw.x + 1, bw.y + 1, bw.w - 2, 4);
  }

  // 基地围墙
  for (const bw of gameState.baseWalls) {
    if (bw.active) {
      ctx.fillStyle = '#aa8866';
      ctx.fillRect(bw.x, bw.y, bw.w, bw.h);
      ctx.fillStyle = '#886644';
      ctx.fillRect(bw.x + 2, bw.y + 2, bw.w - 4, bw.h - 4);
    }
  }

  // 敌方坦克
  for (const e of gameState.enemies) {
    ctx.save();
    ctx.fillStyle = e.type.color;
    ctx.fillRect(e.x + 2, e.y + 2, e.width - 4, e.height - 4);
    ctx.fillStyle = e.type === ENEMY_TYPES.HEAVY ? '#4a4a5e' : '#7a3529';
    ctx.fillRect(e.x + 4, e.y + 4, e.width - 8, e.height - 8);
    ctx.fillStyle = '#3f2b1d';
    ctx.fillRect(e.x + 2, e.y + 6, 4, e.height - 12);
    ctx.fillRect(e.x + e.width - 6, e.y + 6, 4, e.height - 12);
    ctx.fillStyle = '#d68b45';
    const turretW = Math.min(16, e.width * 0.4);
    const turretH = Math.min(16, e.height * 0.4);
    ctx.fillRect(e.x + e.width / 2 - turretW / 2, e.y + e.height / 2 - turretH / 2, turretW, turretH);
    ctx.fillStyle = '#2f241b';
    if (e.direction === 'up') ctx.fillRect(e.x + e.width / 2 - 4, e.y - 2, 8, 12);
    else if (e.direction === 'down') ctx.fillRect(e.x + e.width / 2 - 4, e.y + e.height - 8, 8, 12);
    else if (e.direction === 'left') ctx.fillRect(e.x - 6, e.y + e.height / 2 - 3, 12, 6);
    else ctx.fillRect(e.x + e.width - 5, e.y + e.height / 2 - 3, 12, 6);
    ctx.restore();
  }

  // 玩家坦克
  const p = gameState.player;
  ctx.fillStyle = '#7cb518';
  ctx.fillRect(p.x + 2, p.y + 2, PLAYER_SIZE - 4, PLAYER_SIZE - 4);
  ctx.fillStyle = '#5e8c16';
  ctx.fillRect(p.x + 4, p.y + 4, PLAYER_SIZE - 8, PLAYER_SIZE - 8);
  ctx.fillStyle = '#3f2b1d';
  ctx.fillRect(p.x + 2, p.y + 6, 4, PLAYER_SIZE - 12);
  ctx.fillRect(p.x + PLAYER_SIZE - 6, p.y + 6, 4, PLAYER_SIZE - 12);
  ctx.fillStyle = '#f5bc42';
  ctx.fillRect(p.x + PLAYER_SIZE * 0.25, p.y + PLAYER_SIZE * 0.25, PLAYER_SIZE * 0.5, PLAYER_SIZE * 0.5);
  ctx.fillStyle = '#2f241b';
  if (p.direction === 'up') ctx.fillRect(p.x + PLAYER_SIZE / 2 - 4, p.y - 2, 8, 12);
  else if (p.direction === 'down') ctx.fillRect(p.x + PLAYER_SIZE / 2 - 4, p.y + PLAYER_SIZE - 8, 8, 12);
  else if (p.direction === 'left') ctx.fillRect(p.x - 6, p.y + PLAYER_SIZE / 2 - 3, 12, 6);
  else ctx.fillRect(p.x + PLAYER_SIZE - 5, p.y + PLAYER_SIZE / 2 - 3, 12, 6);
  if (p.invincibleTimer && p.invincibleTimer > 0 && (Math.floor(Date.now() / 50) % 3 < 1)) {
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#fff5b0';
    ctx.fillRect(p.x, p.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.globalAlpha = 1;
  }

  // 子弹
  for (const b of gameState.bullets) {
    ctx.fillStyle = '#ffdd77';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = '#ffaa33';
    ctx.fillRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
  }

  // 基地
  if (!gameState.baseActive) {
    ctx.fillStyle = '#4a1a1a';
    ctx.fillRect(BASE_POS.x, BASE_POS.y, BASE_POS.w, BASE_POS.h);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('💀', BASE_POS.x + 20, BASE_POS.y + 24);
  } else {
    ctx.fillStyle = '#d9a13b';
    ctx.fillRect(BASE_POS.x, BASE_POS.y, BASE_POS.w, BASE_POS.h);
    ctx.fillStyle = '#f5d742';
    ctx.fillRect(BASE_POS.x + 5, BASE_POS.y + 5, BASE_POS.w - 10, BASE_POS.h - 10);
    ctx.fillStyle = '#3e2a1a';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('🏠', BASE_POS.x + 22, BASE_POS.y + 24);
  }

  if (gameState.gameOver) {
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#ffc857';
    ctx.fillText(
      gameState.currentLevel >= 10 && gameState.baseActive ? '胜利!' : 'GAME OVER',
      WIDTH / 2 - 100,
      HEIGHT / 2 - 40
    );
    ctx.font = 'bold 16px monospace';
    ctx.fillText('点击「重新出征」', WIDTH / 2 - 90, HEIGHT / 2 + 30);
  }
}