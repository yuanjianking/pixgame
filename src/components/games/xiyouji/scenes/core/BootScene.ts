// scenes/BootScene.ts
import * as Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
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
    const saveData = localStorage.getItem('xiyouji_save');
    return saveData !== null;
  }
}