import { WuKong } from '../characters/player/WuKong';
import type { GameSaveData, PlayerSaveData } from '../types';

/** 根据角色类创建 1 级默认玩家数据（目前主控为悟空） */
export function createDefaultPlayer(
  playerClass: string = 'WuKong',
  overrides?: Partial<PlayerSaveData>
): PlayerSaveData {
  const stats = WuKong.BASE_STATS;
  return {
    id: 'wukong',
    playerClass,
    position: { x: 0, y: 0 },
    currentScene: 'WorldMapScene',
    level: 1,
    exp: 0,
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    attack: stats.attack,
    defense: stats.defense,
    battleMoveRange: stats.moveRange,
    battleAttackRange: stats.attackRange,
    weapon: { id: 'none', name: '无武器' },
    clothes: { id: 'none', name: '无衣服' },
    ...overrides,
  };
}

export function createDefaultSaveData(slotId: number): GameSaveData {
  const player = createDefaultPlayer();
  return {
    version: '1.0',
    saveTime: Date.now(),
    slotId,
    player,
    party: [{ ...player }],
    progress: {
      completedTasks: [],
      unlockedScenes: [],
      taskStepProgress: {},
    },
    inventory: { items: [] },
  };
}

/** 确保 progress 字段完整（兼容旧存档） */
export function normalizeProgress(saveData: GameSaveData): void {
  saveData.progress.completedTasks = saveData.progress.completedTasks ?? [];
  saveData.progress.unlockedScenes = saveData.progress.unlockedScenes ?? [];
  saveData.progress.taskStepProgress = saveData.progress.taskStepProgress ?? {};
  saveData.party = saveData.party?.length ? saveData.party : [{ ...saveData.player }];
}
