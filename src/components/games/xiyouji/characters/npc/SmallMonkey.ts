// npc/SmallMonkey.ts
import * as Phaser from 'phaser';
import { BaseNPC } from './BaseNPC';
import type { DialogBox } from '../../ui/DialogBox';

export class SmallMonkey extends BaseNPC {


  // 颜色常量
  private static readonly COLORS = {
    SKIN_LIGHT: 0xF5DEB3,
    SKIN_MID: 0xDEB887,
    SKIN_DARK: 0xC4A06A,
    SKIN_SHADOW: 0x9A7A4A,
    FUR_LIGHT: 0x9A7A4A,
    FUR_MID: 0x8B6914,
    FUR_DARK: 0x6B4A10,
    EYE: 0x1A0A00,
    MOUTH: 0x5C3A1A,
    VEST: 0x3A6A1A
  };

  private leftArm!: Phaser.GameObjects.Graphics;
  private rightArm!: Phaser.GameObjects.Graphics;
  private leftLeg!: Phaser.GameObjects.Graphics;
  private rightLeg!: Phaser.GameObjects.Graphics;
  private tail!: Phaser.GameObjects.Graphics;
  private pxFunc!: (v: number) => number;
  private pxwFunc!: (v: number) => number;

   constructor(scene: Phaser.Scene, x: number, y: number, name: string, dialogues: string[], dialogBox: DialogBox) {
    super(scene, x, y, name, dialogues, dialogBox);
  }

  private px(v: number): number {
    return v * SmallMonkey.S;
  }

  private pxw(v: number): number {
    return v * SmallMonkey.S * SmallMonkey.WIDTH_SCALE;
  }

  protected createSprite(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(this.x, this.y);
    const bodyY = 0;
    this.pxFunc = this.px.bind(this);
    this.pxwFunc = this.pxw.bind(this);
    const COLORS = SmallMonkey.COLORS;
    const px = this.pxFunc;
    const pxw = this.pxwFunc;

    // 地面阴影
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(pxw(0), px(bodyY + 42), pxw(45), px(10));
    container.add(shadow);

    // ==================== 腿部 ====================
    // 左脚
    const leftFoot = this.scene.add.graphics();
    leftFoot.fillStyle(COLORS.FUR_DARK);
    leftFoot.fillEllipse(pxw(-11), px(bodyY + 42), pxw(9), px(5));
    container.add(leftFoot);

    // 右脚
    const rightFoot = this.scene.add.graphics();
    rightFoot.fillStyle(COLORS.FUR_DARK);
    rightFoot.fillEllipse(pxw(7), px(bodyY + 42), pxw(9), px(5));
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
    bodyDark.fillEllipse(pxw(3), px(bodyY + 4), pxw(22), px(32));
    container.add(bodyDark);

    // 身体亮部
    const bodyLight = this.scene.add.graphics();
    bodyLight.fillStyle(COLORS.FUR_MID);
    bodyLight.fillEllipse(pxw(0), px(bodyY + 2), pxw(22), px(32));
    container.add(bodyLight);

    // 肚子（浅色）
    const belly = this.scene.add.graphics();
    belly.fillStyle(COLORS.FUR_LIGHT);
    belly.fillEllipse(pxw(0), px(bodyY + 10), pxw(14), px(20));
    container.add(belly);

    // ==================== 手臂 ====================
    // 左手
    const leftHand = this.scene.add.graphics();
    leftHand.fillStyle(COLORS.SKIN_MID);
    leftHand.fillEllipse(pxw(-18), px(bodyY + 18), pxw(6), px(5));
    container.add(leftHand);

    // 右手
    const rightHand = this.scene.add.graphics();
    rightHand.fillStyle(COLORS.SKIN_MID);
    rightHand.fillEllipse(pxw(15), px(bodyY + 18), pxw(6), px(5));
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

    // ==================== 衣服（小褂） ====================
    const vest = this.scene.add.graphics();
    vest.fillStyle(COLORS.VEST);
    vest.fillEllipse(pxw(0), px(bodyY + 6), pxw(18), px(12));
    container.add(vest);

    // ==================== 头部 ====================
    // 脖子
    const neck = this.scene.add.graphics();
    neck.fillStyle(COLORS.FUR_MID);
    neck.fillRect(pxw(-5), px(bodyY - 4), pxw(10), px(10));
    container.add(neck);

    // 头骨
    const head = this.scene.add.graphics();
    head.fillStyle(COLORS.FUR_MID);
    head.fillEllipse(pxw(0), px(bodyY - 17), pxw(24), px(26));
    container.add(head);

    const headDark = this.scene.add.graphics();
    headDark.fillStyle(COLORS.FUR_DARK);
    headDark.fillEllipse(pxw(5), px(bodyY - 15), pxw(10), px(22));
    container.add(headDark);

    // 脸部（圆润猴脸）
    const face = this.scene.add.graphics();
    face.fillStyle(COLORS.SKIN_MID);
    face.beginPath();
    face.moveTo(pxw(0), px(bodyY - 34));
    face.lineTo(pxw(-11), px(bodyY - 28));
    face.lineTo(pxw(-12), px(bodyY - 19));
    face.lineTo(pxw(-9), px(bodyY - 9));
    face.lineTo(pxw(-4), px(bodyY - 5));
    face.lineTo(pxw(0), px(bodyY - 6));
    face.lineTo(pxw(4), px(bodyY - 5));
    face.lineTo(pxw(9), px(bodyY - 9));
    face.lineTo(pxw(12), px(bodyY - 19));
    face.lineTo(pxw(11), px(bodyY - 28));
    face.fillPath();
    container.add(face);

    // 脸部亮部
    const faceLight = this.scene.add.graphics();
    faceLight.fillStyle(COLORS.SKIN_LIGHT);
    faceLight.beginPath();
    faceLight.moveTo(pxw(-2), px(bodyY - 32));
    faceLight.lineTo(pxw(-9), px(bodyY - 26));
    faceLight.lineTo(pxw(-10), px(bodyY - 19));
    faceLight.lineTo(pxw(-7), px(bodyY - 11));
    faceLight.lineTo(pxw(-3), px(bodyY - 7));
    faceLight.lineTo(pxw(0), px(bodyY - 8));
    faceLight.fillPath();
    container.add(faceLight);

    // 腮红（可爱）
    const blush = this.scene.add.graphics();
    blush.fillStyle(0xFFAAAA, 0.5);
    blush.fillEllipse(pxw(-10), px(bodyY - 18), pxw(5), px(3.5));
    blush.fillEllipse(pxw(10), px(bodyY - 18), pxw(5), px(3.5));
    container.add(blush);

    // 下巴阴影
    const chin = this.scene.add.graphics();
    chin.fillStyle(COLORS.SKIN_SHADOW);
    chin.fillEllipse(pxw(0), px(bodyY - 5), pxw(10), px(3));
    container.add(chin);

    // 毛发（头顶）
    for (let i = -2; i <= 2; i++) {
      const fur = this.scene.add.graphics();
      fur.fillStyle(COLORS.FUR_MID);
      fur.beginPath();
      fur.moveTo(pxw(i * 3), px(bodyY - 40));
      fur.lineTo(pxw(i * 4.5), px(bodyY - 50));
      fur.lineTo(pxw(i * 1.5), px(bodyY - 45));
      fur.fillPath();
      container.add(fur);
    }

    // ==================== 耳朵 ====================
    // 左耳
    const leftEar = this.scene.add.graphics();
    leftEar.fillStyle(COLORS.FUR_MID);
    leftEar.fillEllipse(pxw(-16), px(bodyY - 22), pxw(8), px(12));
    container.add(leftEar);
    const leftEarInner = this.scene.add.graphics();
    leftEarInner.fillStyle(COLORS.SKIN_LIGHT);
    leftEarInner.fillEllipse(pxw(-17), px(bodyY - 21), pxw(5), px(9));
    container.add(leftEarInner);

    // 右耳
    const rightEar = this.scene.add.graphics();
    rightEar.fillStyle(COLORS.FUR_MID);
    rightEar.fillEllipse(pxw(16), px(bodyY - 22), pxw(8), px(12));
    container.add(rightEar);
    const rightEarInner = this.scene.add.graphics();
    rightEarInner.fillStyle(COLORS.SKIN_LIGHT);
    rightEarInner.fillEllipse(pxw(17), px(bodyY - 21), pxw(5), px(9));
    container.add(rightEarInner);

    // ==================== 眼睛 ====================
    const leftEyeBg = this.scene.add.graphics();
    leftEyeBg.fillStyle(0xFFFFFF);
    leftEyeBg.fillEllipse(pxw(-9), px(bodyY - 25), pxw(4.5), px(4.5));
    container.add(leftEyeBg);

    const rightEyeBg = this.scene.add.graphics();
    rightEyeBg.fillStyle(0xFFFFFF);
    rightEyeBg.fillEllipse(pxw(9), px(bodyY - 25), pxw(4.5), px(4.5));
    container.add(rightEyeBg);

    const leftEye = this.scene.add.graphics();
    leftEye.fillStyle(COLORS.EYE);
    leftEye.fillEllipse(pxw(-8), px(bodyY - 24), pxw(2.5), px(4));
    container.add(leftEye);

    const rightEye = this.scene.add.graphics();
    rightEye.fillStyle(COLORS.EYE);
    rightEye.fillEllipse(pxw(10), px(bodyY - 24), pxw(2.5), px(4));
    container.add(rightEye);

    const leftHighlight = this.scene.add.graphics();
    leftHighlight.fillStyle(0xFFFFFF);
    leftHighlight.fillCircle(pxw(-10), px(bodyY - 27), pxw(1.2));
    container.add(leftHighlight);

    const rightHighlight = this.scene.add.graphics();
    rightHighlight.fillStyle(0xFFFFFF);
    rightHighlight.fillCircle(pxw(8), px(bodyY - 27), pxw(1.2));
    container.add(rightHighlight);

    // ==================== 眉毛 ====================
    const leftBrow = this.scene.add.graphics();
    leftBrow.fillStyle(COLORS.FUR_DARK);
    leftBrow.fillRect(pxw(-13), px(bodyY - 32), pxw(10), px(2));
    container.add(leftBrow);

    const rightBrow = this.scene.add.graphics();
    rightBrow.fillStyle(COLORS.FUR_DARK);
    rightBrow.fillRect(pxw(3), px(bodyY - 32), pxw(10), px(2));
    container.add(rightBrow);

    // ==================== 鼻子 ====================
    const nose = this.scene.add.graphics();
    nose.fillStyle(COLORS.SKIN_DARK);
    nose.fillEllipse(pxw(0), px(bodyY - 16), pxw(4.5), px(3.5));
    container.add(nose);

    const leftNostril = this.scene.add.graphics();
    leftNostril.fillStyle(COLORS.SKIN_SHADOW);
    leftNostril.fillEllipse(pxw(-1.5), px(bodyY - 15), pxw(1.2), px(1));
    container.add(leftNostril);

    const rightNostril = this.scene.add.graphics();
    rightNostril.fillStyle(COLORS.SKIN_SHADOW);
    rightNostril.fillEllipse(pxw(1.5), px(bodyY - 15), pxw(1.2), px(1));
    container.add(rightNostril);

    // ==================== 嘴巴（微笑） ====================
    const mouth = this.scene.add.graphics();
    mouth.fillStyle(COLORS.MOUTH);
    mouth.fillRect(pxw(-3), px(bodyY - 10), pxw(6), px(2));
    container.add(mouth);

    // 牙齿（可爱）
    const tooth = this.scene.add.graphics();
    tooth.fillStyle(0xFFFFFF);
    tooth.fillRect(pxw(-1.5), px(bodyY - 11), pxw(1.5), px(1.5));
    tooth.fillRect(pxw(0), px(bodyY - 11), pxw(1.5), px(1.5));
    container.add(tooth);

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
        time += 0.3;
        const swing = Math.sin(time) * 6;
        const legSwing = Math.sin(time) * 4;
        const tailSwing = Math.sin(time * 1.8) * 7;

        // 左臂摆动
        leftArm.clear();
        leftArm.fillStyle(colors.FUR_MID);
        leftArm.fillEllipse(pxw(-16 - swing * 0.35), px(6 + swing * 0.2), pxw(7), px(16));

        // 右臂摆动
        rightArm.clear();
        rightArm.fillStyle(colors.FUR_DARK);
        rightArm.fillEllipse(pxw(13 + swing * 0.35), px(6 - swing * 0.2), pxw(7), px(16));

        // 左腿摆动
        leftLeg.clear();
        leftLeg.fillStyle(colors.FUR_MID);
        leftLeg.fillEllipse(pxw(-9 - legSwing * 0.3), px(30 + legSwing * 0.15), pxw(8), px(14));

        // 右腿摆动
        rightLeg.clear();
        rightLeg.fillStyle(colors.FUR_DARK);
        rightLeg.fillEllipse(pxw(5 + legSwing * 0.3), px(30 - legSwing * 0.15), pxw(8), px(14));

        // 尾巴摆动
        tail.clear();
        tail.fillStyle(colors.FUR_MID);
        tail.beginPath();
        tail.moveTo(pxw(14), px(10));
        tail.lineTo(pxw(20 + tailSwing * 0.4), px(4 + tailSwing * 0.15));
        tail.lineTo(pxw(23 + tailSwing * 0.6), px(-2 + tailSwing * 0.1));
        tail.lineTo(pxw(20 + tailSwing * 0.4), px(-6 - tailSwing * 0.05));
        tail.lineTo(pxw(16), px(2));
        tail.fillPath();
      },
      loop: true
    });

    return container;
  }
}