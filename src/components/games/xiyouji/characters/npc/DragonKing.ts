import * as Phaser from 'phaser';
import { BaseCharacter } from '../player/BaseCharacter';
import type { DialogBox } from '../../ui/DialogBox';

/** 一级 Boss：高血高攻，射程更远 */
export class DragonKing extends BaseCharacter {
  static readonly BATTLE_STATS = {
    maxHp: 110,
    attack: 10,
    defense: 6,
    moveRange: 2,
    attackRange: 2,
    healthBarColor: 0xf1c40f,
  } as const;

  private static readonly COLORS = {
    // 鳞片
    SCALE_BASE: 0x2ecc71,
    SCALE_DARK: 0x27ae60,
    SCALE_SHADOW: 0x1a7a42,
    SCALE_HIGHLIGHT: 0x4ae090,
    SCALE_RIM: 0x6af0a0,
    // 腹部
    UNDERBELLY: 0xf0d890,
    UNDERBELLY_SHADOW: 0xd0b870,
    UNDERBELLY_DARK: 0xb09850,
    // 金色装饰
    GOLD_BASE: 0xffd700,
    GOLD_DARK: 0xcda530,
    GOLD_SHADOW: 0x8b6914,
    GOLD_HIGHLIGHT: 0xffe44d,
    // 龙角/龙须
    HORN: 0xf1c40f,
    HORN_SHADOW: 0xc4a00a,
    WHISKER: 0xffaa44,
    // 眼睛
    EYE_WHITE: 0xffffff,
    EYE_BLACK: 0x1a0a00,
    EYE_GLOW: 0xff6600,
    // 嘴
    MOUTH: 0x4a2010,
    FANG: 0xffffff,
    // 龙袍细节
    ROBE_BASE: 0xd4af37,
    ROBE_DARK: 0x9a7a2a,
    ROBE_PATTERN: 0xff4444,
    // 特效
    RIM: 0xaaffcc,
    AO: 0x0a2018,
  };

  private static readonly S = 0.7;
  private static readonly WIDTH_SCALE = 1.25;

  protected currentHp: number = DragonKing.BATTLE_STATS.maxHp;
  protected maxHp: number = DragonKing.BATTLE_STATS.maxHp;
  protected healthBarColor: number = DragonKing.BATTLE_STATS.healthBarColor;
  protected attack: number = DragonKing.BATTLE_STATS.attack;
  protected defense: number = DragonKing.BATTLE_STATS.defense;
  protected battleMoveRange: number = DragonKing.BATTLE_STATS.moveRange;
  protected battleAttackRange: number = DragonKing.BATTLE_STATS.attackRange;

  private sprite: Phaser.GameObjects.Container | null = null;
  private npcName: string = '';
  private dialogues: string[] = [];
  private dialogBox?: DialogBox;
  private worldScene?: Phaser.Scene;
  private worldX: number = 0;
  private worldY: number = 0;

  // 动画部件
  private leftArm!: Phaser.GameObjects.Graphics;
  private rightArm!: Phaser.GameObjects.Graphics;
  private leftWhisker!: Phaser.GameObjects.Graphics;
  private rightWhisker!: Phaser.GameObjects.Graphics;
  private cape!: Phaser.GameObjects.Graphics;
  private aura!: Phaser.GameObjects.Graphics;

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
    return v * DragonKing.S;
  }

  private pxw(v: number): number {
    return v * DragonKing.S * DragonKing.WIDTH_SCALE;
  }

  protected createSprite(): Phaser.GameObjects.Container {
    const scene = this.worldScene!;
    const container = scene.add.container(this.worldX, this.worldY);
    const px = this.px.bind(this);
    const pxw = this.pxw.bind(this);
    const C = DragonKing.COLORS;

    // ==================== 地面阴影 ====================
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.35);
    shadow.fillEllipse(pxw(0), px(55), pxw(65), px(15));
    container.add(shadow);

    // ==================== 龙袍披风（底层） ====================
    this.cape = scene.add.graphics();
    container.add(this.cape);

    // ==================== 腿部 ====================
    // 左腿
    const leftLeg = scene.add.graphics();
    container.add(leftLeg);

    // 右腿
    const rightLeg = scene.add.graphics();
    container.add(rightLeg);

    // 左脚
    const leftFoot = scene.add.graphics();
    leftFoot.fillStyle(C.ROBE_DARK);
    leftFoot.fillEllipse(pxw(-18), px(48), pxw(14), px(8));
    container.add(leftFoot);

    // 右脚
    const rightFoot = scene.add.graphics();
    rightFoot.fillStyle(C.ROBE_DARK);
    rightFoot.fillEllipse(pxw(12), px(48), pxw(14), px(8));
    container.add(rightFoot);

    // ==================== 龙袍下摆 ====================
    const robeBase = scene.add.graphics();
    robeBase.fillStyle(C.ROBE_DARK);
    robeBase.fillEllipse(pxw(0), px(30), pxw(45), px(28));
    container.add(robeBase);

    const robeMid = scene.add.graphics();
    robeMid.fillStyle(C.GOLD_DARK);
    robeMid.fillEllipse(pxw(0), px(28), pxw(42), px(25));
    container.add(robeMid);

    const robeLight = scene.add.graphics();
    robeLight.fillStyle(C.ROBE_BASE);
    robeLight.fillEllipse(pxw(0), px(26), pxw(40), px(23));
    container.add(robeLight);

    // 龙袍纹路
    const robePattern = scene.add.graphics();
    robePattern.lineStyle(pxw(1.5), C.ROBE_PATTERN, 0.6);
    for (let i = -2; i <= 2; i++) {
      robePattern.beginPath();
      robePattern.moveTo(pxw(i * 8), px(20));
      robePattern.lineTo(pxw(i * 6), px(40));
      robePattern.strokePath();
    }
    container.add(robePattern);

    // 腰带
    const belt = scene.add.graphics();
    belt.fillStyle(C.GOLD_SHADOW);
    belt.fillRect(pxw(-24), px(22), pxw(48), px(8));
    belt.fillStyle(C.GOLD_BASE);
    belt.fillRect(pxw(-22), px(23), pxw(44), px(5));
    container.add(belt);

    // 腰带装饰
    const beltGem = scene.add.graphics();
    beltGem.fillStyle(C.ROBE_PATTERN);
    beltGem.fillEllipse(pxw(0), px(26), pxw(8), px(5));
    container.add(beltGem);

    // ==================== 身体 ====================
    // 身体暗部
    const bodyShadow = scene.add.graphics();
    bodyShadow.fillStyle(C.SCALE_SHADOW);
    bodyShadow.fillEllipse(pxw(0), px(8), pxw(38), px(32));
    container.add(bodyShadow);

    // 身体主鳞片
    const bodyBase = scene.add.graphics();
    bodyBase.fillStyle(C.SCALE_BASE);
    bodyBase.fillEllipse(pxw(0), px(6), pxw(36), px(30));
    container.add(bodyBase);

    // 身体高光
    const bodyHighlight = scene.add.graphics();
    bodyHighlight.fillStyle(C.SCALE_HIGHLIGHT);
    bodyHighlight.fillEllipse(pxw(-6), px(2), pxw(18), px(22));
    container.add(bodyHighlight);

    // 鳞片纹理
    const scales = scene.add.graphics();
    scales.lineStyle(pxw(1), C.SCALE_DARK, 0.5);
    for (let i = -2; i <= 2; i++) {
      for (let j = -1; j <= 2; j++) {
        scales.beginPath();
        scales.fillEllipse(pxw(i * 7), px(4 + j * 8), pxw(4), px(5));
        scales.strokePath();
      }
    }
    container.add(scales);

    // ==================== 手臂 ====================
    this.leftArm = scene.add.graphics();
    container.add(this.leftArm);

    this.rightArm = scene.add.graphics();
    container.add(this.rightArm);

    // 手爪
    const leftHand = scene.add.graphics();
    container.add(leftHand);

    const rightHand = scene.add.graphics();
    container.add(rightHand);

    // ==================== 头部 ====================
    // 脖子
    const neck = scene.add.graphics();
    neck.fillStyle(C.SCALE_SHADOW);
    neck.fillRect(pxw(-12), px(-10), pxw(24), px(18));
    container.add(neck);

    // 头部暗部
    const headShadow = scene.add.graphics();
    headShadow.fillStyle(C.SCALE_SHADOW);
    headShadow.fillEllipse(pxw(0), px(-28), pxw(48), px(32));
    container.add(headShadow);

    // 头部主色
    const headBase = scene.add.graphics();
    headBase.fillStyle(C.SCALE_BASE);
    headBase.fillEllipse(pxw(0), px(-30), pxw(44), px(30));
    container.add(headBase);

    // 头部高光
    const headHighlight = scene.add.graphics();
    headHighlight.fillStyle(C.SCALE_HIGHLIGHT);
    headHighlight.fillEllipse(pxw(-8), px(-36), pxw(20), px(20));
    container.add(headHighlight);

    // ==================== 面部细节 ====================
    // 脸部
    const face = scene.add.graphics();
    face.fillStyle(C.UNDERBELLY);
    face.fillEllipse(pxw(0), px(-28), pxw(28), px(20));
    container.add(face);

    const faceShadow = scene.add.graphics();
    faceShadow.fillStyle(C.UNDERBELLY_SHADOW);
    faceShadow.fillEllipse(pxw(0), px(-26), pxw(24), px(16));
    container.add(faceShadow);

    // 鼻子
    const nose = scene.add.graphics();
    nose.fillStyle(C.SCALE_DARK);
    nose.fillEllipse(pxw(0), px(-20), pxw(8), px(5));
    container.add(nose);

    // ==================== 眼睛 ====================
    // 左眼白
    const leftEyeWhite = scene.add.graphics();
    leftEyeWhite.fillStyle(C.EYE_WHITE);
    leftEyeWhite.fillEllipse(pxw(-14), px(-38), pxw(8), px(7));
    container.add(leftEyeWhite);

    // 右眼白
    const rightEyeWhite = scene.add.graphics();
    rightEyeWhite.fillStyle(C.EYE_WHITE);
    rightEyeWhite.fillEllipse(pxw(14), px(-38), pxw(8), px(7));
    container.add(rightEyeWhite);

    // 左瞳孔
    const leftPupil = scene.add.graphics();
    leftPupil.fillStyle(C.EYE_BLACK);
    leftPupil.fillEllipse(pxw(-14), px(-37), pxw(4.5), px(5.5));
    container.add(leftPupil);

    // 右瞳孔
    const rightPupil = scene.add.graphics();
    rightPupil.fillStyle(C.EYE_BLACK);
    rightPupil.fillEllipse(pxw(14), px(-37), pxw(4.5), px(5.5));
    container.add(rightPupil);

    // 左高光
    const leftHighlight = scene.add.graphics();
    leftHighlight.fillStyle(C.EYE_WHITE);
    leftHighlight.fillCircle(pxw(-16), px(-40), pxw(1.8));
    container.add(leftHighlight);

    // 右高光
    const rightHighlight = scene.add.graphics();
    rightHighlight.fillStyle(C.EYE_WHITE);
    rightHighlight.fillCircle(pxw(12), px(-40), pxw(1.8));
    container.add(rightHighlight);

    // 眼神光（怒气）
    const leftGlow = scene.add.graphics();
    leftGlow.fillStyle(C.EYE_GLOW, 0.4);
    leftGlow.fillEllipse(pxw(-14), px(-37), pxw(6), px(4));
    container.add(leftGlow);

    const rightGlow = scene.add.graphics();
    rightGlow.fillStyle(C.EYE_GLOW, 0.4);
    rightGlow.fillEllipse(pxw(14), px(-37), pxw(6), px(4));
    container.add(rightGlow);

    // ==================== 眉毛 ====================
    const leftBrow = scene.add.graphics();
    leftBrow.fillStyle(C.SCALE_DARK);
    leftBrow.fillRect(pxw(-20), px(-48), pxw(14), px(4));
    container.add(leftBrow);

    const rightBrow = scene.add.graphics();
    rightBrow.fillStyle(C.SCALE_DARK);
    rightBrow.fillRect(pxw(6), px(-48), pxw(14), px(4));
    container.add(rightBrow);

    // ==================== 嘴巴 ====================
    const mouth = scene.add.graphics();
    mouth.fillStyle(C.MOUTH);
    mouth.beginPath();
    mouth.moveTo(pxw(-8), px(-18));
    mouth.lineTo(pxw(0), px(-14));
    mouth.lineTo(pxw(8), px(-18));
    mouth.fillPath();
    container.add(mouth);

    // 獠牙
    const leftFang = scene.add.graphics();
    leftFang.fillStyle(C.FANG);
    leftFang.fillTriangle(pxw(-5), px(-16), pxw(-7), px(-11), pxw(-2), px(-15));
    container.add(leftFang);

    const rightFang = scene.add.graphics();
    rightFang.fillStyle(C.FANG);
    rightFang.fillTriangle(pxw(5), px(-16), pxw(7), px(-11), pxw(2), px(-15));
    container.add(rightFang);

    // ==================== 龙须 ====================
    this.leftWhisker = scene.add.graphics();
    container.add(this.leftWhisker);

    this.rightWhisker = scene.add.graphics();
    container.add(this.rightWhisker);

    // ==================== 龙角 ====================
    // 左角
    const leftHorn = scene.add.graphics();
    leftHorn.fillStyle(C.HORN_SHADOW);
    leftHorn.fillTriangle(pxw(-26), px(-42), pxw(-40), px(-68), pxw(-14), px(-48));
    leftHorn.fillStyle(C.HORN);
    leftHorn.fillTriangle(pxw(-25), px(-43), pxw(-38), px(-65), pxw(-15), px(-47));
    container.add(leftHorn);

    // 右角
    const rightHorn = scene.add.graphics();
    rightHorn.fillStyle(C.HORN_SHADOW);
    rightHorn.fillTriangle(pxw(26), px(-42), pxw(40), px(-68), pxw(14), px(-48));
    rightHorn.fillStyle(C.HORN);
    rightHorn.fillTriangle(pxw(25), px(-43), pxw(38), px(-65), pxw(15), px(-47));
    container.add(rightHorn);

    // 角纹路
    const hornPattern = scene.add.graphics();
    hornPattern.lineStyle(pxw(1), C.HORN_SHADOW, 0.5);
    for (let i = -2; i <= 2; i++) {
      hornPattern.beginPath();
      hornPattern.moveTo(pxw(-30 + i * 3), px(-50 + i * 4));
      hornPattern.lineTo(pxw(-20 + i * 2), px(-44 + i * 3));
      hornPattern.strokePath();
      hornPattern.beginPath();
      hornPattern.moveTo(pxw(20 + i * 3), px(-50 + i * 4));
      hornPattern.lineTo(pxw(30 + i * 2), px(-44 + i * 3));
      hornPattern.strokePath();
    }
    container.add(hornPattern);

    // ==================== 龙珠（胸口） ====================
    const dragonPearl = scene.add.graphics();
    dragonPearl.fillStyle(C.GOLD_BASE);
    dragonPearl.fillCircle(pxw(0), px(12), pxw(8));
    dragonPearl.fillStyle(C.GOLD_HIGHLIGHT);
    dragonPearl.fillCircle(pxw(-1), px(10), pxw(3));
    container.add(dragonPearl);

    // ==================== 灵气光环 ====================
    this.aura = scene.add.graphics();
    container.add(this.aura);

    container.setDepth(30);

    // 交互区域
    container.setInteractive(
      new Phaser.Geom.Rectangle(pxw(-30), px(-55), pxw(60), px(110)),
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
        const armSwing = Math.sin(time) * 5;
        const whiskerWave = Math.sin(time * 0.8) * 8;
        const capeWave = Math.sin(time * 1.2) * 6;
        const auraPulse = Math.sin(time * 2) * 0.3 + 0.5;

        // 手臂摆动
        this.leftArm.clear();
        this.leftArm.fillStyle(C.SCALE_BASE);
        this.leftArm.fillEllipse(pxw(-28 - armSwing * 0.2), px(8 + armSwing * 0.15), pxw(12), px(22));

        this.rightArm.clear();
        this.rightArm.fillStyle(C.SCALE_DARK);
        this.rightArm.fillEllipse(pxw(16 + armSwing * 0.2), px(8 - armSwing * 0.15), pxw(12), px(22));

        // 龙须飘动
        this.leftWhisker.clear();
        this.leftWhisker.fillStyle(C.WHISKER);
        this.leftWhisker.beginPath();
        this.leftWhisker.moveTo(pxw(-18), px(-24));
        this.leftWhisker.lineTo(pxw(-28 - whiskerWave * 0.3), px(-30));
        this.leftWhisker.lineTo(pxw(-40 - whiskerWave * 0.5), px(-22));
        this.leftWhisker.fillPath();

        this.rightWhisker.clear();
        this.rightWhisker.fillStyle(C.WHISKER);
        this.rightWhisker.beginPath();
        this.rightWhisker.moveTo(pxw(18), px(-24));
        this.rightWhisker.lineTo(pxw(28 + whiskerWave * 0.3), px(-30));
        this.rightWhisker.lineTo(pxw(40 + whiskerWave * 0.5), px(-22));
        this.rightWhisker.fillPath();

        // 披风飘动
        this.cape.clear();
        this.cape.fillStyle(C.ROBE_DARK);
        this.cape.beginPath();
        this.cape.moveTo(pxw(-20), px(16));
        this.cape.lineTo(pxw(-30 + capeWave * 0.2), px(30));
        this.cape.lineTo(pxw(-25 + capeWave), px(50));
        this.cape.lineTo(pxw(25 - capeWave), px(50));
        this.cape.lineTo(pxw(30 - capeWave * 0.2), px(30));
        this.cape.lineTo(pxw(20), px(16));
        this.cape.fillPath();

        // 灵气光环
        this.aura.clear();
        this.aura.lineStyle(pxw(2), C.GOLD_BASE, 0.6 * auraPulse);
        this.aura.strokeCircle(pxw(0), px(6), pxw(28));
        this.aura.lineStyle(pxw(1), C.RIM, 0.4 * auraPulse);
        this.aura.strokeCircle(pxw(0), px(6), pxw(34));

        // 腿动画
        const legSwing = Math.sin(time * 1.4) * 6;
        leftLeg.clear();
        leftLeg.fillStyle(C.ROBE_BASE);
        leftLeg.fillEllipse(pxw(-16 + legSwing * 0.2), px(38), pxw(12), px(14));

        rightLeg.clear();
        rightLeg.fillStyle(C.ROBE_BASE);
        rightLeg.fillEllipse(pxw(10 - legSwing * 0.2), px(38), pxw(12), px(14));
      },
      loop: true,
    });

    // 浮动动画
    scene.tweens.add({
      targets: container,
      y: this.worldY - 6,
      duration: 1800,
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
    return { x: this.worldX - 25, y: this.worldY - 45, width: 50, height: 95 };
  }

  public destroy(): void {
    if (this.sprite) this.sprite.destroy();
    this.clear();
  }

  public setShowHealthBar(show: boolean): void {
    super.setShowHealthBar(show);
  }

  protected getHealthBarYOffset(): number {
    return -this.collisionRadius - 30;
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
    const C = DragonKing.COLORS;
    const hurt = this.getHurtTint();

    const bob = this.isMoving ? Math.sin(this.walkCycle) * 1.5 : 0;
    const clawReach = this.isAttacking ? 16 : 0;

    // 地面阴影
    this.ellipse(0, bob + 28, 40, 10, hurt ?? C.AO);

    // 龙袍下摆
    this.ellipse(0, bob + 18, 32, 20, hurt ?? C.GOLD_SHADOW);
    this.ellipse(0, bob + 16, 30, 18, hurt ?? C.GOLD_DARK);
    this.ellipse(0, bob + 14, 28, 16, hurt ?? C.GOLD_BASE);

    // 身体
    this.ellipse(0, bob + 2, 28, 24, hurt ?? C.SCALE_SHADOW);
    this.ellipse(0, bob, 26, 22, hurt ?? C.SCALE_BASE);
    this.ellipse(-5, bob - 3, 14, 16, hurt ?? C.SCALE_HIGHLIGHT);

    // 鳞片纹理
    this.graphics.lineStyle(this.pxw(1), C.SCALE_DARK, 0.4);
    for (let i = -2; i <= 2; i++) {
      for (let j = -1; j <= 1; j++) {
        this.graphics.beginPath();
        this.graphics.fillEllipse(this.pxw(i * 6), this.px(bob + 2 + j * 8), this.pxw(3.5), this.px(4.5));
        this.graphics.strokePath();
      }
    }

    // 攻击时龙爪前伸
    if (this.isAttacking) {
      this.graphics.fillStyle(hurt ?? C.SCALE_DARK);
      this.graphics.fillRect(this.pxw(12 + clawReach), this.px(bob + 4), this.pxw(16), this.px(8));
      this.graphics.fillStyle(hurt ?? C.GOLD_BASE);
      this.graphics.fillRect(this.pxw(22 + clawReach), this.px(bob + 2), this.pxw(10), this.px(6));
      this.graphics.fillStyle(hurt ?? 0xff6600);
      this.graphics.fillEllipse(this.pxw(30 + clawReach), this.px(bob + 4), this.pxw(8), this.px(6));
    }

    // 头部
    this.ellipse(0, bob - 20, 32, 24, hurt ?? C.SCALE_SHADOW);
    this.ellipse(0, bob - 22, 30, 22, hurt ?? C.SCALE_BASE);
    this.ellipse(-5, bob - 26, 14, 14, hurt ?? C.SCALE_HIGHLIGHT);

    // 脸部
    this.ellipse(0, bob - 20, 20, 16, hurt ?? C.UNDERBELLY);
    this.ellipse(0, bob - 18, 18, 14, hurt ?? C.UNDERBELLY_SHADOW);

    // 龙角
    this.graphics.fillStyle(hurt ?? C.HORN_SHADOW);
    this.graphics.fillTriangle(
      this.pxw(-18), this.px(bob - 32),
      this.pxw(-28), this.px(bob - 52),
      this.pxw(-8), this.px(bob - 36)
    );
    this.graphics.fillStyle(hurt ?? C.HORN);
    this.graphics.fillTriangle(
      this.pxw(-17), this.px(bob - 33),
      this.pxw(-26), this.px(bob - 50),
      this.pxw(-9), this.px(bob - 35)
    );

    this.graphics.fillStyle(hurt ?? C.HORN_SHADOW);
    this.graphics.fillTriangle(
      this.pxw(18), this.px(bob - 32),
      this.pxw(28), this.px(bob - 52),
      this.pxw(8), this.px(bob - 36)
    );
    this.graphics.fillStyle(hurt ?? C.HORN);
    this.graphics.fillTriangle(
      this.pxw(17), this.px(bob - 33),
      this.pxw(26), this.px(bob - 50),
      this.pxw(9), this.px(bob - 35)
    );

    // 龙须
    this.graphics.fillStyle(hurt ?? C.WHISKER);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(-14), this.px(bob - 18));
    this.graphics.lineTo(this.pxw(-24), this.px(bob - 22));
    this.graphics.lineTo(this.pxw(-32), this.px(bob - 16));
    this.graphics.fillPath();

    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(14), this.px(bob - 18));
    this.graphics.lineTo(this.pxw(24), this.px(bob - 22));
    this.graphics.lineTo(this.pxw(32), this.px(bob - 16));
    this.graphics.fillPath();

    // 眼睛
    this.ellipse(-10, bob - 28, 5, 4.5, hurt ?? C.EYE_WHITE);
    this.ellipse(10, bob - 28, 5, 4.5, hurt ?? C.EYE_WHITE);
    this.ellipse(-10, bob - 27, 2.5, 3.5, hurt ?? C.EYE_BLACK);
    this.ellipse(10, bob - 27, 2.5, 3.5, hurt ?? C.EYE_BLACK);

    this.graphics.fillStyle(hurt ?? C.EYE_GLOW);
    this.graphics.fillEllipse(this.pxw(-10), this.px(bob - 26), this.pxw(3), this.px(2));
    this.graphics.fillEllipse(this.pxw(10), this.px(bob - 26), this.pxw(3), this.px(2));

    // 嘴巴
    this.graphics.fillStyle(hurt ?? C.MOUTH);
    this.graphics.beginPath();
    this.graphics.moveTo(this.pxw(-6), this.px(bob - 14));
    this.graphics.lineTo(this.pxw(0), this.px(bob - 10));
    this.graphics.lineTo(this.pxw(6), this.px(bob - 14));
    this.graphics.fillPath();

    // 龙珠（胸口）
    this.graphics.fillStyle(hurt ?? C.GOLD_BASE);
    this.graphics.fillCircle(this.pxw(0), this.px(bob + 6), this.pxw(6));
    this.graphics.fillStyle(hurt ?? C.GOLD_HIGHLIGHT);
    this.graphics.fillCircle(this.pxw(-1), this.px(bob + 4), this.pxw(2.5));

    // 边缘光
    this.graphics.lineStyle(this.pxw(1.2), C.RIM, 0.35);
    this.graphics.strokeEllipse(this.pxw(0), this.px(bob - 22), this.pxw(28), this.px(20));
    this.graphics.strokeEllipse(this.pxw(0), this.px(bob), this.pxw(24), this.px(18));
  }
}