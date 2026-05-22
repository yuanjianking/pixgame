import type { GameSaveData } from "../types";
import { createDefaultSaveData, normalizeProgress } from "./saveDefaults";

export class SaveManager {
  private saveKey = 'game_saves';
  private static instance: SaveManager;
  // 获取全局实例
  public static getInstance(): SaveManager {
      if (!SaveManager.instance) {
          SaveManager.instance = new SaveManager();
      }
      return SaveManager.instance;
  }

  // 保存游戏
  saveGame(slotId: number, data: GameSaveData): boolean {
    try {
      const saves = this.getAllSaves();
      saves[slotId] = {
        ...data,
        slotId,
        saveTime: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(this.saveKey, JSON.stringify(saves));
      return true;
    } catch(e) {
      console.error('保存失败', e);
      return false;
    }
  }

  // 读取存档
  loadGame(slotId: number): GameSaveData | null {
    const saves = this.getAllSaves();
    return saves[slotId] || null;
  }

  // 获取所有存档
  getAllSaves(): Record<number, GameSaveData> {
    const data = localStorage.getItem(this.saveKey);
    return data ? JSON.parse(data) : {};
  }

  // 删除存档
  deleteSave(slotId: number): void {
    const saves = this.getAllSaves();
    delete saves[slotId];
    localStorage.setItem(this.saveKey, JSON.stringify(saves));
  }

  // 检查是否有存档
  hasAnySave(): boolean {
    return Object.keys(this.getAllSaves()).length > 0;
  }

  /** 读取存档，不存在则创建默认档（使用角色 BASE_STATS，非写死数值） */
  getOrCreateSave(slotId: number): GameSaveData {
    const existing = this.loadGame(slotId);
    if (existing) {
      normalizeProgress(existing);
      return existing;
    }
    return createDefaultSaveData(slotId);
  }

  /** 在已有存档上修改并保存，仅 mutator 触及的字段会被更新 */
  updateSave(slotId: number, mutator: (data: GameSaveData) => void): boolean {
    const data = this.getOrCreateSave(slotId);
    mutator(data);
    normalizeProgress(data);
    return this.saveGame(slotId, data);
  }
}