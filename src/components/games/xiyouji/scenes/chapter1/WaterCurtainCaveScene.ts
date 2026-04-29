// scenes/WaterCurtainCaveScene.ts
import * as Phaser from 'phaser';
import { WuKong } from '../../characters/player/WuKong';

export default class WaterCurtainCaveScene extends Phaser.Scene {
  private wukong!: WuKong;
  private obstacles: { x: number; y: number; width: number; height: number }[] = [];
  private exitArea!: { x: number; y: number; width: number; height: number };
  private isExiting: boolean = false;

  constructor() {
    super({ key: 'WaterCurtainCaveScene' });
  }

  init(data: { from: string; playerX: number; playerY: number }) {
    console.log('进入水帘洞内部', data);
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 洞口区域（底部中间）
    this.exitArea = {
      x: width / 2 - 60,
      y: height - 80,
      width: 120,
      height: 50
    };

    // ========== 洞穴背景 ==========
    const bg = this.add.graphics();
    bg.fillStyle(0x1A0F08);
    bg.fillRect(0, 0, width, height);

    // 石壁纹理
    for (let i = 0; i < 200; i++) {
      const rock = this.add.graphics();
      rock.fillStyle(0x2A1A0A, 0.5);
      rock.fillEllipse(50 + Math.random() * (width - 100), 50 + Math.random() * (height - 100), 20 + Math.random() * 40, 15 + Math.random() * 30);
    }

    // 钟乳石（顶部）
    for (let i = 0; i < 15; i++) {
      const stalactite = this.add.graphics();
      stalactite.fillStyle(0x3A2A1A);
      const x = 50 + i * 80 + Math.random() * 40;
      const w = 15 + Math.random() * 20;
      const h = 40 + Math.random() * 60;
      stalactite.beginPath();
      stalactite.moveTo(x - w / 2, 0);
      stalactite.lineTo(x, h);
      stalactite.lineTo(x + w / 2, 0);
      stalactite.fillPath();
      // 钟乳石碰撞
      if (h > 50) {
        this.obstacles.push({ x: x - w / 2, y: 0, width: w, height: h });
      }
    }

    // 石笋（底部）
    for (let i = 0; i < 12; i++) {
      const stalagmite = this.add.graphics();
      stalagmite.fillStyle(0x3A2A1A);
      const x = 60 + i * 100 + Math.random() * 50;
      const w = 18 + Math.random() * 25;
      const h = 35 + Math.random() * 55;
      stalagmite.beginPath();
      stalagmite.moveTo(x - w / 2, height);
      stalagmite.lineTo(x, height - h);
      stalagmite.lineTo(x + w / 2, height);
      stalagmite.fillPath();
      this.obstacles.push({ x: x - w / 2, y: height - h, width: w, height: h });
    }

    // ========== 猴王宝座 ==========
    const throneX = 160;
    const throneY = 360;

    const throneBase = this.add.graphics();
    throneBase.fillStyle(0x4A3A2A);
    throneBase.fillRoundedRect(throneX - 50, throneY - 15, 100, 30, 8);
    throneBase.fillStyle(0x5A4A3A);
    throneBase.fillRoundedRect(throneX - 47, throneY - 13, 94, 26, 6);

    const throneSeat = this.add.graphics();
    throneSeat.fillStyle(0x5A4A3A);
    throneSeat.fillRoundedRect(throneX - 45, throneY - 35, 90, 25, 6);
    throneSeat.fillStyle(0x6B5A4A);
    throneSeat.fillRoundedRect(throneX - 42, throneY - 33, 84, 21, 4);
    throneSeat.fillStyle(0x7A6A5A);
    throneSeat.fillRoundedRect(throneX - 39, throneY - 31, 78, 17, 3);

    const throneBack = this.add.graphics();
    throneBack.fillStyle(0x4A3A2A);
    throneBack.fillRoundedRect(throneX - 48, throneY - 110, 96, 85, 10);
    throneBack.fillStyle(0x5A4A3A);
    throneBack.fillRoundedRect(throneX - 44, throneY - 107, 88, 80, 8);
    throneBack.fillStyle(0x6B5A4A);
    throneBack.fillRoundedRect(throneX - 40, throneY - 104, 80, 75, 6);

    const backTop = this.add.graphics();
    backTop.fillStyle(0x7A6A5A);
    backTop.fillEllipse(throneX, throneY - 112, 70, 24);
    backTop.fillStyle(0xFFD700, 0.4);
    backTop.fillEllipse(throneX, throneY - 112, 56, 16);

    const leftArm = this.add.graphics();
    leftArm.fillStyle(0x5A4A3A);
    leftArm.fillRoundedRect(throneX - 65, throneY - 40, 25, 45, 8);
    leftArm.fillStyle(0x6B5A4A);
    leftArm.fillRoundedRect(throneX - 62, throneY - 37, 19, 39, 6);

    const rightArm = this.add.graphics();
    rightArm.fillStyle(0x5A4A3A);
    rightArm.fillRoundedRect(throneX + 40, throneY - 40, 25, 45, 8);
    rightArm.fillStyle(0x6B5A4A);
    rightArm.fillRoundedRect(throneX + 43, throneY - 37, 19, 39, 6);

    const leftBall = this.add.graphics();
    leftBall.fillStyle(0x8B6914);
    leftBall.fillCircle(throneX - 52, throneY - 45, 6);
    leftBall.fillStyle(0xCDA530);
    leftBall.fillCircle(throneX - 52, throneY - 45, 4);

    const rightBall = this.add.graphics();
    rightBall.fillStyle(0x8B6914);
    rightBall.fillCircle(throneX + 52, throneY - 45, 6);
    rightBall.fillStyle(0xCDA530);
    rightBall.fillCircle(throneX + 52, throneY - 45, 4);

    const fur = this.add.graphics();
    fur.fillStyle(0xA0784A, 0.6);
    fur.fillEllipse(throneX, throneY - 25, 70, 36);
    fur.fillStyle(0x8B5A2B, 0.4);
    fur.fillEllipse(throneX, throneY - 27, 50, 24);

    this.obstacles.push({ x: throneX - 65, y: throneY - 110, width: 130, height: 130 });

    // ========== 石桌 ==========
    const tableX = throneX + 180;
    const tableY = throneY - 10;

    const tableBase = this.add.graphics();
    tableBase.fillStyle(0x4A3A2A);
    tableBase.fillRoundedRect(tableX - 8, tableY + 15, 16, 35, 4);
    tableBase.fillStyle(0x5A4A3A);
    tableBase.fillEllipse(tableX, tableY + 18, 40, 20);

    const tableTop = this.add.graphics();
    tableTop.fillStyle(0x5A4A3A);
    tableTop.fillEllipse(tableX, tableY, 130, 56);
    tableTop.fillStyle(0x6B5A4A);
    tableTop.fillEllipse(tableX, tableY - 3, 120, 50);
    tableTop.fillStyle(0x7A6A5A);
    tableTop.fillEllipse(tableX, tableY - 5, 110, 44);

    const tableEdge = this.add.graphics();
    tableEdge.lineStyle(2, 0x8B6914, 0.5);
    tableEdge.beginPath();
    tableEdge.fillEllipse(tableX, tableY - 4, 104, 40);
    tableEdge.strokePath();

    const pot = this.add.graphics();
    pot.fillStyle(0x7A5A3A);
    pot.fillRoundedRect(tableX - 36, tableY - 12, 20, 16, 3);
    pot.fillStyle(0x8B6A4A);
    pot.fillRoundedRect(tableX - 34, tableY - 14, 12, 8, 2);

    const cup1 = this.add.graphics();
    cup1.fillStyle(0x7A5A3A);
    cup1.fillEllipse(tableX + 16, tableY - 8, 16, 10);
    cup1.fillStyle(0x8B6A4A);
    cup1.fillEllipse(tableX + 16, tableY - 9, 12, 6);

    const cup2 = this.add.graphics();
    cup2.fillStyle(0x7A5A3A);
    cup2.fillEllipse(tableX + 40, tableY - 6, 16, 10);
    cup2.fillStyle(0x8B6A4A);
    cup2.fillEllipse(tableX + 40, tableY - 7, 12, 6);

    const plate = this.add.graphics();
    plate.fillStyle(0x6B5A4A);
    plate.fillEllipse(tableX - 50, tableY - 5, 28, 10);

    const peach = this.add.graphics();
    peach.fillStyle(0xFF8888);
    peach.fillEllipse(tableX - 54, tableY - 9, 10, 12);
    peach.fillStyle(0xFF6666);
    peach.fillEllipse(tableX - 56, tableY - 10, 6, 8);

    this.obstacles.push({ x: tableX - 66, y: tableY - 15, width: 132, height: 60 });

    // ========== 石床 ==========
    const bedX = width - 220;
    const bedY = 380;

    const bedBase = this.add.graphics();
    bedBase.fillStyle(0x4A3A2A);
    bedBase.fillRoundedRect(bedX, bedY + 10, 140, 15, 5);
    bedBase.fillStyle(0x5A4A3A);
    bedBase.fillRoundedRect(bedX + 5, bedY + 12, 130, 10, 4);

    const bedMain = this.add.graphics();
    bedMain.fillStyle(0x5A4A3A);
    bedMain.fillRoundedRect(bedX, bedY, 140, 20, 6);
    bedMain.fillStyle(0x6B5A4A);
    bedMain.fillRoundedRect(bedX + 3, bedY + 2, 134, 16, 4);
    bedMain.fillStyle(0x7A6A5A);
    bedMain.fillRoundedRect(bedX + 6, bedY + 4, 128, 12, 3);

    const headboard = this.add.graphics();
    headboard.fillStyle(0x5A4A3A);
    headboard.fillRoundedRect(bedX + 100, bedY - 30, 35, 35, 6);
    headboard.fillStyle(0x6B5A4A);
    headboard.fillRoundedRect(bedX + 103, bedY - 27, 29, 29, 4);

    const headDeco = this.add.graphics();
    headDeco.fillStyle(0xCDA530, 0.6);
    headDeco.fillCircle(bedX + 117, bedY - 12, 8);

    const mat = this.add.graphics();
    mat.fillStyle(0x9A7A4A, 0.5);
    mat.fillRoundedRect(bedX + 10, bedY + 3, 80, 12, 3);

    this.obstacles.push({ x: bedX, y: bedY, width: 140, height: 50 });

    // ========== 火把（带碰撞） ==========
    const torchPositions = [
      { x: 80, y: 250, w: 12, h: 50 },
      { x: width - 80, y: 250, w: 12, h: 50 },
      { x: 100, y: 450, w: 12, h: 50 },
      { x: width - 100, y: 450, w: 12, h: 50 }
    ];

    torchPositions.forEach(pos => {
      const torch = this.add.graphics();
      torch.fillStyle(0x6B4A2A);
      torch.fillRect(pos.x - 3, pos.y, 6, 40);

      const flame = this.add.graphics();
      flame.fillStyle(0xFF6600);
      flame.fillEllipse(pos.x, pos.y - 5, 20, 30);
      flame.fillStyle(0xFFAA00);
      flame.fillEllipse(pos.x, pos.y - 7, 14, 24);
      flame.fillStyle(0xFFDD44);
      flame.fillEllipse(pos.x, pos.y - 8, 8, 16);

      // 添加火把碰撞
      this.obstacles.push({ x: pos.x - 10, y: pos.y - 15, width: 20, height: 60 });
    });

    // ========== 洞内溪流 ==========
    const stream = this.add.graphics();
    stream.fillStyle(0x3399FF, 0.4);
    stream.fillRect(0, height - 60, width, 20);
    stream.fillStyle(0x44AAFF, 0.3);
    stream.fillRect(0, height - 58, width, 15);

    for (let i = 0; i < 30; i++) {
      const ripple = this.add.graphics();
      ripple.fillStyle(0x88CCFF, 0.3);
      ripple.fillEllipse(30 + Math.random() * (width - 60), height - 50 + Math.random() * 20, 30, 8);
    }

    // ========== 水滴效果 ==========
    for (let i = 0; i < 25; i++) {
      const drop = this.add.graphics();
      drop.fillStyle(0x88CCFF, 0.7);
      const startX = 50 + Math.random() * (width - 100);
      const startY = 10 + Math.random() * 50;
      const endY = height - 70;
      drop.fillEllipse(startX, startY, 4, 8);

      this.tweens.add({
        targets: drop,
        y: endY,
        alpha: 0,
        duration: 1200 + Math.random() * 800,
        repeat: -1,
        delay: Math.random() * 3000,
        onStart: () => {
          drop.setPosition(startX, startY);
          drop.setAlpha(0.7);
        },
        onRepeat: () => {
          drop.setPosition(startX, startY);
          drop.setAlpha(0.7);
        }
      });
    }

    // ========== 洞口光效 ==========
    const light = this.add.graphics();
    light.fillStyle(0x88CCFF, 0.15);
    light.fillEllipse(width / 2, height - 60, 200, 80);

    // 洞口区域高亮提示
    const exitGlow = this.add.graphics();
    exitGlow.fillStyle(0x88CCFF, 0.2);
    exitGlow.fillRoundedRect(this.exitArea.x, this.exitArea.y, this.exitArea.width, this.exitArea.height, 10);

    // 出口文字
    const exitText = this.add.text(width / 2, height - 55, '出口', {
      fontSize: '14px',
      color: '#88CCFF',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 6, y: 2 }
    });
    exitText.setOrigin(0.5);

    // ========== 匾额 ==========
    const plaque = this.add.graphics();
    plaque.fillStyle(0xCDA530);
    plaque.fillRoundedRect(width / 2 - 80, 60, 160, 40, 8);
    plaque.fillStyle(0xFFD700);
    plaque.fillRoundedRect(width / 2 - 77, 63, 154, 34, 6);

    const plaqueText = this.add.text(width / 2, 80, '水帘洞', {
      fontSize: '24px',
      color: '#8B2222',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    plaqueText.setOrigin(0.5);

    // 对联
    const coupletLeft = this.add.text(width / 2 - 180, 120, '花果山福地', {
      fontSize: '16px',
      color: '#CDA530',
      fontFamily: 'monospace'
    });
    coupletLeft.setOrigin(0.5);

    const coupletRight = this.add.text(width / 2 + 180, 120, '水帘洞洞天', {
      fontSize: '16px',
      color: '#CDA530',
      fontFamily: 'monospace'
    });
    coupletRight.setOrigin(0.5);

    // ========== 创建悟空 ==========
    const playerGraphics = this.add.graphics();
    this.wukong = new WuKong(playerGraphics, this);
    this.wukong.setPosition(width / 2, height / 2);
    this.wukong.setBounds(50, width - 50, 50, height - 80);

  }

  private checkExit(): void {
    if (this.isExiting) return;

    const playerX = this.wukong.getX();
    const playerY = this.wukong.getY();
    const radius = 18;

    const isAtExit = playerX + radius > this.exitArea.x &&
                     playerX - radius < this.exitArea.x + this.exitArea.width &&
                     playerY + radius > this.exitArea.y &&
                     playerY - radius < this.exitArea.y + this.exitArea.height;

    if (isAtExit) {
      this.isExiting = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('HuaguoshanScene');
      });
    }
  }

  update() {
    if (this.wukong && !this.isExiting) {
      this.wukong.updateFromControllerWithCollision(this.obstacles);
      this.checkExit();
    }
  }
}