// characters/ShaSeng.ts
export class ShaSeng {
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
    const bounceY = this.isMoving ? Math.sin(this.walkCycle) * 2 : 0;
    const bodyY = 10 + bounceY;
    const armSwing = this.isMoving ? Math.sin(this.walkCycle * 1.8) * 5 : 0;
    const legSwing = this.isMoving ? Math.sin(this.walkCycle * 1.8) * 3 : 0;

    // 眨眼
    this.blinkTimer++;
    const isBlinking = this.blinkTimer % 120 < 3;
    const eyeHeight = isBlinking ? 2 : 5;

    // === 身体（高大）===
    this.graphics.fillStyle(0xC47A3A);  // 古铜色皮肤
    this.graphics.fillEllipse(0, bodyY, 30, 52);

    // 衣服（蓝色）
    this.graphics.fillStyle(0x2E5E8C);
    this.graphics.fillEllipse(0, bodyY + 2, 32, 48);

    // 佛珠
    this.graphics.fillStyle(0x8B4513);
    for (let i = -2; i <= 2; i++) {
      this.graphics.fillCircle(i * 6, bodyY + 15, 4);
    }

    // === 手臂（肌肉发达）===
    this.graphics.fillStyle(0xC47A3A);
    this.graphics.fillEllipse(-17 - armSwing * 0.3, bodyY + armSwing * 0.3, 11, 30);
    this.graphics.fillEllipse(17 + armSwing * 0.3, bodyY - armSwing * 0.3, 11, 30);

    // 手
    this.graphics.fillStyle(0xD48A4A);
    this.graphics.fillCircle(-21 - armSwing * 0.4, bodyY + 18 + armSwing * 0.4, 6);
    this.graphics.fillCircle(21 + armSwing * 0.4, bodyY + 18 - armSwing * 0.4, 6);

    // === 腿部 ===
    this.graphics.fillStyle(0x2E5E8C);
    this.graphics.fillEllipse(-9 - legSwing * 0.3, bodyY + 32 + legSwing * 0.3, 12, 24);
    this.graphics.fillEllipse(9 + legSwing * 0.3, bodyY + 32 - legSwing * 0.3, 12, 24);

    // 靴子
    this.graphics.fillStyle(0x5C3310);
    this.graphics.fillEllipse(-11 - legSwing * 0.4, bodyY + 48 + legSwing * 0.4, 10, 6);
    this.graphics.fillEllipse(11 + legSwing * 0.4, bodyY + 48 - legSwing * 0.4, 10, 6);

    // === 头部 ===
    this.graphics.fillStyle(0xC47A3A);
    this.graphics.fillEllipse(0, -18, 32, 34);

    // 光头
    this.graphics.fillStyle(0xE0B87A);
    this.graphics.fillEllipse(0, -20, 28, 30);

    // 胡子（络腮胡）
    this.graphics.fillStyle(0x3C2A1A);
    this.graphics.fillEllipse(-12, -8, 10, 8);
    this.graphics.fillEllipse(12, -8, 10, 8);
    this.graphics.fillEllipse(0, -6, 14, 6);

    // === 耳朵 ===
    this.graphics.fillStyle(0xC47A3A);
    this.graphics.fillEllipse(-26, -26, 10, 14);
    this.graphics.fillEllipse(26, -26, 10, 14);

    // === 眼睛 ===
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillEllipse(-10, -22, 7, 9);
    this.graphics.fillEllipse(10, -22, 7, 9);
    this.graphics.fillStyle(0x1A1A2E);
    this.graphics.fillEllipse(-9, -21, 3.5, eyeHeight);
    this.graphics.fillEllipse(11, -21, 3.5, eyeHeight);

    // 高光
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillCircle(-11, -24, 1.5);
    this.graphics.fillCircle(9, -24, 1.5);

    // === 眉毛 ===
    const browY = -29 + (this.isMoving ? Math.sin(this.walkCycle * 3) * 1 : 0);
    this.graphics.fillStyle(0x3C2A1A);
    this.graphics.fillRect(-16, browY, 12, 3);
    this.graphics.fillRect(4, browY, 12, 3);

  }
}