// characters/TangSeng.ts
export class TangSeng {
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

    // 动画参数（唐僧动作优雅，幅度小）
    const bounceY = this.isMoving ? Math.sin(this.walkCycle) * 1.5 : 0;
    const bodyY = 10 + bounceY;
    const armSwing = this.isMoving ? Math.sin(this.walkCycle * 1.2) * 3 : 0;
    const legSwing = this.isMoving ? Math.sin(this.walkCycle * 1.2) * 2 : 0;

    // 眨眼
    this.blinkTimer++;
    const isBlinking = this.blinkTimer % 150 < 3;
    const eyeHeight = isBlinking ? 2 : 5;

    // === 身体（瘦弱）===
    this.graphics.fillStyle(0xF5DEB3);  // 浅色皮肤
    this.graphics.fillEllipse(0, bodyY, 26, 44);

    // 袈裟（红色）
    this.graphics.fillStyle(0xCC3333);
    this.graphics.fillEllipse(0, bodyY, 28, 46);

    // 袈裟金边（用两个椭圆模拟边框）
    this.graphics.lineStyle(2, 0xFFD700);
    this.graphics.beginPath();
    this.graphics.fillEllipse(0, bodyY, 28, 46);
    this.graphics.strokePath();

    // === 手臂 ===
    this.graphics.fillStyle(0xF5DEB3);
    this.graphics.fillEllipse(-14 - armSwing * 0.3, bodyY + armSwing * 0.4, 8, 26);
    this.graphics.fillEllipse(14 + armSwing * 0.3, bodyY - armSwing * 0.4, 8, 26);

    // 手（合十）
    this.graphics.fillStyle(0xF5DEB3);
    if (this.isMoving) {
      this.graphics.fillCircle(-17 - armSwing * 0.4, bodyY + 14 + armSwing * 0.5, 5);
      this.graphics.fillCircle(17 + armSwing * 0.4, bodyY + 14 - armSwing * 0.5, 5);
    } else {
      // 站立时双手合十
      this.graphics.fillEllipse(0, bodyY + 12, 10, 14);
    }

    // === 腿部 ===
    this.graphics.fillStyle(0xCC3333);
    this.graphics.fillEllipse(-7 - legSwing * 0.3, bodyY + 28 + legSwing * 0.3, 10, 22);
    this.graphics.fillEllipse(7 + legSwing * 0.3, bodyY + 28 - legSwing * 0.3, 10, 22);

    // 布鞋
    this.graphics.fillStyle(0x5C3310);
    this.graphics.fillEllipse(-9 - legSwing * 0.4, bodyY + 44 + legSwing * 0.4, 8, 5);
    this.graphics.fillEllipse(9 + legSwing * 0.4, bodyY + 44 - legSwing * 0.4, 8, 5);

    // === 头部 ===
    this.graphics.fillStyle(0xF5DEB3);
    this.graphics.fillEllipse(0, -16, 28, 30);

    // 光头
    this.graphics.fillStyle(0xE8D5B0);
    this.graphics.fillEllipse(0, -18, 24, 26);

    // 戒疤
    this.graphics.fillStyle(0x8B4513);
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      const bx = Math.sin(angle) * 8;
      const by = -28 + Math.cos(angle) * 4;
      this.graphics.fillCircle(bx, by, 2);
    }

    // === 耳朵 ===
    this.graphics.fillStyle(0xF5DEB3);
    this.graphics.fillEllipse(-22, -24, 8, 12);
    this.graphics.fillEllipse(22, -24, 8, 12);

    // === 眼睛（慈悲温和）===
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillEllipse(-9, -20, 7, 8);
    this.graphics.fillEllipse(9, -20, 7, 8);
    this.graphics.fillStyle(0x1A1A2E);
    this.graphics.fillEllipse(-8, -19, 3, eyeHeight);
    this.graphics.fillEllipse(10, -19, 3, eyeHeight);

    // 高光
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillCircle(-10, -22, 1.5);
    this.graphics.fillCircle(8, -22, 1.5);

    // === 眉毛 ===
    const browY = -27 + (this.isMoving ? Math.sin(this.walkCycle * 3) * 0.5 : 0);
    this.graphics.fillStyle(0x3C2A1A);
    this.graphics.fillRect(-14, browY, 10, 2);
    this.graphics.fillRect(4, browY, 10, 2);

    // === 鼻子 ===
    this.graphics.fillStyle(0xD4A574);
    this.graphics.fillEllipse(0, -13, 4, 3);

    // === 嘴巴 ===
    this.graphics.lineStyle(2, 0x5C3310);
    this.graphics.beginPath();
    this.graphics.arc(0, -8, 5, 0.15, Math.PI - 0.15);
    this.graphics.strokePath();

    // === 唐僧帽（毗卢帽）===
    this.graphics.fillStyle(0xFFD700);
    this.graphics.fillEllipse(0, -30, 20, 6);
    this.graphics.fillRect(-15, -34, 30, 4);

    // 帽翅
    this.graphics.fillStyle(0xFFD700);
    this.graphics.fillEllipse(-20, -32, 8, 12);
    this.graphics.fillEllipse(20, -32, 8, 12);

    // 佛像装饰
    this.graphics.fillStyle(0xFF6666);
    this.graphics.fillRect(-2, -38, 4, 8);
  }
}