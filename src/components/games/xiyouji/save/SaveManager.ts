import type { GameSaveData } from "../types";

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
}