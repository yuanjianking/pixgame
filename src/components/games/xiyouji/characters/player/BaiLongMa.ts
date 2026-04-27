// characters/BaiLongMa.ts
export class BaiLongMa {
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
    const bounceY = this.isMoving ? Math.sin(this.walkCycle * 2) * 2 : 0;
    const bodyY = 15 + bounceY;
    const legSwing = this.isMoving ? Math.sin(this.walkCycle * 3) * 8 : 0;

    // 眨眼
    this.blinkTimer++;
    const isBlinking = this.blinkTimer % 120 < 3;
    const eyeHeight = isBlinking ? 2 : 5;

    // === 身体 ===
    this.graphics.fillStyle(0xF0F0F0);  // 白色
    this.graphics.fillEllipse(0, bodyY, 45, 30);

    // 马背
    this.graphics.fillStyle(0xE0E0E0);
    this.graphics.fillEllipse(0, bodyY - 5, 42, 25);

    // 马鞍
    this.graphics.fillStyle(0xCC3333);
    this.graphics.fillRect(-15, bodyY - 8, 30, 8);
    this.graphics.fillStyle(0xFFD700);
    this.graphics.fillRect(-15, bodyY - 8, 30, 2);

    // === 脖子 ===
    this.graphics.fillStyle(0xF0F0F0);
    this.graphics.fillEllipse(-25, bodyY - 5, 18, 22);

    // 鬃毛
    this.graphics.fillStyle(0xD0D0D0);
    for (let i = 0; i < 5; i++) {
      this.graphics.fillEllipse(-28 - i * 2, bodyY - 10 - i * 3, 4, 8);
    }

    // === 头部 ===
    this.graphics.fillStyle(0xF0F0F0);
    this.graphics.fillEllipse(-40, bodyY - 12, 22, 20);

    // 马嘴
    this.graphics.fillStyle(0xE0E0E0);
    this.graphics.fillEllipse(-52, bodyY - 8, 12, 10);

    // 鼻孔
    this.graphics.fillStyle(0x8B4513);
    this.graphics.fillEllipse(-56, bodyY - 10, 2, 2);
    this.graphics.fillEllipse(-52, bodyY - 10, 2, 2);

    // === 眼睛 ===
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillEllipse(-45, bodyY - 18, 6, 7);
    this.graphics.fillStyle(0x2C1810);
    this.graphics.fillEllipse(-44, bodyY - 17, 3, eyeHeight);
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillCircle(-46, bodyY - 19, 1.5);

    // === 耳朵 ===
    this.graphics.fillStyle(0xF0F0F0);
    this.graphics.fillEllipse(-42, bodyY - 28, 6, 10);
    this.graphics.fillEllipse(-35, bodyY - 28, 6, 10);
    this.graphics.fillStyle(0xE0E0E0);
    this.graphics.fillEllipse(-42, bodyY - 28, 3, 6);
    this.graphics.fillEllipse(-35, bodyY - 28, 3, 6);

    // === 腿部 ===
    // 前腿
    this.graphics.fillStyle(0xF0F0F0);
    this.graphics.fillEllipse(-22 - legSwing * 0.2, bodyY + 18 + legSwing * 0.3, 8, 22);
    this.graphics.fillEllipse(-12 + legSwing * 0.3, bodyY + 18 - legSwing * 0.2, 8, 22);

    // 后腿
    this.graphics.fillEllipse(15 - legSwing * 0.3, bodyY + 18 + legSwing * 0.2, 8, 22);
    this.graphics.fillEllipse(25 + legSwing * 0.2, bodyY + 18 - legSwing * 0.3, 8, 22);

    // 马蹄
    this.graphics.fillStyle(0x5C3310);
    this.graphics.fillEllipse(-22 - legSwing * 0.2, bodyY + 36 + legSwing * 0.3, 8, 4);
    this.graphics.fillEllipse(-12 + legSwing * 0.3, bodyY + 36 - legSwing * 0.2, 8, 4);
    this.graphics.fillEllipse(15 - legSwing * 0.3, bodyY + 36 + legSwing * 0.2, 8, 4);
    this.graphics.fillEllipse(25 + legSwing * 0.2, bodyY + 36 - legSwing * 0.3, 8, 4);

    // === 尾巴 ===
    const tailSwing = this.isMoving ? Math.sin(this.walkCycle * 4) * 6 : 0;
    this.graphics.lineStyle(4, 0xD0D0D0);
    this.graphics.beginPath();
    this.graphics.moveTo(25, bodyY - 2);
    this.graphics.lineTo(32 + tailSwing, bodyY - 4);
    this.graphics.lineTo(30 + tailSwing * 0.7, bodyY + 2);
    this.graphics.strokePath();

    // === 缰绳 ===
    this.graphics.lineStyle(2, 0xFFD700);
    this.graphics.beginPath();
    this.graphics.moveTo(-48, bodyY - 15);
    this.graphics.lineTo(-58, bodyY - 8);
    this.graphics.strokePath();

    // 龙角
    this.graphics.fillStyle(0xFFD700);
    this.graphics.fillEllipse(-38, bodyY - 32, 4, 8);
    this.graphics.fillEllipse(-32, bodyY - 32, 4, 8);

    // 鳞片效果
    this.graphics.fillStyle(0xE8E8E8, 0.5);
    for (let i = -3; i <= 3; i++) {
      this.graphics.fillEllipse(i * 8, bodyY - 2, 4, 2);
    }
  }
}