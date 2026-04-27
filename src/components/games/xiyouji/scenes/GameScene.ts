// scenes/GameScene.ts
import * as Phaser from 'phaser';
import type { SaveData } from '../types';

export default class GameScene extends Phaser.Scene {
  private isNewGame: boolean = true;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { isNewGame: boolean; saveData?: SaveData }) {
    this.isNewGame = data.isNewGame;
    console.log('GameScene 初始化:', this.isNewGame ? '新游戏' : '继续游戏');
    if (data.saveData) {
      console.log('加载存档:', data.saveData);
    }
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a472a);
    bg.fillRect(0, 0, width, height);

    // 提示文字
    const text = this.add.text(width / 2, height / 2, '游戏主场景\n开发中...', {
      fontSize: '32px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      align: 'center'
    });
    text.setOrigin(0.5);

    // 返回菜单按钮（测试用）
    const backBtn = this.add.text(100, height - 50, '← 返回菜单', {
    fontSize: '20px',
    color: '#FFD700',
    fontFamily: 'Arial'
    });
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
    // 添加音效（可选）
    console.log('返回菜单');

    // 确保场景存在并切换
    if (this.scene.get('MenuScene')) {
        this.scene.start('MenuScene');
    } else {
        console.error('MenuScene 不存在');
    }
    });

    // 添加悬停效果
    backBtn.on('pointerover', () => {
    backBtn.setColor('#FFFFFF');
    backBtn.setScale(1.05);
    });

    backBtn.on('pointerout', () => {
    backBtn.setColor('#FFD700');
    backBtn.setScale(1);
    });

    console.log('GameScene 创建完成');
  }
}