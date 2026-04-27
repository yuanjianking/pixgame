// characters/WuKong.ts
export class WuKong {
  private graphics: Phaser.GameObjects.Graphics;
  private isMoving: boolean = false;
  private walkCycle: number = 0;
  private blinkTimer: number = 0;

  constructor(graphics: Phaser.GameObjects.Graphics) {
    this.graphics = graphics;
  }

  // 更新动画状态
  updateAnimation(isMoving: boolean, walkCycle: number) {
    this.isMoving = isMoving;
    this.walkCycle = walkCycle;
  }

  // 绘制角色
  draw(x: number, y: number) {
    this.graphics.clear();
    this.graphics.setPosition(x, y);

    // 动画参数
    const bounceY = this.isMoving ? Math.sin(this.walkCycle) * 2.5 : 0;
    const bodyY = 10 + bounceY;
    const armSwing = this.isMoving ? Math.sin(this.walkCycle * 2) * 6 : 0;
    const legSwing = this.isMoving ? Math.sin(this.walkCycle * 2) * 4 : 0;

    // 眨眼动画
    this.blinkTimer++;
    const isBlinking = this.blinkTimer % 120 < 3;
    const eyeHeight = isBlinking ? 2 : 5;

    // === 身体 ===
    // 身体阴影
    this.graphics.fillStyle(0x000000, 0.1);
    this.graphics.fillEllipse(2, bodyY + 2, 34, 44);

    // 主身体
    this.graphics.fillStyle(0xD4893A);
    this.graphics.fillEllipse(0, bodyY, 32, 42);

    // 身体高光
    this.graphics.fillStyle(0xE8A95B, 0.5);
    this.graphics.fillEllipse(-5, bodyY - 5, 8, 12);

    // === 肚子 ===
    this.graphics.fillStyle(0xF5D89C);
    this.graphics.fillEllipse(0, bodyY + 5, 24, 30);

    // 肚脐
    this.graphics.fillStyle(0xC4813A);
    this.graphics.fillCircle(0, bodyY + 8, 2);

    // === 手臂 ===
    // 左臂
    this.graphics.fillStyle(0xD4893A);
    this.graphics.fillEllipse(-16 - armSwing * 0.4, bodyY + armSwing * 0.3, 9, 24);
    // 左手
    this.graphics.fillStyle(0xF5D89C);
    this.graphics.fillCircle(-20 - armSwing * 0.5, bodyY + 12 + armSwing * 0.4, 5);

    // 右臂
    this.graphics.fillStyle(0xD4893A);
    this.graphics.fillEllipse(16 + armSwing * 0.4, bodyY - armSwing * 0.3, 9, 24);
    // 右手
    this.graphics.fillStyle(0xF5D89C);
    this.graphics.fillCircle(20 + armSwing * 0.5, bodyY + 12 - armSwing * 0.4, 5);

    // === 腿部 ===
    // 左腿
    this.graphics.fillStyle(0xC47A2A);
    this.graphics.fillEllipse(-9 - legSwing * 0.4, bodyY + 20 + legSwing * 0.3, 11, 20);
    // 左脚
    this.graphics.fillStyle(0xF5D89C);
    this.graphics.fillEllipse(-12 - legSwing * 0.5, bodyY + 32 + legSwing * 0.4, 8, 5);

    // 右腿
    this.graphics.fillStyle(0xC47A2A);
    this.graphics.fillEllipse(9 + legSwing * 0.4, bodyY + 20 - legSwing * 0.3, 11, 20);
    // 右脚
    this.graphics.fillStyle(0xF5D89C);
    this.graphics.fillEllipse(12 + legSwing * 0.5, bodyY + 32 - legSwing * 0.4, 8, 5);

    // === 头部 ===
    // 头部阴影
    this.graphics.fillStyle(0x000000, 0.1);
    this.graphics.fillEllipse(2, -16, 30, 32);

    // 主头部
    this.graphics.fillStyle(0xD4893A);
    this.graphics.fillEllipse(0, -18, 30, 32);

    // === 毛发（头顶）===
    this.graphics.fillStyle(0x8B4513);
    for (let i = -3; i <= 3; i++) {
      this.graphics.fillEllipse(i * 3, -34 - Math.abs(i) * 0.5, 3, 6);
    }

    // === 耳朵 ===
    this.graphics.fillStyle(0xD4893A);
    this.graphics.fillEllipse(-24, -28, 14, 20);
    this.graphics.fillEllipse(24, -28, 14, 20);
    this.graphics.fillStyle(0xF0B87A);
    this.graphics.fillEllipse(-24, -28, 8, 12);
    this.graphics.fillEllipse(24, -28, 8, 12);
    // 耳洞
    this.graphics.fillStyle(0xC47A2A);
    this.graphics.fillEllipse(-24, -28, 3, 5);
    this.graphics.fillEllipse(24, -28, 3, 5);

    // === 脸部 ===
    this.graphics.fillStyle(0xFCE8B2);
    this.graphics.fillEllipse(0, -15, 24, 26);

    // 腮红
    this.graphics.fillStyle(0xFFAAAA, 0.5);
    this.graphics.fillEllipse(-14, -10, 6, 4);
    this.graphics.fillEllipse(14, -10, 6, 4);

    // === 眼睛 ===
    // 眼眶
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillEllipse(-10, -20, 8, 10);
    this.graphics.fillEllipse(10, -20, 8, 10);

    // 瞳孔
    this.graphics.fillStyle(0x2C1810);
    this.graphics.fillEllipse(-9, -19, 4, eyeHeight);
    this.graphics.fillEllipse(11, -19, 4, eyeHeight);

    // 高光
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillCircle(-11, -22, 1.5);
    this.graphics.fillCircle(9, -22, 1.5);

    // 眼睛光晕
    this.graphics.fillStyle(0xFFFFFF, 0.3);
    this.graphics.fillCircle(-10, -20, 3);
    this.graphics.fillCircle(10, -20, 3);

    // === 眉毛 ===
    const browY = -28 + (this.isMoving ? Math.sin(this.walkCycle * 3) * 1 : 0);
    this.graphics.fillStyle(0x5C3310);
    this.graphics.fillRect(-16, browY, 12, 3);
    this.graphics.fillRect(4, browY, 12, 3);

    // === 鼻子 ===
    this.graphics.fillStyle(0xC47A2A);
    this.graphics.fillEllipse(0, -12, 5, 4);
    // 鼻孔
    this.graphics.fillStyle(0x8B4513);
    this.graphics.fillEllipse(-2, -11, 1.5, 1);
    this.graphics.fillEllipse(2, -11, 1.5, 1);

    // === 嘴巴 ===
    this.graphics.lineStyle(2.5, 0x5C3310);
    if (this.isMoving) {
      // 开心大笑
      this.graphics.beginPath();
      this.graphics.arc(0, -6, 7, 0.1, Math.PI - 0.1);
      this.graphics.strokePath();
      // 舌头
      this.graphics.fillStyle(0xFF6B6B);
      this.graphics.fillEllipse(0, -3, 4, 3);
      // 牙齿
      this.graphics.fillStyle(0xFFFFFF);
      this.graphics.fillRect(-3, -9, 2, 2);
      this.graphics.fillRect(1, -9, 2, 2);
    } else {
      // 可爱微笑
      this.graphics.beginPath();
      this.graphics.arc(0, -7, 6, 0.15, Math.PI - 0.15);
      this.graphics.strokePath();
    }

    // === 尾巴 ===
    this.graphics.lineStyle(5, 0xD4893A);
    const tailWag = this.isMoving ? Math.sin(this.walkCycle * 3) * 8 : 0;

    this.graphics.beginPath();
    this.graphics.moveTo(18, bodyY + 8);
    this.graphics.lineTo(22 + tailWag * 0.3, bodyY + 5 - tailWag * 0.2);
    this.graphics.lineTo(25 + tailWag * 0.6, bodyY + 2 - tailWag * 0.3);
    this.graphics.lineTo(27 + tailWag * 0.8, bodyY - 1 - tailWag * 0.2);
    this.graphics.lineTo(26 + tailWag, bodyY - 4);
    this.graphics.lineTo(24 + tailWag * 0.7, bodyY - 6);
    this.graphics.strokePath();

    // 尾巴尖
    this.graphics.fillStyle(0xF5D89C);
    this.graphics.fillCircle(24 + tailWag * 0.7, bodyY - 6, 4);

    // === 筋斗云（移动时的特效）===
    if (this.isMoving) {
      this.graphics.fillStyle(0xFFFFFF, 0.4);
      for (let i = 0; i < 3; i++) {
        const cloudX = -25 + i * 15 + Math.sin(this.walkCycle * 5) * 3;
        const cloudY = bodyY + 20 + Math.sin(this.walkCycle * 3 + i) * 2;
        this.graphics.fillEllipse(cloudX, cloudY, 15, 8);
        this.graphics.fillEllipse(cloudX - 8, cloudY + 2, 10, 6);
        this.graphics.fillEllipse(cloudX + 8, cloudY + 2, 10, 6);
      }
    }
  }
}