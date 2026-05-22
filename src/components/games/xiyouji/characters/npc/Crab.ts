import * as Phaser from 'phaser';
import { BaseCharacter } from '../player/BaseCharacter';
import type { DialogBox } from '../../ui/DialogBox';

/** 一级怪：重甲坦克，攻防均衡但行动迟缓 */
export class Crab extends BaseCharacter {
  static readonly BATTLE_STATS = {
    maxHp: 44,
    attack: 10,
    defense: 6,
    moveRange: 2,
    attackRange: 1,
    healthBarColor: 0xcc2222,
  } as const;

  private static readonly COLORS = {
    // 壳
    SHELL_BASE: 0xAA3333,
    SHELL_DARK: 0x882222,
    SHELL_SHADOW: 0x661818,
    SHELL_HIGHLIGHT: 0xCC5555,
    SHELL_RIM: 0xDD6666,
    // 腹部
    UNDERBELLY: 0xE8C8A0,
    UNDERBELLY_SHADOW: 0xC8A870,
    // 钳子
    CLAW_BASE: 0xBB4444,
    CLAW_DARK: 0x993333,
    CLAW_HIGHLIGHT: 0xDD6666,
    CLAW_INNER: 0xEEDDAA,
    // 腿
    LEG_BASE: 0xAA4444,
    LEG_DARK: 0x883333,
    LEG_JOINT: 0xCC5555,
    // 眼睛
    EYE_WHITE: 0xFFFFFF,
    EYE_BLACK: 0x1A0A00,
    EYE_HIGHLIGHT: 0xFFFFFF,
    // 嘴
    MOUTH: 0x4A2010,
    // 细节
    SPOT: 0x771818,
    RIM: 0xFFAA88,
    AO: 0x2A1010,
  };

  private static readonly S = 0.55;
  private static readonly WIDTH_SCALE = 1.2;

  protected currentHp: number = Crab.BATTLE_STATS.maxHp;
  protected maxHp: number = Crab.BATTLE_STATS.maxHp;
  protected healthBarColor: number = Crab.BATTLE_STATS.healthBarColor;
  protected attack: number = Crab.BATTLE_STATS.attack;
  protected defense: number = Crab.BATTLE_STATS.defense;
  protected battleMoveRange: number = Crab.BATTLE_STATS.moveRange;
  protected battleAttackRange: number = Crab.BATTLE_STATS.attackRange;

  private sprite: Phaser.GameObjects.Container | null = null;
  private npcName: string = '';
  private dialogues: string[] = [];
  private dialogBox?: DialogBox;
  private worldScene?: Phaser.Scene;
  private worldX: number = 0;
  private worldY: number = 0;

  // 动画部件
  private leftClaw!: Phaser.GameObjects.Graphics;
  private rightClaw!: Phaser.GameObjects.Graphics;
  private leftLegs: Phaser.GameObjects.Graphics[] = [];
  private rightLegs: Phaser.GameObjects.Graphics[] = [];

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

  private px(v: number): number {
    return v * Crab.S;
  }

  private pxw(v: number): number {
    return v * Crab.S * Crab.WIDTH_SCALE;
  }

  protected createSprite(): Phaser.GameObjects.Container {
    const scene = this.worldScene!;
    const container = scene.add.container(this.worldX, this.worldY);
    const px = this.px.bind(this);
    const pxw = this.pxw.bind(this);
    const C = Crab.COLORS;

    // ==================== 地面阴影 ====================
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.35);
    shadow.fillEllipse(pxw(0), px(40), pxw(55), px(12));
    container.add(shadow);

    // ==================== 后腿（最底层） ====================
    // 左后腿
    const leftHindLeg = scene.add.graphics();
    container.add(leftHindLeg);
    this.leftLegs.push(leftHindLeg);

    // 右后腿
    const rightHindLeg = scene.add.graphics();
    container.add(rightHindLeg);
    this.rightLegs.push(rightHindLeg);

    // 左中腿
    const leftMidLeg = scene.add.graphics();
    container.add(leftMidLeg);
    this.leftLegs.push(leftMidLeg);

    // 右中腿
    const rightMidLeg = scene.add.graphics();
    container.add(rightMidLeg);
    this.rightLegs.push(rightMidLeg);

    // 左前腿
    const leftFrontLeg = scene.add.graphics();
    container.add(leftFrontLeg);
    this.leftLegs.push(leftFrontLeg);

    // 右前腿
    const rightFrontLeg = scene.add.graphics();
    container.add(rightFrontLeg);
    this.rightLegs.push(rightFrontLeg);

    // ==================== 腹部 ====================
    const underbelly = scene.add.graphics();
    underbelly.fillStyle(C.UNDERBELLY_SHADOW);
    underbelly.fillEllipse(pxw(0), px(18), pxw(28), px(22));
    underbelly.fillStyle(C.UNDERBELLY);
    underbelly.fillEllipse(pxw(0), px(16), pxw(26), px(20));
    container.add(underbelly);

    // 腹部纹理（节状）
    for (let i = -3; i <= 3; i++) {
      const segment = scene.add.graphics();
      segment.fillStyle(C.UNDERBELLY_SHADOW, 0.5);
      segment.fillRect(pxw(i * 4 - 2), px(10 + Math.abs(i) * 2), pxw(4), px(3));
      container.add(segment);
    }

    // ==================== 身体（主壳） ====================
    const bodyShadow = scene.add.graphics();
    bodyShadow.fillStyle(C.SHELL_SHADOW);
    bodyShadow.fillEllipse(pxw(0), px(4), pxw(34), px(28));
    container.add(bodyShadow);

    const body = scene.add.graphics();
    body.fillStyle(C.SHELL_BASE);
    body.fillEllipse(pxw(0), px(2), pxw(32), px(26));
    container.add(body);

    const bodyHighlight = scene.add.graphics();
    bodyHighlight.fillStyle(C.SHELL_HIGHLIGHT);
    bodyHighlight.fillEllipse(pxw(-4), px(-2), pxw(16), px(18));
    container.add(bodyHighlight);

    // 壳纹路
    const shellPattern = scene.add.graphics();
    shellPattern.lineStyle(pxw(1.5), C.SHELL_DARK, 0.6);
    for (let i = -2; i <= 2; i++) {
      shellPattern.beginPath();
      shellPattern.moveTo(pxw(i * 5), px(6));
      shellPattern.lineTo(pxw(i * 5), px(-8));
      shellPattern.strokePath();
    }
    container.add(shellPattern);

    // 壳斑点
    for (let i = 0; i < 6; i++) {
      const spot = scene.add.graphics();
      spot.fillStyle(C.SPOT, 0.5);
      spot.fillCircle(pxw(-10 + i * 4), px(-4 + (i % 2) * 3), pxw(2));
      container.add(spot);
    }

    // ==================== 钳子 ====================
    // 左钳主体
    this.leftClaw = scene.add.graphics();
    container.add(this.leftClaw);

    // 右钳主体
    this.rightClaw = scene.add.graphics();
    container.add(this.rightClaw);

    // 左钳钳齿
    const leftClawTeeth = scene.add.graphics();
    container.add(leftClawTeeth);

    // 右钳钳齿
    const rightClawTeeth = scene.add.graphics();
    container.add(rightClawTeeth);

    // ==================== 眼睛 ====================
    // 眼柄（左）
    const leftStalk = scene.add.graphics();
    leftStalk.fillStyle(C.SHELL_BASE);
    leftStalk.fillRect(pxw(-14), px(-12), pxw(5), px(8));
    container.add(leftStalk);

    // 眼柄（右）
    const rightStalk = scene.add.graphics();
    rightStalk.fillStyle(C.SHELL_BASE);
    rightStalk.fillRect(pxw(9), px(-12), pxw(5), px(8));
    container.add(rightStalk);

    // 左眼白
    const leftEyeWhite = scene.add.graphics();
    leftEyeWhite.fillStyle(C.EYE_WHITE);
    leftEyeWhite.fillEllipse(pxw(-12), px(-13), pxw(6), px(6));
    container.add(leftEyeWhite);

    // 右眼白
    const rightEyeWhite = scene.add.graphics();
    rightEyeWhite.fillStyle(C.EYE_WHITE);
    rightEyeWhite.fillEllipse(pxw(6), px(-13), pxw(6), px(6));
    container.add(rightEyeWhite);

    // 左瞳孔
    const leftPupil = scene.add.graphics();
    leftPupil.fillStyle(C.EYE_BLACK);
    leftPupil.fillEllipse(pxw(-12), px(-12), pxw(3.5), px(4.5));
    container.add(leftPupil);

    // 右瞳孔
    const rightPupil = scene.add.graphics();
    rightPupil.fillStyle(C.EYE_BLACK);
    rightPupil.fillEllipse(pxw(6), px(-12), pxw(3.5), px(4.5));
    container.add(rightPupil);

    // 左高光
    const leftHighlight = scene.add.graphics();
    leftHighlight.fillStyle(C.EYE_HIGHLIGHT);
    leftHighlight.fillCircle(pxw(-13.5), px(-14), pxw(1.5));
    container.add(leftHighlight);

    // 右高光
    const rightHighlight = scene.add.graphics();
    rightHighlight.fillStyle(C.EYE_HIGHLIGHT);
    rightHighlight.fillCircle(pxw(4.5), px(-14), pxw(1.5));
    container.add(rightHighlight);

    // ==================== 嘴巴 ====================
    const mouth = scene.add.graphics();
    mouth.fillStyle(C.MOUTH);
    mouth.beginPath();
    mouth.moveTo(pxw(-4), px(-2));
    mouth.lineTo(pxw(0), px(1));
    mouth.lineTo(pxw(4), px(-2));
    mouth.fillPath();
    container.add(mouth);

    // 吐泡泡（装饰）
    const bubble = scene.add.graphics();
    bubble.fillStyle(0x88AACC, 0.4);
    bubble.fillCircle(pxw(8), px(-3), pxw(3));
    container.add(bubble);

    container.setDepth(18);

    // ==================== 动画 ====================
    let time = 0;
    scene.time.addEvent({
      delay: 50,
      callback: () => {
        time += 0.2;
        const clawSwing = Math.sin(time) * 6;
        const legWave = Math.sin(time * 1.3) * 4;

        // 左钳动画
        this.leftClaw.clear();
        this.leftClaw.fillStyle(C.CLAW_BASE);
        this.leftClaw.fillEllipse(pxw(-22 - clawSwing * 0.3), px(6 + clawSwing * 0.15), pxw(12), pxw(10));
        this.leftClaw.fillStyle(C.CLAW_HIGHLIGHT);
        this.leftClaw.fillEllipse(pxw(-25 - clawSwing * 0.35), px(4 + clawSwing * 0.1), pxw(8), pxw(7));

        // 右钳动画
        this.rightClaw.clear();
        this.rightClaw.fillStyle(C.CLAW_BASE);
        this.rightClaw.fillEllipse(pxw(10 + clawSwing * 0.3), px(6 - clawSwing * 0.15), pxw(12), pxw(10));
        this.rightClaw.fillStyle(C.CLAW_HIGHLIGHT);
        this.rightClaw.fillEllipse(pxw(17 + clawSwing * 0.35), px(4 - clawSwing * 0.1), pxw(8), pxw(7));

        // 钳齿
        leftClawTeeth.clear();
        leftClawTeeth.fillStyle(C.CLAW_INNER);
        leftClawTeeth.fillRect(pxw(-28 - clawSwing * 0.3), px(3 + clawSwing * 0.1), pxw(5), px(4));

        rightClawTeeth.clear();
        rightClawTeeth.fillStyle(C.CLAW_INNER);
        rightClawTeeth.fillRect(pxw(23 + clawSwing * 0.3), px(3 - clawSwing * 0.1), pxw(5), px(4));

        // 腿动画
        const legPositions = [
          { leg: leftHindLeg, x: -16, y: 24, swing: legWave * 0.3 },
          { leg: rightHindLeg, x: 8, y: 24, swing: -legWave * 0.3 },
          { leg: leftMidLeg, x: -20, y: 16, swing: legWave * 0.5 },
          { leg: rightMidLeg, x: 12, y: 16, swing: -legWave * 0.5 },
          { leg: leftFrontLeg, x: -22, y: 8, swing: legWave * 0.4 },
          { leg: rightFrontLeg, x: 14, y: 8, swing: -legWave * 0.4 },
        ];

        legPositions.forEach((pos) => {
          pos.leg.clear();
          pos.leg.fillStyle(C.LEG_BASE);
          pos.leg.fillEllipse(pxw(pos.x + pos.swing), px(pos.y), pxw(8), px(14));
          pos.leg.fillStyle(C.LEG_DARK);
          pos.leg.fillRect(pxw(pos.x + pos.swing - 2), px(pos.y + 6), pxw(4), px(10));
          pos.leg.fillStyle(C.LEG_JOINT);
          pos.leg.fillCircle(pxw(pos.x + pos.swing), px(pos.y + 4), pxw(3));
        });
      },
      loop: true,
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
    return { x: this.worldX - 20, y: this.worldY - 20, width: 40, height: 40 };
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

  private ellipse(x: number, y: number, rx: number, ry: number, color: number): void {
    this.graphics.fillStyle(color);
    this.graphics.fillEllipse(this.pxw(x), this.px(y), this.pxw(rx), this.px(ry));
  }

  draw(x: number, y: number): void {
    this.graphics.clear();
    this.graphics.setPosition(x, y);
    const C = Crab.COLORS;
    const hurt = this.getHurtTint();

    const bob = this.isMoving ? Math.sin(this.walkCycle) * 1.5 : 0;
    const clawSwing = this.isMoving
      ? Math.sin(this.walkCycle * 1.5) * 6
      : (this.isAttacking ? 12 : 0);

    // 地面阴影
    this.ellipse(0, bob + 18, 32, 8, hurt ?? C.AO);

    // 腹部
    this.ellipse(0, bob + 12, 22, 16, hurt ?? C.UNDERBELLY_SHADOW);
    this.ellipse(0, bob + 10, 20, 14, hurt ?? C.UNDERBELLY);

    // 身体主壳
    this.ellipse(0, bob + 2, 28, 22, hurt ?? C.SHELL_SHADOW);
    this.ellipse(0, bob, 26, 20, hurt ?? C.SHELL_BASE);
    this.ellipse(-5, bob - 3, 12, 14, hurt ?? C.SHELL_HIGHLIGHT);

    // 壳纹路
    this.graphics.lineStyle(this.pxw(1.2), C.SHELL_DARK, 0.5);
    for (let i = -2; i <= 2; i++) {
      this.graphics.beginPath();
      this.graphics.moveTo(this.pxw(i * 5), this.px(bob + 2));
      this.graphics.lineTo(this.pxw(i * 5), this.px(bob - 8));
      this.graphics.strokePath();
    }

    // 左钳
    this.graphics.fillStyle(hurt ?? C.CLAW_BASE);
    this.graphics.fillEllipse(this.pxw(-18 - clawSwing), this.px(bob + 4), this.pxw(10), this.pxw(8));
    this.graphics.fillStyle(hurt ?? C.CLAW_HIGHLIGHT);
    this.graphics.fillEllipse(this.pxw(-21 - clawSwing), this.px(bob + 2), this.pxw(7), this.pxw(6));

    // 右钳
    this.graphics.fillStyle(hurt ?? C.CLAW_BASE);
    this.graphics.fillEllipse(this.pxw(8 + clawSwing), this.px(bob + 4), this.pxw(10), this.pxw(8));
    this.graphics.fillStyle(hurt ?? C.CLAW_HIGHLIGHT);
    this.graphics.fillEllipse(this.pxw(14 + clawSwing), this.px(bob + 2), this.pxw(7), this.pxw(6));

    // 腿
    for (let i = -3; i <= 3; i++) {
      const legSwing = this.isMoving ? Math.sin(this.walkCycle * 1.5 + i) * 4 : 0;
      this.graphics.fillStyle(hurt ?? C.LEG_BASE);
      this.graphics.fillRect(this.pxw(i * 4 + legSwing * 0.3), this.px(bob + 12 + Math.abs(i) * 2), this.pxw(5), this.px(12));
    }

    // 眼睛
    this.ellipse(-10, bob - 10, 4, 4, hurt ?? C.EYE_WHITE);
    this.ellipse(10, bob - 10, 4, 4, hurt ?? C.EYE_WHITE);
    this.ellipse(-10, bob - 9, 2.5, 3.5, hurt ?? C.EYE_BLACK);
    this.ellipse(10, bob - 9, 2.5, 3.5, hurt ?? C.EYE_BLACK);
    this.graphics.fillStyle(hurt ?? C.EYE_HIGHLIGHT);
    this.graphics.fillCircle(this.pxw(-11.5), this.px(bob - 12), this.pxw(1));
    this.graphics.fillCircle(this.pxw(8.5), this.px(bob - 12), this.pxw(1));

    // 嘴巴
    this.graphics.fillStyle(hurt ?? C.MOUTH);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(-3), this.px(bob - 2));
    this.graphics.lineTo(this.pxw(0), this.px(bob + 1));
    this.graphics.lineTo(this.pxw(3), this.px(bob - 2));
    this.graphics.fillPath();

    // 边缘光
    this.graphics.lineStyle(this.pxw(1.2), C.RIM, 0.35);
    this.graphics.strokeEllipse(this.pxw(0), this.px(bob), this.pxw(24), this.px(18));
  }
}