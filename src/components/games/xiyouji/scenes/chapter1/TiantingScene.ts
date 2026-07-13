// scenes/chapter1/TiantingScene.ts
import * as Phaser from 'phaser';
import { WuKong } from '../../characters/player/WuKong';
import { TaibaiJinxing } from '../../characters/npc/TaibaiJinxing';
import { HeavenlySoldier } from '../../characters/npc/HeavenlySoldier';
import type { BaseNPC } from '../../characters/npc/BaseNPC';
import { DialogBox } from '../../ui/DialogBox';
import { HUD } from '../../ui/HUD';
import { InputJController } from '../../controllers/InputJController';
import { SaveManager } from '../../save/SaveManager';
import { applySaveToCharacter } from '../../save/playerSave';
import { saveEnterSceneProgress } from '../sceneSave';
import { HeavenMap } from '../../maps/HeavenMap';
import type { GameSaveData } from '../../types';

const TILE = 40;
const MAP_COLS = 20;
const MAP_ROWS = 15;
const MAP_W = MAP_COLS * TILE;
const MAP_H = MAP_ROWS * TILE;

export default class TiantingScene extends Phaser.Scene {
  private wukong!: WuKong;
  private obstacles: { x: number; y: number; width: number; height: number }[] = [];
  private dialogBox!: DialogBox;
  private isExiting = false;
  private npcs: BaseNPC[] = [];
  private inputJController!: InputJController;
  private saveData?: GameSaveData;
  private entryPosition?: { x: number; y: number };

  constructor() {
    super({ key: 'TiantingScene' });
  }

  init(data?: { playerX?: number; playerY?: number }): void {
    this.saveData = SaveManager.getInstance().loadGame(1) ?? undefined;
    this.entryPosition = (data?.playerX !== undefined && data?.playerY !== undefined)
      ? { x: data.playerX, y: data.playerY }
      : undefined;
    this.obstacles = [];
    this.npcs = [];
    this.isExiting = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x87CEEB);

    // 使用 HeavenMap 绘制场景背景 / 宫殿 / 云朵 / 光柱
    const heavenMap = new HeavenMap(this);
    heavenMap.render();
    this.obstacles.push(...heavenMap.obstacles);

    const playerGraphics = this.add.graphics().setDepth(20);
    this.wukong = new WuKong(playerGraphics, this);
    const saved = this.saveData?.player ?? SaveManager.getInstance().loadGame(1)?.player;
    applySaveToCharacter(this.wukong, saved);

    // 优先使用场景入口位置（从世界地图传入），其次是存档位置
    const startX = this.entryPosition?.x ?? saved?.position.x ?? 10 * TILE;
    const startY = this.entryPosition?.y ?? saved?.position.y ?? 13 * TILE;
    const validX = startX > 0 && startX < MAP_W ? startX : 10 * TILE;
    const validY = startY > 0 && startY < MAP_H ? startY : 13 * TILE;
    this.wukong.setPosition(validX, validY);
    this.wukong.setCollisionRadius(15);
    this.wukong.setBounds(0, MAP_W, 0, MAP_H);

    this.dialogBox = new DialogBox(this);
    new HUD(this, () => this.wukong.getLevel());

    saveEnterSceneProgress(this.wukong, 'TiantingScene', { x: validX, y: validY });

    this.spawnNpcs();

    this.inputJController = new InputJController(this);
    this.inputJController.onInteract = () => this.checkNPCInteraction();

    this.showControlHint();

    // 首次进入天庭时显示开场对话
    this.time.delayedCall(400, () => this.showIntroDialog());
  }

  private spawnNpcs(): void {
    // 太白金星（左前）
    const taibai = new TaibaiJinxing(
      this,
      5 * TILE,
      8 * TILE,
      '太白金星',
      ['贫道太白金星，奉玉帝之命前来迎接上仙。'],
      this.dialogBox,
    );
    this.npcs.push(taibai);
    this.obstacles.push(taibai.getCollisionRect());

    // 天兵 - 左守卫
    const soldierL = new HeavenlySoldier(
      this,
      6 * TILE,
      5 * TILE,
      '天兵',
      ['天庭重地，闲人止步！', '站住！可有玉帝旨意？'],
      this.dialogBox,
    );
    this.npcs.push(soldierL);
    this.obstacles.push(soldierL.getCollisionRect());

    // 天兵 - 右守卫
    const soldierR = new HeavenlySoldier(
      this,
      14 * TILE,
      5 * TILE,
      '天兵',
      ['天规森严，不得擅闯！', '若无传召，速速离去！'],
      this.dialogBox,
    );
    this.npcs.push(soldierR);
    this.obstacles.push(soldierR.getCollisionRect());
  }

  private checkNPCInteraction(): void {
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

  private showIntroDialog(): void {
    if (this.dialogBox.isDialogActive()) return;

    const isTaskCompleted = this.saveData?.progress?.completedTasks?.includes('heavenly_court') ?? false;
    if (isTaskCompleted) return;

    this.dialogBox.show('太白金星', [
      '贫道太白金星，奉玉帝之命，特来迎接上仙。',
      '上仙可是花果山水帘洞孙悟空？玉帝知你修行有成，特召你上天受封。',
      '请随我来，玉帝已在凌霄宝殿等候多时了。',
    ]);
  }

  private showControlHint(): void {
    const hint = this.add.text(400, 560, 'WASD 移动 | J 对话/确认', {
      fontSize: '12px',
      color: '#FFD700',
      fontFamily: 'monospace',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 4 },
    }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

    this.tweens.add({
      targets: hint,
      alpha: { from: 1, to: 0.5 },
      duration: 1000,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.tweens.add({
          targets: hint,
          alpha: 0,
          duration: 500,
          onComplete: () => hint.destroy(),
        });
      },
    });
  }

  update(): void {
    if (this.wukong) {
      this.wukong.updateFromControllerWithCollision(this.obstacles);
      this.checkMapExit();
    }
  }

  private checkMapExit(): void {
    if (this.isExiting) return;
    const py = this.wukong.getY();

    if (py > MAP_H - 40) {
      this.isExiting = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WorldMapScene', { returnNodeId: 'tianting' });
      });
    }
  }
}
