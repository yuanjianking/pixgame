// characters/BaiLongMa.ts
// 风格：90年代光荣SRPG战棋立绘风
// 白龙马：骏马形态、优雅、白色、缰绳、马鞍
// 版本：宽高比 1:1

import { BaseCharacter } from "./BaseCharacter";

export class BaiLongMa extends BaseCharacter{
  private blinkTimer: number = 0;
  private attackTimer: number = 0;
  private isAttacking: boolean = false;


  private readonly COLORS = {
    // 白马毛色
    HORSE_LIGHT: 0xF5F5F5,
    HORSE_MID: 0xE0E0E0,
    HORSE_DARK: 0xC0C0C0,
    HORSE_SHADOW: 0xA0A0A0,
    // 鬃毛/尾巴
    MANE_LIGHT: 0xD0D0D0,
    MANE_MID: 0xB0B0B0,
    MANE_DARK: 0x909090,
    // 马鞍
    SADDLE_LIGHT: 0x8B4513,
    SADDLE_MID: 0x6B3410,
    SADDLE_DARK: 0x4A250A,
    // 缰绳/装饰
    REINS: 0xCDA530,
    GOLD_LIGHT: 0xFFD700,
    GOLD_MID: 0xCDA530,
    GOLD_DARK: 0x8B6914,
    SILVER: 0xC0C0C0,      // 马镫银色
    // 蹄子
    HOOF: 0x4A4A4A,
    // 眼睛
    EYE: 0x1A1A2E,
    // 阴影
    AO: 0x1A1518,
    SHADOW: 0x2A2025,
    RIM: 0xFFAA66
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

  private fillEllipse(x: number, y: number, w: number, h: number, color: number) {
    const sx = this.pxw(x);
    const sy = this.px(y);
    const sw = this.pxw(w);
    const sh = this.px(h);
    this.graphics.fillStyle(color);
    this.graphics.fillEllipse(sx, sy, sw, sh);
  }

  draw(x: number, y: number) {
    this.graphics.clear();
    this.graphics.setPosition(x, y);

    const bodyY = 12 + (this.isMoving ? Math.sin(this.walkCycle) * 1.5 : 0);
    const headSwing = this.isMoving ? Math.sin(this.walkCycle * 1.5) * 3 : 0;
    const legSwing = this.isMoving ? Math.sin(this.walkCycle * 2) * 4 : 0;
    const tailSwing = this.isMoving ? Math.sin(this.walkCycle * 2.5) * 6 : 0;
    const eyeClose = this.blinkTimer++ % 160 < 4;

    // 地面阴影
    this.fillEllipse(0, bodyY + 38, 50, 10, this.COLORS.AO);

    // ==================== 尾巴 ====================
    this.graphics.fillStyle(this.COLORS.MANE_MID);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(18), this.px(bodyY + 10));
    this.graphics.lineTo(this.pxw(26 + tailSwing), this.px(bodyY + 6));
    this.graphics.lineTo(this.pxw(28 + tailSwing), this.px(bodyY + 0));
    this.graphics.lineTo(this.pxw(24 + tailSwing), this.px(bodyY - 2));
    this.graphics.lineTo(this.pxw(20), this.px(bodyY + 4));
    this.graphics.fillPath();
    this.fillEllipse(26 + tailSwing, bodyY - 2, 5, 4, this.COLORS.MANE_LIGHT);

    // ==================== 身体（马身） ====================
    // 身体暗部（右侧）
    this.rect(6, bodyY + 2, 16, 28, this.COLORS.SHADOW, this.COLORS.SHADOW);
    // 身体亮部（左侧）
    this.rect(-16, bodyY, 18, 30, this.COLORS.HORSE_MID, this.COLORS.HORSE_MID);
    // 身体过渡
    this.rect(-2, bodyY, 8, 30, this.COLORS.HORSE_DARK, this.COLORS.HORSE_DARK);

    // 身体高光
    this.fillEllipse(-12, bodyY + 4, 8, 12, this.COLORS.HORSE_LIGHT);

    // ==================== 马鞍 ====================
    this.rect(-14, bodyY + 12, 24, 8, this.COLORS.SADDLE_LIGHT, this.COLORS.SADDLE_DARK, this.COLORS.SADDLE_MID);
    // 马鞍金边
    this.graphics.fillStyle(this.COLORS.GOLD_MID);
    this.graphics.fillRect(this.pxw(-13), this.px(bodyY + 13), this.pxw(22), this.px(2));
    this.graphics.fillRect(this.pxw(-13), this.px(bodyY + 18), this.pxw(22), this.px(2));
    // 马鞍装饰
    this.fillEllipse(0, bodyY + 16, 4, 3, this.COLORS.GOLD_LIGHT);

    // ==================== 缰绳 ====================
    this.graphics.fillStyle(this.COLORS.REINS);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(-18), this.px(bodyY + 4));
    this.graphics.lineTo(this.pxw(-24), this.px(bodyY - 8));
    this.graphics.lineTo(this.pxw(-20), this.px(bodyY - 10));
    this.graphics.fillPath();
    this.graphics.lineStyle(this.px(1.5), this.COLORS.REINS);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(-22), this.px(bodyY - 9));
    this.graphics.lineTo(this.pxw(-28), this.px(bodyY - 14));
    this.graphics.strokePath();

    // ==================== 前腿 ====================
    const legFL = -12 - legSwing;
    const legFR = -4 - legSwing;

    // 左前腿
    this.rect(legFL, bodyY + 22, 7, 16, this.COLORS.HORSE_MID, this.COLORS.HORSE_DARK);
    this.fillEllipse(legFL, bodyY + 36, 8, 5, this.COLORS.HOOF);

    // 右前腿
    this.rect(legFR, bodyY + 22, 7, 16, this.COLORS.HORSE_DARK, this.COLORS.SHADOW);
    this.fillEllipse(legFR, bodyY + 36, 8, 5, this.COLORS.HOOF);

    // ==================== 后腿 ====================
    const legHL = 8 + legSwing;
    const legHR = 14 + legSwing;

    // 左后腿
    this.rect(legHL, bodyY + 24, 7, 14, this.COLORS.HORSE_MID, this.COLORS.HORSE_DARK);
    this.fillEllipse(legHL, bodyY + 36, 8, 5, this.COLORS.HOOF);

    // 右后腿
    this.rect(legHR, bodyY + 24, 7, 14, this.COLORS.HORSE_DARK, this.COLORS.SHADOW);
    this.fillEllipse(legHR, bodyY + 36, 8, 5, this.COLORS.HOOF);

    // ==================== 颈部 ====================
    this.fillEllipse(-14, bodyY - 2, 10, 16, this.COLORS.HORSE_MID);
    this.fillEllipse(-10, bodyY - 4, 8, 14, this.COLORS.HORSE_LIGHT);

    // ==================== 头部 ====================
    // 头骨
    this.fillEllipse(-20 + headSwing, bodyY - 12, 16, 14, this.COLORS.HORSE_MID);
    this.fillEllipse(-18 + headSwing, bodyY - 14, 12, 12, this.COLORS.HORSE_LIGHT);

    // 脸部（马脸）
    this.poly([
      [-16 + headSwing, bodyY - 20], [-24 + headSwing, bodyY - 16],
      [-26 + headSwing, bodyY - 10], [-24 + headSwing, bodyY - 4],
      [-20 + headSwing, bodyY - 2], [-16 + headSwing, bodyY - 4]
    ], this.COLORS.HORSE_MID);

    this.poly([
      [-17 + headSwing, bodyY - 18], [-23 + headSwing, bodyY - 14],
      [-24 + headSwing, bodyY - 10], [-22 + headSwing, bodyY - 6],
      [-18 + headSwing, bodyY - 6]
    ], this.COLORS.HORSE_LIGHT, false);

    // 口鼻部（白色）
    this.fillEllipse(-26 + headSwing, bodyY - 8, 6, 5, this.COLORS.HORSE_LIGHT);
    // 鼻孔
    this.fillEllipse(-28 + headSwing, bodyY - 8, 1.5, 1, this.COLORS.HORSE_SHADOW);
    this.fillEllipse(-25 + headSwing, bodyY - 8, 1.5, 1, this.COLORS.HORSE_SHADOW);

    // ==================== 鬃毛 ====================
    this.graphics.fillStyle(this.COLORS.MANE_MID);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(-18 + headSwing), this.px(bodyY - 16));
    this.graphics.lineTo(this.pxw(-14), this.px(bodyY - 18));
    this.graphics.lineTo(this.pxw(-12), this.px(bodyY - 14));
    this.graphics.lineTo(this.pxw(-10), this.px(bodyY - 16));
    this.graphics.lineTo(this.pxw(-8), this.px(bodyY - 12));
    this.graphics.fillPath();

    this.graphics.fillStyle(this.COLORS.MANE_LIGHT);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(-16 + headSwing), this.px(bodyY - 17));
    this.graphics.lineTo(this.pxw(-13), this.px(bodyY - 18));
    this.graphics.lineTo(this.pxw(-11), this.px(bodyY - 14));
    this.graphics.fillPath();

    // ==================== 耳朵 ====================
    this.fillEllipse(-22 + headSwing, bodyY - 22, 4, 6, this.COLORS.HORSE_MID);
    this.fillEllipse(-18 + headSwing, bodyY - 22, 4, 6, this.COLORS.HORSE_MID);
    this.fillEllipse(-22 + headSwing, bodyY - 23, 2.5, 4, this.COLORS.HORSE_LIGHT);
    this.fillEllipse(-18 + headSwing, bodyY - 23, 2.5, 4, this.COLORS.HORSE_LIGHT);

    // ==================== 眼睛 ====================
    this.fillEllipse(-24 + headSwing, bodyY - 14, 3, 2.5, this.COLORS.HORSE_SHADOW);
    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillRect(this.pxw(-25 + headSwing), this.px(bodyY - 15.5), this.pxw(3), this.px(3));

    const eyeH = eyeClose ? 1.5 : 3;
    this.graphics.fillStyle(this.COLORS.EYE);
    this.graphics.fillRect(this.pxw(-24 + headSwing), this.px(bodyY - 15), this.pxw(2), this.px(eyeH));

    this.graphics.fillStyle(0xFFFFFF);
    this.graphics.fillRect(this.pxw(-25 + headSwing), this.px(bodyY - 16), this.pxw(1), this.px(1));

    // 眼罩装饰（白龙马特有）
    this.graphics.lineStyle(this.px(1), this.COLORS.GOLD_MID);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(-28 + headSwing), this.px(bodyY - 14));
    this.graphics.lineTo(this.pxw(-32 + headSwing), this.px(bodyY - 12));
    this.graphics.strokePath();

    // ==================== 龙角（白龙马特征） ====================
    this.graphics.fillStyle(this.COLORS.GOLD_LIGHT);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(-20 + headSwing), this.px(bodyY - 24));
    this.graphics.lineTo(this.pxw(-22 + headSwing), this.px(bodyY - 30));
    this.graphics.lineTo(this.pxw(-18 + headSwing), this.px(bodyY - 28));
    this.graphics.fillPath();
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(-16 + headSwing), this.px(bodyY - 24));
    this.graphics.lineTo(this.pxw(-14 + headSwing), this.px(bodyY - 30));
    this.graphics.lineTo(this.pxw(-18 + headSwing), this.px(bodyY - 28));
    this.graphics.fillPath();

    // ==================== 马镫 ====================
    this.fillEllipse(-8, bodyY + 28, 3, 4, this.COLORS.SILVER);
    this.fillEllipse(12, bodyY + 30, 3, 4, this.COLORS.SILVER);

    // Rim Light
    this.graphics.lineStyle(this.px(1.5), this.COLORS.RIM, 0.35);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(16), this.px(bodyY - 8));
    this.graphics.lineTo(this.pxw(20), this.px(bodyY + 12));
    this.graphics.lineTo(this.pxw(16), this.px(bodyY + 32));
    this.graphics.strokePath();
  }
}