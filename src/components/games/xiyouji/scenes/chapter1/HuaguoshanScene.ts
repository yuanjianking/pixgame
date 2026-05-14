// scenes/HuaguoshanScene.ts
import * as Phaser from 'phaser';
import { GameMap } from '../../maps/TerrainMap';
import { WuKong } from '../../characters/player/WuKong';
import { DaMaHou } from '../../characters/npc/DaMaHou';
import { SmallMonkey } from '../../characters/npc/SmallMonkey';
import type { BaseNPC } from '../../characters/npc/BaseNPC';
import { DialogBox } from '../../ui/DialogBox';
import { InputJController } from '../../controllers/InputJController';
import type { GameSaveData } from '../../types';

export default class HuaguoshanScene extends Phaser.Scene {
  private wukong!: WuKong;
  private obstacles: { x: number; y: number; width: number; height: number }[] = [];
  private caveArea!: { x: number; y: number; width: number; height: number };
  private isEnteringCave: boolean = false;
  private dialogBox!: DialogBox;
  private isExiting = false;
  // NPC
  private npcs: BaseNPC[] = [];

  private inputJController!: InputJController;

  private isNewGame: boolean = true;
  private saveData?: GameSaveData;

  constructor() {
    super({ key: 'HuaguoshanScene' });
  }

  init(data: { isNewGame: boolean; saveData?: GameSaveData }) {
    this.isNewGame = data.isNewGame;
    this.saveData = data.saveData;

    this.isEnteringCave = false;
    this.isExiting = false
    this.obstacles = [];
  }

  create() {
    const map = new GameMap(this, '花果山');
    map.render();

    // 画水帘洞
    this.drawWaterfallCave(2, 2, 2);

    // 画桃树林
    const peachPositions = [
      [4, 2], [4, 3], [4, 4], [4, 5],
      [16, 2], [17, 2], [18, 2], [16, 3], [17, 3], [18, 3],
      [2, 12], [3, 12], [2, 13], [3, 13],
      [16, 12], [17, 12], [18, 12], [16, 13], [17, 13], [18, 13],
      [5, 5], [14, 5],
      [5, 9], [14, 9],
      [7, 4], [12, 4],
      [7, 10], [12, 10]
    ];

    peachPositions.forEach(([x, y]) => {
      this.drawPeachTree(x, y);
    });

    // 添加孙悟空
    const playerGraphics = this.add.graphics();
    this.wukong = new WuKong(playerGraphics, this);
    const startGridX = 10;
    const startGridY = 7;
    const playerX = startGridX * 40;
    const playerY = startGridY * 40;
    this.wukong.setPosition(playerX, playerY);
    this.wukong.setCollisionRadius(15);

    this.dialogBox = new DialogBox(this);

    // ==================== 添加大马猴 ====================
    const daMaHou = new DaMaHou(this, 8 * 40, 10 * 40,'赤尻马猴',[
      '大王，您来了。',
      '大王有何吩咐？',
      '大王，花果山一切安好。',
    ],this.dialogBox);
    this.npcs.push(daMaHou);
    this.obstacles.push(daMaHou.getCollisionRect());

    // ==================== 添加5只小猴子 ====================
    // 小猴子1 - 右上角
    const monkey1 = new SmallMonkey(this, 14 * 40, 6 * 40, '果果',[
     '大王吃桃不？我刚摘的！',
     '山后面的果子熟啦！',
     '果果要把最好吃的留给大王！',
    ],this.dialogBox);
    this.npcs.push(monkey1);
    this.obstacles.push(monkey1.getCollisionRect());

    // 小猴子2 - 右下角
    const monkey2 = new SmallMonkey(this, 15 * 40, 12 * 40, '聪聪',[
      '大王，我发现山下有动静！',
      '聪聪帮大王盯着呢！',
      '我用树叶做了个小扇子，大王热不热？',
    ],this.dialogBox);
    this.npcs.push(monkey2);
    this.obstacles.push(monkey2.getCollisionRect());

    // 小猴子3 - 左上角
    const monkey3 = new SmallMonkey(this, 6 * 40, 4 * 40, '毛毛',[
      '大王摸摸头～叽叽～',
      '毛毛好想大王呀！',
      '我帮大王挠痒痒！',
    ],this.dialogBox);
    this.npcs.push(monkey3);
    this.obstacles.push(monkey3.getCollisionRect());

    // 小猴子4 - 左下角桃林附近
    const monkey4 = new SmallMonkey(this, 5 * 40, 11 * 40, '壮壮',[
      '大王！我把石头搬开了！',
      '壮壮保护大家！',
      '嘿嘿，大王需要帮忙吗？',
    ],this.dialogBox);
    this.npcs.push(monkey4);
    this.obstacles.push(monkey4.getCollisionRect());

    // 小猴子5 - 水帘洞附近
    const monkey5 = new SmallMonkey(this, 5 * 40, 8 * 40, ' 蹦蹦',[
      '叽叽叽！大王回来啦！',
      '蹦蹦我今天抓了3只蚂蚱！',
      '大王看我新学的翻跟头！',
    ],this.dialogBox);
    this.npcs.push(monkey5);
    this.obstacles.push(monkey5.getCollisionRect());

    this.inputJController = new InputJController(this);
    this.inputJController.onInteract = () => {
          this.checkNPCInteraction();
      };
  }

  update() {
    if (this.wukong && !this.isEnteringCave) {
      this.wukong.updateFromControllerWithCollision(this.obstacles);
      this.checkEnterCave();
      //this.checkNPCInteraction();
      this.checkLeaveMap();
    }
  }

  private checkEnterCave(): void {
    if (this.isEnteringCave) return;
    if (!this.caveArea) return;

    const playerX = this.wukong.getX();
    const playerY = this.wukong.getY();
    const radius = 15;

    const isInCave = playerX + radius > this.caveArea.x &&
                     playerX - radius < this.caveArea.x + this.caveArea.width &&
                     playerY + radius > this.caveArea.y &&
                     playerY - radius < this.caveArea.y + this.caveArea.height;

    if (isInCave) {
      this.isEnteringCave = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WaterCurtainCaveScene', {
          from: 'huaguoshan',
          playerX: 400,
          playerY: 300
        });
      });
    }
  }

  private checkNPCInteraction(): void {
    // 如果对话框激活，不处理NPC交互
    if (this.dialogBox.isDialogActive()) return;
    for (const npc of this.npcs) {
      const npcPos = npc.getPosition();
      const distance = Math.hypot(this.wukong.getX() - npcPos.x, this.wukong.getY() - npcPos.y);

      if (distance < 50) {
        npc.interact();
        break;
      }
    }
  }

  private checkLeaveMap(): void {
    if (this.isExiting) return;
    const playerX = this.wukong.getX();
    const playerY = this.wukong.getY();

    const OutsetArea = {
      x: 40,
      y: 40,
      width: 760 ,
      height: 560
    };

    const isInOutset =
        playerX < OutsetArea.x ||
        playerX > OutsetArea.width ||
        playerY < OutsetArea.y ||
        playerY > OutsetArea.height;

    if (isInOutset) {
      this.isExiting = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WorldMapScene', { returnNodeId: 'huaguoshan' });
      });
    }
  }

  // 画水帘洞
  private drawWaterfallCave(gridX: number, gridY: number, size: number = 1): void {
    const baseSize = 40;
    const x = gridX * baseSize;
    const y = gridY * baseSize;
    const w = baseSize * size;
    const h = baseSize * size;

    this.caveArea = {
      x: x + w * 0.1,
      y: y + h * 0.3,
      width: w * 0.8,
      height: h * 0.6
    };

    this.obstacles.push({ x: x, y: y, width: w, height: h * 0.45 });
    this.obstacles.push({ x: x, y: y + h * 0.45, width: w * 0.25, height: h * 0.4 });
    this.obstacles.push({ x: x + w * 0.75, y: y + h * 0.45, width: w * 0.25, height: h * 0.4 });

    const container = this.add.container(x, y);

    const rock = this.add.graphics();
    rock.fillStyle(0x6B5A4A);
    rock.fillRect(0, 0, w, h);
    rock.fillStyle(0x5A4A3A);
    rock.fillEllipse(w / 2, h * 0.6, w * 0.65, h * 0.75);
    container.add(rock);

    const hole = this.add.graphics();
    hole.fillStyle(0x2A1A0A);
    hole.fillEllipse(w / 2, h * 0.6, w * 0.4, h * 0.55);
    container.add(hole);

    const water = this.add.graphics();
    water.fillStyle(0x88CCFF, 0.6);
    water.fillRect(w * 0.35, h * 0.7, w * 0.3, h * 0.45);
    water.fillStyle(0xAAEEFF, 0.4);
    water.fillRect(w * 0.42, h * 0.7, w * 0.15, h * 0.35);
    container.add(water);

    const text = this.add.text(w / 2, h * 0.15, '水帘洞', {
      fontSize: `${Math.floor(10 * size)}px`,
      color: '#FFD700',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 3 * size, y: 1 * size }
    });
    text.setOrigin(0.5);
    container.add(text);

    container.setDepth(20);
  }

  // 画桃树
  private drawPeachTree(gridX: number, gridY: number): void {
    const x = gridX * 40;
    const y = gridY * 40;

    this.obstacles.push({ x: x, y: y, width: 40, height: 40 });

    const container = this.add.container(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillEllipse(20, 34, 18, 6);
    container.add(shadow);

    const trunk = this.add.graphics();
    trunk.fillStyle(0x8B5A2B);
    trunk.fillRect(18, 22, 5, 12);
    container.add(trunk);

    const leaves = this.add.graphics();
    leaves.fillStyle(0x3A7A2A);
    leaves.fillCircle(20, 16, 14);
    leaves.fillStyle(0x5A9A4A);
    leaves.fillCircle(15, 12, 9);
    leaves.fillCircle(25, 12, 9);
    container.add(leaves);

    const blossom = this.add.graphics();
    blossom.fillStyle(0xFFB6C1);
    blossom.fillCircle(16, 10, 3);
    blossom.fillCircle(24, 9, 3);
    blossom.fillCircle(20, 6, 2.5);
    blossom.fillStyle(0xFF69B4);
    blossom.fillCircle(18, 4, 2);
    blossom.fillCircle(22, 5, 2);
    container.add(blossom);

    container.setDepth(20);
  }
}