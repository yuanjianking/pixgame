import { SaveManager } from '../save/SaveManager';
import { snapshotFromCharacter } from '../save/playerSave';
import { TaskManager } from '../task/TaskManager';
import type { BaseCharacter } from '../characters/player/BaseCharacter';

/** 场景进入时统一保存玩家进度并触发到达类任务 */
export function saveEnterSceneProgress(
  char: BaseCharacter | undefined,
  sceneName: string,
  position: { x: number; y: number },
  saveSlot: number = 1
): void {
  SaveManager.getInstance().updateSave(saveSlot, (saveData) => {
    if (char) {
      saveData.player = snapshotFromCharacter(char, {
        position,
        currentScene: sceneName,
        playerClass: saveData.player?.playerClass ?? 'WuKong',
        id: saveData.player?.id ?? 'wukong',
      });
      const idx = saveData.party.findIndex((p) => p.id === saveData.player.id);
      if (idx >= 0) {
        saveData.party[idx] = { ...saveData.player };
      } else {
        saveData.party = [saveData.player, ...saveData.party];
      }
    } else {
      saveData.player.position = position;
      saveData.player.currentScene = sceneName;
    }
  });
  TaskManager.getInstance().markArrive(sceneName, saveSlot);
}
