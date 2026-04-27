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