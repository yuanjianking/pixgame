// characters/BaJie.ts
export class BaJie {
  private graphics: Phaser.GameObjects.Graphics;
  private isMoving: boolean = false;
  private walkCycle: number = 0;
  private blinkTimer: number = 0;

  constructor(graphics: Phaser.GameObjects.Graphics) {
    this.graphics = graphics;
  }

  updateAnimation(isMoving: boolean, walkCycle: number) {
    this.isMoving = isMoving;
    this.walkCycle = walkCycle;
  }

  draw(x: number, y: number) {
    this.graphics.clear();
    this.graphics.setPosition(x, y);

    // 动画参数
    const bounceY = this.isMoving ? Math.sin(this.walkCycle) * 3 : 0;
    const bodyY = 8 + bounceY;
    const armSwing = this.isMoving ? Math.sin(this.walkCycle * 1.5) * 4 : 0;
    const legSwing = this.isMoving ? Math.sin(this.walkCycle * 1.5) * 3 : 0;

    // 眨眼
    this.blinkTimer++;
    const isBlinking = this.blinkTimer % 120 < 3;
    const eyeHeight = isBlinking ? 2 : 5;

    // === 身体（胖胖的）===
    this.graphics.fillStyle(0xE8A0A0);  // 粉色皮肤
    this.graphics.fillEllipse(0, bodyY, 38, 48);

    // 大肚子
    this.graphics.fillStyle(0xF5C0C0);
    this.graphics.fillEllipse(0, bodyY + 8, 32, 42);

    // 肚脐
    this.graphics.fillStyle(0xD08080);
    this.graphics.fillCircle(0, bodyY + 12, 3);

    // === 衣服（黑色）===
    this.graphics.fillStyle(0x4A4A4A);
    this.graphics.fillEllipse(0, bodyY - 5, 40, 25);

    // 腰带
    this.graphics.fillStyle(0x8B4513);
    this.graphics.fillRect(-20, bodyY + 5, 40, 4);

    // === 手臂 ===
    this.graphics.fillStyle(0xE8A0A0);
    this.graphics.fillEllipse(-18 - armSwing * 0.3, bodyY + armSwing * 0.4, 10, 28);
    this.graphics.fillEllipse(18 + armSwing * 0.3, bodyY - armSwing * 0.4, 10, 28);

    // 手
    this.graphics.fillStyle(0xF5C0C0);
    this.graphics.fillCircle(-22 - armSwing * 0.4, bodyY + 16 + armSwing * 0.5, 6);
    this.graphics.fillCircle(22 + armSwing * 0.4, bodyY + 16 - armSwing * 0.5, 6);

    // === 腿部 ===
    this.graphics.fillStyle(0x4A4A4A);
    this.graphics.fillEllipse(-10 - legSwing * 0.3, bodyY + 28 + legSwing * 0.3, 12, 22);
    this.graphics.fillEllipse(10 + legSwing * 0.3, bodyY + 28 - legSwing * 0.3, 12, 22);

    // 脚
    this.graphics.fillStyle(0xE8A0A0);
    this.graphics.fillEllipse(-12 - legSwing * 0.4, bodyY + 42 + legSwing * 0.4, 10, 6);
    this.graphics.fillEllipse(12 + legSwing * 0.4, bodyY + 42 - legSwing * 0.4, 10, 6);

    // === 头部 ===
    this.graphics.fillStyle(0xE8A0A0);
    this.graphics.fillEllipse(0, -18, 34, 36);

    // 猪耳朵
    this.graphics.fillStyle(0xD08080);
    this.graphics.fillEllipse(-24, -28, 16, 10);
    this.graphics.fillEllipse(24, -28, 16, 10);

    // 耳朵内测
    this.graphics.fillStyle(0xF0A0A0);
    this.graphics.fillEllipse(-24, -28, 10, 6);
    this.graphics.fillEllipse(24, -28, 10, 6);

    // === 脸部 ===
    this.graphics.fillStyle(0xF5C0C0);
    this.graphics.fillEllipse(0, -14, 28, 30);

    // 腮红
    this.graphics.fillStyle(0xFFAAAA, 0.5);
    this.graphics.fillEllipse(-16, -8, 7, 5);
    this.graphics.fillEllipse(16, -8, 7, 5);

    // 猪鼻子
    this.graphics.fillStyle(0xD08080);
    this.graphics.fillEllipse(0, -8, 12, 10);
    this.graphics.fillStyle(0x8B4513);
    this.graphics.fillEllipse(-4, -8, 3, 3);
    this.graphics.fillEllipse(4, -8, 3, 3);

    // === 眼睛 ===
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillEllipse(-11, -20, 7, 9);
    this.graphics.fillEllipse(11, -20, 7, 9);
    this.graphics.fillStyle(0x2C1810);
    this.graphics.fillEllipse(-10, -19, 3.5, eyeHeight);
    this.graphics.fillEllipse(12, -19, 3.5, eyeHeight);

    // 高光
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillCircle(-12, -22, 1.5);
    this.graphics.fillCircle(10, -22, 1.5);

    // === 眉毛 ===
    const browY = -27 + (this.isMoving ? Math.sin(this.walkCycle * 3) * 1 : 0);
    this.graphics.fillStyle(0x5C3310);
    this.graphics.fillRect(-18, browY, 12, 3);
    this.graphics.fillRect(6, browY, 12, 3);

    // === 嘴巴 ===
    this.graphics.lineStyle(2.5, 0x8B4513);
    if (this.isMoving) {
      this.graphics.beginPath();
      this.graphics.arc(0, -2, 6, 0.1, Math.PI - 0.1);
      this.graphics.strokePath();
    } else {
      this.graphics.beginPath();
      this.graphics.arc(0, -3, 5, 0.15, Math.PI - 0.15);
      this.graphics.strokePath();
    }


    // === 尾巴（小猪尾巴）===
    this.graphics.lineStyle(4, 0xE8A0A0);
    this.graphics.beginPath();
    this.graphics.moveTo(20, bodyY + 10);
    this.graphics.lineTo(28, bodyY + 12);
    this.graphics.lineTo(30, bodyY + 8);
    this.graphics.lineTo(26, bodyY + 6);
    this.graphics.strokePath();
  }
}