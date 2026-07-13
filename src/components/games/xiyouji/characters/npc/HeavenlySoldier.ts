// npc/HeavenlySoldier.ts
import * as Phaser from 'phaser';
import { BaseNPC } from './BaseNPC';
import type { DialogBox } from '../../ui/DialogBox';

export class HeavenlySoldier extends BaseNPC {
  private static readonly COLORS = {
    ARMOR_GOLD: 0xFFD700,
    ARMOR_MID: 0xDAA520,
    ARMOR_DARK: 0xB8860B,
    ARMOR_SHADOW: 0x8B6914,
    ARMOR_RIM: 0xFFF8DC,
    CAPE_RED: 0xCC3333,
    CAPE_DARK: 0x992222,
    SKIRT_RED: 0xCC3333,
    SKIRT_DARK: 0x992222,
    PLUME_RED: 0xDD4444,
    PLUME_DARK: 0xAA2222,
    BOOT_DARK: 0x4A4A4A,
    BOOT_MID: 0x5A5A5A,
    VISOR_DARK: 0x333333,
    MIRROR_RED: 0xFF4444,
    BELT_LEATHER: 0x8B5A3A,
    SPEAR_SHAFT: 0x8B6914,
    SPEAR_BLADE: 0xC0C0C0,
    SPEAR_HIGHLIGHT: 0xE0E0E0,
    SKIN_MID: 0xDEB887,
    SKIN_DARK: 0xC4A06A,
    EYE: 0x1A0A00,
  };

  private leftArm!: Phaser.GameObjects.Graphics;
  private rightArm!: Phaser.GameObjects.Graphics;
  private cape!: Phaser.GameObjects.Graphics;
  private spearBlade!: Phaser.GameObjects.Graphics;
  private pxFunc!: (v: number) => number;
  private pxwFunc!: (v: number) => number;

  constructor(scene: Phaser.Scene, x: number, y: number, name: string, dialogues: string[], dialogBox: DialogBox) {
    super(scene, x, y, name, dialogues, dialogBox);
  }

  private px(v: number): number {
    return v * HeavenlySoldier.S;
  }

  private pxw(v: number): number {
    return v * HeavenlySoldier.S * HeavenlySoldier.WIDTH_SCALE;
  }

  protected createSprite(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(this.x, this.y);
    const bodyY = 0;
    this.pxFunc = this.px.bind(this);
    this.pxwFunc = this.pxw.bind(this);
    const C = HeavenlySoldier.COLORS;
    const px = this.pxFunc;
    const pxw = this.pxwFunc;

    // 地面阴影
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(pxw(0), px(bodyY + 50), pxw(50), px(10));
    container.add(shadow);

    // ==================== 披风（在身体后面） ====================
    this.cape = this.scene.add.graphics();

    const capeBase = this.scene.add.graphics();
    capeBase.fillStyle(C.CAPE_DARK);
    capeBase.beginPath();
    capeBase.moveTo(pxw(-16), px(bodyY - 10));
    capeBase.lineTo(pxw(-22), px(bodyY + 30));
    capeBase.lineTo(pxw(22), px(bodyY + 30));
    capeBase.lineTo(pxw(16), px(bodyY - 10));
    capeBase.fillPath();
    container.add(capeBase);

    const capeLight = this.scene.add.graphics();
    capeLight.fillStyle(C.CAPE_RED);
    capeLight.beginPath();
    capeLight.moveTo(pxw(-14), px(bodyY - 8));
    capeLight.lineTo(pxw(-18), px(bodyY + 28));
    capeLight.lineTo(pxw(18), px(bodyY + 28));
    capeLight.lineTo(pxw(14), px(bodyY - 8));
    capeLight.fillPath();
    container.add(capeLight);

    // ==================== 战靴 ====================
    const leftBoot = this.scene.add.graphics();
    leftBoot.fillStyle(C.BOOT_DARK);
    leftBoot.fillEllipse(pxw(-12), px(bodyY + 46), pxw(12), px(8));
    container.add(leftBoot);

    const rightBoot = this.scene.add.graphics();
    rightBoot.fillStyle(C.BOOT_DARK);
    rightBoot.fillEllipse(pxw(12), px(bodyY + 46), pxw(12), px(8));
    container.add(rightBoot);

    const leftBootTop = this.scene.add.graphics();
    leftBootTop.fillStyle(C.BOOT_MID);
    leftBootTop.fillRect(pxw(-16), px(bodyY + 38), pxw(8), px(10));
    container.add(leftBootTop);

    const rightBootTop = this.scene.add.graphics();
    rightBootTop.fillStyle(C.BOOT_MID);
    rightBootTop.fillRect(pxw(8), px(bodyY + 38), pxw(8), px(10));
    container.add(rightBootTop);

    // ==================== 腿甲 ====================
    const leftLeg = this.scene.add.graphics();
    leftLeg.fillStyle(C.ARMOR_MID);
    leftLeg.fillRect(pxw(-14), px(bodyY + 24), pxw(8), px(16));
    container.add(leftLeg);

    const rightLeg = this.scene.add.graphics();
    rightLeg.fillStyle(C.ARMOR_MID);
    rightLeg.fillRect(pxw(6), px(bodyY + 24), pxw(8), px(16));
    container.add(rightLeg);

    // 腿甲金边
    const legTrimL = this.scene.add.graphics();
    legTrimL.fillStyle(C.ARMOR_GOLD);
    legTrimL.fillRect(pxw(-14), px(bodyY + 36), pxw(8), px(3));
    container.add(legTrimL);

    const legTrimR = this.scene.add.graphics();
    legTrimR.fillStyle(C.ARMOR_GOLD);
    legTrimR.fillRect(pxw(6), px(bodyY + 36), pxw(8), px(3));
    container.add(legTrimR);

    // ==================== 红色战裙 ====================
    const skirt = this.scene.add.graphics();
    skirt.fillStyle(C.SKIRT_DARK);
    skirt.fillRect(pxw(-18), px(bodyY + 18), pxw(36), px(10));
    container.add(skirt);

    const skirtLight = this.scene.add.graphics();
    skirtLight.fillStyle(C.SKIRT_RED);
    skirtLight.fillRect(pxw(-16), px(bodyY + 19), pxw(32), px(8));
    container.add(skirtLight);

    // 战裙分叉装饰
    const skirtSplit = this.scene.add.graphics();
    skirtSplit.fillStyle(C.ARMOR_GOLD, 0.7);
    skirtSplit.fillRect(pxw(-2), px(bodyY + 20), pxw(4), px(6));
    container.add(skirtSplit);

    // ==================== 躯干铠甲 ====================
    // 铠甲暗部
    const armorDark = this.scene.add.graphics();
    armorDark.fillStyle(C.ARMOR_DARK);
    armorDark.fillEllipse(pxw(2), px(bodyY + 4), pxw(34), px(34));
    container.add(armorDark);

    // 铠甲中调
    const armorMid = this.scene.add.graphics();
    armorMid.fillStyle(C.ARMOR_MID);
    armorMid.fillEllipse(pxw(0), px(bodyY + 2), pxw(32), px(34));
    container.add(armorMid);

    // 铠甲亮部
    const armorLight = this.scene.add.graphics();
    armorLight.fillStyle(C.ARMOR_GOLD);
    armorLight.fillEllipse(pxw(-2), px(bodyY), pxw(24), px(30));
    container.add(armorLight);

    // 铠甲高光
    const armorHighlight = this.scene.add.graphics();
    armorHighlight.fillStyle(C.ARMOR_RIM);
    armorHighlight.fillEllipse(pxw(-5), px(bodyY - 2), pxw(12), px(20));
    container.add(armorHighlight);

    // 铠甲纹理线（横纹）
    for (let i = 0; i < 4; i++) {
      const line = this.scene.add.graphics();
      line.fillStyle(C.ARMOR_DARK, 0.4);
      line.fillRect(pxw(-14), px(bodyY - 4 + i * 6), pxw(28), px(1.5));
      container.add(line);
    }

    // 护心镜
    const mirror = this.scene.add.graphics();
    mirror.fillStyle(C.MIRROR_RED);
    mirror.fillEllipse(pxw(0), px(bodyY + 4), pxw(12), px(10));
    container.add(mirror);

    const mirrorRim = this.scene.add.graphics();
    mirrorRim.fillStyle(C.ARMOR_GOLD);
    mirrorRim.strokeEllipse(pxw(0), px(bodyY + 4), pxw(13), px(11));
    container.add(mirrorRim);

    const mirrorHighlight = this.scene.add.graphics();
    mirrorHighlight.fillStyle(0xFF8888, 0.6);
    mirrorHighlight.fillEllipse(pxw(-2), px(bodyY + 2), pxw(5), px(4));
    container.add(mirrorHighlight);

    // ==================== 肩甲 ====================
    const leftPauldron = this.scene.add.graphics();
    leftPauldron.fillStyle(C.ARMOR_MID);
    leftPauldron.fillEllipse(pxw(-20), px(bodyY + 2), pxw(12), px(16));
    container.add(leftPauldron);

    const leftPauldronLight = this.scene.add.graphics();
    leftPauldronLight.fillStyle(C.ARMOR_GOLD);
    leftPauldronLight.fillEllipse(pxw(-19), px(bodyY + 1), pxw(8), px(12));
    container.add(leftPauldronLight);

    const rightPauldron = this.scene.add.graphics();
    rightPauldron.fillStyle(C.ARMOR_MID);
    rightPauldron.fillEllipse(pxw(20), px(bodyY + 2), pxw(12), px(16));
    container.add(rightPauldron);

    const rightPauldronLight = this.scene.add.graphics();
    rightPauldronLight.fillStyle(C.ARMOR_GOLD);
    rightPauldronLight.fillEllipse(pxw(19), px(bodyY + 1), pxw(8), px(12));
    container.add(rightPauldronLight);

    // ==================== 腰带 ====================
    const belt = this.scene.add.graphics();
    belt.fillStyle(C.BELT_LEATHER);
    belt.fillRect(pxw(-16), px(bodyY + 16), pxw(32), px(4));
    container.add(belt);

    const beltGold = this.scene.add.graphics();
    beltGold.fillStyle(C.ARMOR_GOLD);
    beltGold.fillRect(pxw(-4), px(bodyY + 16), pxw(8), px(4));
    container.add(beltGold);

    // 腰带扣
    const buckle = this.scene.add.graphics();
    buckle.fillStyle(C.ARMOR_GOLD);
    buckle.fillRect(pxw(-3), px(bodyY + 15), pxw(6), px(6));
    container.add(buckle);

    const buckleInner = this.scene.add.graphics();
    buckleInner.fillStyle(C.MIRROR_RED);
    buckleInner.fillRect(pxw(-2), px(bodyY + 16), pxw(4), px(4));
    container.add(buckleInner);

    // ==================== 护颈 ====================
    const neckGuard = this.scene.add.graphics();
    neckGuard.fillStyle(C.ARMOR_MID);
    neckGuard.fillRect(pxw(-8), px(bodyY - 8), pxw(16), px(6));
    container.add(neckGuard);

    const neckGuardRim = this.scene.add.graphics();
    neckGuardRim.fillStyle(C.ARMOR_GOLD);
    neckGuardRim.fillRect(pxw(-7), px(bodyY - 6), pxw(14), px(2));
    container.add(neckGuardRim);

    // ==================== 头部 ====================
    // 脸部
    const face = this.scene.add.graphics();
    face.fillStyle(C.SKIN_MID);
    face.fillEllipse(pxw(0), px(bodyY - 20), pxw(18), px(20));
    container.add(face);

    const faceDark = this.scene.add.graphics();
    faceDark.fillStyle(C.SKIN_DARK);
    faceDark.fillEllipse(pxw(4), px(bodyY - 18), pxw(10), px(16));
    container.add(faceDark);

    // 眼睛（严肃）
    const leftEyeBg = this.scene.add.graphics();
    leftEyeBg.fillStyle(0xFFFFFF);
    leftEyeBg.fillEllipse(pxw(-7), px(bodyY - 22), pxw(4), px(3));
    container.add(leftEyeBg);

    const rightEyeBg = this.scene.add.graphics();
    rightEyeBg.fillStyle(0xFFFFFF);
    rightEyeBg.fillEllipse(pxw(7), px(bodyY - 22), pxw(4), px(3));
    container.add(rightEyeBg);

    const leftEye = this.scene.add.graphics();
    leftEye.fillStyle(C.EYE);
    leftEye.fillEllipse(pxw(-6), px(bodyY - 21), pxw(2.5), px(2.5));
    container.add(leftEye);

    const rightEye = this.scene.add.graphics();
    rightEye.fillStyle(C.EYE);
    rightEye.fillEllipse(pxw(8), px(bodyY - 21), pxw(2.5), px(2.5));
    container.add(rightEye);

    // 眉毛（严厉）
    const leftBrow = this.scene.add.graphics();
    leftBrow.fillStyle(0x1A0A00);
    leftBrow.fillRect(pxw(-11), px(bodyY - 28), pxw(8), px(2.5));
    container.add(leftBrow);

    const rightBrow = this.scene.add.graphics();
    rightBrow.fillStyle(0x1A0A00);
    rightBrow.fillRect(pxw(3), px(bodyY - 28), pxw(8), px(2.5));
    container.add(rightBrow);

    // ==================== 金盔 ====================
    // 头盔主体
    const helmet = this.scene.add.graphics();
    helmet.fillStyle(C.ARMOR_MID);
    helmet.fillEllipse(pxw(0), px(bodyY - 34), pxw(26), px(20));
    container.add(helmet);

    const helmetLight = this.scene.add.graphics();
    helmetLight.fillStyle(C.ARMOR_GOLD);
    helmetLight.fillEllipse(pxw(-2), px(bodyY - 36), pxw(20), px(16));
    container.add(helmetLight);

    const helmetHighlight = this.scene.add.graphics();
    helmetHighlight.fillStyle(C.ARMOR_RIM);
    helmetHighlight.fillEllipse(pxw(-4), px(bodyY - 38), pxw(12), px(10));
    container.add(helmetHighlight);

    // 头盔檐
    const brim = this.scene.add.graphics();
    brim.fillStyle(C.ARMOR_DARK);
    brim.fillRect(pxw(-14), px(bodyY - 26), pxw(28), px(4));
    container.add(brim);

    const brimGold = this.scene.add.graphics();
    brimGold.fillStyle(C.ARMOR_GOLD);
    brimGold.fillRect(pxw(-13), px(bodyY - 25), pxw(26), px(2));
    container.add(brimGold);

    // 头盔护耳（左右）
    const leftEarGuard = this.scene.add.graphics();
    leftEarGuard.fillStyle(C.ARMOR_MID);
    leftEarGuard.fillEllipse(pxw(-16), px(bodyY - 28), pxw(6), px(12));
    container.add(leftEarGuard);

    const rightEarGuard = this.scene.add.graphics();
    rightEarGuard.fillStyle(C.ARMOR_MID);
    rightEarGuard.fillEllipse(pxw(16), px(bodyY - 28), pxw(6), px(12));
    container.add(rightEarGuard);

    const earGuardGoldL = this.scene.add.graphics();
    earGuardGoldL.fillStyle(C.ARMOR_GOLD);
    earGuardGoldL.fillEllipse(pxw(-15), px(bodyY - 28), pxw(4), px(8));
    container.add(earGuardGoldL);

    const earGuardGoldR = this.scene.add.graphics();
    earGuardGoldR.fillStyle(C.ARMOR_GOLD);
    earGuardGoldR.fillEllipse(pxw(15), px(bodyY - 28), pxw(4), px(8));
    container.add(earGuardGoldR);

    // 头盔顶饰
    const crestBase = this.scene.add.graphics();
    crestBase.fillStyle(C.ARMOR_GOLD);
    crestBase.fillEllipse(pxw(0), px(bodyY - 44), pxw(10), px(6));
    container.add(crestBase);

    // 红缨
    const plume = this.scene.add.graphics();
    plume.fillStyle(C.PLUME_DARK);
    plume.beginPath();
    plume.moveTo(pxw(-4), px(bodyY - 44));
    plume.lineTo(pxw(0), px(bodyY - 58));
    plume.lineTo(pxw(4), px(bodyY - 44));
    plume.fillPath();
    container.add(plume);

    const plumeLight = this.scene.add.graphics();
    plumeLight.fillStyle(C.PLUME_RED);
    plumeLight.beginPath();
    plumeLight.moveTo(pxw(-3), px(bodyY - 44));
    plumeLight.lineTo(pxw(0), px(bodyY - 56));
    plumeLight.lineTo(pxw(3), px(bodyY - 44));
    plumeLight.fillPath();
    container.add(plumeLight);

    // 红缨流苏
    const plumeTassel = this.scene.add.graphics();
    plumeTassel.fillStyle(C.PLUME_RED);
    plumeTassel.fillEllipse(pxw(0), px(bodyY - 56), pxw(4), px(6));
    container.add(plumeTassel);

    // ==================== 手臂 ====================
    // 左臂
    this.leftArm = this.scene.add.graphics();
    container.add(this.leftArm);

    // 右臂（持矛）
    this.rightArm = this.scene.add.graphics();
    container.add(this.rightArm);

    // 左手
    const leftHand = this.scene.add.graphics();
    leftHand.fillStyle(C.SKIN_MID);
    leftHand.fillEllipse(pxw(-24), px(bodyY + 8), pxw(6), px(6));
    container.add(leftHand);

    // ==================== 长矛（持于右侧） ====================
    // 矛杆
    const spearShaft = this.scene.add.graphics();
    spearShaft.fillStyle(C.SPEAR_SHAFT);
    spearShaft.fillRect(pxw(30), px(bodyY - 36), pxw(4), px(64));
    container.add(spearShaft);

    const shaftLight = this.scene.add.graphics();
    shaftLight.fillStyle(0xA08040, 0.6);
    shaftLight.fillRect(pxw(31), px(bodyY - 34), pxw(1.5), px(60));
    container.add(shaftLight);

    // 矛头
    this.spearBlade = this.scene.add.graphics();

    const blade = this.scene.add.graphics();
    blade.fillStyle(C.SPEAR_BLADE);
    blade.beginPath();
    blade.moveTo(pxw(32), px(bodyY - 42));
    blade.lineTo(pxw(36), px(bodyY - 30));
    blade.lineTo(pxw(28), px(bodyY - 30));
    blade.fillPath();
    container.add(blade);

    const bladeHighlight = this.scene.add.graphics();
    bladeHighlight.fillStyle(C.SPEAR_HIGHLIGHT);
    bladeHighlight.beginPath();
    bladeHighlight.moveTo(pxw(32), px(bodyY - 41));
    bladeHighlight.lineTo(pxw(35), px(bodyY - 31));
    bladeHighlight.lineTo(pxw(32), px(bodyY - 31));
    bladeHighlight.fillPath();
    container.add(bladeHighlight);

    // 矛缨（红缨枪缨）
    const spearTassel = this.scene.add.graphics();
    spearTassel.fillStyle(C.PLUME_RED);
    spearTassel.fillEllipse(pxw(32), px(bodyY - 28), pxw(8), px(6));
    container.add(spearTassel);

    const spearTasselDark = this.scene.add.graphics();
    spearTasselDark.fillStyle(C.PLUME_DARK);
    spearTasselDark.fillEllipse(pxw(33), px(bodyY - 27), pxw(5), px(4));
    container.add(spearTasselDark);

    container.setDepth(20);

    // ==================== 动画 ====================
    const leftArm = this.leftArm;
    const rightArm = this.rightArm;
    const cape = this.cape;
    const colors = C;

    let time = 0;
    this.scene.time.addEvent({
      delay: 70,
      callback: () => {
        time += 0.2;
        const swing = Math.sin(time) * 3;
        const capeWave = Math.sin(time * 1.2) * 3;

        // 左臂摆动（自然下垂）
        leftArm.clear();
        leftArm.fillStyle(colors.ARMOR_GOLD);
        leftArm.fillEllipse(pxw(-22), px(bodyY + 8 + swing * 0.15), pxw(6), px(16));

        // 右臂（握矛）轻微摆动
        rightArm.clear();
        rightArm.fillStyle(colors.ARMOR_GOLD);
        rightArm.fillEllipse(pxw(26), px(bodyY + 6 - swing * 0.15), pxw(6), px(16));

        // 披风飘动
        cape.clear();
        cape.fillStyle(colors.CAPE_RED);
        cape.beginPath();
        cape.moveTo(pxw(-14 + capeWave * 0.3), px(bodyY - 8));
        cape.lineTo(pxw(-18 + capeWave * 0.5), px(bodyY + 28));
        cape.lineTo(pxw(18 + capeWave * 0.5), px(bodyY + 28));
        cape.lineTo(pxw(14 + capeWave * 0.3), px(bodyY - 8));
        cape.fillPath();
      },
      loop: true,
    });

    return container;
  }
}
