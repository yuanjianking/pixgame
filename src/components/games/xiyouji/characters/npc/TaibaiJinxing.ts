// npc/TaibaiJinxing.ts
import * as Phaser from 'phaser';
import { BaseNPC } from './BaseNPC';
import type { DialogBox } from '../../ui/DialogBox';

export class TaibaiJinxing extends BaseNPC {
  private static readonly COLORS = {
    SKIN_LIGHT: 0xF5DEB3,
    SKIN_MID: 0xEED9B7,
    SKIN_DARK: 0xD4A06A,
    SKIN_SHADOW: 0xC49060,
    ROBE_WHITE: 0xFFFFFF,
    ROBE_LIGHT: 0xF5F5F5,
    ROBE_MID: 0xE8E8E8,
    ROBE_SHADOW: 0xD0D0D0,
    GOLD: 0xFFD700,
    GOLD_DARK: 0xDAA520,
    SASH_BLUE: 0x87CEEB,
    SASH_BLUE_DARK: 0x6BB3D9,
    HAIR_WHITE: 0xFFFFFF,
    HAIR_LIGHT: 0xF0F0F0,
    HAIR_SHADOW: 0xE0E0E0,
    BEARD_WHITE: 0xFFFFFF,
    BEARD_LIGHT: 0xF0F0F0,
    BEARD_SHADOW: 0xE0E0E0,
    EYE: 0x1A0A00,
    MOUTH: 0x8B5A3A,
    TABLET_JADE: 0xAACFCF,
    TABLET_DARK: 0x8FB5B5,
    HAIRPIN: 0xFFD700,
  };

  private leftArm!: Phaser.GameObjects.Graphics;
  private rightArm!: Phaser.GameObjects.Graphics;
  private pxFunc!: (v: number) => number;
  private pxwFunc!: (v: number) => number;

  constructor(scene: Phaser.Scene, x: number, y: number, name: string, dialogues: string[], dialogBox: DialogBox) {
    super(scene, x, y, name, dialogues, dialogBox);
  }

  private px(v: number): number {
    return v * TaibaiJinxing.S;
  }

  private pxw(v: number): number {
    return v * TaibaiJinxing.S * TaibaiJinxing.WIDTH_SCALE;
  }

  protected createSprite(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(this.x, this.y);
    const bodyY = 0;
    this.pxFunc = this.px.bind(this);
    this.pxwFunc = this.pxw.bind(this);
    const C = TaibaiJinxing.COLORS;
    const px = this.pxFunc;
    const pxw = this.pxwFunc;

    // 地面阴影
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(pxw(0), px(bodyY + 52), pxw(55), px(10));
    container.add(shadow);

    // ==================== 脚部 ====================
    // 左脚（黑鞋）
    const leftFoot = this.scene.add.graphics();
    leftFoot.fillStyle(0x333333);
    leftFoot.fillEllipse(pxw(-11), px(bodyY + 50), pxw(10), px(6));
    container.add(leftFoot);

    // 右脚
    const rightFoot = this.scene.add.graphics();
    rightFoot.fillStyle(0x333333);
    rightFoot.fillEllipse(pxw(11), px(bodyY + 50), pxw(10), px(6));
    container.add(rightFoot);

    // ==================== 腿部（白袍下摆） ====================
    const lowerRobe = this.scene.add.graphics();
    lowerRobe.fillStyle(C.ROBE_SHADOW);
    lowerRobe.fillEllipse(pxw(2), px(bodyY + 38), pxw(40), px(28));
    container.add(lowerRobe);

    const lowerRobeMid = this.scene.add.graphics();
    lowerRobeMid.fillStyle(C.ROBE_MID);
    lowerRobeMid.fillEllipse(pxw(0), px(bodyY + 36), pxw(38), px(26));
    container.add(lowerRobeMid);

    // ==================== 身体（白袍主体） ====================
    // 袍子暗部
    const robeDark = this.scene.add.graphics();
    robeDark.fillStyle(C.ROBE_SHADOW);
    robeDark.fillEllipse(pxw(3), px(bodyY + 10), pxw(36), px(42));
    container.add(robeDark);

    // 袍子中调
    const robeMid = this.scene.add.graphics();
    robeMid.fillStyle(C.ROBE_MID);
    robeMid.fillEllipse(pxw(0), px(bodyY + 8), pxw(34), px(42));
    container.add(robeMid);

    // 袍子亮部
    const robeLight = this.scene.add.graphics();
    robeLight.fillStyle(C.ROBE_LIGHT);
    robeLight.fillEllipse(pxw(-4), px(bodyY + 6), pxw(22), px(36));
    container.add(robeLight);

    // 袍子高光（胸前）
    const robeHighlight = this.scene.add.graphics();
    robeHighlight.fillStyle(C.ROBE_WHITE);
    robeHighlight.fillEllipse(pxw(-3), px(bodyY + 2), pxw(16), px(28));
    container.add(robeHighlight);

    // ==================== 金边装饰（袍缘） ====================
    const robeTrim = this.scene.add.graphics();
    robeTrim.fillStyle(C.GOLD, 0.85);
    robeTrim.fillRect(pxw(-19), px(bodyY + 36), pxw(38), px(4));
    container.add(robeTrim);

    const robeTrimHighlight = this.scene.add.graphics();
    robeTrimHighlight.fillStyle(C.GOLD_DARK, 0.7);
    robeTrimHighlight.fillRect(pxw(-17), px(bodyY + 37), pxw(34), px(2));
    container.add(robeTrimHighlight);

    // 领口金边
    const collar = this.scene.add.graphics();
    collar.fillStyle(C.GOLD, 0.8);
    collar.fillRect(pxw(-8), px(bodyY - 6), pxw(16), px(3));
    container.add(collar);

    // ==================== 腰带 ====================
    const belt = this.scene.add.graphics();
    belt.fillStyle(C.GOLD_DARK);
    belt.fillRect(pxw(-16), px(bodyY + 26), pxw(32), px(5));
    container.add(belt);

    const beltLight = this.scene.add.graphics();
    beltLight.fillStyle(C.GOLD);
    beltLight.fillRect(pxw(-14), px(bodyY + 27), pxw(28), px(2));
    container.add(beltLight);

    const beltBuckle = this.scene.add.graphics();
    beltBuckle.fillStyle(0xFF6600);
    beltBuckle.fillRect(pxw(-3), px(bodyY + 25), pxw(6), px(7));
    container.add(beltBuckle);

    // ==================== 飘带/绶带 ====================
    const sash = this.scene.add.graphics();
    sash.fillStyle(C.SASH_BLUE_DARK);
    sash.beginPath();
    sash.moveTo(pxw(-14), px(bodyY + 8));
    sash.lineTo(pxw(-20), px(bodyY + 24));
    sash.lineTo(pxw(-16), px(bodyY + 24));
    sash.lineTo(pxw(-10), px(bodyY + 10));
    sash.fillPath();
    container.add(sash);

    const sashLight = this.scene.add.graphics();
    sashLight.fillStyle(C.SASH_BLUE);
    sashLight.beginPath();
    sashLight.moveTo(pxw(-8), px(bodyY + 6));
    sashLight.lineTo(pxw(8), px(bodyY + 6));
    sashLight.lineTo(pxw(12), px(bodyY + 10));
    sashLight.lineTo(pxw(-4), px(bodyY + 10));
    sashLight.fillPath();
    container.add(sashLight);

    // ==================== 袖子 ====================
    // 左袖（宽大垂袖）
    const leftSleeve = this.scene.add.graphics();
    leftSleeve.fillStyle(C.ROBE_MID);
    leftSleeve.fillEllipse(pxw(-24), px(bodyY + 14), pxw(14), px(22));
    container.add(leftSleeve);

    const leftSleeveLight = this.scene.add.graphics();
    leftSleeveLight.fillStyle(C.ROBE_LIGHT);
    leftSleeveLight.fillEllipse(pxw(-23), px(bodyY + 12), pxw(10), px(18));
    container.add(leftSleeveLight);

    // 右袖（持玉笏）
    this.rightArm = this.scene.add.graphics();

    const rightSleeve = this.scene.add.graphics();
    rightSleeve.fillStyle(C.ROBE_MID);
    rightSleeve.fillEllipse(pxw(22), px(bodyY + 14), pxw(14), px(20));
    container.add(rightSleeve);

    const rightSleeveLight = this.scene.add.graphics();
    rightSleeveLight.fillStyle(C.ROBE_LIGHT);
    rightSleeveLight.fillEllipse(pxw(21), px(bodyY + 12), pxw(10), px(16));
    container.add(rightSleeveLight);

    // ==================== 玉笏（持于右手） ====================
    const tablet = this.scene.add.graphics();
    tablet.fillStyle(C.TABLET_DARK);
    tablet.fillRect(pxw(28), px(bodyY - 4), pxw(5), px(20));
    container.add(tablet);

    const tabletLight = this.scene.add.graphics();
    tabletLight.fillStyle(C.TABLET_JADE);
    tabletLight.fillRect(pxw(29), px(bodyY - 2), pxw(3), px(16));
    container.add(tabletLight);

    const tabletTop = this.scene.add.graphics();
    tabletTop.fillStyle(C.GOLD, 0.8);
    tabletTop.fillRect(pxw(27), px(bodyY - 6), pxw(7), px(3));
    container.add(tabletTop);

    // ==================== 脖子 ====================
    const neck = this.scene.add.graphics();
    neck.fillStyle(C.SKIN_MID);
    neck.fillRect(pxw(-5), px(bodyY - 6), pxw(10), px(8));
    container.add(neck);

    // ==================== 头部 ====================
    // 头部暗部
    const headDark = this.scene.add.graphics();
    headDark.fillStyle(C.SKIN_DARK);
    headDark.fillEllipse(pxw(3), px(bodyY - 24), pxw(26), px(30));
    container.add(headDark);

    // 头部中调
    const headMid = this.scene.add.graphics();
    headMid.fillStyle(C.SKIN_MID);
    headMid.fillEllipse(pxw(0), px(bodyY - 24), pxw(26), px(30));
    container.add(headMid);

    // 面部亮部
    const faceLight = this.scene.add.graphics();
    faceLight.fillStyle(C.SKIN_LIGHT);
    faceLight.fillEllipse(pxw(-3), px(bodyY - 26), pxw(16), px(22));
    container.add(faceLight);

    // 颧骨暗部（年迈褶皱）
    const cheekLeft = this.scene.add.graphics();
    cheekLeft.fillStyle(C.SKIN_SHADOW);
    cheekLeft.fillEllipse(pxw(-13), px(bodyY - 20), pxw(6), px(5));
    container.add(cheekLeft);

    const cheekRight = this.scene.add.graphics();
    cheekRight.fillStyle(C.SKIN_SHADOW);
    cheekRight.fillEllipse(pxw(13), px(bodyY - 20), pxw(6), px(5));
    container.add(cheekRight);

    // 额头纹
    const foreheadLine = this.scene.add.graphics();
    foreheadLine.fillStyle(C.SKIN_SHADOW, 0.6);
    foreheadLine.fillRect(pxw(-8), px(bodyY - 34), pxw(16), px(2));
    container.add(foreheadLine);

    // 眼角纹（左）
    const eyeLineL = this.scene.add.graphics();
    eyeLineL.fillStyle(C.SKIN_SHADOW, 0.5);
    eyeLineL.fillRect(pxw(-16), px(bodyY - 26), pxw(5), px(1.5));
    container.add(eyeLineL);

    // 眼角纹（右）
    const eyeLineR = this.scene.add.graphics();
    eyeLineR.fillStyle(C.SKIN_SHADOW, 0.5);
    eyeLineR.fillRect(pxw(11), px(bodyY - 26), pxw(5), px(1.5));
    container.add(eyeLineR);

    // ==================== 眼睛（慈祥眯眼） ====================
    const leftEyeBg = this.scene.add.graphics();
    leftEyeBg.fillStyle(0xFFFFFF);
    leftEyeBg.fillEllipse(pxw(-10), px(bodyY - 26), pxw(5), px(4));
    container.add(leftEyeBg);

    const rightEyeBg = this.scene.add.graphics();
    rightEyeBg.fillStyle(0xFFFFFF);
    rightEyeBg.fillEllipse(pxw(10), px(bodyY - 26), pxw(5), px(4));
    container.add(rightEyeBg);

    const leftEye = this.scene.add.graphics();
    leftEye.fillStyle(C.EYE);
    leftEye.fillEllipse(pxw(-9), px(bodyY - 25), pxw(2.5), px(2));
    container.add(leftEye);

    const rightEye = this.scene.add.graphics();
    rightEye.fillStyle(C.EYE);
    rightEye.fillEllipse(pxw(11), px(bodyY - 25), pxw(2.5), px(2));
    container.add(rightEye);

    const leftHighlight = this.scene.add.graphics();
    leftHighlight.fillStyle(0xFFFFFF);
    leftHighlight.fillCircle(pxw(-10.5), px(bodyY - 27), pxw(1));
    container.add(leftHighlight);

    const rightHighlight = this.scene.add.graphics();
    rightHighlight.fillStyle(0xFFFFFF);
    rightHighlight.fillCircle(pxw(9.5), px(bodyY - 27), pxw(1));
    container.add(rightHighlight);

    // 眼袋（年迈）
    const eyeBagL = this.scene.add.graphics();
    eyeBagL.fillStyle(C.SKIN_SHADOW, 0.4);
    eyeBagL.fillEllipse(pxw(-10), px(bodyY - 22), pxw(7), px(3));
    container.add(eyeBagL);

    const eyeBagR = this.scene.add.graphics();
    eyeBagR.fillStyle(C.SKIN_SHADOW, 0.4);
    eyeBagR.fillEllipse(pxw(10), px(bodyY - 22), pxw(7), px(3));
    container.add(eyeBagR);

    // ==================== 眉毛（白色长眉） ====================
    const leftBrow = this.scene.add.graphics();
    leftBrow.fillStyle(C.HAIR_WHITE);
    leftBrow.beginPath();
    leftBrow.moveTo(pxw(-3), px(bodyY - 36));
    leftBrow.lineTo(pxw(-18), px(bodyY - 32));
    leftBrow.lineTo(pxw(-16), px(bodyY - 30));
    leftBrow.lineTo(pxw(-3), px(bodyY - 34));
    leftBrow.fillPath();
    container.add(leftBrow);

    const rightBrow = this.scene.add.graphics();
    rightBrow.fillStyle(C.HAIR_WHITE);
    rightBrow.beginPath();
    rightBrow.moveTo(pxw(3), px(bodyY - 36));
    rightBrow.lineTo(pxw(18), px(bodyY - 32));
    rightBrow.lineTo(pxw(16), px(bodyY - 30));
    rightBrow.lineTo(pxw(3), px(bodyY - 34));
    rightBrow.fillPath();
    container.add(rightBrow);

    // 眉毛阴影
    const leftBrowShadow = this.scene.add.graphics();
    leftBrowShadow.fillStyle(C.HAIR_SHADOW, 0.5);
    leftBrowShadow.fillRect(pxw(-17), px(bodyY - 31), pxw(14), px(2));
    container.add(leftBrowShadow);

    const rightBrowShadow = this.scene.add.graphics();
    rightBrowShadow.fillStyle(C.HAIR_SHADOW, 0.5);
    rightBrowShadow.fillRect(pxw(3), px(bodyY - 31), pxw(14), px(2));
    container.add(rightBrowShadow);

    // ==================== 长白胡须（标志性特征） ====================
    // 胡须 - 上段（下巴处）
    const beardTop = this.scene.add.graphics();
    beardTop.fillStyle(C.BEARD_WHITE);
    beardTop.beginPath();
    beardTop.moveTo(pxw(-10), px(bodyY - 10));
    beardTop.lineTo(pxw(0), px(bodyY + 22));
    beardTop.lineTo(pxw(10), px(bodyY - 10));
    beardTop.fillPath();
    container.add(beardTop);

    // 胡须 - 中段（分层增加体积）
    const beardMid = this.scene.add.graphics();
    beardMid.fillStyle(C.BEARD_LIGHT);
    beardMid.beginPath();
    beardMid.moveTo(pxw(-8), px(bodyY - 8));
    beardMid.lineTo(pxw(-2), px(bodyY + 24));
    beardMid.lineTo(pxw(6), px(bodyY - 6));
    beardMid.fillPath();
    container.add(beardMid);

    // 胡须 - 左侧飘散
    const beardLeft = this.scene.add.graphics();
    beardLeft.fillStyle(C.BEARD_LIGHT);
    beardLeft.beginPath();
    beardLeft.moveTo(pxw(-10), px(bodyY - 8));
    beardLeft.lineTo(pxw(-16), px(bodyY + 8));
    beardLeft.lineTo(pxw(-14), px(bodyY - 2));
    beardLeft.lineTo(pxw(-6), px(bodyY - 10));
    beardLeft.fillPath();
    container.add(beardLeft);

    // 胡须 - 右侧飘散
    const beardRight = this.scene.add.graphics();
    beardRight.fillStyle(C.BEARD_LIGHT);
    beardRight.beginPath();
    beardRight.moveTo(pxw(10), px(bodyY - 8));
    beardRight.lineTo(pxw(16), px(bodyY + 8));
    beardRight.lineTo(pxw(14), px(bodyY - 2));
    beardRight.lineTo(pxw(6), px(bodyY - 10));
    beardRight.fillPath();
    container.add(beardRight);

    // 胡须 - 阴影纹理线
    const beardLine = this.scene.add.graphics();
    beardLine.fillStyle(C.BEARD_SHADOW, 0.4);
    beardLine.fillRect(pxw(-1), px(bodyY - 6), pxw(2), px(22));
    container.add(beardLine);

    // 胡须 - 第二根
    const beardLine2 = this.scene.add.graphics();
    beardLine2.fillStyle(C.BEARD_SHADOW, 0.3);
    beardLine2.fillRect(pxw(-5), px(bodyY - 4), pxw(1.5), px(18));
    container.add(beardLine2);

    const beardLine3 = this.scene.add.graphics();
    beardLine3.fillStyle(C.BEARD_SHADOW, 0.3);
    beardLine3.fillRect(pxw(4), px(bodyY - 4), pxw(1.5), px(18));
    container.add(beardLine3);

    // 嘴巴（在胡须后面，隐约可见）
    const mouth = this.scene.add.graphics();
    mouth.fillStyle(C.MOUTH);
    mouth.fillRect(pxw(-3), px(bodyY - 8), pxw(6), px(2));
    container.add(mouth);

    // ==================== 鼻子 ====================
    const nose = this.scene.add.graphics();
    nose.fillStyle(C.SKIN_DARK);
    nose.fillEllipse(pxw(0), px(bodyY - 16), pxw(4), px(4));
    container.add(nose);

    // ==================== 头发（白发髻） ====================
    // 头发主体
    const hair = this.scene.add.graphics();
    hair.fillStyle(C.HAIR_LIGHT);
    hair.fillEllipse(pxw(0), px(bodyY - 38), pxw(24), px(16));
    container.add(hair);

    const hairDark = this.scene.add.graphics();
    hairDark.fillStyle(C.HAIR_SHADOW);
    hairDark.fillEllipse(pxw(5), px(bodyY - 37), pxw(12), px(14));
    container.add(hairDark);

    // 发髻
    const bun = this.scene.add.graphics();
    bun.fillStyle(C.HAIR_LIGHT);
    bun.fillEllipse(pxw(2), px(bodyY - 48), pxw(14), px(14));
    container.add(bun);

    const bunHighlight = this.scene.add.graphics();
    bunHighlight.fillStyle(C.HAIR_WHITE);
    bunHighlight.fillEllipse(pxw(0), px(bodyY - 50), pxw(10), px(10));
    container.add(bunHighlight);

    // 金簪
    const hairpin = this.scene.add.graphics();
    hairpin.fillStyle(C.HAIRPIN);
    hairpin.fillRect(pxw(-8), px(bodyY - 50), pxw(6), px(3));
    container.add(hairpin);

    const hairpinHead = this.scene.add.graphics();
    hairpinHead.fillStyle(0xFFAA00);
    hairpinHead.fillCircle(pxw(-9), px(bodyY - 48.5), pxw(2.5));
    container.add(hairpinHead);

    // 耳朵
    const leftEar = this.scene.add.graphics();
    leftEar.fillStyle(C.SKIN_MID);
    leftEar.fillEllipse(pxw(-18), px(bodyY - 22), pxw(8), px(12));
    container.add(leftEar);

    const rightEar = this.scene.add.graphics();
    rightEar.fillStyle(C.SKIN_MID);
    rightEar.fillEllipse(pxw(18), px(bodyY - 22), pxw(8), px(12));
    container.add(rightEar);

    container.setDepth(20);

    // ==================== 动画 ====================
    const rightArm = this.rightArm;
    const colors = C;

    let time = 0;
    this.scene.time.addEvent({
      delay: 80,
      callback: () => {
        time += 0.2;
        const swing = Math.sin(time) * 4;

        // 右臂（持玉笏）轻微晃动
        rightArm.clear();
        rightArm.fillStyle(colors.ROBE_MID);
        rightArm.fillEllipse(pxw(24 + swing * 0.2), px(bodyY + 10 + swing * 0.1), pxw(8), px(18));
      },
      loop: true,
    });

    return container;
  }
}
