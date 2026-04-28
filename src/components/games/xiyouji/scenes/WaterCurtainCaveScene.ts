// scenes/WaterCurtainCaveScene.ts
import * as Phaser from 'phaser';
import { WuKong } from '../characters/player/WuKong';

export default class WaterCurtainCaveScene extends Phaser.Scene {
  private wukong!: WuKong;

  constructor() {
    super({ key: 'WaterCurtainCaveScene' });
  }

  init(data: { from: string; playerX: number; playerY: number }) {
    console.log('进入水帘洞内部', data);
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 洞穴内部背景（深色）
    const bg = this.add.graphics();
    bg.fillStyle(0x2A1A0A);
    bg.fillRect(0, 0, width, height);

    // 添加内部装饰...
    const title = this.add.text(width / 2, 100, '水帘洞内部', {
      fontSize: '32px',
      color: '#FFD700',
      fontFamily: 'monospace'
    });
    title.setOrigin(0.5);

    // 创建悟空
    const playerGraphics = this.add.graphics();
    this.wukong = new WuKong(playerGraphics, this);
    this.wukong.setPosition(width / 2, height / 2);

    // 按 ESC 返回
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('HuaguoshanScene');
    });

    const hint = this.add.text(width / 2, height - 50, '按 ESC 返回花果山', {
      fontSize: '14px',
      color: '#888888'
    });
    hint.setOrigin(0.5);
  }

  update() {
    if (this.wukong) {
      this.wukong.updateFromController();
    }
  }
}