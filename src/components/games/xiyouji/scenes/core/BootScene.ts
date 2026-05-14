// scenes/BootScene.ts
import * as Phaser from 'phaser';
import { SaveManager } from '../../save/SaveManager';

export default class BootScene extends Phaser.Scene {
  currentSlotId: number = 1;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 可以在这里加载资源
    console.log('BootScene: 加载资源...');

  }

  create() {
    console.log('BootScene: 资源加载完成');
    this.scene.launch('WorldMapScene');
    // 等待一帧让地图生成完成
    this.scene.get('WorldMapScene').events.once('mapReady', () => {
      this.scene.stop('WorldMapScene');
      const hasSaveData = this.checkSaveData();
      this.scene.start('MenuScene', { hasSaveData });
    });

  }

  private checkSaveData(): boolean {
    // 检查 localStorage 是否有存档
     // 检测是否有存档
    if (SaveManager.getInstance().hasAnySave()) {
      return true;
    } else {
      return false;
    }
  }
}