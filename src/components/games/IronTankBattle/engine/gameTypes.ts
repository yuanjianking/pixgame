// src/components/IronTankBattle/engine/gameTypes.ts
export const WIDTH = 800;
export const HEIGHT = 600;
export const PLAYER_SIZE = 36;
export const BULLET_SIZE = 6;
export const PLAYER_SPEED = 3.5;
export const BULLET_SPEED = 7.0;
export const PLAYER_SHOOT_DELAY = 18;
export const ENEMY_SPAWN_INTERVAL_FRAMES = 300;
export const BASE_POS = { x: WIDTH / 2 - 30, y: HEIGHT - 30, w: 60, h: 30 };
export const PLAYER_SPAWN_X = WIDTH / 2 - PLAYER_SIZE / 2;
export const PLAYER_SPAWN_Y = HEIGHT - 110;
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Tank {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Direction;
  active: boolean;
  invincibleTimer?: number;
  shootCooldown?: number;
}

export interface Player extends Tank {
  health?: number;
  invincibleTimer: number;
  shootCooldown: number;
}

export interface EnemyType {
  name: string;
  color: string;
  speed: number;
  width: number;
  height: number;
  score: number;
  shootDelay: number;
  health: number;
  invincibleTimer?: number;  // 添加无敌帧属性
}

export interface Enemy extends Tank {
  type: EnemyType;
  health: number;
  shootCooldown: number;
}

export interface Bullet {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  owner: 'player' | 'enemy';
  active: boolean;
  damage: number;
}

export interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
  active?: boolean;
  type: 'steel' | 'brick' | 'baseWall';
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  steelWalls: Wall[];
  breakableWalls: Wall[];
  baseWalls: Wall[];
  baseActive: boolean;
  score: number;
  lives: number;
  enemiesDestroyed: number;
  currentLevel: number;
  gameOver: boolean;
  waveActive: boolean;
}

export const ENEMY_TYPES: Record<string, EnemyType> = {
  NORMAL: { name: '普通', color: '#aa4c3c', speed: 1.55, width: 36, height: 36, score: 100, shootDelay: 70, health: 1 },
  HEAVY: { name: '重坦', color: '#5a5a6e', speed: 1.0, width: 72, height: 36, score: 300, shootDelay: 90, health: 3 },
  FAST: { name: '快艇', color: '#c98f2e', speed: 2.5, width: 34, height: 34, score: 150, shootDelay: 55, health: 1 }
};
