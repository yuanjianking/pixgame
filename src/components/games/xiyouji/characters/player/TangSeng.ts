import { BaseCharacter } from "./BaseCharacter";

/** 辅助型：脆皮低攻，攻击距离远，升级偏生存 */
export class TangSeng  extends BaseCharacter {
  static readonly BASE_STATS = {
    maxHp: 80,
    attack: 5,
    defense: 4,
    moveRange: 3,
    attackRange: 2,
    healthBarColor: 0xFF6666,
  } as const;

  static readonly LEVEL_GROWTH = {
    hp: 6,
    attack: 1,
    defense: 1,
  } as const;

  protected currentHp: number = TangSeng.BASE_STATS.maxHp;
  protected maxHp: number = TangSeng.BASE_STATS.maxHp;
  protected healthBarColor: number = TangSeng.BASE_STATS.healthBarColor;
  protected attack: number = TangSeng.BASE_STATS.attack;
  protected defense: number = TangSeng.BASE_STATS.defense;
  protected battleMoveRange: number = TangSeng.BASE_STATS.moveRange;
  protected battleAttackRange: number = TangSeng.BASE_STATS.attackRange;
  protected levelGrowth = TangSeng.LEVEL_GROWTH;

  private blinkTimer: number = 0;

  private readonly COLORS = {
    SKIN_LIGHT: 0xF5DEB3,
    SKIN_MID: 0xE8D5B0,
    SKIN_DARK: 0xC4A882,
    SKIN_SHADOW: 0x8B7355,
    SKIN_PINK: 0xFFCCCC,
    ROBE_LIGHT: 0xE84444,
    ROBE_MID: 0xCC3333,
    ROBE_DARK: 0x8B2222,
    RED_MID: 0xCC4444,
    RED_DARK: 0x8B2222,
    GOLD_LIGHT: 0xFFD700,
    GOLD_MID: 0xCDA530,
    GOLD_DARK: 0x8B6914,
    BROWN_LIGHT: 0x8B5A3A,
    BROWN_MID: 0x5C3A1A,
    BROWN_DARK: 0x3A2010,
    WOOD: 0xAD8A5C,
    SILVER: 0xC0C0C0,
    AO: 0x1A1518,
    SHADOW: 0x2A2025,
    RIM: 0xFFAA66,
    EYE: 0x1A1A2E
  };

 constructor(graphics: Phaser.GameObjects.Graphics, scene?: Phaser.Scene) {
    super(graphics, true, scene);
  }

  updateAnimation(isMoving: boolean, walkCycle: number, isAttacking: boolean = false) {
    this.isMoving = isMoving;
    this.walkCycle = walkCycle;
    this.tickAttackTimer(isAttacking);
    this.tickHurtTimer();
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
    const armSwing = this.isMoving ? Math.sin(this.walkCycle * 1.2) * 3 : (this.isAttacking ? 10 : 0);
    const legSwing = this.isMoving ? Math.sin(this.walkCycle * 1.2) * 2.5 : 0;
    const eyeClose = this.blinkTimer++ % 160 < 4;

    // 地面阴影
    this.fillEllipse(0, bodyY + 38, 35, 8, this.COLORS.AO);

    // 袈裟
    this.poly([
      [-12, bodyY + 2], [-19, bodyY + 14], [-17, bodyY + 33],
      [-12, bodyY + 43], [-5, bodyY + 45], [0, bodyY + 43],
      [5, bodyY + 45], [12, bodyY + 43], [17, bodyY + 33],
      [19, bodyY + 14], [12, bodyY + 2]
    ], this.COLORS.ROBE_MID);

    this.poly([
      [-7, bodyY + 7], [-12, bodyY + 24], [-7, bodyY + 40],
      [0, bodyY + 42], [0, bodyY + 9]
    ], this.COLORS.ROBE_DARK, false);
    this.poly([
      [7, bodyY + 7], [12, bodyY + 24], [7, bodyY + 40],
      [0, bodyY + 42], [0, bodyY + 9]
    ], this.COLORS.ROBE_DARK, false);

    // 身体
    this.rect(4, bodyY + 2, 10, 28, this.COLORS.SHADOW, this.COLORS.SHADOW);
    this.rect(-12, bodyY, 14, 30, this.COLORS.SKIN_MID, this.COLORS.SKIN_MID);
    this.rect(-2, bodyY, 6, 30, this.COLORS.SKIN_DARK, this.COLORS.SKIN_DARK);

    // 佛珠
    for (let i = -3; i <= 3; i++) {
      this.fillEllipse(i * 3.5, bodyY + 5, 2, 2, this.COLORS.WOOD);
      this.fillEllipse(i * 3.5, bodyY + 10, 2, 2, this.COLORS.WOOD);
    }
    this.fillEllipse(0, bodyY + 7.5, 3.5, 3.5, this.COLORS.GOLD_MID);

    // 腰封
    this.rect(-14, bodyY + 21, 28, 7, this.COLORS.BROWN_LIGHT, this.COLORS.BROWN_DARK, this.COLORS.BROWN_MID);

    // 手臂
    const axL = -14 - armSwing;
    const axR = 10 + armSwing;
    this.rect(axL, bodyY + 5, 6, 16, this.COLORS.SKIN_LIGHT, this.COLORS.SKIN_MID);
    this.rect(axR, bodyY + 5, 6, 16, this.COLORS.SKIN_MID, this.COLORS.SKIN_DARK);

    // 双手合十
    if (!this.isMoving && !this.isAttacking) {
      this.rect(-4, bodyY + 12, 8, 10, this.COLORS.SKIN_LIGHT, this.COLORS.SKIN_MID);
    }

    // 九环锡杖
    const staffX = axR + 11;
    const staffY = bodyY + 14;
    this.rect(staffX - 1, staffY - 30, 2.5, 60, this.COLORS.SILVER, this.COLORS.BROWN_DARK);
    this.fillEllipse(staffX, staffY - 33, 4, 5, this.COLORS.GOLD_MID);
    for (let i = 0; i < 9; i++) {
      const ringY = staffY - 28 + i * 3.5;
      this.fillEllipse(staffX + 2, ringY, 2.5, 1.5, this.COLORS.GOLD_LIGHT);
    }

    // 腿部
    const legL = -7 - legSwing;
    const legR = 3 + legSwing;
    this.rect(legL, bodyY + 31, 6, 12, this.COLORS.ROBE_MID, this.COLORS.ROBE_DARK);
    this.rect(legR, bodyY + 31, 6, 12, this.COLORS.ROBE_DARK, this.COLORS.SHADOW);
    this.rect(legL - 2.5, bodyY + 42, 8, 5, this.COLORS.BROWN_LIGHT, this.COLORS.BROWN_DARK);
    this.rect(legR - 1, bodyY + 42, 8, 5, this.COLORS.BROWN_DARK, this.COLORS.SHADOW);

    // ==================== 头部（圆脸，短脸） ====================
    this.fillEllipse(0, bodyY - 17, 27, 23, this.COLORS.SKIN_MID);
    this.fillEllipse(4, bodyY - 15, 12, 19, this.COLORS.SKIN_DARK);

    // 脸部（圆脸，放大）
    this.poly([
      [0, bodyY - 34], [-13, bodyY - 27], [-14, bodyY - 18],
      [-11, bodyY - 8], [-6, bodyY - 4], [0, bodyY - 5],
      [6, bodyY - 4], [11, bodyY - 8], [14, bodyY - 18],
      [13, bodyY - 27]
    ], this.COLORS.SKIN_LIGHT);

    // 脸部亮部
    this.poly([
      [-2, bodyY - 32], [-10, bodyY - 25], [-11, bodyY - 18],
      [-8, bodyY - 10], [-3, bodyY - 6], [0, bodyY - 7]
    ], this.COLORS.SKIN_LIGHT, false);

    // 脸颊红润（放大）
    this.fillEllipse(-12, bodyY - 19, 6, 5, this.COLORS.SKIN_PINK);
    this.fillEllipse(12, bodyY - 19, 6, 5, this.COLORS.SKIN_PINK);

    // 下巴阴影
    this.fillEllipse(0, bodyY - 5, 12, 4, this.COLORS.SKIN_SHADOW);

    // 光头（放大）
    this.fillEllipse(0, bodyY - 36, 25, 9, this.COLORS.SKIN_MID);
    this.fillEllipse(-2, bodyY - 38, 14, 6, this.COLORS.SKIN_LIGHT);

    // 戒疤（放大位置调整）
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      const bx = Math.sin(angle) * 7;
      const by = -43 + Math.cos(angle) * 4;
      this.fillEllipse(bx, bodyY + by, 2.5, 2.5, this.COLORS.RED_MID);
    }
    this.fillEllipse(0, bodyY - 45, 3, 3, this.COLORS.RED_DARK);

    // 毗卢帽（放大）
    this.rect(-16, bodyY - 47, 32, 7, this.COLORS.GOLD_MID, this.COLORS.GOLD_DARK);
    this.poly([
      [-16, bodyY - 44], [-26, bodyY - 51], [-30, bodyY - 47],
      [-24, bodyY - 42], [-18, bodyY - 44]
    ], this.COLORS.GOLD_LIGHT);
    this.poly([
      [16, bodyY - 44], [26, bodyY - 51], [30, bodyY - 47],
      [24, bodyY - 42], [18, bodyY - 44]
    ], this.COLORS.GOLD_MID);

    // 眼睛（放大）
    this.fillEllipse(-11, bodyY - 26, 6, 5, this.COLORS.SKIN_DARK);
    this.fillEllipse(11, bodyY - 26, 6, 5, this.COLORS.SKIN_DARK);
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillRect(this.pxw(-13), this.px(bodyY - 28), this.pxw(6), this.px(6));
    this.graphics.fillRect(this.pxw(7), this.px(bodyY - 28), this.pxw(6), this.px(6));

    const eyeH = eyeClose ? 2 : 5;
    this.graphics.fillStyle(this.COLORS.EYE);
    this.graphics.fillRect(this.pxw(-12), this.px(bodyY - 27), this.pxw(3), this.px(eyeH));
    this.graphics.fillRect(this.pxw(9), this.px(bodyY - 27), this.pxw(3), this.px(eyeH));

    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillRect(this.pxw(-13), this.px(bodyY - 29), this.pxw(2), this.px(2));
    this.graphics.fillRect(this.pxw(8), this.px(bodyY - 29), this.pxw(2), this.px(2));

    // 眉毛（放大）
    const browY = -22 + (this.isMoving ? Math.sin(this.walkCycle * 2) * 0.5 : 0);
    this.graphics.fillStyle(this.COLORS.BROWN_MID);
    this.graphics.fillRect(this.pxw(-17), this.px(browY), this.pxw(12), this.px(2.5));
    this.graphics.fillRect(this.pxw(5), this.px(browY), this.pxw(12), this.px(2.5));

    // 鼻子（放大）
    this.fillEllipse(0, bodyY - 16, 4, 3, this.COLORS.SKIN_DARK);
    this.fillEllipse(-1.5, bodyY - 15, 1.8, 1.2, this.COLORS.SKIN_SHADOW);
    this.fillEllipse(1.5, bodyY - 15, 1.8, 1.2, this.COLORS.SKIN_SHADOW);

    // 嘴巴（微笑）
    this.graphics.fillStyle(this.COLORS.SKIN_SHADOW);
    this.graphics.fillRect(this.pxw(-4), this.px(bodyY - 10), this.pxw(2.5), this.px(2));
    this.graphics.fillRect(this.pxw(-1), this.px(bodyY - 11), this.pxw(2.5), this.px(2));
    this.graphics.fillRect(this.pxw(2), this.px(bodyY - 10), this.pxw(2.5), this.px(2));

    // ==================== 颈部连接（填补头身空隙） ====================
    this.graphics.fillStyle(this.COLORS.SKIN_MID);
    this.graphics.fillRect(this.pxw(-8), this.px(bodyY - 4), this.pxw(16), this.px(10));

    // Rim Light
    this.graphics.lineStyle(this.px(1.5), this.COLORS.RIM, 0.35);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(14), this.px(bodyY - 19));
    this.graphics.lineTo(this.pxw(17), this.px(bodyY + 7));
    this.graphics.lineTo(this.pxw(14), this.px(bodyY + 35));
    this.graphics.strokePath();
  }
}