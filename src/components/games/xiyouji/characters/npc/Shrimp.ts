import * as Phaser from 'phaser';
import { BaseCharacter } from '../player/BaseCharacter';
import type { DialogBox } from '../../ui/DialogBox';

/** 一级怪：敏捷脆皮，移动力强 */
export class Shrimp extends BaseCharacter {
  static readonly BATTLE_STATS = {
    maxHp: 24,
    attack: 6,
    defense: 2,
    moveRange: 4,
    attackRange: 1,
    healthBarColor: 0xff8844,
  } as const;

  private static readonly COLORS = {
    // 身体
    BODY_BASE: 0xffaa77,
    BODY_DARK: 0xdd8844,
    BODY_SHADOW: 0xaa6633,
    BODY_HIGHLIGHT: 0xffcc99,
    // 节纹
    SEGMENT_BASE: 0xff9966,
    SEGMENT_DARK: 0xcc7744,
    // 尾巴
    TAIL_BASE: 0xff8844,
    TAIL_DARK: 0xcc6622,
    TAIL_FAN: 0xffaa66,
    // 眼睛
    EYE_WHITE: 0xffffff,
    EYE_BLACK: 0x1a0a00,
    EYE_HIGHLIGHT: 0xffffff,
    // 触须
    ANTENNA: 0xffaa66,
    // 钳子
    CLAW_BASE: 0xff8866,
    CLAW_DARK: 0xdd6644,
    CLAW_HIGHLIGHT: 0xffaa88,
    // 腿部
    LEG_BASE: 0xee8844,
    LEG_DARK: 0xcc6633,
    RIM: 0xffcc99,
    AO: 0x2a1810,
  };

  private static readonly S = 0.55;
  private static readonly WIDTH_SCALE = 1.15;

  protected currentHp: number = Shrimp.BATTLE_STATS.maxHp;
  protected maxHp: number = Shrimp.BATTLE_STATS.maxHp;
  protected healthBarColor: number = Shrimp.BATTLE_STATS.healthBarColor;
  protected attack: number = Shrimp.BATTLE_STATS.attack;
  protected defense: number = Shrimp.BATTLE_STATS.defense;
  protected battleMoveRange: number = Shrimp.BATTLE_STATS.moveRange;
  protected battleAttackRange: number = Shrimp.BATTLE_STATS.attackRange;

  private sprite: Phaser.GameObjects.Container | null = null;
  private npcName: string = '';
  private dialogues: string[] = [];
  private dialogBox?: DialogBox;
  private worldScene?: Phaser.Scene;
  private worldX: number = 0;
  private worldY: number = 0;

  // 动画部件
  private leftLegs: Phaser.GameObjects.Graphics[] = [];
  private rightLegs: Phaser.GameObjects.Graphics[] = [];
  private leftAntenna!: Phaser.GameObjects.Graphics;
  private rightAntenna!: Phaser.GameObjects.Graphics;
  private tailFan!: Phaser.GameObjects.Graphics;

  constructor(a: Phaser.Scene | Phaser.GameObjects.Graphics, b?: number | Phaser.Scene, c?: number, d?: string, e?: string[], f?: DialogBox) {
    if ((a as Phaser.Scene).add && typeof b === 'number') {
      const scene = a as Phaser.Scene;
      super(scene.add.graphics(), false, scene);
      this.worldScene = scene;
      this.worldX = b;
      this.worldY = c ?? 0;
      this.npcName = d || '';
      this.dialogues = e || [];
      this.dialogBox = f;
      this.sprite = this.createSprite();
      this.setPosition(this.worldX, this.worldY);
    } else {
      super(a as Phaser.GameObjects.Graphics, false, b as Phaser.Scene | undefined);
    }
  }

  protected createSprite(): Phaser.GameObjects.Container {
    const scene = this.worldScene!;
    const container = scene.add.container(this.worldX, this.worldY);
    const px = this.px.bind(this);
    const pxw = this.pxw.bind(this);
    const C = Shrimp.COLORS;

    // ==================== 地面阴影 ====================
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.35);
    shadow.fillEllipse(pxw(0), px(32), pxw(40), px(8));
    container.add(shadow);

    // ==================== 腿部（底层） ====================
    // 左腿 x3
    for (let i = 0; i < 3; i++) {
      const leg = scene.add.graphics();
      container.add(leg);
      this.leftLegs.push(leg);
    }

    // 右腿 x3
    for (let i = 0; i < 3; i++) {
      const leg = scene.add.graphics();
      container.add(leg);
      this.rightLegs.push(leg);
    }

    // ==================== 尾巴 ====================
    // 尾节
    const tailSeg1 = scene.add.graphics();
    tailSeg1.fillStyle(C.TAIL_BASE);
    tailSeg1.fillEllipse(pxw(16), px(12), pxw(8), px(8));
    container.add(tailSeg1);

    const tailSeg2 = scene.add.graphics();
    tailSeg2.fillStyle(C.TAIL_DARK);
    tailSeg2.fillEllipse(pxw(22), px(11), pxw(6), px(6));
    container.add(tailSeg2);

    // 尾扇
    this.tailFan = scene.add.graphics();
    container.add(this.tailFan);

    // ==================== 身体 ====================
    // 身体阴影
    const bodyShadow = scene.add.graphics();
    bodyShadow.fillStyle(C.BODY_SHADOW);
    bodyShadow.fillEllipse(pxw(0), px(8), pxw(28), px(18));
    container.add(bodyShadow);

    // 身体主体
    const body = scene.add.graphics();
    body.fillStyle(C.BODY_BASE);
    body.fillEllipse(pxw(0), px(6), pxw(26), px(16));
    container.add(body);

    // 身体高光
    const bodyHighlight = scene.add.graphics();
    bodyHighlight.fillStyle(C.BODY_HIGHLIGHT);
    bodyHighlight.fillEllipse(pxw(-4), px(2), pxw(12), px(10));
    container.add(bodyHighlight);

    // 身体节纹
    const segments = scene.add.graphics();
    for (let i = -1; i <= 1; i++) {
      segments.fillStyle(C.SEGMENT_BASE);
      segments.fillRect(pxw(i * 6 - 3), px(8), pxw(6), px(3));
      segments.fillStyle(C.SEGMENT_DARK);
      segments.fillRect(pxw(i * 6 - 2), px(10), pxw(4), px(2));
    }
    container.add(segments);

    // ==================== 头部 ====================
    // 头部暗部
    const headShadow = scene.add.graphics();
    headShadow.fillStyle(C.BODY_SHADOW);
    headShadow.fillEllipse(pxw(-8), px(0), pxw(20), px(14));
    container.add(headShadow);

    // 头部主体
    const head = scene.add.graphics();
    head.fillStyle(C.BODY_BASE);
    head.fillEllipse(pxw(-10), px(-2), pxw(18), px(12));
    container.add(head);

    // 头部高光
    const headHighlight = scene.add.graphics();
    headHighlight.fillStyle(C.BODY_HIGHLIGHT);
    headHighlight.fillEllipse(pxw(-14), px(-4), pxw(8), px(7));
    container.add(headHighlight);

    // 头冠（虾特有的突起）
    const crest = scene.add.graphics();
    crest.fillStyle(C.BODY_DARK);
    crest.fillTriangle(pxw(-12), px(-10), pxw(-8), px(-14), pxw(-4), px(-9));
    container.add(crest);

    // ==================== 眼睛 ====================
    // 左眼白
    const leftEyeWhite = scene.add.graphics();
    leftEyeWhite.fillStyle(C.EYE_WHITE);
    leftEyeWhite.fillEllipse(pxw(-16), px(-4), pxw(4.5), px(4));
    container.add(leftEyeWhite);

    // 右眼白
    const rightEyeWhite = scene.add.graphics();
    rightEyeWhite.fillStyle(C.EYE_WHITE);
    rightEyeWhite.fillEllipse(pxw(-6), px(-5), pxw(4), px(3.5));
    container.add(rightEyeWhite);

    // 左瞳孔
    const leftPupil = scene.add.graphics();
    leftPupil.fillStyle(C.EYE_BLACK);
    leftPupil.fillEllipse(pxw(-16.5), px(-3.5), pxw(2.5), px(3));
    container.add(leftPupil);

    // 右瞳孔
    const rightPupil = scene.add.graphics();
    rightPupil.fillStyle(C.EYE_BLACK);
    rightPupil.fillEllipse(pxw(-6.5), px(-4.5), pxw(2.2), px(2.8));
    container.add(rightPupil);

    // 高光
    const leftHighlight = scene.add.graphics();
    leftHighlight.fillStyle(C.EYE_HIGHLIGHT);
    leftHighlight.fillCircle(pxw(-17.5), px(-5), pxw(1));
    container.add(leftHighlight);

    const rightHighlight = scene.add.graphics();
    rightHighlight.fillStyle(C.EYE_HIGHLIGHT);
    rightHighlight.fillCircle(pxw(-7.5), px(-6), pxw(0.8));
    container.add(rightHighlight);

    // ==================== 触须 ====================
    this.leftAntenna = scene.add.graphics();
    container.add(this.leftAntenna);

    this.rightAntenna = scene.add.graphics();
    container.add(this.rightAntenna);

    // ==================== 钳子 ====================
    // 左钳
    const leftClaw = scene.add.graphics();
    container.add(leftClaw);

    // 右钳
    const rightClaw = scene.add.graphics();
    container.add(rightClaw);

    container.setDepth(18);

    // 交互区域
    container.setInteractive(
      new Phaser.Geom.Rectangle(pxw(-25), px(-15), pxw(55), px(45)),
      Phaser.Geom.Rectangle.Contains
    );
    container.on('pointerdown', () => {
      if (!this.isDialogActive()) this.interact();
    });

    // ==================== 动画 ====================
    let time = 0;
    scene.time.addEvent({
      delay: 50,
      callback: () => {
        time += 0.2;
        const legWave = Math.sin(time * 1.5) * 5;
        const antennaWave = Math.sin(time * 1.2) * 8;
        const tailSway = Math.sin(time) * 3;

        // 触须动画
        this.leftAntenna.clear();
        this.leftAntenna.fillStyle(C.ANTENNA);
        this.leftAntenna.beginPath();
        this.leftAntenna.moveTo(pxw(-18), px(-8));
        this.leftAntenna.lineTo(pxw(-24 - antennaWave * 0.2), px(-14 - antennaWave * 0.1));
        this.leftAntenna.lineTo(pxw(-30 - antennaWave * 0.3), px(-10));
        this.leftAntenna.fillPath();

        this.rightAntenna.clear();
        this.rightAntenna.fillStyle(C.ANTENNA);
        this.rightAntenna.beginPath();
        this.rightAntenna.moveTo(pxw(-10), px(-9));
        this.rightAntenna.lineTo(pxw(-14 + antennaWave * 0.15), px(-16 - antennaWave * 0.08));
        this.rightAntenna.lineTo(pxw(-18 + antennaWave * 0.25), px(-12));
        this.rightAntenna.fillPath();

        // 尾扇摆动
        this.tailFan.clear();
        this.tailFan.fillStyle(C.TAIL_FAN);
        this.tailFan.beginPath();
        this.tailFan.moveTo(pxw(24), px(10));
        this.tailFan.lineTo(pxw(30 + tailSway * 0.3), px(6 + tailSway * 0.1));
        this.tailFan.lineTo(pxw(32 + tailSway * 0.2), px(12));
        this.tailFan.lineTo(pxw(30 - tailSway * 0.1), px(16 - tailSway * 0.1));
        this.tailFan.fillPath();

        // 腿动画
        const legPositions = [
          { leg: this.leftLegs[0], x: -18, y: 12, swing: legWave * 0.25 },
          { leg: this.leftLegs[1], x: -20, y: 18, swing: legWave * 0.4 },
          { leg: this.leftLegs[2], x: -18, y: 24, swing: legWave * 0.35 },
          { leg: this.rightLegs[0], x: 6, y: 12, swing: -legWave * 0.25 },
          { leg: this.rightLegs[1], x: 8, y: 18, swing: -legWave * 0.4 },
          { leg: this.rightLegs[2], x: 6, y: 24, swing: -legWave * 0.35 },
        ];

        legPositions.forEach((pos) => {
          pos.leg.clear();
          pos.leg.fillStyle(C.LEG_BASE);
          pos.leg.fillEllipse(pxw(pos.x + pos.swing), px(pos.y), pxw(6), px(10));
          pos.leg.fillStyle(C.LEG_DARK);
          pos.leg.fillRect(pxw(pos.x + pos.swing - 1), px(pos.y + 4), pxw(3), px(7));
        });

        // 钳子动画
        const clawSwing = Math.sin(time * 1.8) * 4;
        leftClaw.clear();
        leftClaw.fillStyle(C.CLAW_BASE);
        leftClaw.fillEllipse(pxw(-20 + clawSwing * 0.2), px(2 + clawSwing * 0.1), pxw(7), px(5));
        leftClaw.fillStyle(C.CLAW_HIGHLIGHT);
        leftClaw.fillEllipse(pxw(-23 + clawSwing * 0.25), px(1 + clawSwing * 0.05), pxw(4), px(3.5));

        rightClaw.clear();
        rightClaw.fillStyle(C.CLAW_BASE);
        rightClaw.fillEllipse(pxw(10 - clawSwing * 0.2), px(0 - clawSwing * 0.05), pxw(6), px(4.5));
        rightClaw.fillStyle(C.CLAW_HIGHLIGHT);
        rightClaw.fillEllipse(pxw(13 - clawSwing * 0.25), px(-1 - clawSwing * 0.03), pxw(3.5), px(3));
      },
      loop: true,
    });

    // 浮动动画
    scene.tweens.add({
      targets: container,
      y: this.worldY - 3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return container;
  }

  public interact(): void {
    if (!this.dialogBox) return;
    if (this.dialogBox.isDialogActive()) return;
    this.dialogBox.show(this.npcName, this.dialogues);
  }

  public isDialogActive(): boolean {
    return !!(this.dialogBox && this.dialogBox.isDialogActive());
  }

  public getSprite(): Phaser.GameObjects.Container | null {
    return this.sprite;
  }

  public getCollisionRect(): { x: number; y: number; width: number; height: number } {
    return { x: this.worldX - 18, y: this.worldY - 18, width: 40, height: 45 };
  }

  public destroy(): void {
    if (this.sprite) this.sprite.destroy();
    this.clear();
  }

  updateAnimation(isMoving: boolean, walkCycle: number, isAttacking: boolean = false): void {
    this.isMoving = isMoving;
    this.walkCycle = walkCycle;
    this.tickAttackTimer(isAttacking);
    this.tickHurtTimer();
  }

  private px(v: number): number {
    return v * Shrimp.S;
  }

  private pxw(v: number): number {
    return v * Shrimp.S * Shrimp.WIDTH_SCALE;
  }

  private ellipse(x: number, y: number, rx: number, ry: number, color: number): void {
    this.graphics.fillStyle(color);
    this.graphics.fillEllipse(this.pxw(x), this.px(y), this.pxw(rx), this.px(ry));
  }

  draw(x: number, y: number): void {
    this.graphics.clear();
    this.graphics.setPosition(x, y);
    const C = Shrimp.COLORS;
    const hurt = this.getHurtTint();

    const bob = this.isMoving ? Math.sin(this.walkCycle) * 1.5 : 0;
    const clawLunge = this.isAttacking ? 10 : 0;
    const tailSwing = this.isMoving ? Math.sin(this.walkCycle * 2) * 8 : 0;

    // 地面阴影
    this.ellipse(0, bob + 18, 24, 6, hurt ?? C.AO);

    // 尾巴
    this.graphics.fillStyle(hurt ?? C.TAIL_DARK);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(12 + tailSwing * 0.3), this.px(bob + 8));
    this.graphics.lineTo(this.pxw(20 + tailSwing), this.px(bob + 4));
    this.graphics.lineTo(this.pxw(22 + tailSwing * 0.8), this.px(bob + 12));
    this.graphics.lineTo(this.pxw(16 + tailSwing * 0.2), this.px(bob + 14));
    this.graphics.fillPath();

    this.graphics.fillStyle(hurt ?? C.TAIL_BASE);
    this.graphics.fillEllipse(this.pxw(18 + tailSwing * 0.5), this.px(bob + 8), this.pxw(6), this.px(5));

    // 身体
    this.ellipse(0 + clawLunge * 0.2, bob + 4, 22, 14, hurt ?? C.BODY_SHADOW);
    this.ellipse(0 + clawLunge * 0.3, bob + 3, 20, 12, hurt ?? C.BODY_BASE);
    this.ellipse(-4 + clawLunge * 0.2, bob, 10, 8, hurt ?? C.BODY_HIGHLIGHT);

    // 节纹
    for (let i = -1; i <= 1; i++) {
      this.graphics.fillStyle(hurt ?? C.SEGMENT_BASE);
      this.graphics.fillRect(this.pxw(i * 5 - 2), this.px(bob + 6), this.pxw(5), this.px(2.5));
    }

    // 头部
    this.ellipse(-8 + clawLunge * 0.4, bob - 2, 14, 10, hurt ?? C.BODY_SHADOW);
    this.ellipse(-9 + clawLunge * 0.5, bob - 3, 12, 8, hurt ?? C.BODY_BASE);
    this.ellipse(-12 + clawLunge * 0.4, bob - 5, 6, 5, hurt ?? C.BODY_HIGHLIGHT);

    // 眼睛
    this.ellipse(-13 + clawLunge * 0.5, bob - 4, 3, 2.8, hurt ?? C.EYE_WHITE);
    this.ellipse(-7 + clawLunge * 0.5, bob - 5, 2.5, 2.2, hurt ?? C.EYE_WHITE);
    this.ellipse(-13.5 + clawLunge * 0.5, bob - 3.5, 1.8, 2.2, hurt ?? C.EYE_BLACK);
    this.ellipse(-7.5 + clawLunge * 0.5, bob - 4.5, 1.5, 1.8, hurt ?? C.EYE_BLACK);

    // 钳子（攻击前伸）
    this.graphics.fillStyle(hurt ?? C.CLAW_DARK);
    this.graphics.fillRect(this.pxw(6 + clawLunge), this.px(bob - 1), this.pxw(8), this.px(4.5));
    this.graphics.fillStyle(hurt ?? C.CLAW_BASE);
    this.graphics.fillRect(this.pxw(12 + clawLunge), this.px(bob - 2), this.pxw(5), this.px(4));
    this.graphics.fillStyle(hurt ?? C.CLAW_HIGHLIGHT);
    this.graphics.fillRect(this.pxw(15 + clawLunge), this.px(bob - 2.5), this.pxw(3), this.px(3));

    // 触须
    this.graphics.fillStyle(hurt ?? C.ANTENNA);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(-14 + clawLunge * 0.3), this.px(bob - 7));
    this.graphics.lineTo(this.pxw(-20), this.px(bob - 12));
    this.graphics.lineTo(this.pxw(-24), this.px(bob - 9));
    this.graphics.fillPath();

    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(-8 + clawLunge * 0.3), this.px(bob - 8));
    this.graphics.lineTo(this.pxw(-12), this.px(bob - 14));
    this.graphics.lineTo(this.pxw(-16), this.px(bob - 11));
    this.graphics.fillPath();

    // 边缘光
    this.graphics.lineStyle(this.pxw(1), C.RIM, 0.35);
    this.graphics.strokeEllipse(this.pxw(0), this.px(bob + 3), this.pxw(18), this.px(10));
  }
}