import * as Phaser from 'phaser';
import { DialogBox } from '../../ui/DialogBox';
import { HUD } from '../../ui/HUD';
import { WuKong } from '../../characters/player/WuKong';
import { TaskManager } from '../../task/TaskManager';
import { DragonKing } from '../../characters/npc/DragonKing';
import { Shrimp } from '../../characters/npc/Shrimp';
import { Crab } from '../../characters/npc/Crab';
import { SaveManager } from '../../save/SaveManager';
import { applySaveToCharacter } from '../../save/playerSave';
import { saveEnterSceneProgress } from '../sceneSave';
import { InputJController } from '../../controllers/InputJController';
import { WaterMap } from '../../maps/WaterMap';
import type { GameSaveData } from '../../types';

const TILE = 40;
const MAP_COLS = 20;
const MAP_ROWS = 15;
const MAP_W = MAP_COLS * TILE;
const MAP_H = MAP_ROWS * TILE;

export class DonghaiScene extends Phaser.Scene {
    private wukong!: WuKong;
    private dialogBox!: DialogBox;
    private inputJController!: InputJController;
    private obstacles: { x: number; y: number; width: number; height: number }[] = [];
    private dragonKingNpc: DragonKing | null = null;
    private saveData?: GameSaveData;
    private battleStarted = false;
    private victory = false;
    private isExiting = false;
    private entryPosition?: { x: number; y: number };
    private waterMap!: WaterMap;

    constructor() {
        super({ key: 'DonghaiScene' });
    }

    init(data?: { saveData?: GameSaveData; victory?: boolean; playerX?: number; playerY?: number }): void {
        this.saveData = data?.saveData ?? SaveManager.getInstance().loadGame(1) ?? undefined;
        this.victory = data?.victory ?? false;
        this.entryPosition = (data?.playerX !== undefined && data?.playerY !== undefined)
            ? { x: data.playerX, y: data.playerY }
            : undefined;
        this.obstacles = [];
        this.battleStarted = false;
        this.isExiting = false;
    }

    create(): void {
        this.cameras.main.setBackgroundColor(0x0a2f6a);

        // 使用 WaterMap 替换手动绘制的地形
        this.waterMap = new WaterMap(this, '东海龙宫', MAP_COLS, MAP_ROWS);
        this.waterMap.setPosition(0, 0);
        this.waterMap.render();

        // 构建完整的龙宫场景（包含宫殿、座椅、桌案、装饰、气泡、光线）
        this.buildDragonPalace();

        const playerGraphics = this.add.graphics().setDepth(20);
        this.wukong = new WuKong(playerGraphics, this);
        const saved = this.saveData?.player ?? SaveManager.getInstance().loadGame(1)?.player;
        applySaveToCharacter(this.wukong, saved);
        const startX = this.entryPosition?.x ?? saved?.position.x ?? 10 * TILE;
        const startY = this.entryPosition?.y ?? saved?.position.y ?? 8 * TILE;
        const validX = (startX > 0 && startX < MAP_W) ? startX : 10 * TILE;
        const validY = (startY > 0 && startY < MAP_H) ? startY : 8 * TILE;
        this.wukong.setPosition(validX, validY);
        this.wukong.setCollisionRadius(15);
        this.wukong.setBounds(0, MAP_W, 0, MAP_H);

        this.dialogBox = new DialogBox(this);
        saveEnterSceneProgress(this.wukong, 'DonghaiScene', { x: validX, y: validY });

        new HUD(this, () => this.wukong.getLevel());

        this.spawnNpcs();

        this.inputJController = new InputJController(this);
        this.inputJController.onInteract = () => this.checkNpcInteraction();

        this.showControlHint();

        if (!this.victory && !this.battleStarted) {
            this.time.delayedCall(400, () => this.showIntroDialog());
        } else if (this.victory) {
            this.createWorldMapExitHint();
        }
    }

    private buildDragonPalace(): void {
        const palaceX = 8 * TILE;
        const palaceY = 3 * TILE;
        const palaceW = 4 * TILE;
        const palaceH = 4 * TILE;

        // ==================== 宫殿地基碰撞 ====================
        this.obstacles.push({ x: palaceX, y: palaceY, width: palaceW, height: palaceH * 0.7 });

        const container = this.add.container(palaceX, palaceY);
        container.setDepth(15);

        // 地基平台
        const platform = this.add.graphics();
        platform.fillStyle(0x3a6ea5, 0.9);
        platform.fillRect(0, palaceH * 0.7, palaceW, palaceH * 0.3);
        platform.fillStyle(0x4a7eb5, 0.7);
        for (let i = 0; i < 20; i++) {
            platform.fillRect(5 + Math.random() * (palaceW - 10), palaceH * 0.7 + 5 + Math.random() * 20, 3, 2);
        }
        container.add(platform);

        // 台阶
        const steps = this.add.graphics();
        steps.fillStyle(0x4a7eb5, 0.85);
        steps.fillRect(palaceW * 0.3, palaceH * 0.65, palaceW * 0.4, 8);
        steps.fillRect(palaceW * 0.35, palaceH * 0.6, palaceW * 0.3, 8);
        steps.fillRect(palaceW * 0.4, palaceH * 0.55, palaceW * 0.2, 8);
        container.add(steps);

        // 主殿墙壁
        const backWall = this.add.graphics();
        backWall.fillStyle(0x2a5a8a, 0.95);
        backWall.fillRect(0, 0, palaceW, palaceH * 0.7);
        backWall.fillStyle(0x3a6a9a, 0.5);
        for (let i = 0; i < 30; i++) {
            backWall.fillRect(4 + Math.random() * (palaceW - 8), 4 + Math.random() * (palaceH * 0.7 - 8), 4, 4);
        }
        container.add(backWall);

        // 柱子
        const pillarPositions = [palaceW * 0.15, palaceW * 0.45, palaceW * 0.75];
        pillarPositions.forEach((px) => {
            const pillar = this.add.graphics();
            pillar.fillStyle(0xc0392b, 0.9);
            pillar.fillRect(px - 8, palaceH * 0.2, 16, palaceH * 0.5);
            pillar.fillStyle(0x8b6914, 0.9);
            pillar.fillRect(px - 10, palaceH * 0.68, 20, 6);
            pillar.fillStyle(0xffd700, 0.85);
            pillar.fillRect(px - 9, palaceH * 0.18, 18, 6);
            pillar.fillStyle(0xffd700, 0.6);
            pillar.fillEllipse(px, palaceH * 0.35, 6, 8);
            pillar.fillEllipse(px, palaceH * 0.55, 6, 8);
            container.add(pillar);

            this.obstacles.push({ x: palaceX + px - 10, y: palaceY + palaceH * 0.2, width: 20, height: palaceH * 0.55 });
        });

        // 横梁
        const beam = this.add.graphics();
        beam.fillStyle(0x8b6914, 0.9);
        beam.fillRect(0, palaceH * 0.16, palaceW, 8);
        beam.fillStyle(0xffd700, 0.7);
        beam.fillRect(2, palaceH * 0.17, palaceW - 4, 3);
        container.add(beam);

        // 屋顶
        const roof = this.add.graphics();
        roof.fillStyle(0x1a4a6a, 0.95);
        roof.fillTriangle(palaceW / 2, -12, 8, palaceH * 0.16, palaceW - 8, palaceH * 0.16);
        roof.fillStyle(0x2a5a7a, 0.7);
        roof.fillTriangle(palaceW / 2, -6, 12, palaceH * 0.16, palaceW - 12, palaceH * 0.16);
        container.add(roof);

        // 屋脊装饰
        const ridge = this.add.graphics();
        ridge.fillStyle(0xffd700, 0.8);
        ridge.fillRect(palaceW / 2 - 4, -8, 8, 4);
        ridge.fillStyle(0xffaa00, 0.8);
        ridge.fillCircle(palaceW / 2, -6, 4);
        container.add(ridge);

        // 牌匾
        const sign = this.add.graphics();
        sign.fillStyle(0x8b4513, 0.9);
        sign.fillRect(palaceW / 2 - 40, 8, 80, 24);
        sign.fillStyle(0xffd700, 0.7);
        sign.fillRect(palaceW / 2 - 38, 10, 76, 20);
        container.add(sign);

        const signText = this.add.text(palaceW / 2, 20, '东海龙宫', {
            fontSize: '12px',
            color: '#ffd700',
            fontFamily: 'monospace',
            fontStyle: 'bold',
        });
        signText.setOrigin(0.5);
        container.add(signText);

        // ==================== 龙王宝座 ====================
        const throneX = palaceW / 2 - 25;
        const throneY = palaceH * 0.5;
        const throneW = 50;
        const throneH = 55;

        this.obstacles.push({ x: palaceX + throneX, y: palaceY + throneY, width: throneW, height: throneH });

        const throne = this.add.graphics();

        throne.fillStyle(0x8b6914, 0.9);
        throne.fillRect(throneX, throneY + throneH - 12, throneW, 12);
        throne.fillStyle(0xffd700, 0.7);
        throne.fillRect(throneX + 5, throneY + throneH - 10, throneW - 10, 6);

        throne.fillStyle(0xffd700, 0.85);
        throne.fillRect(throneX + 5, throneY, 8, throneH - 12);
        throne.fillRect(throneX + throneW - 13, throneY, 8, throneH - 12);
        throne.fillStyle(0xcda530, 0.9);
        throne.fillRect(throneX + 10, throneY + 8, throneW - 20, throneH - 20);

        throne.fillStyle(0xffd700, 0.9);
        throne.fillRect(throneX - 8, throneY + 25, 12, 8);
        throne.fillRect(throneX + throneW - 4, throneY + 25, 12, 8);

        throne.fillStyle(0xffaa00, 0.9);
        throne.fillCircle(throneX - 2, throneY + 29, 5);
        throne.fillCircle(throneX + throneW + 2, throneY + 29, 5);
        throne.fillStyle(0xff6600, 0.8);
        throne.fillCircle(throneX - 3, throneY + 28, 2);
        throne.fillCircle(throneX + throneW + 1, throneY + 28, 2);

        throne.fillStyle(0xffd700, 0.9);
        throne.fillEllipse(throneX + throneW / 2, throneY - 4, 20, 8);
        throne.fillStyle(0xffaa00, 0.8);
        throne.fillEllipse(throneX + throneW / 2, throneY - 6, 14, 5);
        container.add(throne);

        // 座椅垫
        const cushion = this.add.graphics();
        cushion.fillStyle(0xcc3333, 0.85);
        cushion.fillEllipse(throneX + throneW / 2, throneY + throneH - 20, 30, 12);
        cushion.fillStyle(0xff6666, 0.6);
        cushion.fillEllipse(throneX + throneW / 2, throneY + throneH - 22, 24, 8);
        container.add(cushion);

        // ==================== 桌案 ====================
        const tableX = throneX + throneW + 10;
        const tableY = throneY + 15;
        const tableW = 45;
        const tableH = 30;

        this.obstacles.push({ x: palaceX + tableX, y: palaceY + tableY, width: tableW, height: tableH });

        const table = this.add.graphics();

        table.fillStyle(0x8b6914, 0.9);
        table.fillRect(tableX + 5, tableY + tableH - 8, 8, 8);
        table.fillRect(tableX + tableW - 13, tableY + tableH - 8, 8, 8);
        table.fillRect(tableX + 5, tableY + 2, 8, 8);
        table.fillRect(tableX + tableW - 13, tableY + 2, 8, 8);

        table.fillStyle(0xcda530, 0.9);
        table.fillRect(tableX, tableY, tableW, 8);
        table.fillStyle(0xffd700, 0.7);
        table.fillRect(tableX + 2, tableY + 1, tableW - 4, 4);

        table.lineStyle(1.5, 0xffd700, 0.8);
        table.strokeRect(tableX + 1, tableY + 0.5, tableW - 2, 6);
        container.add(table);

        // 宝物
        const treasure = this.add.graphics();
        treasure.fillStyle(0x88ccff, 0.9);
        treasure.fillCircle(tableX + 15, tableY - 2, 6);
        treasure.fillStyle(0xaaffff, 0.7);
        treasure.fillCircle(tableX + 13, tableY - 4, 2);
        treasure.fillStyle(0xffd700, 0.9);
        treasure.fillRect(tableX + tableW - 20, tableY - 4, 10, 8);
        treasure.fillStyle(0xffaa00, 0.8);
        treasure.fillRect(tableX + tableW - 18, tableY - 8, 6, 6);
        container.add(treasure);

        // ==================== 灯笼 ====================
        const lanterns = [
            { x: palaceW * 0.2, y: palaceH * 0.22 },
            { x: palaceW * 0.8, y: palaceH * 0.22 },
        ];
        lanterns.forEach((pos) => {
            const lantern = this.add.graphics();
            lantern.lineStyle(1, 0xffd700, 0.8);
            lantern.beginPath();
            lantern.moveTo(pos.x, pos.y - 5);
            lantern.lineTo(pos.x, pos.y);
            lantern.strokePath();
            lantern.fillStyle(0xff4444, 0.85);
            lantern.fillEllipse(pos.x, pos.y + 6, 8, 12);
            lantern.fillStyle(0xff8888, 0.6);
            lantern.fillEllipse(pos.x, pos.y + 5, 5, 8);
            lantern.fillStyle(0xffaa66, 0.4);
            lantern.fillCircle(pos.x, pos.y + 6, 10);
            container.add(lantern);
        });

        // 水纹特效
        const waterEffect = this.add.graphics();
        waterEffect.fillStyle(0x88ccff, 0.35);
        waterEffect.fillRect(0, palaceH * 0.7, palaceW, 10);
        waterEffect.fillStyle(0xaaeeff, 0.25);
        waterEffect.fillRect(5, palaceH * 0.73, palaceW - 10, 6);
        container.add(waterEffect);

        // ==================== 珊瑚装饰 ====================
        const coralPositions = [
            [3, 5], [5, 3], [14, 5], [16, 4],
            [2, 11], [4, 13], [15, 12], [17, 10],
        ];
        const coralColors = [0xff6b6b, 0xff9f43, 0xee5a6f, 0xff8a5c, 0xd63031];
        coralPositions.forEach(([col, row]) => {
            const x = col * TILE + TILE / 2;
            const y = row * TILE + TILE / 2;
            const c = this.add.graphics().setDepth(6);
            const color = coralColors[Math.floor(Math.random() * coralColors.length)];

            c.fillStyle(color, 0.85);
            c.fillCircle(x - 4, y + 3, 5);
            c.fillCircle(x - 8, y - 2, 3);
            c.fillCircle(x - 2, y - 6, 4);
            c.fillStyle(color, 0.7);
            c.fillCircle(x + 5, y + 2, 4);
            c.fillCircle(x + 9, y - 3, 3);
            c.fillCircle(x + 4, y - 7, 3);
            c.fillStyle(0xffffff, 0.3);
            c.fillCircle(x - 3, y - 5, 2);
            c.fillCircle(x + 6, y - 6, 1.5);

            // 珊瑚碰撞
            this.obstacles.push({ x: x - 15, y: y - 15, width: 30, height: 30 });
        });

        // ==================== 气泡效果 ====================
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.add.particles(0, 0, '', {
            x: { min: 40, max: width - 40 },
            y: { min: height - 120, max: height - 20 },
            lifespan: 4000,
            speedY: { min: -30, max: -80 },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.6, end: 0 },
            frequency: 500,
            quantity: 1,
        }).setDepth(50);

        // ==================== 光线效果 ====================
        for (let i = 0; i < 5; i++) {
            const rayX = 50 + i * 100;
            const lightRay = this.add.rectangle(rayX, 0, 30, height, 0xffffff, 0.05);
            lightRay.setOrigin(0.5, 0);
            lightRay.setScrollFactor(0);
            lightRay.setDepth(5);
            this.tweens.add({
                targets: lightRay,
                x: rayX + 20,
                duration: 5000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        }
    }

    update(): void {
        if (this.wukong) {
            this.wukong.updateFromControllerWithCollision(this.obstacles);
            this.checkMapExit();
        }
    }

    private checkNpcInteraction(): void {
        if (this.dialogBox.isDialogActive()) return;

        const dk = this.dragonKingNpc;
        if (!dk) return;

        const pos = dk.getCollisionRect();
        const cx = pos.x + pos.width / 2;
        const cy = pos.y + pos.height / 2;
        const dist = Math.hypot(this.wukong.getX() - cx, this.wukong.getY() - cy);

        if (dist < 80) {
            if (this.victory) {
                this.dialogBox.show('东海龙王', [
                    '大圣慢走！日后若有需要，东海龙宫定当相助！',
                ]);
            } else {
                this.dialogBox.show('东海龙王', [
                    '哼！你这猴子，口气不小！',
                    '想要兵器？看你有没有本事从我手里拿走！',
                ], () => this.startBattleOrTask());
            }
        }
    }

    private showIntroDialog(): void {
        if (this.dialogBox.isDialogActive()) return;
        this.dialogBox.show('东海龙王', [
            '何方妖孽，竟敢擅闯我东海龙宫！',
            '嗯？你就是花果山水帘洞的孙悟空？',
            '本王听说过你的名号，来我龙宫有何贵干？',
        ], () => {
            this.dialogBox.show('孙悟空', [
                '嘿嘿，老龙王，俺老孙听说你这龙宫有不少宝贝兵器！',
                '特来借一件耍耍，也好保俺花果山平安！',
            ], () => {
                this.dialogBox.show('东海龙王', [
                    '哼！你这猴子，口气不小！',
                    '你想要兵器？我东海龙宫确实有些宝贝...',
                    '不过，得看你有没有本事拿走了！',
                ], () => this.startBattleOrTask());
            });
        });
    }

    private spawnNpcs(): void {
        this.dragonKingNpc = new DragonKing(
            this, 10 * TILE, 4 * TILE, '东海龙王',
            ['你胆敢擅闯龙宫？来者何人？'],
            this.dialogBox
        );
        this.obstacles.push(this.dragonKingNpc.getCollisionRect());

        const shrimp1 = new Shrimp(this, 6 * TILE, 9 * TILE, '海虾1', ['叽叽喳喳'], this.dialogBox);
        const shrimp2 = new Shrimp(this, 14 * TILE, 9 * TILE, '海虾2', ['叽叽喳喳'], this.dialogBox);
        const crab1 = new Crab(this, 4 * TILE, 8 * TILE, '寄居蟹', ['嘟囔'], this.dialogBox);
        this.obstacles.push(
            shrimp1.getCollisionRect(),
            shrimp2.getCollisionRect(),
            crab1.getCollisionRect()
        );
    }

    private startBattleOrTask(): void {
        if (this.battleStarted) return;
        this.battleStarted = true;

        const onBattleEnd = (result: 'win' | 'lose') => {
            if (result === 'win') {
                TaskManager.getInstance().completeTask('get_weapon_from_dragon');
                const save = SaveManager.getInstance().loadGame(1);
                return { key: 'DonghaiVictoryScene', data: { saveData: save ?? undefined } };
            }
            return 'BootScene';
        };

        const config: import('../core/BattleScene').BattleConfig = {
            saveSlot: 1,
            playerUnits: [
                {
                    id: 'wukong',
                    name: '孙悟空',
                    x: 11,
                    y: 7,
                    hp: this.wukong.getHp(),
                    maxHp: this.wukong.getMaxHp(),
                    attack: this.wukong.getAttack(),
                    defense: this.wukong.getDefense(),
                    moveRange: this.wukong.getBattleMoveRange(),
                    attackRange: this.wukong.getBattleAttackRange(),
                    level: this.wukong.getLevel(),
                    exp: this.wukong.getExp(),
                    characterClass: 'WuKong',
                },
            ],
            enemyUnits: [
                {
                    id: 'shrimp_1',
                    name: '虾兵',
                    x: 6,
                    y: 5,
                    hp: Shrimp.BATTLE_STATS.maxHp,
                    maxHp: Shrimp.BATTLE_STATS.maxHp,
                    attack: Shrimp.BATTLE_STATS.attack,
                    defense: Shrimp.BATTLE_STATS.defense,
                    moveRange: Shrimp.BATTLE_STATS.moveRange,
                    attackRange: Shrimp.BATTLE_STATS.attackRange,
                    characterClass: 'Shrimp',
                },
                {
                    id: 'crab_1',
                    name: '蟹将',
                    x: 7,
                    y: 6,
                    hp: Crab.BATTLE_STATS.maxHp,
                    maxHp: Crab.BATTLE_STATS.maxHp,
                    attack: Crab.BATTLE_STATS.attack,
                    defense: Crab.BATTLE_STATS.defense,
                    moveRange: Crab.BATTLE_STATS.moveRange,
                    attackRange: Crab.BATTLE_STATS.attackRange,
                    characterClass: 'Crab',
                },
                {
                    id: 'dragon_king',
                    name: '东海龙王',
                    x: 3,
                    y: 4,
                    hp: DragonKing.BATTLE_STATS.maxHp,
                    maxHp: DragonKing.BATTLE_STATS.maxHp,
                    attack: DragonKing.BATTLE_STATS.attack,
                    defense: DragonKing.BATTLE_STATS.defense,
                    moveRange: DragonKing.BATTLE_STATS.moveRange,
                    attackRange: DragonKing.BATTLE_STATS.attackRange,
                    characterClass: 'DragonKing',
                },
            ],
            onBattleEnd,
        };

        this.scene.start('BattleScene', config);
    }

    private createWorldMapExitHint(): void {
        const hint = this.add.text(400, MAP_H - 30, '从任意边缘离开返回世界地图', {
            fontSize: '12px',
            color: '#FFD700',
            fontFamily: 'monospace',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 4 },
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);

        this.tweens.add({
            targets: hint,
            alpha: { from: 1, to: 0.4 },
            duration: 800,
            yoyo: true,
            repeat: -1,
        });
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

    private checkMapExit(): void {
        if (this.isExiting) return;
        const px = this.wukong.getX();
        const py = this.wukong.getY();
        const margin = 40;

        if (px < margin || px > MAP_W - margin || py < margin || py > MAP_H - margin) {
            this.isExiting = true;
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('WorldMapScene', { returnNodeId: 'donghai' });
            });
        }
    }
}