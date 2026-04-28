export class BaJie {
  private graphics: Phaser.GameObjects.Graphics;
  private isMoving: boolean = false;
  private walkCycle: number = 0;
  private blinkTimer: number = 0;
  private attackTimer: number = 0;
  private isAttacking: boolean = false;

  // 缩放系数（与悟空保持一致，但更胖）
  private readonly S = 0.4;
  private readonly WIDTH_SCALE = 1.35;  // 猪八戒最宽，突出肥胖

  private readonly COLORS = {
    SKIN_LIGHT: 0xE8A0A0,
    SKIN_MID: 0xD48A8A,
    SKIN_DARK: 0xB07070,
    SKIN_SHADOW: 0x8A5050,
    SKIN_PINK: 0xFFCCCC,
    ROBE_LIGHT: 0x5C8A3A,
    ROBE_MID: 0x3A6A1A,
    ROBE_DARK: 0x1A4A0A,
    BELT: 0x8B5A3A,
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

    const bodyY = 10 + (this.isMoving ? Math.sin(this.walkCycle) * 1.5 : 0);
    const armSwing = this.isMoving ? Math.sin(this.walkCycle * 1.3) * 5 : (this.isAttacking ? 14 : 0);
    const legSwing = this.isMoving ? Math.sin(this.walkCycle * 1.3) * 3 : 0;
    const eyeClose = this.blinkTimer++ % 160 < 4;

    // 地面阴影（更宽）
    this.fillEllipse(0, bodyY + 38, 48, 10, this.COLORS.AO);

    // ==================== 衣服（绿色/黑色） ====================
    this.poly([
      [-18, bodyY + 2], [-26, bodyY + 16], [-24, bodyY + 36],
      [-18, bodyY + 46], [-9, bodyY + 48], [0, bodyY + 46],
      [9, bodyY + 48], [18, bodyY + 46], [24, bodyY + 36],
      [26, bodyY + 16], [18, bodyY + 2]
    ], this.COLORS.ROBE_MID);

    // 衣服暗部
    this.poly([
      [-12, bodyY + 8], [-18, bodyY + 28], [-12, bodyY + 44],
      [0, bodyY + 46], [0, bodyY + 10]
    ], this.COLORS.ROBE_DARK, false);
    this.poly([
      [12, bodyY + 8], [18, bodyY + 28], [12, bodyY + 44],
      [0, bodyY + 46], [0, bodyY + 10]
    ], this.COLORS.ROBE_DARK, false);

    // 衣服亮部
    this.poly([
      [-15, bodyY + 4], [-20, bodyY + 20], [-16, bodyY + 36],
      [-9, bodyY + 44], [-4, bodyY + 44]
    ], this.COLORS.ROBE_LIGHT, false);

    // ==================== 身体（肥胖圆润） ====================
    this.rect(6, bodyY + 2, 16, 32, this.COLORS.SHADOW, this.COLORS.SHADOW);
    this.rect(-18, bodyY, 20, 34, this.COLORS.SKIN_MID, this.COLORS.SKIN_MID);
    this.rect(-2, bodyY, 6, 34, this.COLORS.SKIN_DARK, this.COLORS.SKIN_DARK);

    // 大肚子（额外椭圆突出肥胖）
    this.fillEllipse(0, bodyY + 18, 18, 16, this.COLORS.SKIN_LIGHT);
    this.fillEllipse(0, bodyY + 22, 14, 12, this.COLORS.SKIN_MID);

    // 胸肌（松弛）
    this.fillEllipse(-12, bodyY + 6, 8, 9, this.COLORS.SKIN_LIGHT);
    this.fillEllipse(8, bodyY + 6, 8, 9, this.COLORS.SKIN_DARK);

    // ==================== 腰封 ====================
    this.rect(-17, bodyY + 28, 34, 8, this.COLORS.BELT, this.COLORS.BROWN_DARK, this.COLORS.BROWN_DARK);

    // 腰封装饰
    this.graphics.fillStyle(this.COLORS.GOLD_MID);
    this.graphics.fillRect(this.pxw(-12), this.px(bodyY + 30), this.pxw(24), this.px(2));

    // ==================== 手臂（粗短） ====================
    const axL = -18 - armSwing;
    const axR = 14 + armSwing;

    this.rect(axL, bodyY + 6, 9, 18, this.COLORS.SKIN_LIGHT, this.COLORS.SKIN_MID);
    this.rect(axR, bodyY + 6, 9, 18, this.COLORS.SKIN_MID, this.COLORS.SKIN_DARK);

    // 护腕
    this.rect(axL - 2, bodyY + 18, 12, 7, this.COLORS.GOLD_MID, this.COLORS.GOLD_DARK);
    this.rect(axR - 2, bodyY + 18, 12, 7, this.COLORS.GOLD_DARK, this.COLORS.GOLD_DARK);

    // 手（肥厚）
    this.fillEllipse(axL, bodyY + 25, 6, 5, this.COLORS.SKIN_LIGHT);
    this.fillEllipse(axR + 1, bodyY + 25, 6, 5, this.COLORS.SKIN_MID);

    // ==================== 九齿钉耙 ====================
    const rakeX = axR + 13;
    const rakeY = bodyY + 14;

    // 耙柄
    this.rect(rakeX - 1, rakeY - 25, 2.5, 50, this.COLORS.BROWN_DARK, this.COLORS.BROWN_DARK);
    this.rect(rakeX - 1, rakeY - 25, 1.5, 50, this.COLORS.WOOD, this.COLORS.WOOD);

    // 耙头（九齿）
    this.graphics.fillStyle(this.COLORS.SILVER);
    this.graphics.fillRect(this.pxw(rakeX - 6), this.px(rakeY - 30), this.pxw(12), this.px(5));

    // 九个齿
    for (let i = -4; i <= 4; i++) {
      this.graphics.fillRect(this.pxw(rakeX + i * 1.3 - 1), this.px(rakeY - 33), this.pxw(1.5), this.px(5));
    }

    // 耙头装饰
    this.fillEllipse(rakeX, rakeY - 28, 5, 3.5, this.COLORS.GOLD_MID);
    this.fillEllipse(rakeX, rakeY - 27, 3, 2.5, this.COLORS.GOLD_LIGHT);

    // ==================== 腿部（短粗） ====================
    const legL = -10 - legSwing;
    const legR = 6 + legSwing;

    this.rect(legL, bodyY + 34, 9, 13, this.COLORS.ROBE_MID, this.COLORS.ROBE_DARK);
    this.rect(legR, bodyY + 34, 9, 13, this.COLORS.ROBE_DARK, this.COLORS.SHADOW);

    // 靴子
    this.rect(legL - 2.5, bodyY + 45, 11, 6, this.COLORS.BROWN_LIGHT, this.COLORS.BROWN_DARK);
    this.rect(legR - 1.5, bodyY + 45, 11, 6, this.COLORS.BROWN_DARK, this.COLORS.SHADOW);

    // ==================== 尾巴（小猪尾巴） ====================
    const tailSwing = this.isMoving ? Math.sin(this.walkCycle * 4) * 4 : 0;
    this.graphics.fillStyle(this.COLORS.SKIN_MID);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(16), this.px(bodyY + 12));
    this.graphics.lineTo(this.pxw(20 + tailSwing), this.px(bodyY + 8));
    this.graphics.lineTo(this.pxw(22 + tailSwing * 0.8), this.px(bodyY + 4));
    this.graphics.lineTo(this.pxw(20 + tailSwing * 0.5), this.px(bodyY + 0));
    this.graphics.fillPath();
    this.fillEllipse(20 + tailSwing * 0.5, bodyY + 0, 2.5, 2, this.COLORS.SKIN_DARK);

    // ==================== 头部（猪头特征） ====================
    // 头骨（圆）
    this.fillEllipse(0, bodyY - 17, 27, 23, this.COLORS.SKIN_MID);
    this.fillEllipse(4, bodyY - 15, 12, 19, this.COLORS.SKIN_DARK);

    // 脸部（圆胖猪脸）
    this.poly([
      [0, bodyY - 32], [-12, bodyY - 25], [-13, bodyY - 17],
      [-11, bodyY - 8], [-7, bodyY - 4], [0, bodyY - 4],
      [7, bodyY - 4], [11, bodyY - 8], [13, bodyY - 17],
      [12, bodyY - 25]
    ], this.COLORS.SKIN_LIGHT);

    // 脸颊红润
    this.fillEllipse(-11, bodyY - 16, 5, 4, this.COLORS.SKIN_PINK);
    this.fillEllipse(11, bodyY - 16, 5, 4, this.COLORS.SKIN_PINK);

    // 下巴（双层下巴）
    this.fillEllipse(0, bodyY - 4, 12, 4, this.COLORS.SKIN_SHADOW);
    this.fillEllipse(0, bodyY - 1, 10, 3, this.COLORS.SKIN_MID);


    //光头宽大
    this.fillEllipse(0, bodyY - 36, 25, 9, this.COLORS.SKIN_MID);
    this.fillEllipse(-2, bodyY - 38, 14, 6, this.COLORS.SKIN_LIGHT);

    // ==================== 大耳朵 ====================
    // 左耳
    this.fillEllipse(-16, bodyY - 22, 8, 12, this.COLORS.SKIN_MID);
    this.fillEllipse(-17, bodyY - 21, 5, 9, this.COLORS.SKIN_LIGHT);
    this.fillEllipse(-18, bodyY - 20, 2, 5, this.COLORS.SKIN_DARK);

    // 右耳
    this.fillEllipse(16, bodyY - 22, 8, 12, this.COLORS.SKIN_MID);
    this.fillEllipse(17, bodyY - 21, 5, 9, this.COLORS.SKIN_LIGHT);
    this.fillEllipse(18, bodyY - 20, 2, 5, this.COLORS.SKIN_DARK);

    // ==================== 猪鼻子 ====================
    this.fillEllipse(0, bodyY - 12, 8, 6, this.COLORS.SKIN_DARK);
    this.fillEllipse(0, bodyY - 13, 7, 5, this.COLORS.SKIN_MID);
    // 鼻孔
    this.fillEllipse(-2.5, bodyY - 13, 1.5, 1.5, this.COLORS.SKIN_SHADOW);
    this.fillEllipse(2.5, bodyY - 13, 1.5, 1.5, this.COLORS.SKIN_SHADOW);

    // ==================== 眼睛 ====================
    this.fillEllipse(-9, bodyY - 23, 4.5, 3.5, this.COLORS.SKIN_DARK);
    this.fillEllipse(9, bodyY - 23, 4.5, 3.5, this.COLORS.SKIN_DARK);

    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillRect(this.pxw(-11), this.px(bodyY - 25), this.pxw(4.5), this.px(4.5));
    this.graphics.fillRect(this.pxw(7), this.px(bodyY - 25), this.pxw(4.5), this.px(4.5));

    const eyeH = eyeClose ? 2 : 4;
    this.graphics.fillStyle(this.COLORS.EYE);
    this.graphics.fillRect(this.pxw(-10), this.px(bodyY - 24), this.pxw(2.5), this.px(eyeH));
    this.graphics.fillRect(this.pxw(8), this.px(bodyY - 24), this.pxw(2.5), this.px(eyeH));

    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillRect(this.pxw(-11), this.px(bodyY - 26), this.pxw(1.5), this.px(1.5));
    this.graphics.fillRect(this.pxw(7), this.px(bodyY - 26), this.pxw(1.5), this.px(1.5));

    // 眉毛（细小）
    const browY = -20 + (this.isMoving ? Math.sin(this.walkCycle * 2) * 0.5 : 0);
    this.graphics.fillStyle(this.COLORS.BROWN_DARK);
    this.graphics.fillRect(this.pxw(-13), this.px(browY), this.pxw(8), this.px(2));
    this.graphics.fillRect(this.pxw(5), this.px(browY), this.pxw(8), this.px(2));

    // 嘴巴（憨厚微笑）
    if (this.isAttacking) {
      this.graphics.fillStyle(this.COLORS.SKIN_SHADOW);
      this.graphics.fillRect(this.pxw(-5), this.px(bodyY - 7), this.pxw(10), this.px(2));
      this.graphics.fillStyle(0xFFFFFF);
      this.graphics.fillRect(this.pxw(-3.5), this.px(bodyY - 8), this.pxw(2), this.px(2));
      this.graphics.fillRect(this.pxw(1.5), this.px(bodyY - 8), this.pxw(2), this.px(2));
    } else {
      // 憨笑
      this.graphics.fillStyle(this.COLORS.SKIN_SHADOW);
      this.graphics.fillRect(this.pxw(-4), this.px(bodyY - 7), this.pxw(2), this.px(2));
      this.graphics.fillRect(this.pxw(-1), this.px(bodyY - 8), this.pxw(2), this.px(2));
      this.graphics.fillRect(this.pxw(2), this.px(bodyY - 7), this.pxw(2), this.px(2));
    }

    // ==================== 帽子（小帽） ====================
    this.fillEllipse(0, bodyY - 40, 20, 7, this.COLORS.BROWN_LIGHT);
    this.fillEllipse(0, bodyY - 42, 14, 5, this.COLORS.BROWN_DARK);

    // ==================== 颈部连接（填补头身空隙） ====================
    this.graphics.fillStyle(this.COLORS.SKIN_MID);
    this.graphics.fillRect(this.pxw(-8), this.px(bodyY - 4), this.pxw(16), this.px(10));

    // ==================== 八戒腾云（扁平拖尾，笨重感） ====================
    if (this.isMoving) {
      // 主云（扁长，像被拖着走）
      this.graphics.fillStyle(0xFFFFFF, 0.75);
      this.fillEllipse(-20, bodyY + 32, 18, 8, 0xFFFFFF);
      this.fillEllipse(-5, bodyY + 30, 15, 9, 0xFFFFFF);
      this.fillEllipse(10, bodyY + 32, 16, 8, 0xFFFFFF);
      this.fillEllipse(22, bodyY + 34, 12, 7, 0xFFFFFF);

      // 拖尾云（向后飘，体现慢速）
      this.fillEllipse(-30, bodyY + 35, 10, 6, 0xEEEEEE);
      this.fillEllipse(-38, bodyY + 37, 8, 5, 0xDDDDDD);

      // 云底阴影（厚重感）
      this.graphics.fillStyle(0xCCCCCC, 0.5);
      this.fillEllipse(-18, bodyY + 35, 15, 5, 0xCCCCCC);
      this.fillEllipse(0, bodyY + 34, 14, 5, 0xCCCCCC);
      this.fillEllipse(18, bodyY + 36, 12, 4, 0xCCCCCC);

      // 少量高光
      this.graphics.fillStyle(0xFFFFFF, 0.5);
      this.fillEllipse(-18, bodyY + 29, 8, 4, 0xFFFFFF);
      this.fillEllipse(5, bodyY + 28, 7, 4, 0xFFFFFF);
    }


    // Rim Light
    this.graphics.lineStyle(this.px(1.5), this.COLORS.RIM, 0.35);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(18), this.px(bodyY - 18));
    this.graphics.lineTo(this.pxw(22), this.px(bodyY + 8));
    this.graphics.lineTo(this.pxw(18), this.px(bodyY + 38));
    this.graphics.strokePath();
  }
}