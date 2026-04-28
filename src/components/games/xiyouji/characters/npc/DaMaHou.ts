// npc/DaMaHou.ts
import * as Phaser from 'phaser';
import { BaseNPC } from './BaseNPC';

export class DaMaHou extends BaseNPC {
  private static readonly S = 0.5;
  private static readonly WIDTH_SCALE = 1.2;

  private static readonly COLORS = {
    SKIN_LIGHT: 0xD4A06A,
    SKIN_MID: 0xC4905A,
    SKIN_DARK: 0xA07040,
    SKIN_SHADOW: 0x7A5020,
    FUR_LIGHT: 0x6B4A2A,
    FUR_MID: 0x5A3A1A,
    FUR_DARK: 0x3A2010,
    EYE: 0x1A0A00,
    MOUTH: 0x3A2010,
    BELT: 0x8B5A3A,
    GOLD: 0xFFD700,
    VEST: 0x3A6A1A
  };

  private leftArm!: Phaser.GameObjects.Graphics;
  private rightArm!: Phaser.GameObjects.Graphics;
  private leftLeg!: Phaser.GameObjects.Graphics;
  private rightLeg!: Phaser.GameObjects.Graphics;
  private tail!: Phaser.GameObjects.Graphics;
  private pxFunc!: (v: number) => number;
  private pxwFunc!: (v: number) => number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '大马猴', [
      '大王，您终于回来了！',
      '大王，我们缺一件趁手的兵器啊！',
      '听说东海龙宫有神兵利器，大王何不去看看？'
    ]);
  }

  private px(v: number): number {
    return v * DaMaHou.S;
  }

  private pxw(v: number): number {
    return v * DaMaHou.S * DaMaHou.WIDTH_SCALE;
  }

  protected createSprite(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(this.x, this.y);
    const bodyY = 0;
    this.pxFunc = this.px.bind(this);
    this.pxwFunc = this.pxw.bind(this);
    const COLORS = DaMaHou.COLORS;
    const px = this.pxFunc;
    const pxw = this.pxwFunc;

    // 地面阴影
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(pxw(0), px(bodyY + 45), pxw(50), px(10));
    container.add(shadow);

    // ==================== 腿部 ====================
    // 左脚
    const leftFoot = this.scene.add.graphics();
    leftFoot.fillStyle(COLORS.FUR_DARK);
    leftFoot.fillEllipse(pxw(-12), px(bodyY + 46), pxw(10), px(6));
    container.add(leftFoot);

    // 右脚
    const rightFoot = this.scene.add.graphics();
    rightFoot.fillStyle(COLORS.FUR_DARK);
    rightFoot.fillEllipse(pxw(8), px(bodyY + 46), pxw(10), px(6));
    container.add(rightFoot);

    // 左腿
    this.leftLeg = this.scene.add.graphics();
    container.add(this.leftLeg);

    // 右腿
    this.rightLeg = this.scene.add.graphics();
    container.add(this.rightLeg);

    // ==================== 身体 ====================
    // 身体暗部
    const bodyDark = this.scene.add.graphics();
    bodyDark.fillStyle(COLORS.FUR_DARK);
    bodyDark.fillEllipse(pxw(3), px(bodyY + 4), pxw(24), px(34));
    container.add(bodyDark);

    // 身体亮部
    const bodyLight = this.scene.add.graphics();
    bodyLight.fillStyle(COLORS.FUR_MID);
    bodyLight.fillEllipse(pxw(0), px(bodyY + 2), pxw(24), px(34));
    container.add(bodyLight);

    // 身体高光
    const bodyHighlight = this.scene.add.graphics();
    bodyHighlight.fillStyle(COLORS.FUR_LIGHT);
    bodyHighlight.fillEllipse(pxw(-5), px(bodyY), pxw(12), px(26));
    container.add(bodyHighlight);

    // 肚子（浅色）
    const belly = this.scene.add.graphics();
    belly.fillStyle(COLORS.FUR_LIGHT);
    belly.fillEllipse(pxw(0), px(bodyY + 12), pxw(14), px(20));
    container.add(belly);

    // ==================== 手臂 ====================
    // 左手
    const leftHand = this.scene.add.graphics();
    leftHand.fillStyle(COLORS.SKIN_MID);
    leftHand.fillEllipse(pxw(-20), px(bodyY + 20), pxw(7), px(6));
    container.add(leftHand);

    // 右手
    const rightHand = this.scene.add.graphics();
    rightHand.fillStyle(COLORS.SKIN_MID);
    rightHand.fillEllipse(pxw(16), px(bodyY + 20), pxw(7), px(6));
    container.add(rightHand);

    // 左臂
    this.leftArm = this.scene.add.graphics();
    container.add(this.leftArm);

    // 右臂
    this.rightArm = this.scene.add.graphics();
    container.add(this.rightArm);

    // ==================== 尾巴 ====================
    this.tail = this.scene.add.graphics();
    container.add(this.tail);

    // ==================== 腰封 ====================
    const belt = this.scene.add.graphics();
    belt.fillStyle(COLORS.BELT);
    belt.fillRect(pxw(-15), px(bodyY + 26), pxw(30), px(6));
    container.add(belt);

    const beltGold = this.scene.add.graphics();
    beltGold.fillStyle(COLORS.GOLD);
    beltGold.fillRect(pxw(-5), px(bodyY + 28), pxw(10), px(2));
    container.add(beltGold);

    // ==================== 衣服（坎肩） ====================
    const vest = this.scene.add.graphics();
    vest.fillStyle(COLORS.VEST);
    vest.fillEllipse(pxw(0), px(bodyY + 6), pxw(22), px(14));
    container.add(vest);

    // ==================== 头部 ====================
    // 脖子
    const neck = this.scene.add.graphics();
    neck.fillStyle(COLORS.FUR_MID);
    neck.fillRect(pxw(-6), px(bodyY - 4), pxw(12), px(12));
    container.add(neck);

    // 头骨
    const head = this.scene.add.graphics();
    head.fillStyle(COLORS.FUR_MID);
    head.fillEllipse(pxw(0), px(bodyY - 18), pxw(28), px(30));
    container.add(head);

    const headDark = this.scene.add.graphics();
    headDark.fillStyle(COLORS.FUR_DARK);
    headDark.fillEllipse(pxw(6), px(bodyY - 16), pxw(12), px(26));
    container.add(headDark);

    // 脸部（心形）
    const face = this.scene.add.graphics();
    face.fillStyle(COLORS.SKIN_MID);
    face.beginPath();
    face.moveTo(pxw(0), px(bodyY - 38));
    face.lineTo(pxw(-13), px(bodyY - 32));
    face.lineTo(pxw(-15), px(bodyY - 22));
    face.lineTo(pxw(-11), px(bodyY - 10));
    face.lineTo(pxw(-5), px(bodyY - 5));
    face.lineTo(pxw(0), px(bodyY - 7));
    face.lineTo(pxw(5), px(bodyY - 5));
    face.lineTo(pxw(11), px(bodyY - 10));
    face.lineTo(pxw(15), px(bodyY - 22));
    face.lineTo(pxw(13), px(bodyY - 32));
    face.fillPath();
    container.add(face);

    // 脸部亮部
    const faceLight = this.scene.add.graphics();
    faceLight.fillStyle(COLORS.SKIN_LIGHT);
    faceLight.beginPath();
    faceLight.moveTo(pxw(-2), px(bodyY - 36));
    faceLight.lineTo(pxw(-11), px(bodyY - 30));
    faceLight.lineTo(pxw(-12), px(bodyY - 22));
    faceLight.lineTo(pxw(-9), px(bodyY - 12));
    faceLight.lineTo(pxw(-3), px(bodyY - 7));
    faceLight.lineTo(pxw(0), px(bodyY - 9));
    faceLight.fillPath();
    container.add(faceLight);

    // 颧骨暗部
    const cheek = this.scene.add.graphics();
    cheek.fillStyle(COLORS.SKIN_SHADOW);
    cheek.fillEllipse(pxw(-13), px(bodyY - 24), pxw(6), px(5));
    cheek.fillEllipse(pxw(13), px(bodyY - 24), pxw(6), px(5));
    container.add(cheek);

    // 下巴阴影
    const chin = this.scene.add.graphics();
    chin.fillStyle(COLORS.SKIN_SHADOW);
    chin.fillEllipse(pxw(0), px(bodyY - 6), pxw(12), px(4));
    container.add(chin);

    // 毛发（头顶）
    for (let i = -3; i <= 3; i++) {
      const fur = this.scene.add.graphics();
      fur.fillStyle(COLORS.FUR_MID);
      fur.beginPath();
      fur.moveTo(pxw(i * 3), px(bodyY - 44));
      fur.lineTo(pxw(i * 5), px(bodyY - 56));
      fur.lineTo(pxw(i * 2), px(bodyY - 50));
      fur.fillPath();
      container.add(fur);
    }

    // ==================== 耳朵 ====================
    // 左耳
    const leftEar = this.scene.add.graphics();
    leftEar.fillStyle(COLORS.FUR_MID);
    leftEar.fillEllipse(pxw(-19), px(bodyY - 26), pxw(10), px(14));
    container.add(leftEar);
    const leftEarInner = this.scene.add.graphics();
    leftEarInner.fillStyle(COLORS.SKIN_LIGHT);
    leftEarInner.fillEllipse(pxw(-20), px(bodyY - 25), pxw(6), px(11));
    container.add(leftEarInner);
    const leftEarHole = this.scene.add.graphics();
    leftEarHole.fillStyle(COLORS.SKIN_SHADOW);
    leftEarHole.fillEllipse(pxw(-21), px(bodyY - 24), pxw(2.5), px(6));
    container.add(leftEarHole);

    // 右耳
    const rightEar = this.scene.add.graphics();
    rightEar.fillStyle(COLORS.FUR_MID);
    rightEar.fillEllipse(pxw(19), px(bodyY - 26), pxw(10), px(14));
    container.add(rightEar);
    const rightEarInner = this.scene.add.graphics();
    rightEarInner.fillStyle(COLORS.SKIN_LIGHT);
    rightEarInner.fillEllipse(pxw(20), px(bodyY - 25), pxw(6), px(11));
    container.add(rightEarInner);
    const rightEarHole = this.scene.add.graphics();
    rightEarHole.fillStyle(COLORS.SKIN_SHADOW);
    rightEarHole.fillEllipse(pxw(21), px(bodyY - 24), pxw(2.5), px(6));
    container.add(rightEarHole);

    // ==================== 眼睛 ====================
    const leftEyeBg = this.scene.add.graphics();
    leftEyeBg.fillStyle(0xFFFFFF);
    leftEyeBg.fillEllipse(pxw(-11), px(bodyY - 28), pxw(5), px(5));
    container.add(leftEyeBg);

    const rightEyeBg = this.scene.add.graphics();
    rightEyeBg.fillStyle(0xFFFFFF);
    rightEyeBg.fillEllipse(pxw(11), px(bodyY - 28), pxw(5), px(5));
    container.add(rightEyeBg);

    const leftEye = this.scene.add.graphics();
    leftEye.fillStyle(COLORS.EYE);
    leftEye.fillEllipse(pxw(-10), px(bodyY - 27), pxw(3), px(4.5));
    container.add(leftEye);

    const rightEye = this.scene.add.graphics();
    rightEye.fillStyle(COLORS.EYE);
    rightEye.fillEllipse(pxw(12), px(bodyY - 27), pxw(3), px(4.5));
    container.add(rightEye);

    const leftHighlight = this.scene.add.graphics();
    leftHighlight.fillStyle(0xFFFFFF);
    leftHighlight.fillCircle(pxw(-12), px(bodyY - 30), pxw(1.5));
    container.add(leftHighlight);

    const rightHighlight = this.scene.add.graphics();
    rightHighlight.fillStyle(0xFFFFFF);
    rightHighlight.fillCircle(pxw(10), px(bodyY - 30), pxw(1.5));
    container.add(rightHighlight);

    // ==================== 眉毛 ====================
    const leftBrow = this.scene.add.graphics();
    leftBrow.fillStyle(COLORS.FUR_DARK);
    leftBrow.fillRect(pxw(-16), px(bodyY - 36), pxw(12), px(3));
    container.add(leftBrow);

    const rightBrow = this.scene.add.graphics();
    rightBrow.fillStyle(COLORS.FUR_DARK);
    rightBrow.fillRect(pxw(4), px(bodyY - 36), pxw(12), px(3));
    container.add(rightBrow);

    // ==================== 鼻子 ====================
    const nose = this.scene.add.graphics();
    nose.fillStyle(COLORS.SKIN_DARK);
    nose.fillEllipse(pxw(0), px(bodyY - 18), pxw(6), px(5));
    container.add(nose);

    const leftNostril = this.scene.add.graphics();
    leftNostril.fillStyle(COLORS.SKIN_SHADOW);
    leftNostril.fillEllipse(pxw(-2), px(bodyY - 17), pxw(1.8), px(1.5));
    container.add(leftNostril);

    const rightNostril = this.scene.add.graphics();
    rightNostril.fillStyle(COLORS.SKIN_SHADOW);
    rightNostril.fillEllipse(pxw(2), px(bodyY - 17), pxw(1.8), px(1.5));
    container.add(rightNostril);

    // ==================== 嘴巴（微笑） ====================
    const mouth = this.scene.add.graphics();
    mouth.fillStyle(COLORS.MOUTH);
    mouth.fillRect(pxw(-4), px(bodyY - 11), pxw(8), px(2));
    container.add(mouth);


    container.setDepth(20);

    // ==================== 启动动画 ====================
    const leftArm = this.leftArm;
    const rightArm = this.rightArm;
    const leftLeg = this.leftLeg;
    const rightLeg = this.rightLeg;
    const tail = this.tail;
    const colors = COLORS;

    let time = 0;
    this.scene.time.addEvent({
      delay: 60,
      callback: () => {
        time += 0.25;
        const swing = Math.sin(time) * 7;
        const legSwing = Math.sin(time) * 5;
        const tailSwing = Math.sin(time * 1.6) * 9;

        // 左臂摆动
        leftArm.clear();
        leftArm.fillStyle(colors.FUR_MID);
        leftArm.fillEllipse(pxw(-18 - swing * 0.4), px(6 + swing * 0.25), pxw(8), px(18));

        // 右臂摆动
        rightArm.clear();
        rightArm.fillStyle(colors.FUR_DARK);
        rightArm.fillEllipse(pxw(14 + swing * 0.4), px(6 - swing * 0.25), pxw(8), px(18));

        // 左腿摆动
        leftLeg.clear();
        leftLeg.fillStyle(colors.FUR_MID);
        leftLeg.fillEllipse(pxw(-10 - legSwing * 0.35), px(32 + legSwing * 0.2), pxw(9), px(16));

        // 右腿摆动
        rightLeg.clear();
        rightLeg.fillStyle(colors.FUR_DARK);
        rightLeg.fillEllipse(pxw(6 + legSwing * 0.35), px(32 - legSwing * 0.2), pxw(9), px(16));

        // 尾巴摆动
        tail.clear();
        tail.fillStyle(colors.FUR_MID);
        tail.beginPath();
        tail.moveTo(pxw(14), px(12));
        tail.lineTo(pxw(22 + tailSwing * 0.5), px(6 + tailSwing * 0.2));
        tail.lineTo(pxw(26 + tailSwing * 0.7), px(0 + tailSwing * 0.15));
        tail.lineTo(pxw(24 + tailSwing * 0.5), px(-4 - tailSwing * 0.08));
        tail.lineTo(pxw(18), px(2));
        tail.fillPath();
      },
      loop: true
    });

    return container;
  }
}