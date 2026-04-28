import * as Phaser from 'phaser';

import { BaiLongMa } from '../characters/player/BaiLongMa';
class TestScene extends Phaser.Scene {
  private characterGraphics!: Phaser.GameObjects.Graphics;
  private character!: BaiLongMa;
  private nameText!: Phaser.GameObjects.Text;

  // 移动相关
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private characterX: number = 0;
  private characterY: number = 0;
  private isMoving: boolean = false;
  private walkCycle: number = 0;
  private moveSpeed: number = 3;

  constructor() {
    super({ key: 'TestScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 简洁背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e);
    bg.fillRect(0, 0, width, height);

    // 辅助网格
    this.addGrid();

    // 创建角色
    this.characterGraphics = this.add.graphics();
    this.character = new BaiLongMa(this.characterGraphics);

    // 初始位置在屏幕中心
    this.characterX = width / 2;
    this.characterY = height / 2;

    // 绘制角色
    this.character.draw(this.characterX, this.characterY);

    // 显示角色名称 - 确保这行代码存在且没有被注释
    this.nameText = this.add.text(this.characterX, this.characterY - 80, '测试角色', {
      fontSize: '20px',
      color: '#FFD700',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    });
    this.nameText.setOrigin(0.5);

    // 显示提示文字
    const hint = this.add.text(width / 2, height - 50, 'WASD 移动角色', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial'
    });
    hint.setOrigin(0.5);

    // 初始化键盘控制
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
  }

  update() {
    // 确保 nameText 存在
    if (!this.nameText) return;

    // 重置移动状态
    let moveX = 0;
    let moveY = 0;

    // 检测 WASD 和 方向键
    if (this.wasd?.left?.isDown || this.cursors?.left?.isDown) {
      moveX = -1;
    } else if (this.wasd?.right?.isDown || this.cursors?.right?.isDown) {
      moveX = 1;
    }

    if (this.wasd?.up?.isDown || this.cursors?.up?.isDown) {
      moveY = -1;
    } else if (this.wasd?.down?.isDown || this.cursors?.down?.isDown) {
      moveY = 1;
    }

    // 更新移动状态
    this.isMoving = (moveX !== 0 || moveY !== 0);

    if (this.isMoving) {
      if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.707;
        moveY *= 0.707;
      }

      this.characterX += moveX * this.moveSpeed;
      this.characterY += moveY * this.moveSpeed;

      const bounds = 50;
      this.characterX = Math.max(bounds, Math.min(this.cameras.main.width - bounds, this.characterX));
      this.characterY = Math.max(bounds + 40, Math.min(this.cameras.main.height - bounds, this.characterY));

      this.walkCycle += 0.15;
    } else {
      this.walkCycle = 0;
    }

    // 更新角色
    if (this.character) {
      this.character.updateAnimation(this.isMoving, this.walkCycle);
      this.character.draw(this.characterX, this.characterY);
    }

    // 更新名字位置
    if (this.nameText) {
      this.nameText.setPosition(this.characterX, this.characterY - 80);
    }
  }

  private addGrid() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x333344, 0.3);

    for (let x = 0; x < width; x += 50) {
      grid.beginPath();
      grid.moveTo(x, 0);
      grid.lineTo(x, height);
      grid.strokePath();
    }
    for (let y = 0; y < height; y += 50) {
      grid.beginPath();
      grid.moveTo(0, y);
      grid.lineTo(width, y);
      grid.strokePath();
    }

    grid.lineStyle(2, 0xFF6666, 0.5);
    grid.beginPath();
    grid.moveTo(width / 2, 0);
    grid.lineTo(width / 2, height);
    grid.strokePath();
    grid.beginPath();
    grid.moveTo(0, height / 2);
    grid.lineTo(width, height / 2);
    grid.strokePath();
  }
}

export default TestScene;