// maps/HeavenMap.ts
// 天庭场景地图 — 包含天空背景、凌霄宝殿、祥云、金色光柱
import * as Phaser from 'phaser';

export class HeavenMap {
  static readonly MAP_COLS = 20;
  static readonly MAP_ROWS = 15;
  static readonly TILE = 40;
  static readonly MAP_W = HeavenMap.MAP_COLS * HeavenMap.TILE;
  static readonly MAP_H = HeavenMap.MAP_ROWS * HeavenMap.TILE;

  /** 该地图产生的碰撞障碍物矩形 */
  readonly obstacles: { x: number; y: number; width: number; height: number }[] = [];

  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** 绘制所有地图元素 */
  render(): void {
    this.drawSkyBackground();
    this.drawHeavenlyPalace();
    this.drawCloudEffects();
  }

  // ==================== 天空背景 ====================

  private drawSkyBackground(): void {
    const sky = this.scene.add.graphics().setDepth(0);
    const { MAP_W } = HeavenMap;

    // 渐变带
    const bands = [
      { y: 0, h: 80, color: 0x6BB3D9 },
      { y: 80, h: 80, color: 0x87CEEB },
      { y: 160, h: 80, color: 0xA8D8EA },
      { y: 240, h: 80, color: 0xC8E8F5 },
      { y: 320, h: 80, color: 0xE0F0FA },
      { y: 400, h: 80, color: 0xEEF6FB },
      { y: 480, h: 80, color: 0xF5FAFC },
      { y: 560, h: 40, color: 0xFAFCFE },
    ];
    bands.forEach((b) => {
      sky.fillStyle(b.color, 1);
      sky.fillRect(0, b.y, MAP_W, b.h);
    });

    // 星星
    for (let i = 0; i < 20; i++) {
      sky.fillStyle(0xFFFFFF, 0.6);
      sky.fillCircle(30 + Math.random() * (MAP_W - 60), 10 + Math.random() * 60, 1 + Math.random() * 1.5);
    }

    // 远云剪影
    for (let i = 0; i < 6; i++) {
      const cx = 50 + i * 130 + Math.random() * 40;
      const cy = 120 + Math.random() * 60;
      sky.fillStyle(0xFFFFFF, 0.3);
      sky.fillEllipse(cx, cy, 100 + Math.random() * 60, 20 + Math.random() * 15);
      sky.fillEllipse(cx - 20, cy + 5, 60 + Math.random() * 40, 16 + Math.random() * 10);
      sky.fillEllipse(cx + 20, cy + 3, 50 + Math.random() * 30, 14 + Math.random() * 8);
    }
  }

  // ==================== 凌霄宝殿 ====================

  private drawHeavenlyPalace(): void {
    const { TILE, MAP_H } = HeavenMap;
    const px = 7 * TILE;
    const py = 2 * TILE;
    const pw = 6 * TILE;
    const ph = 5 * TILE;
    const scene = this.scene;

    // 平台碰撞
    this.obstacles.push({ x: px, y: py + ph * 0.7, width: pw, height: ph * 0.3 });

    const container = scene.add.container(px, py);
    container.setDepth(10);

    // ---- 台基 ----
    const platform = scene.add.graphics();
    platform.fillStyle(0xDAA520, 0.9);
    platform.fillRect(0, ph * 0.7, pw, ph * 0.3);
    platform.fillStyle(0xFFD700, 0.6);
    for (let i = 0; i < 25; i++) {
      platform.fillRect(5 + Math.random() * (pw - 10), ph * 0.7 + 4 + Math.random() * 20, 4, 2);
    }
    container.add(platform);

    // 台阶
    const steps = scene.add.graphics();
    steps.fillStyle(0xF0F0F0, 0.85);
    steps.fillRect(pw * 0.3, ph * 0.65, pw * 0.4, 8);
    steps.fillRect(pw * 0.33, ph * 0.6, pw * 0.34, 8);
    steps.fillRect(pw * 0.36, ph * 0.55, pw * 0.28, 8);
    steps.fillStyle(0xFFFFFF, 0.6);
    steps.fillRect(pw * 0.3, ph * 0.66, pw * 0.4, 3);
    container.add(steps);

    // 后墙
    const backWall = scene.add.graphics();
    backWall.fillStyle(0xF0E6D0, 0.95);
    backWall.fillRect(0, 0, pw, ph * 0.7);
    backWall.fillStyle(0xE8DCC8, 0.5);
    for (let i = 0; i < 30; i++) {
      backWall.fillRect(4 + Math.random() * (pw - 8), 4 + Math.random() * (ph * 0.7 - 8), 5, 5);
    }
    container.add(backWall);

    // 金柱
    const pillarXs = [pw * 0.1, pw * 0.28, pw * 0.46, pw * 0.54, pw * 0.72, pw * 0.9];
    pillarXs.forEach((ppx) => {
      const pillar = scene.add.graphics();
      pillar.fillStyle(0xCC3333, 0.9);
      pillar.fillRect(ppx - 8, ph * 0.18, 16, ph * 0.52);
      pillar.fillStyle(0xFFD700, 0.85);
      pillar.fillRect(ppx - 10, ph * 0.15, 20, 5);
      pillar.fillRect(ppx - 10, ph * 0.68, 20, 5);
      pillar.fillStyle(0xFFD700, 0.4);
      pillar.fillEllipse(ppx, ph * 0.32, 10, 6);
      pillar.fillEllipse(ppx, ph * 0.50, 10, 6);
      container.add(pillar);

      this.obstacles.push({ x: px + ppx - 10, y: py + ph * 0.18, width: 20, height: ph * 0.52 });
    });

    // 大梁
    const beam = scene.add.graphics();
    beam.fillStyle(0xCC3333, 0.9);
    beam.fillRect(0, ph * 0.14, pw, 8);
    beam.fillStyle(0xFFD700, 0.7);
    beam.fillRect(2, ph * 0.15, pw - 4, 3);
    beam.fillStyle(0x4488CC, 0.6);
    for (let i = 0; i < 8; i++) {
      beam.fillRect(20 + i * (pw - 40) / 7, ph * 0.145, 6, 4);
    }
    container.add(beam);

    // ---- 三重檐金顶 ----
    const roof1 = scene.add.graphics();
    roof1.fillStyle(0xFFD700, 0.9);
    roof1.beginPath();
    roof1.moveTo(-16, ph * 0.14);
    roof1.lineTo(pw / 2, -8);
    roof1.lineTo(pw + 16, ph * 0.14);
    roof1.closePath();
    roof1.fillPath();
    roof1.fillStyle(0xDAA520, 0.7);
    roof1.beginPath();
    roof1.moveTo(-8, ph * 0.14);
    roof1.lineTo(pw / 2, 0);
    roof1.lineTo(pw + 8, ph * 0.14);
    roof1.closePath();
    roof1.fillPath();
    container.add(roof1);

    // 飞檐
    const eave1 = scene.add.graphics();
    eave1.lineStyle(3, 0xFFD700, 0.8);
    eave1.beginPath();
    eave1.moveTo(-16, ph * 0.14);
    eave1.lineTo(-12, ph * 0.18);
    eave1.strokePath();
    eave1.beginPath();
    eave1.moveTo(pw + 16, ph * 0.14);
    eave1.lineTo(pw + 12, ph * 0.18);
    eave1.strokePath();
    container.add(eave1);

    const roof2 = scene.add.graphics();
    roof2.fillStyle(0xFFD700, 0.85);
    roof2.beginPath();
    roof2.moveTo(-8, 0);
    roof2.lineTo(pw / 2, -28);
    roof2.lineTo(pw + 8, 0);
    roof2.closePath();
    roof2.fillPath();
    roof2.fillStyle(0xDAA520, 0.6);
    roof2.beginPath();
    roof2.moveTo(-4, 0);
    roof2.lineTo(pw / 2, -22);
    roof2.lineTo(pw + 4, 0);
    roof2.closePath();
    roof2.fillPath();
    container.add(roof2);

    const roof3 = scene.add.graphics();
    roof3.fillStyle(0xFFEA00, 0.9);
    roof3.beginPath();
    roof3.moveTo(-4, -20);
    roof3.lineTo(pw / 2, -44);
    roof3.lineTo(pw + 4, -20);
    roof3.closePath();
    roof3.fillPath();
    roof3.fillStyle(0xFFD700, 0.7);
    roof3.beginPath();
    roof3.moveTo(-2, -20);
    roof3.lineTo(pw / 2, -40);
    roof3.lineTo(pw + 2, -20);
    roof3.closePath();
    roof3.fillPath();
    container.add(roof3);

    // 宝顶
    const finial = scene.add.graphics();
    finial.fillStyle(0xFFD700, 0.9);
    finial.fillCircle(pw / 2, -44, 6);
    finial.fillStyle(0xFFF8DC, 0.7);
    finial.fillCircle(pw / 2 - 2, -46, 3);
    container.add(finial);

    // 吻兽
    [-16, pw + 16].forEach((xx) => {
      const beast = scene.add.graphics();
      beast.fillStyle(0xFFD700, 0.8);
      beast.fillEllipse(xx, ph * 0.15, 10, 8);
      beast.fillStyle(0xFF6600, 0.7);
      beast.fillCircle(xx, ph * 0.13, 3);
      container.add(beast);
    });

    // 牌匾
    const sign = scene.add.graphics();
    sign.fillStyle(0x8B4513, 0.9);
    sign.fillRect(pw / 2 - 50, ph * 0.22, 100, 28);
    sign.fillStyle(0xFFD700, 0.7);
    sign.fillRect(pw / 2 - 48, ph * 0.24, 96, 24);
    sign.lineStyle(1.5, 0xFFD700, 0.9);
    sign.strokeRect(pw / 2 - 49, ph * 0.23, 98, 26);
    container.add(sign);

    const signText = scene.add.text(pw / 2, ph * 0.34, '凌霄宝殿', {
      fontSize: '14px',
      color: '#FFD700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    signText.setOrigin(0.5);
    container.add(signText);

    // 祥云灯
    [-20, pw + 20].forEach((xx) => {
      const lamp = scene.add.graphics();
      lamp.lineStyle(1, 0xFFD700, 0.8);
      lamp.beginPath();
      lamp.moveTo(xx, ph * 0.18);
      lamp.lineTo(xx, ph * 0.22);
      lamp.strokePath();
      lamp.fillStyle(0xFF8888, 0.85);
      lamp.fillEllipse(xx, ph * 0.26, 10, 14);
      lamp.fillStyle(0xFFAA66, 0.4);
      lamp.fillCircle(xx, ph * 0.26, 12);
      container.add(lamp);
    });

    // ---- 宫殿前玉石地面 ----
    const plaza = scene.add.graphics().setDepth(9);
    plaza.fillStyle(0xF5F0E8, 0.8);
    plaza.fillRect(px - TILE, py + ph * 0.7, pw + 2 * TILE, MAP_H - (py + ph * 0.7));
    plaza.fillStyle(0xE8E0D0, 0.5);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        plaza.strokeRect(px - TILE + col * TILE, py + ph * 0.7 + row * TILE, TILE, TILE);
      }
    }
  }

  // ==================== 祥云 & 光柱 ====================

  private drawCloudEffects(): void {
    const { MAP_W, MAP_H } = HeavenMap;
    const scene = this.scene;

    // 漂浮祥云
    const clouds: { x: number; y: number; w: number; h: number; speed: number }[] = [];
    for (let i = 0; i < 10; i++) {
      clouds.push({
        x: Math.random() * MAP_W,
        y: 80 + Math.random() * (MAP_H - 160),
        w: 80 + Math.random() * 100,
        h: 18 + Math.random() * 14,
        speed: 0.1 + Math.random() * 0.2,
      });
    }

    clouds.forEach((c, i) => {
      const cloud = scene.add.graphics().setDepth(8);
      cloud.fillStyle(0xFFFFFF, 0.35 - i * 0.01);
      cloud.fillEllipse(c.x, c.y, c.w, c.h);
      cloud.fillEllipse(c.x - c.w * 0.25, c.y + 3, c.w * 0.6, c.h * 0.8);
      cloud.fillEllipse(c.x + c.w * 0.25, c.y + 2, c.w * 0.55, c.h * 0.75);

      scene.tweens.add({
        targets: cloud,
        x: c.x + 30,
        duration: 8000 / c.speed,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // 底部薄雾
    for (let i = 0; i < 5; i++) {
      const mist = scene.add.graphics().setDepth(5);
      mist.fillStyle(0xFFFFFF, 0.2);
      mist.fillEllipse(
        50 + i * (MAP_W - 100) / 4,
        MAP_H - 20 + Math.random() * 20,
        180 + Math.random() * 80,
        20 + Math.random() * 10,
      );
    }

    // 光柱（两侧）
    for (let i = 0; i < 4; i++) {
      const rayX = 60 + i * (MAP_W - 120) / 3;
      const lightRay = scene.add.rectangle(rayX, 0, 20, MAP_H, 0xFFD700, 0.06);
      lightRay.setOrigin(0.5, 0);
      lightRay.setScrollFactor(0);
      lightRay.setDepth(4);
      scene.tweens.add({
        targets: lightRay,
        x: rayX + 15,
        duration: 4000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // 中央主光柱
    const godRay = scene.add.rectangle(MAP_W / 2, 0, 40, MAP_H, 0xFFD700, 0.04);
    godRay.setOrigin(0.5, 0);
    godRay.setScrollFactor(0);
    godRay.setDepth(4);
    scene.tweens.add({
      targets: godRay,
      alpha: { from: 0.04, to: 0.08 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
