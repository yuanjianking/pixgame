import * as Phaser from 'phaser';
import { WuKong } from '../characters/player/WuKong';
// 想测试哪个角色，就导入哪个，注释掉其他的
// import { BaJie } from './characters/BaJie';
// import { ShaSeng } from './characters/ShaSeng';
// import { TangSeng } from './characters/TangSeng';
// import { BaiLongMa } from './characters/BaiLongMa';

class TestScene extends Phaser.Scene {
  private characterGraphics!: Phaser.GameObjects.Graphics;
  private character!: WuKong;  // 改成对应的角色类型
  private nameText!: Phaser.GameObjects.Text;

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

    // 中心点标记（便于观察位置）
    const centerX = width / 2;
    const centerY = height / 2;

    // 辅助网格
    this.addGrid();

    // 创建角色
    this.characterGraphics = this.add.graphics();
    this.character = new WuKong(this.characterGraphics);  // 改成对应的角色

    // 在屏幕中心绘制角色
    this.character.draw(centerX, centerY);

    // 显示角色名称
    this.nameText = this.add.text(centerX, centerY - 120, '孙悟空', {
      fontSize: '28px',
      color: '#FFD700',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    });
    this.nameText.setOrigin(0.5);

    // 显示提示文字
    const hint = this.add.text(centerX, height - 50, '按空SHIFT切换角色动画（移动/静止）', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'Arial'
    });
    hint.setOrigin(0.5);

    // 动画控制
    let isMoving = false;
    let walkCycle = 0;

    // 空格键切换动画
    this.input.keyboard!.on('keydown-SHIFT', () => {
      isMoving = !isMoving;
    });

    // 定时更新动画
    this.time.addEvent({
      delay: 50,
      callback: () => {
        if (isMoving) {
          walkCycle += 0.15;
        } else {
          walkCycle = 0;
        }
        this.character.updateAnimation(isMoving, walkCycle);
        this.character.draw(centerX, centerY);
      },
      loop: true
    });
  }

  private addGrid() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x333344, 0.3);

    // 绘制网格线
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

    // 中心十字线
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