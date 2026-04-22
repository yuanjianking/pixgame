export type GameType = 'brick-breaker';

export interface GameInfo {
  id: GameType;
  name: string;
  thumbnail: string;
  route: string;
}

export interface GameSave {
  id: string;
  gameType: GameType;
  timestamp: number;
  data: any;
  screenshot?: string;
}

export interface BrickBreakerSaveData {
  score: number;
  lives: number;
  bricks: BrickState[][];
  ball: BallState;
  paddle: PaddleState;
  level: number;
}


export interface BrickState {
  x: number;
  y: number;
  z: number;
  hp: number;
  color: string;
}

export interface BallState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

export interface PaddleState {
  x: number;
  y: number;
  z: number;
  width: number;
}

