// engine/types.ts
export interface Vector2 {
  x: number;
  y: number;
}

export interface Bullet {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AsteroidVertex {
  x: number;
  y: number;
}

export interface Asteroid {
  x: number;
  y: number;
  baseRadius: number;
  currentRadius: number;
  hp: number;
  maxHp: number;
  type: string;
  speedY: number;
  speedX: number;
  scoreValue: number;
  vertices: AsteroidVertex[];
  hasDroppedItem: boolean;
  crackSeed: number;
}

export interface Powerup {
  x: number;
  y: number;
  radius: number;
  type: 'weapon' | 'health' | 'bomb';
  speedY: number;
  speedX: number;
}

export interface EnemyFighter {
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  type: string;
  speedY: number;
  speedX: number;
  shootTimer: number;
  shootDelayBase: number;
  bulletPattern: string;
  scoreValue: number;
  wigglePhase: number;
}

export interface EnemyBullet {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
}

export interface Explosion {
  x: number;
  y: number;
  life: number;
  radius: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
}

export interface GameState {
  gameRunning: boolean;
  score: number;
  playerHealth: number;
  gameTimeSeconds: number;
  powerLevel: number;
  bombCount: number;
  bestScore: number;
}

export interface GameObjects {
  asteroids: Asteroid[];
  powerups: Powerup[];
  enemyFighters: EnemyFighter[];
  enemyBullets: EnemyBullet[];
  explosions: Explosion[];
  bullets: Bullet[];
  powerLevel: number;
  bombCount: number;
  invincibleFrames: number;
  playerX: number;
  playerY: number;
}