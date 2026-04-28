import { BaseCharacter } from "./BaseCharacter";

export class WuKong  extends BaseCharacter {
  private blinkTimer: number = 0;
  private attackTimer: number = 0;
  private isAttacking: boolean = false;

  // 缩放系数（调整为更宽的比例）
  private readonly S = 0.4;
  private readonly WIDTH_SCALE = 1.2;  // 宽度额外放大

  // SRPG固定色调板
  private readonly COLORS = {
    SKIN_LIGHT: 0xE8C08A,
    SKIN_MID: 0xC4A06A,
    SKIN_DARK: 0x8B633A,
    SKIN_SHADOW: 0x5A3A1A,
    FUR_DARK: 0x3A2010,
    FUR_MID: 0x5C3A1A,
    FUR_LIGHT: 0x7A5030,
    GOLD_LIGHT: 0xFFD700,
    GOLD_MID: 0xCDA530,
    GOLD_DARK: 0x8B6914,
    GOLD_SHADOW: 0x5C4510,
    BRONZE_LIGHT: 0xD4A520,
    BRONZE_MID: 0xA07828,
    BRONZE_DARK: 0x6B4A10,
    RED_LIGHT: 0xE83A3A,
    RED_MID: 0xAA1A1A,
    RED_DARK: 0x6A0A0A,
    TIGER_LIGHT: 0xCDA540,
    TIGER_MID: 0x9A7A2A,
    TIGER_DARK: 0x6A4A1A,
    LEATHER_LIGHT: 0x7A4A2A,
    LEATHER_MID: 0x5A2A1A,
    LEATHER_DARK: 0x3A1A0A,
    AO: 0x1A1518,
    SHADOW: 0x2A2025,
    RIM: 0xFFAA66,
    EYE: 0xFF6600
  };

  constructor(graphics: Phaser.GameObjects.Graphics, scene?: Phaser.Scene) {
    super(graphics, true, scene);
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

  private ellipse(x: number, y: number, rx: number, ry: number, color: number) {
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
    const armSwing = this.isMoving ? Math.sin(this.walkCycle * 2.5) * 6 : (this.isAttacking ? 14 : 0);
    const legSwing = this.isMoving ? Math.sin(this.walkCycle * 2) * 4 : 0;
    const eyeClose = this.blinkTimer++ % 160 < 4;

    // 地面阴影
    this.ellipse(0, bodyY + 38, 40, 8, this.COLORS.AO);

    // 披风
    this.poly([
      [-14, bodyY + 2], [-22, bodyY + 14], [-20, bodyY + 34],
      [-14, bodyY + 44], [-5, bodyY + 46], [0, bodyY + 44],
      [5, bodyY + 46], [14, bodyY + 44], [20, bodyY + 34],
      [22, bodyY + 14], [14, bodyY + 2]
    ], this.COLORS.RED_MID);
    this.poly([
      [-8, bodyY + 8], [-13, bodyY + 26], [-8, bodyY + 42],
      [0, bodyY + 44], [0, bodyY + 10]
    ], this.COLORS.RED_DARK, false);
    this.poly([
      [8, bodyY + 8], [13, bodyY + 26], [8, bodyY + 42],
      [0, bodyY + 44], [0, bodyY + 10]
    ], this.COLORS.RED_DARK, false);
    this.poly([
      [-12, bodyY + 4], [-16, bodyY + 18], [-13, bodyY + 32],
      [-7, bodyY + 40], [-3, bodyY + 40]
    ], this.COLORS.RED_LIGHT, false);

    // 身体（更宽）
    this.rect(5, bodyY + 2, 14, 30, this.COLORS.SHADOW, this.COLORS.SHADOW);
    this.rect(-16, bodyY, 18, 32, this.COLORS.FUR_MID, this.COLORS.FUR_MID);
    this.rect(-2, bodyY, 8, 32, this.COLORS.FUR_DARK, this.COLORS.FUR_DARK);

    // 胸肌
    this.rect(-14, bodyY + 2, 9, 12, this.COLORS.FUR_LIGHT, this.COLORS.FUR_MID);
    this.rect(5, bodyY + 2, 9, 12, this.COLORS.FUR_DARK, this.COLORS.SHADOW);
    this.graphics.fillStyle(this.COLORS.FUR_LIGHT);
    this.graphics.fillRect(this.pxw(-14), this.px(bodyY + 2), this.pxw(5), this.px(7));

    // 腹肌
    this.rect(-7, bodyY + 15, 4, 6, this.COLORS.FUR_MID, this.COLORS.FUR_DARK);
    this.rect(1, bodyY + 15, 4, 6, this.COLORS.FUR_DARK, this.COLORS.SHADOW);
    this.rect(-3, bodyY + 23, 7, 4, this.COLORS.FUR_MID, this.COLORS.FUR_DARK);

    // 肩甲
    this.ellipse(-20, bodyY + 1, 14, 12, this.COLORS.GOLD_DARK);
    this.ellipse(-20, bodyY, 13, 11, this.COLORS.GOLD_MID);
    this.ellipse(-23, bodyY - 2, 5, 4, this.COLORS.GOLD_LIGHT);
    this.ellipse(20, bodyY + 1, 14, 12, this.COLORS.BRONZE_DARK);
    this.ellipse(20, bodyY, 13, 11, this.COLORS.BRONZE_MID);
    this.ellipse(23, bodyY + 3, 7, 5, this.COLORS.GOLD_SHADOW);

    // 腰封
    this.rect(-17, bodyY + 24, 34, 8, this.COLORS.LEATHER_LIGHT, this.COLORS.LEATHER_DARK, this.COLORS.LEATHER_MID);
    for (let i = -2; i <= 2; i++) {
      this.graphics.fillStyle(this.COLORS.GOLD_LIGHT);
      this.graphics.fillRect(this.pxw(i * 6 - 2), this.px(bodyY + 27), this.pxw(3.5), this.px(4));
      this.graphics.fillStyle(this.COLORS.GOLD_SHADOW);
      this.graphics.fillRect(this.pxw(i * 6 - 1), this.px(bodyY + 28), this.pxw(1.5), this.px(2.5));
    }

    // 虎皮裙
    this.poly([
      [-19, bodyY + 33], [-24, bodyY + 44], [-17, bodyY + 49],
      [-8, bodyY + 48], [0, bodyY + 49], [8, bodyY + 48],
      [17, bodyY + 49], [24, bodyY + 44], [19, bodyY + 33]
    ], this.COLORS.TIGER_MID);
    this.graphics.fillStyle(this.COLORS.TIGER_DARK);
    this.graphics.fillRect(this.pxw(-15), this.px(bodyY + 38), this.pxw(4), this.px(1.5));
    this.graphics.fillRect(this.pxw(-6), this.px(bodyY + 40), this.pxw(4), this.px(1.5));
    this.graphics.fillRect(this.pxw(3), this.px(bodyY + 40), this.pxw(4), this.px(1.5));
    this.graphics.fillRect(this.pxw(12), this.px(bodyY + 38), this.pxw(4), this.px(1.5));
    this.poly([
      [-17, bodyY + 35], [-20, bodyY + 43], [-13, bodyY + 46],
      [-6, bodyY + 45], [0, bodyY + 46], [6, bodyY + 45],
      [13, bodyY + 46], [20, bodyY + 43], [17, bodyY + 35]
    ], this.COLORS.TIGER_LIGHT, false);

    // 左臂
    const axL = -18 - armSwing;
    this.rect(axL, bodyY + 4, 8, 17, this.COLORS.FUR_LIGHT, this.COLORS.FUR_MID);
    this.rect(axL - 2, bodyY + 14, 11, 7, this.COLORS.GOLD_LIGHT, this.COLORS.GOLD_DARK);
    this.ellipse(axL + 1, bodyY + 22, 6, 5, this.COLORS.FUR_LIGHT);

    // 右臂
    const axR = 14 + armSwing;
    this.rect(axR, bodyY + 4, 8, 17, this.COLORS.FUR_DARK, this.COLORS.SHADOW);
    this.rect(axR - 2, bodyY + 14, 11, 7, this.COLORS.GOLD_MID, this.COLORS.GOLD_DARK);

    // 金箍棒
    const staffX = axR + 11;
    const staffY = bodyY + 14;
    this.graphics.fillStyle(this.COLORS.GOLD_DARK);
    this.graphics.fillRect(this.pxw(staffX - 3.5), this.px(staffY - 28), this.pxw(7), this.px(56));
    this.graphics.fillStyle(this.COLORS.GOLD_MID);
    this.graphics.fillRect(this.pxw(staffX - 3.5), this.px(staffY - 28), this.pxw(3.5), this.px(56));
    this.graphics.fillStyle(this.COLORS.GOLD_LIGHT);
    this.graphics.fillRect(this.pxw(staffX - 1.5), this.px(staffY - 27), this.pxw(1.5), this.px(54));
    this.graphics.fillStyle(this.COLORS.GOLD_LIGHT);
    this.graphics.fillRect(this.pxw(staffX - 5), this.px(staffY - 33), this.pxw(10), this.px(7));
    this.graphics.fillRect(this.pxw(staffX - 5), this.px(staffY + 26), this.pxw(10), this.px(7));
    this.graphics.fillStyle(this.COLORS.GOLD_SHADOW);
    this.graphics.fillRect(this.pxw(staffX - 4), this.px(staffY - 32), this.pxw(8), this.px(5));
    this.graphics.fillRect(this.pxw(staffX - 4), this.px(staffY + 27), this.pxw(8), this.px(5));
    this.ellipse(staffX - 2, staffY + 3, 6, 5, this.COLORS.LEATHER_DARK);

    // 左腿
    this.rect(-10 - legSwing, bodyY + 35, 9, 15, this.COLORS.FUR_MID, this.COLORS.FUR_DARK);
    this.rect(-12 - legSwing, bodyY + 48, 12, 7, this.COLORS.LEATHER_LIGHT, this.COLORS.LEATHER_DARK);
    this.graphics.fillStyle(this.COLORS.GOLD_MID);
    this.graphics.fillRect(this.pxw(-12 - legSwing), this.px(bodyY + 48), this.pxw(12), this.px(2));

    // 右腿
    this.rect(3 + legSwing, bodyY + 35, 9, 15, this.COLORS.FUR_DARK, this.COLORS.SHADOW);
    this.rect(1 + legSwing, bodyY + 48, 12, 7, this.COLORS.LEATHER_MID, this.COLORS.LEATHER_DARK);
    this.graphics.fillStyle(this.COLORS.GOLD_SHADOW);
    this.graphics.fillRect(this.pxw(1 + legSwing), this.px(bodyY + 48), this.pxw(12), this.px(2));

    // 尾巴
    const tailSwing = this.isMoving ? Math.sin(this.walkCycle * 3) * 5 : 0;
    this.graphics.fillStyle(this.COLORS.FUR_MID);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(14), this.px(bodyY + 10));
    this.graphics.lineTo(this.pxw(19 + tailSwing), this.px(bodyY + 5));
    this.graphics.lineTo(this.pxw(22 + tailSwing * 1.2), this.px(bodyY - 2));
    this.graphics.lineTo(this.pxw(20 + tailSwing), this.px(bodyY - 8));
    this.graphics.lineTo(this.pxw(15 + tailSwing), this.px(bodyY - 5));
    this.graphics.fillPath();
    this.ellipse(20 + tailSwing, bodyY - 8, 3, 3, this.COLORS.GOLD_MID);

    // 头部
    this.ellipse(0, bodyY - 14, 24, 26, this.COLORS.FUR_MID);
    this.ellipse(5, bodyY - 12, 10, 22, this.COLORS.FUR_DARK);

    // 脸部
    this.poly([
      [0, bodyY - 34], [-11, bodyY - 28], [-12, bodyY - 19],
      [-9, bodyY - 9], [-4, bodyY - 5], [0, bodyY - 6],
      [4, bodyY - 5], [9, bodyY - 9], [12, bodyY - 19],
      [11, bodyY - 28]
    ], this.COLORS.SKIN_MID);
    this.poly([
      [-2, bodyY - 32], [-9, bodyY - 26], [-10, bodyY - 19],
      [-7, bodyY - 12], [-3, bodyY - 8], [0, bodyY - 10]
    ], this.COLORS.SKIN_LIGHT, false);

    // 颧骨暗部
    this.ellipse(-10, bodyY - 21, 5, 4, this.COLORS.SKIN_SHADOW);
    this.ellipse(10, bodyY - 21, 5, 4, this.COLORS.SKIN_SHADOW);
    this.ellipse(0, bodyY - 7, 10, 3, this.COLORS.SKIN_DARK);

    // 毛发
    for (let i = -3; i <= 3; i++) {
      this.graphics.fillStyle(this.COLORS.FUR_MID);
      this.graphics.beginPath();
      this.graphics.moveTo(this.pxw(i * 2.5), this.px(bodyY - 40));
      this.graphics.lineTo(this.pxw(i * 4), this.px(bodyY - 50));
      this.graphics.lineTo(this.pxw(i * 1.5), this.px(bodyY - 45));
      this.graphics.fillPath();
    }
    for (let i = -2; i <= 2; i++) {
      this.graphics.fillStyle(this.COLORS.RED_MID);
      this.graphics.beginPath();
      this.graphics.moveTo(this.pxw(i * 3.5), this.px(bodyY - 42));
      this.graphics.lineTo(this.pxw(i * 5), this.px(bodyY - 52));
      this.graphics.lineTo(this.pxw(i * 2), this.px(bodyY - 47));
      this.graphics.fillPath();
    }

    // 凤翅冠（整体下移3像素）
    this.rect(-11, bodyY - 40, 22, 6, this.COLORS.GOLD_MID, this.COLORS.GOLD_DARK);  // -43 → -40
    this.poly([
      [-11, bodyY - 37], [-20, bodyY - 44], [-24, bodyY - 41],  // -40→-37, -47→-44, -44→-41
      [-21, bodyY - 35], [-16, bodyY - 37]                       // -38→-35, -40→-37
    ], this.COLORS.GOLD_LIGHT);
    this.poly([
      [11, bodyY - 37], [20, bodyY - 44], [24, bodyY - 41],
      [21, bodyY - 35], [16, bodyY - 37]
    ], this.COLORS.GOLD_MID);
    this.ellipse(0, bodyY - 45, 4, 4, this.COLORS.RED_MID);   // -48 → -45
    this.ellipse(-1, bodyY - 46, 2.5, 2.5, this.COLORS.RED_LIGHT);  // -49 → -46

    // 金箍（下移3像素）
    this.graphics.lineStyle(this.px(2), this.COLORS.GOLD_LIGHT);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(-12), this.px(bodyY - 30));  // -33 → -30
    this.graphics.lineTo(this.pxw(-12), this.px(bodyY - 27));  // -30 → -27
    this.graphics.lineTo(this.pxw(12), this.px(bodyY - 27));   // -30 → -27
    this.graphics.lineTo(this.pxw(12), this.px(bodyY - 30));   // -33 → -30
    this.graphics.strokePath();
    this.ellipse(-12, bodyY - 29, 2, 2, this.COLORS.GOLD_LIGHT);  // -32 → -29
    this.ellipse(12, bodyY - 29, 2, 2, this.COLORS.GOLD_LIGHT);   // -32 → -29

    // 眼睛
    const eyeH = eyeClose ? 2 : 4;
    this.ellipse(-11, bodyY - 24, 3.5, 3.5, this.COLORS.SKIN_DARK);
    this.ellipse(7, bodyY - 24, 3.5, 3.5, this.COLORS.SKIN_DARK);
    this.graphics.fillStyle(0xE8DCC8);
    this.graphics.fillRect(this.pxw(-11), this.px(bodyY - 26), this.pxw(4.5), this.px(4.5));
    this.graphics.fillRect(this.pxw(7), this.px(bodyY - 26), this.pxw(4.5), this.px(4.5));
    this.graphics.fillStyle(this.COLORS.EYE);
    this.graphics.fillRect(this.pxw(-10), this.px(bodyY - 25), this.pxw(2.5), this.px(eyeH));
    this.graphics.fillRect(this.pxw(8), this.px(bodyY - 25), this.pxw(2.5), this.px(eyeH));
    this.graphics.fillStyle(0x1A0A00);
    this.graphics.fillRect(this.pxw(-9.5), this.px(bodyY - 24), this.pxw(1.5), this.px(eyeH - 1));
    this.graphics.fillRect(this.pxw(8.5), this.px(bodyY - 24), this.pxw(1.5), this.px(eyeH - 1));
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillRect(this.pxw(-11), this.px(bodyY - 27), this.pxw(1.5), this.px(1.5));
    this.graphics.fillRect(this.pxw(7), this.px(bodyY - 27), this.pxw(1.5), this.px(1.5));

    // 眉毛
    this.graphics.fillStyle(this.COLORS.FUR_DARK);
    this.graphics.fillRect(this.pxw(-16), this.px(bodyY - 29), this.pxw(10), this.px(2.5));  // -32 → -29
    this.graphics.fillRect(this.pxw(6), this.px(bodyY - 29), this.pxw(10), this.px(2.5));    // -32 → -29
    this.graphics.fillStyle(this.COLORS.RED_MID, 0.5);
    this.graphics.fillRect(this.pxw(-15), this.px(bodyY - 30), this.pxw(8), this.px(1.5));   // -33 → -30
    this.graphics.fillRect(this.pxw(7), this.px(bodyY - 30), this.pxw(8), this.px(1.5));     // -33 → -30

    // 鼻子嘴巴
    this.graphics.fillStyle(this.COLORS.SKIN_DARK);
    this.graphics.fillRect(this.pxw(-2), this.px(bodyY - 16), this.pxw(3.5), this.px(3.5));
    this.graphics.fillStyle(this.COLORS.SKIN_SHADOW);
    this.graphics.fillRect(this.pxw(-1), this.px(bodyY - 15), this.pxw(1.5), this.px(1.5));

    if (this.isAttacking) {
      this.graphics.fillStyle(this.COLORS.SHADOW);
      this.graphics.fillRect(this.pxw(-5), this.px(bodyY - 11), this.pxw(10), this.px(2));
      this.graphics.fillStyle(0xFFFFFF);
      this.graphics.fillRect(this.pxw(-3.5), this.px(bodyY - 12), this.pxw(2), this.px(2));
      this.graphics.fillRect(this.pxw(1.5), this.px(bodyY - 12), this.pxw(2), this.px(2));
    } else {
      this.graphics.fillStyle(this.COLORS.SHADOW);
      this.graphics.fillRect(this.pxw(-4), this.px(bodyY - 10), this.pxw(8), this.px(2));
    }

    // 添加颈部连接（在头和身体之间）
    this.graphics.fillStyle(this.COLORS.FUR_MID);
    this.graphics.fillRect(this.pxw(-6), this.px(bodyY - 6), this.pxw(12), this.px(10));
    this.graphics.fillStyle(this.COLORS.FUR_DARK);
    this.graphics.fillRect(this.pxw(-4), this.px(bodyY - 4), this.pxw(8), this.px(8));

    // 筋斗云
    if (this.isMoving) {
      this.graphics.fillStyle(0xFFFFFF, 0.85);
      this.ellipse(-28, bodyY + 24, 15, 8, 0xFFFFFF);
      this.ellipse(-14, bodyY + 22, 14, 10, 0xFFFFFF);
      this.ellipse(0, bodyY + 24, 15, 8, 0xFFFFFF);
      this.ellipse(14, bodyY + 22, 14, 10, 0xFFFFFF);
      this.ellipse(28, bodyY + 24, 15, 8, 0xFFFFFF);
      this.graphics.fillStyle(0xCCCCCC, 0.5);
      this.ellipse(-26, bodyY + 27, 12, 5, 0xCCCCCC);
      this.ellipse(0, bodyY + 27, 12, 5, 0xCCCCCC);
      this.ellipse(26, bodyY + 27, 12, 5, 0xCCCCCC);
    }

    // Rim Light
    this.graphics.lineStyle(this.px(1.5), this.COLORS.RIM, 0.4);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(17), this.px(bodyY - 20));
    this.graphics.lineTo(this.pxw(22), this.px(bodyY + 8));
    this.graphics.lineTo(this.pxw(19), this.px(bodyY + 38));
    this.graphics.lineTo(this.pxw(14), this.px(bodyY + 56));
    this.graphics.strokePath();
  }
}