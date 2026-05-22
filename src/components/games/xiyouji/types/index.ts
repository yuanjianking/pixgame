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

// 游戏任务
export interface Task {
    id: string;
    name: string;
    completed: boolean;
    steps: Array<{
        stepId: number;
        description: string;
        target: {
            type: string;      // "talk" | "arrive" | "collect" | "kill"
            npcId?: string;
            scene?: string;
            itemId?: string;
            count?: number;
            dialogues?:string[];
        };
    }>;
    rewards: {
        exp: number;
        items: string[];
        unlockScenes: string[];
    };
}

// 需要保存的内容
export interface EquipmentData {
  id: string;
  name: string;
}

export interface PlayerSaveData {
  id: string;              // 玩家唯一 ID
  playerClass: string;     // 玩家角色类名
  position: { x: number; y: number };
  currentScene: string;    // 当前场景
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  battleMoveRange: number;
  battleAttackRange: number;
  weapon: EquipmentData;
  clothes: EquipmentData;
}

export interface GameSaveData {
  // 基本信息
  version: string;          // 存档版本
  saveTime: number;         // 保存时间
  slotId: number;           // 存档位（1-5）

  // 当前活动玩家数据
  player: PlayerSaveData;

  // 玩家队伍数据（最多 4 名角色）
  party: PlayerSaveData[];

  // 游戏进度
  progress: {
    completedTasks: string[];   // 已完成任务ID
    unlockedScenes: string[];   // 已解锁场景
    /** 各任务已完成到的 stepId（键为 taskId） */
    taskStepProgress?: Record<string, number>;
  };

  // 背包数据
  inventory: {
    items: Array<{ id: string; count: number }>;
  };
}