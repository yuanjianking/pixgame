// characters/ShaSeng.ts
// 风格：90年代光荣SRPG战棋立绘风
// 沙僧：高大魁梧、光头、络腮胡、月牙铲
// 版本：宽高比 1:1

export class ShaSeng {
  private graphics: Phaser.GameObjects.Graphics;
  private isMoving: boolean = false;
  private walkCycle: number = 0;
  private blinkTimer: number = 0;
  private attackTimer: number = 0;
  private isAttacking: boolean = false;

  // 缩放系数（与悟空/唐僧保持一致）
  private readonly S = 0.4;
  private readonly WIDTH_SCALE = 1.25;  // 沙僧更宽，突出魁梧

  private readonly COLORS = {
    SKIN_LIGHT: 0xD48A4A,
    SKIN_MID: 0xC47A3A,
    SKIN_DARK: 0xA06030,
    SKIN_SHADOW: 0x7A4020,
    ROBE_LIGHT: 0x4A7A9C,
    ROBE_MID: 0x2E5E8C,
    ROBE_DARK: 0x1A3A5C,
    BEARD: 0x3C2A1A,
    GOLD_LIGHT: 0xFFD700,
    GOLD_MID: 0xCDA530,
    GOLD_DARK: 0x8B6914,
    BROWN_LIGHT: 0x8B5A3A,
    BROWN_DARK: 0x5C3A1A,
    WOOD: 0xAD8A5C,
    SILVER: 0xC0C0C0,
    AO: 0x1A1518,
    SHADOW: 0x2A2025,
    RIM: 0xFFAA66,
    EYE: 0x1A1A2E
  };

  constructor(graphics: Phaser.GameObjects.Graphics) {
    this.graphics = graphics;
  }

  updateAnimation(isMoving: boolean, walkCycle: number, isAttacking: boolean = false) {
    this.isMoving = isMoving;
    this.walkCycle = walkCycle;
    this.isAttacking = isAttacking;
    if (isAttacking) this.attackTimer = 12;
    else this.attackTimer = Math.max(0, this.attackTimer - 1);
  }

  private px(v: number): number {
    return v * this.S;
  }

  private pxw(v: number): number {
    return v * this.S * this.WIDTH_SCALE;
  }

  private rect(x: number, y: number, w: number, h: number, light: number, dark: number, mid?: number) {
    const sx = this.pxw(x);
    const sy = this.px(y);
    const sw = this.pxw(w);
    const sh = this.px(h);
    const offset = this.px(2);

    this.graphics.fillStyle(dark);
    this.graphics.fillRect(sx + offset, sy + offset, sw, sh);
    this.graphics.fillStyle(light);
    this.graphics.fillRect(sx, sy, sw, sh);
    if (mid) {
      this.graphics.fillStyle(mid);
      this.graphics.fillRect(sx + this.px(1), sy + this.px(1), sw - this.px(2), sh - this.px(2));
    }
  }

  private poly(points: Array<[number, number]>, color: number, shadow: boolean = true) {
    if (points.length < 3) return;
    const scaledPoints = points.map(([x, y]) => [this.pxw(x), this.px(y)] as [number, number]);
    const offset = this.px(2);

    if (shadow) {
      this.graphics.fillStyle(this.COLORS.AO, 0.5);
      this.graphics.beginPath();
      this.graphics.moveTo(scaledPoints[0][0] + offset, scaledPoints[0][1] + offset);
      for (let i = 1; i < scaledPoints.length; i++) {
        this.graphics.lineTo(scaledPoints[i][0] + offset, scaledPoints[i][1] + offset);
      }
      this.graphics.closePath();
      this.graphics.fillPath();
    }
    this.graphics.fillStyle(color);
    this.graphics.beginPath();
    this.graphics.moveTo(scaledPoints[0][0], scaledPoints[0][1]);
    for (let i = 1; i < scaledPoints.length; i++) {
      this.graphics.lineTo(scaledPoints[i][0], scaledPoints[i][1]);
    }
    this.graphics.closePath();
    this.graphics.fillPath();
  }

  private fillEllipse(x: number, y: number, rx: number, ry: number, color: number) {
    const sx = this.pxw(x);
    const sy = this.px(y);
    const srx = this.pxw(rx);
    const sry = this.px(ry);
    this.graphics.fillStyle(color);
    this.graphics.fillEllipse(sx, sy, srx, sry);
  }

  draw(x: number, y: number) {
    this.graphics.clear();
    this.graphics.setPosition(x, y);

    const bodyY = 10 + (this.isMoving ? Math.sin(this.walkCycle) * 1.2 : 0);
    const armSwing = this.isMoving ? Math.sin(this.walkCycle * 1.5) * 4 : (this.isAttacking ? 12 : 0);
    const legSwing = this.isMoving ? Math.sin(this.walkCycle * 1.5) * 3 : 0;
    const eyeClose = this.blinkTimer++ % 160 < 4;

    // 地面阴影
    this.fillEllipse(0, bodyY + 38, 40, 9, this.COLORS.AO);

    // ==================== 衣服（蓝色） ====================
    this.poly([
      [-14, bodyY + 2], [-21, bodyY + 15], [-19, bodyY + 35],
      [-14, bodyY + 45], [-7, bodyY + 47], [0, bodyY + 45],
      [7, bodyY + 47], [14, bodyY + 45], [19, bodyY + 35],
      [21, bodyY + 15], [14, bodyY + 2]
    ], this.COLORS.ROBE_MID);

    // 衣服暗部
    this.poly([
      [-9, bodyY + 7], [-14, bodyY + 26], [-9, bodyY + 42],
      [0, bodyY + 44], [0, bodyY + 8]
    ], this.COLORS.ROBE_DARK, false);
    this.poly([
      [9, bodyY + 7], [14, bodyY + 26], [9, bodyY + 42],
      [0, bodyY + 44], [0, bodyY + 8]
    ], this.COLORS.ROBE_DARK, false);

    // ==================== 身体（高大魁梧） ====================
    this.rect(5, bodyY + 2, 12, 30, this.COLORS.SHADOW, this.COLORS.SHADOW);
    this.rect(-14, bodyY, 15, 32, this.COLORS.SKIN_MID, this.COLORS.SKIN_MID);
    this.rect(-2, bodyY, 6, 32, this.COLORS.SKIN_DARK, this.COLORS.SKIN_DARK);

    // 胸肌（壮汉）
    this.fillEllipse(-10, bodyY + 7, 8, 9, this.COLORS.SKIN_LIGHT);
    this.fillEllipse(7, bodyY + 8, 7, 8, this.COLORS.SKIN_DARK);

    // ==================== 佛珠 ====================
    for (let i = -3; i <= 3; i++) {
      this.fillEllipse(i * 4.5, bodyY + 7, 2.5, 2.5, this.COLORS.WOOD);
      this.fillEllipse(i * 4.5, bodyY + 13, 2.5, 2.5, this.COLORS.WOOD);
    }
    this.fillEllipse(0, bodyY + 10, 4, 4, this.COLORS.GOLD_MID);

    // ==================== 腰封 ====================
    this.rect(-15, bodyY + 24, 30, 8, this.COLORS.BROWN_LIGHT, this.COLORS.BROWN_DARK, this.COLORS.BROWN_DARK);

    // ==================== 手臂（粗壮） ====================
    const axL = -15 - armSwing;
    const axR = 12 + armSwing;

    this.rect(axL, bodyY + 5, 8, 19, this.COLORS.SKIN_LIGHT, this.COLORS.SKIN_MID);
    this.rect(axR, bodyY + 5, 8, 19, this.COLORS.SKIN_MID, this.COLORS.SKIN_DARK);

    // 护腕
    this.rect(axL - 2, bodyY + 17, 11, 7, this.COLORS.GOLD_MID, this.COLORS.GOLD_DARK);
    this.rect(axR - 2, bodyY + 17, 11, 7, this.COLORS.GOLD_DARK, this.COLORS.GOLD_DARK);

    // 手
    this.fillEllipse(axL - 1, bodyY + 24, 5, 5, this.COLORS.SKIN_LIGHT);
    this.fillEllipse(axR + 1, bodyY + 24, 5, 5, this.COLORS.SKIN_MID);

    // ==================== 月牙铲 ====================
    const staffX = axR + 12;
    const staffY = bodyY + 14;

    // 铲柄
    this.rect(staffX - 1, staffY - 30, 2.5, 60, this.COLORS.WOOD, this.COLORS.BROWN_DARK);

    // 月牙（铲头）
    this.graphics.fillStyle(this.COLORS.SILVER);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(staffX), this.px(staffY - 35));
    this.graphics.lineTo(this.pxw(staffX - 10), this.px(staffY - 28));
    this.graphics.lineTo(this.pxw(staffX), this.px(staffY - 24));
    this.graphics.fillPath();

    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(staffX), this.px(staffY - 35));
    this.graphics.lineTo(this.pxw(staffX + 10), this.px(staffY - 28));
    this.graphics.lineTo(this.pxw(staffX), this.px(staffY - 24));
    this.graphics.fillPath();

    // 铲头装饰
    this.fillEllipse(staffX, staffY - 31, 4, 3.5, this.COLORS.GOLD_MID);

    // ==================== 腿部 ====================
    const legL = -8 - legSwing;
    const legR = 5 + legSwing;

    this.rect(legL, bodyY + 33, 8, 13, this.COLORS.ROBE_MID, this.COLORS.ROBE_DARK);
    this.rect(legR, bodyY + 33, 8, 13, this.COLORS.ROBE_DARK, this.COLORS.SHADOW);

    // 靴子
    this.rect(legL - 2.5, bodyY + 45, 10, 6, this.COLORS.BROWN_LIGHT, this.COLORS.BROWN_DARK);
    this.rect(legR - 1.5, bodyY + 45, 10, 6, this.COLORS.BROWN_DARK, this.COLORS.SHADOW);

    // ==================== 头部（宽脸、魁梧） ====================
    // 头骨
    this.fillEllipse(0, bodyY - 17, 27, 23, this.COLORS.SKIN_MID);
    this.fillEllipse(4, bodyY - 15, 12, 19, this.COLORS.SKIN_DARK);

    // 脸部（方宽脸）
    this.poly([
      [0, bodyY - 35], [-12, bodyY - 28], [-13, bodyY - 19],
      [-11, bodyY - 10], [-7, bodyY - 6], [0, bodyY - 6],
      [7, bodyY - 6], [11, bodyY - 10], [13, bodyY - 19],
      [12, bodyY - 28]
    ], this.COLORS.SKIN_LIGHT);

    // 脸部亮部
    this.poly([
      [-2, bodyY - 33], [-9, bodyY - 26], [-10, bodyY - 19],
      [-8, bodyY - 12], [-4, bodyY - 8], [0, bodyY - 8]
    ], this.COLORS.SKIN_LIGHT, false);

    //光头宽大
    this.fillEllipse(0, bodyY - 36, 25, 9, this.COLORS.SKIN_MID);
    this.fillEllipse(-2, bodyY - 38, 14, 6, this.COLORS.SKIN_LIGHT);

    // 戒疤（6个红点）
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      const bx = Math.sin(angle) * 6;
      const by = -42 + Math.cos(angle) * 3;
      this.fillEllipse(bx, bodyY + by, 2, 2, 0xCC4444);
    }

    // ==================== 络腮胡 ====================
    this.fillEllipse(-10, bodyY - 6, 9, 7, this.COLORS.BEARD);
    this.fillEllipse(10, bodyY - 6, 9, 7, this.COLORS.BEARD);
    this.fillEllipse(0, bodyY - 4, 11, 6, this.COLORS.BEARD);
    this.fillEllipse(-5, bodyY - 2, 6, 5, this.COLORS.BEARD);
    this.fillEllipse(5, bodyY - 2, 6, 5, this.COLORS.BEARD);

    // ==================== 眼睛 ====================
    this.fillEllipse(-10, bodyY - 25, 5, 4, this.COLORS.SKIN_DARK);
    this.fillEllipse(10, bodyY - 25, 5, 4, this.COLORS.SKIN_DARK);
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillRect(this.pxw(-12), this.px(bodyY - 27), this.pxw(5), this.px(5));
    this.graphics.fillRect(this.pxw(7), this.px(bodyY - 27), this.pxw(5), this.px(5));

    const eyeH = eyeClose ? 2 : 4;
    this.graphics.fillStyle(this.COLORS.EYE);
    this.graphics.fillRect(this.pxw(-11), this.px(bodyY - 26), this.pxw(2.5), this.px(eyeH));
    this.graphics.fillRect(this.pxw(8.5), this.px(bodyY - 26), this.pxw(2.5), this.px(eyeH));

    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillRect(this.pxw(-12), this.px(bodyY - 28), this.pxw(1.5), this.px(1.5));
    this.graphics.fillRect(this.pxw(7), this.px(bodyY - 28), this.pxw(1.5), this.px(1.5));

    // ==================== 眉毛（粗重，用深棕色，不是胡子色） ====================
    const browY = -20 + (this.isMoving ? Math.sin(this.walkCycle * 2) * 0.5 : 0);
    this.graphics.fillStyle(0x2A1A0A);  // 深棕色
    this.graphics.fillRect(this.pxw(-15), this.px(browY), this.pxw(10), this.px(2.5));
    this.graphics.fillRect(this.pxw(5), this.px(browY), this.pxw(10), this.px(2.5));

    // 鼻子
    this.fillEllipse(0, bodyY - 16, 4, 3, this.COLORS.SKIN_DARK);

    // 嘴巴（严肃）
    this.graphics.fillStyle(this.COLORS.SKIN_SHADOW);
    this.graphics.fillRect(this.pxw(-4), this.px(bodyY - 9), this.pxw(8), this.px(2));

    // ==================== 颈部连接（填补头身空隙） ====================
    this.graphics.fillStyle(this.COLORS.SKIN_MID);
    this.graphics.fillRect(this.pxw(-8), this.px(bodyY - 4), this.pxw(16), this.px(10));

    // Rim Light
    this.graphics.lineStyle(this.px(1.5), this.COLORS.RIM, 0.35);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(15), this.px(bodyY - 19));
    this.graphics.lineTo(this.pxw(19), this.px(bodyY + 7));
    this.graphics.lineTo(this.pxw(15), this.px(bodyY + 38));
    this.graphics.strokePath();
  }
}