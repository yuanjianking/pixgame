// types/index.ts
export interface CharacterAnimState {
  isMoving: boolean;
  walkCycle: number;
}

export interface CharacterConfig {
  speed: number;
  startX: number;
  startY: number;
  colorScheme: {
    body: number;
    skin: number;
    clothes: number;
  };
}

// 定义存档数据类型
export  interface SaveData {
  playerPosition: { x: number; y: number };
  level: number;
  experience: number;
  inventory: string[];
  // 添加其他需要的字段
}

export interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  dialogues: string[];
  hasQuest?: boolean;
  questDialog?: string;
}

export interface PlayerState {
  x: number;
  y: number;
  hasTask: boolean;
  taskDestination?: string;
}

// 世界地图相关类型
export interface WorldNode {
  id: string;
  name: string;
  x: number;
  y: number;
  region: string;
  isUnlocked: boolean;
  description: string;
  icon: 'mountain' | 'temple' | 'water' | 'city' | 'cave' | 'desert' | 'forest' | 'fire' ;
  scene: string;  // 对应的场景名称
}