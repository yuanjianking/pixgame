// BattleScene.ts
import * as Phaser from 'phaser';
import { BattleGrid } from "../../maps/BattleGrid";
import { createBattleCharacter } from '../../characters/CharacterRegistry';
import type { BaseCharacter } from '../../characters/player/BaseCharacter';
import { SaveManager } from '../../save/SaveManager';
import { snapshotFromCharacter } from '../../save/playerSave';

interface BattleUnitData {
    id: string;
    name: string;
    type: 'player' | 'enemy';
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    moveRange: number;
    attackRange: number;
    /** 战斗角色类名，对应 CharacterRegistry 中的注册 key */
    characterClass: string;
}

export type BattlePlayerUnitConfig = Omit<BattleUnitData, 'type'> & {
    level?: number;
    exp?: number;
};

export interface BattleConfig {
    playerUnits: BattlePlayerUnitConfig[];
    enemyUnits: Omit<BattleUnitData, 'type'>[];
    mapWidth?: number;
    mapHeight?: number;
    cellSize?: number;
    saveSlot?: number;
    onBattleEnd?: (result: 'win' | 'lose') => string | { key: string; data?: object };
}

interface BattleUnit extends BattleUnitData {
    type: 'player' | 'enemy';
    character: BaseCharacter;
}

type MenuState = 'none' | 'main' | 'move' | 'attack';

export class BattleScene extends Phaser.Scene {
    private battleGrid!: BattleGrid;
    private units: BattleUnit[] = [];
    private currentPlayerUnit: BattleUnit | null = null;

    private battleConfig: BattleConfig | null = null;
    private onBattleEnd: ((result: 'win' | 'lose') => string | { key: string; data?: object }) | null = null;

    private cursorX: number = 0;
    private cursorY: number = 0;
    private cursorGraphics!: Phaser.GameObjects.Graphics;

    private moveRange: { x: number; y: number }[] = [];
    private attackRange: { x: number; y: number }[] = [];
    private currentTurn: 'player' | 'enemy' = 'player';
    private isAnimating: boolean = false;
    private currentEnemyIndex: number = 0;

    private menuState: MenuState = 'none';
    private menuContainer!: Phaser.GameObjects.Container;
    private selectedMenuIndex: number = 0;
    private menuCursor!: Phaser.GameObjects.Graphics;
    private menuTexts: Phaser.GameObjects.Text[] = [];

    // UI 元素
    private turnText!: Phaser.GameObjects.Text;
    private unitInfoContainer!: Phaser.GameObjects.Container;
    private unitInfoNameText!: Phaser.GameObjects.Text;
    private unitInfoHpText!: Phaser.GameObjects.Text;
    private unitInfoStatsText!: Phaser.GameObjects.Text;

    private battleEnded = false;

    // 战斗统计数据
    private battleStats = { expGained: 0, enemiesDefeated: 0, damageDealt: 0, criticalHits: 0 };

    private cellSize: number = 50;
    private mapWidth: number = 16;
    private mapHeight: number = 12;
    private saveSlot: number = 1;

    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data: BattleConfig): void {
        this.battleConfig = data;
        this.onBattleEnd = data.onBattleEnd || null;
        this.mapWidth = data.mapWidth || 16;
        this.mapHeight = data.mapHeight || 12;
        this.cellSize = data.cellSize || 50;
        this.saveSlot = data.saveSlot ?? 1;
    }

    create(): void {
        this.battleGrid = new BattleGrid(this, this.mapWidth, this.mapHeight, this.cellSize);
        this.battleGrid.setPosition(0, 0);
        this.battleGrid.render();

        this.createAllUnits();

        const firstPlayer = this.units.find(u => u.type === 'player');
        if (firstPlayer) {
            this.cursorX = firstPlayer.x;
            this.cursorY = firstPlayer.y;
            this.currentPlayerUnit = firstPlayer;
        }

        this.createMenu();
        this.createUnitInfoPanel();
        this.createCursor();
        this.createTurnIndicator();
        this.setupKeyboard();
        this.updateTurnIndicator();
    }

    private createAllUnits(): void {
        if (!this.battleConfig) return;

        for (const unitData of this.battleConfig.playerUnits) {
            this.createUnit({ ...unitData, type: 'player' });
        }

        for (const unitData of this.battleConfig.enemyUnits) {
            this.createUnit({ ...unitData, type: 'enemy' });
        }
    }

    private createUnit(unit: Omit<BattleUnit, 'character'>): void {
        const graphics = this.add.graphics();
        const character = this.createCharacterSprite(unit.characterClass, graphics);
        character.setScale(0.4, 1.5);
        character.setCollisionRadius(15);
        character.setShowHealthBar(true);

        // 设置血量和血条颜色（玩家绿色，敌人使用种族自带颜色）
        const barColor = unit.type === 'player' ? 0x00AA00 : character.getHealthBarColor();
        character.setHp(unit.hp, unit.maxHp, barColor);
        // 将战斗数值注入到角色对象，便于升级与显示
        const playerUnit = unit as BattlePlayerUnitConfig;
        character.setBattleStats({
            attack: unit.attack,
            defense: unit.defense,
            moveRange: unit.moveRange,
            attackRange: unit.attackRange,
            level: playerUnit.level,
            exp: playerUnit.exp,
        });

        const worldX = unit.x * this.cellSize + this.cellSize / 2;
        const worldY = unit.y * this.cellSize + this.cellSize / 2;
        character.setPosition(worldX, worldY);

        const newUnit: BattleUnit = {
            ...unit,
            character: character
        };

        this.units.push(newUnit);
        this.battleGrid.setOccupied(unit.x, unit.y, unit.type, unit.id);
    }

    private createCharacterSprite(characterClass: string, graphics: Phaser.GameObjects.Graphics): BaseCharacter {
        return createBattleCharacter(characterClass, graphics, this);
    }

    private createMenu(): void {
        this.menuContainer = this.add.container(0, 0);
        this.menuContainer.setDepth(200);
        this.menuContainer.setVisible(false);

        const bg = this.add.rectangle(0, 0, 100, 70, 0x000000, 0.85);
        bg.setStrokeStyle(2, 0xFFD700);
        bg.setOrigin(0, 0);

        const moveText = this.add.text(15, 12, '移动', {
            fontSize: '16px',
            color: '#FFFFFF',
            fontFamily: 'monospace'
        });

        const attackText = this.add.text(15, 40, '攻击', {
            fontSize: '16px',
            color: '#FFFFFF',
            fontFamily: 'monospace'
        });

        this.menuTexts = [moveText, attackText];
        this.menuContainer.add([bg, moveText, attackText]);

        this.menuCursor = this.add.graphics();
        this.menuContainer.add(this.menuCursor);
        this.drawMenuCursor();
    }

    private drawMenuCursor(): void {
        this.menuCursor.clear();
        const y = 18 + this.selectedMenuIndex * 30;
        this.menuCursor.fillStyle(0xFFD700, 1);
        this.menuCursor.fillTriangle(5, y, 5, y + 10, 12, y + 5);
    }

    private updateMenuTextColor(): void {
        for (let i = 0; i < this.menuTexts.length; i++) {
            this.menuTexts[i].setColor(i === this.selectedMenuIndex ? '#FFD700' : '#FFFFFF');
        }
    }

    private showMenu(): void {
        if (this.currentTurn !== 'player') return;
        if (this.menuState !== 'none') return;

        const x = this.cursorX * this.cellSize + 25;
        const y = this.cursorY * this.cellSize - 55;
        this.menuContainer.setPosition(x, y);
        this.menuContainer.setVisible(true);
        this.selectedMenuIndex = 0;
        this.drawMenuCursor();
        this.updateMenuTextColor();
        this.menuState = 'main';
    }

    private hideMenu(): void {
        this.menuContainer.setVisible(false);
        this.menuState = 'none';
    }

    private moveMenuUp(): void {
        if (this.menuState !== 'main') return;
        this.selectedMenuIndex = (this.selectedMenuIndex - 1 + 2) % 2;
        this.drawMenuCursor();
        this.updateMenuTextColor();
    }

    private moveMenuDown(): void {
        if (this.menuState !== 'main') return;
        this.selectedMenuIndex = (this.selectedMenuIndex + 1) % 2;
        this.drawMenuCursor();
        this.updateMenuTextColor();
    }

    private confirmMenu(): void {
        if (this.menuState !== 'main') return;

        if (this.selectedMenuIndex === 0) {
            this.selectMove();
        } else {
            this.selectAttack();
        }
    }

    private selectMove(): void {
        this.hideMenu();
        if (this.currentPlayerUnit) {
            this.showMoveRange(this.currentPlayerUnit.x, this.currentPlayerUnit.y);
            this.menuState = 'move';
        }
    }

    private selectAttack(): void {
        this.hideMenu();
        if (this.currentPlayerUnit) {
            this.showAttackRange(this.currentPlayerUnit.x, this.currentPlayerUnit.y);
            this.menuState = 'attack';
        }
    }

    private createTurnIndicator(): void {
        this.turnText = this.add.text(this.cameras.main.width / 2, 16, '玩家回合', {
            fontSize: '18px',
            color: '#44FF44',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            backgroundColor: '#000000aa',
            padding: { x: 12, y: 4 },
        }).setOrigin(0.5).setDepth(300).setScrollFactor(0);
    }

    private updateTurnIndicator(): void {
        if (this.currentTurn === 'player') {
            this.turnText.setText('玩家回合');
            this.turnText.setColor('#44FF44');
        } else {
            this.turnText.setText('敌人回合');
            this.turnText.setColor('#FF4444');
        }
    }

    private createUnitInfoPanel(): void {
        this.unitInfoContainer = this.add.container(0, 0);
        this.unitInfoContainer.setDepth(300);
        this.unitInfoContainer.setVisible(false);
        this.unitInfoContainer.setScrollFactor(0);

        const bg = this.add.rectangle(0, 0, 180, 55, 0x000000, 0.8);
        bg.setStrokeStyle(1, 0xFFD700);
        bg.setOrigin(0, 0);

        this.unitInfoNameText = this.add.text(8, 4, '', {
            fontSize: '12px', color: '#FFFFFF', fontFamily: 'monospace', fontStyle: 'bold',
        });
        this.unitInfoHpText = this.add.text(8, 22, '', {
            fontSize: '11px', color: '#88FF88', fontFamily: 'monospace',
        });
        this.unitInfoStatsText = this.add.text(8, 38, '', {
            fontSize: '10px', color: '#CCCCCC', fontFamily: 'monospace',
        });

        this.unitInfoContainer.add([bg, this.unitInfoNameText, this.unitInfoHpText, this.unitInfoStatsText]);
    }

    private updateUnitInfoPanel(): void {
        const unit = this.units.find(u => u.x === this.cursorX && u.y === this.cursorY);
        if (!unit) return;

        const screenX = Math.min(this.cursorX * this.cellSize + 10, this.cameras.main.width - 190);
        const screenY = this.cursorY * this.cellSize - 65;
        this.unitInfoContainer.setPosition(screenX, Math.max(0, screenY));

        const typeLabel = unit.type === 'player' ? '【友军】' : '【敌军】';
        const typeColor = unit.type === 'player' ? '#44FF44' : '#FF4444';
        this.unitInfoNameText.setText(`${typeLabel}${unit.name}`);
        this.unitInfoNameText.setColor(typeColor);

        const hpPercent = Math.round((unit.character.getHp() / unit.character.getMaxHp()) * 100);
        this.unitInfoHpText.setText(`HP: ${unit.character.getHp()}/${unit.character.getMaxHp()} (${hpPercent}%)`);

        if (unit.type === 'player') {
            this.unitInfoStatsText.setText(`攻击${unit.attack} 防御${unit.defense} 移动${unit.moveRange}`);
        } else {
            this.unitInfoStatsText.setText(`攻击${unit.attack} 防御${unit.defense}`);
        }
    }

    private setupKeyboard(): void {
        const keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        const keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        const keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        const keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        const moveCursorHandler = (dx: number, dy: number) => {
            if (this.menuState === 'none' || this.menuState === 'move' || this.menuState === 'attack') {
                this.moveCursor(dx, dy);
            }
        };

        keyW.on('down', () => moveCursorHandler(0, -1));
        keyS.on('down', () => moveCursorHandler(0, 1));
        keyA.on('down', () => moveCursorHandler(-1, 0));
        keyD.on('down', () => moveCursorHandler(1, 0));

        keyW.on('down', () => {
            if (this.menuState === 'main') this.moveMenuUp();
        });
        keyS.on('down', () => {
            if (this.menuState === 'main') this.moveMenuDown();
        });

        const keyJ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        keyJ.on('down', () => {
            if (this.currentTurn !== 'player') return;

            if (this.menuState === 'main') {
                this.confirmMenu();
            } else if (this.menuState === 'move') {
                this.handleMoveConfirm();
            } else if (this.menuState === 'attack') {
                this.handleAttackConfirm();
            } else if (this.menuState === 'none') {
                const unitAtCursor = this.units.find(u => u.x === this.cursorX && u.y === this.cursorY);
                if (unitAtCursor && unitAtCursor.type === 'player') {
                    this.currentPlayerUnit = unitAtCursor;
                    this.showMenu();
                }
            }
        });

        const keyK = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        keyK.on('down', () => {
            if (this.menuState === 'main') {
                this.hideMenu();
            } else if (this.menuState === 'move' || this.menuState === 'attack') {
                this.clearMoveRange();
                this.clearAttackRange();
                this.menuState = 'none';
            }
        });

        const keyQ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        keyQ.on('down', () => {
            const unit = this.units.find(u => u.x === this.cursorX && u.y === this.cursorY);
            if (unit) {
                this.updateUnitInfoPanel();
                this.unitInfoContainer.setVisible(true);
            }
        });
        keyQ.on('up', () => {
            this.unitInfoContainer.setVisible(false);
        });
    }

    private moveCursor(dx: number, dy: number): void {
        const newX = this.cursorX + dx;
        const newY = this.cursorY + dy;

        if (newX >= 0 && newX < this.mapWidth && newY >= 0 && newY < this.mapHeight) {
            this.cursorX = newX;
            this.cursorY = newY;
            this.drawCursor();
        }
    }

    private createCursor(): void {
        this.cursorGraphics = this.add.graphics();
        this.drawCursor();
    }

    private drawCursor(): void {
        this.cursorGraphics.clear();
        const x = this.cursorX * this.cellSize;
        const y = this.cursorY * this.cellSize;
        const s = this.cellSize;

        this.cursorGraphics.lineStyle(2, 0xFFD700, 1);
        this.cursorGraphics.strokeRect(x, y, s, s);
        this.cursorGraphics.lineStyle(1, 0xFFD700, 0.6);
        this.cursorGraphics.strokeRect(x + 3, y + 3, s - 6, s - 6);
        this.cursorGraphics.fillStyle(0xFFD700, 1);
        this.cursorGraphics.fillCircle(x + 4, y + 4, 2);
        this.cursorGraphics.fillCircle(x + s - 4, y + 4, 2);
        this.cursorGraphics.fillCircle(x + 4, y + s - 4, 2);
        this.cursorGraphics.fillCircle(x + s - 4, y + s - 4, 2);

        this.updateUnitInfoPanel();
    }

    private handleMoveConfirm(): void {
        const canMove = this.moveRange.some(pos => pos.x === this.cursorX && pos.y === this.cursorY);

        if (canMove && this.battleGrid.isWalkable(this.cursorX, this.cursorY)) {
            this.moveUnitTo(this.currentPlayerUnit!, this.cursorX, this.cursorY);
            this.menuState = 'none';
        }
    }

    private handleAttackConfirm(): void {
        const enemy = this.units.find(u => u.type === 'enemy' && u.x === this.cursorX && u.y === this.cursorY);

        if (enemy && this.attackRange.some(pos => pos.x === this.cursorX && pos.y === this.cursorY)) {
            this.attackEnemy(this.currentPlayerUnit!, enemy);
            this.menuState = 'none';
        }
    }

    private showMoveRange(x: number, y: number): void {
        this.moveRange = this.calculateMoveRange(x, y, this.currentPlayerUnit!.moveRange);
        this.battleGrid.highlightMoveRange(this.moveRange);
    }

    private showAttackRange(x: number, y: number): void {
        const directions = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 1, y: 0 },
            { x: -1, y: -1 }, { x: 1, y: -1 },
            { x: -1, y: 1 }, { x: 1, y: 1 }
        ];

        this.attackRange = [];
        for (let i = 1; i <= this.currentPlayerUnit!.attackRange; i++) {
            for (const dir of directions) {
                const newX = x + dir.x * i;
                const newY = y + dir.y * i;
                if (newX >= 0 && newX < this.mapWidth && newY >= 0 && newY < this.mapHeight) {
                    this.attackRange.push({ x: newX, y: newY });
                }
            }
        }

        this.battleGrid.highlightAttackRange(this.attackRange);
    }

    private clearAttackRange(): void {
        this.battleGrid.clearHighlight();
        this.attackRange = [];
    }

    private calculateMoveRange(startX: number, startY: number, maxDistance: number): { x: number; y: number }[] {
        const range: { x: number; y: number }[] = [];
        const visited = new Set<string>();
        const queue: { x: number; y: number; dist: number }[] = [{ x: startX, y: startY, dist: 0 }];
        const directions = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 1, y: 0 }
        ];

        visited.add(`${startX},${startY}`);

        while (queue.length > 0) {
            const current = queue.shift()!;
            range.push({ x: current.x, y: current.y });

            if (current.dist >= maxDistance) continue;

            for (const dir of directions) {
                const newX = current.x + dir.x;
                const newY = current.y + dir.y;
                const key = `${newX},${newY}`;
                if (visited.has(key)) continue;
                if (!this.battleGrid.isWalkable(newX, newY)) continue;
                visited.add(key);
                queue.push({ x: newX, y: newY, dist: current.dist + 1 });
            }
        }
        return range;
    }

    private moveUnitTo(unit: BattleUnit, x: number, y: number): void {
        this.battleGrid.setOccupied(unit.x, unit.y, null);

        const targetX = x * this.cellSize + this.cellSize / 2;
        const targetY = y * this.cellSize + this.cellSize / 2;
        const startX = unit.character.getX();
        const startY = unit.character.getY();

        this.isAnimating = true;
        unit.character.setBattleAnimation(true, 0);

        let step = 0;
        const totalSteps = 50;
        const stepDelay = 20;

        const timer = this.time.addEvent({
            delay: stepDelay,
            repeat: totalSteps - 1,
            callback: () => {
                step++;
                const t = step / totalSteps;
                const newXPos = startX + (targetX - startX) * t;
                const newYPos = startY + (targetY - startY) * t;
                unit.character.setPosition(newXPos, newYPos);
                unit.character.setBattleAnimation(true, step * 0.3);
            },
            callbackScope: this
        });

        this.time.delayedCall(stepDelay * totalSteps, () => {
            timer.remove();
            unit.character.setBattleAnimation(false, 0);
            unit.character.setPosition(targetX, targetY);

            unit.x = x;
            unit.y = y;

            this.battleGrid.setOccupied(x, y, unit.type, unit.id);

            if (unit.type === 'player' && this.currentPlayerUnit === unit) {
                this.cursorX = x;
                this.cursorY = y;
                this.drawCursor();
            }

            this.clearMoveRange();
            this.isAnimating = false;

            if (unit.type === 'player') {
                this.endPlayerTurn();
            } else {
                this.currentEnemyIndex++;
                this.processNextEnemy();
            }
        });
    }

    private calculateDamage(attacker: BattleUnit, defender: BattleUnit): { damage: number; isCrit: boolean } {
        let baseDamage = Math.max(1, attacker.attack - defender.defense);
        // 伤害浮动 ±20%
        const variance = 0.8 + Math.random() * 0.4;
        baseDamage = Math.max(1, Math.round(baseDamage * variance));
        // 暴击: 10% 概率，1.5 倍伤害
        const isCrit = Math.random() < 0.1;
        const damage = isCrit ? Math.round(baseDamage * 1.5) : baseDamage;
        return { damage: Math.max(1, damage), isCrit };
    }

    private showDamageNumber(x: number, y: number, damage: number, isCrit: boolean): void {
        const color = isCrit ? '#FF4444' : '#FFD700';
        const size = isCrit ? '20px' : '14px';
        const text = isCrit ? `暴击! ${damage}` : `${damage}`;

        const dmgText = this.add.text(x, y - 10, text, {
            fontSize: size,
            color: color,
            fontFamily: 'monospace',
            fontStyle: isCrit ? 'bold' : 'normal',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(400);

        this.tweens.add({
            targets: dmgText,
            y: y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => dmgText.destroy(),
        });
    }

    private playHitEffect(x: number, y: number): void {
        // 屏幕震动
        this.cameras.main.shake(100, 0.005);

        // 命中闪光粒子（用简单图形模拟）
        const hitFlash = this.add.graphics();
        hitFlash.fillStyle(0xFFFFFF, 0.8);
        hitFlash.fillCircle(x, y, 15);
        hitFlash.setDepth(350);

        this.tweens.add({
            targets: hitFlash,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 200,
            onComplete: () => hitFlash.destroy(),
        });
    }

    private playDeathEffect(unit: BattleUnit): void {
        const x = unit.character.getX();
        const y = unit.character.getY();

        // 粒子爆发（用多个小点模拟）
        for (let i = 0; i < 8; i++) {
            const particle = this.add.graphics();
            particle.fillStyle(0xFF6600, 1);
            particle.fillCircle(0, 0, 3);
            particle.setPosition(x, y);
            particle.setDepth(350);

            const angle = (Math.PI * 2 * i) / 8;
            const dist = 40 + Math.random() * 30;
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                alpha: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => particle.destroy(),
            });
        }

        // 白色闪烁
        const deathFlash = this.add.graphics();
        deathFlash.fillStyle(0xFFFFFF, 0.9);
        deathFlash.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        deathFlash.setDepth(400);

        this.tweens.add({
            targets: deathFlash,
            alpha: 0,
            duration: 300,
            onComplete: () => deathFlash.destroy(),
        });
    }

    private attackEnemy(attacker: BattleUnit, target: BattleUnit): void {
        const { damage, isCrit } = this.calculateDamage(attacker, target);
        const isDead = target.character.takeDamage(damage);

        if (isCrit) this.battleStats.criticalHits++;
        this.battleStats.damageDealt += damage;

        const targetX = target.character.getX();
        const targetY = target.character.getY();

        // 显示伤害数字
        this.showDamageNumber(targetX, targetY, damage, isCrit);
        // 命中特效
        this.playHitEffect(targetX, targetY);

        attacker.character.setBattleAnimation(false, 0, true);
        this.time.delayedCall(300, () => {
            attacker.character.setBattleAnimation(false, 0, false);

            if (isDead) {
                this.playDeathEffect(target);
                const expReward = Math.max(1, Math.floor(target.character.getMaxHp() / 2));
                if (attacker.type === 'player') {
                    attacker.character.gainExp(expReward);
                    this.battleStats.expGained += expReward;
                    this.battleStats.enemiesDefeated++;
                }
                this.removeUnit(target);
            }

            this.clearAttackRange();
            this.endPlayerTurn();
        });
    }

    private removeUnit(unit: BattleUnit): void {
        console.log(`${unit.name} 被击败`);
        this.battleGrid.setOccupied(unit.x, unit.y, null);
        unit.character.clear();  // 这会清理血条和图形
        this.units = this.units.filter(u => u.id !== unit.id);

        const remainingEnemies = this.units.filter(u => u.type === 'enemy');
        if (remainingEnemies.length === 0) {
            this.endBattle('win');
        }
    }

    private clearMoveRange(): void {
        this.battleGrid.clearHighlight();
        this.moveRange = [];
    }

    private endPlayerTurn(): void {
        this.currentTurn = 'enemy';
        this.updateTurnIndicator();
        this.enemyTurn();
    }

    private enemyTurn(): void {
        const enemies = this.units.filter(u => u.type === 'enemy');
        if (enemies.length === 0) {
            this.endBattle('win');
            return;
        }

        this.currentEnemyIndex = 0;
        this.processNextEnemy();
    }

    private processNextEnemy(): void {
        const enemies = this.units.filter(u => u.type === 'enemy');
        if (this.currentEnemyIndex >= enemies.length) {
            this.endEnemyTurn();
            return;
        }

        const enemy = enemies[this.currentEnemyIndex];
        this.moveEnemyTowardsPlayer(enemy);
    }

    private findPathToTarget(
        startX: number, startY: number,
        targetX: number, targetY: number
    ): { x: number; y: number } | null {
        const visited = new Set<string>();
        const queue: { x: number; y: number; path: { x: number; y: number }[] }[] = [
            { x: startX, y: startY, path: [] }
        ];

        visited.add(`${startX},${startY}`);

        const directions = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 1, y: 0 }
        ];

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (current.path.length >= 20) continue;

            for (const dir of directions) {
                const nx = current.x + dir.x;
                const ny = current.y + dir.y;
                const key = `${nx},${ny}`;

                if (nx < 0 || nx >= this.mapWidth || ny < 0 || ny >= this.mapHeight) continue;
                if (visited.has(key)) continue;

                const isTargetCell = (nx === targetX && ny === targetY);
                if (!isTargetCell && !this.battleGrid.isWalkable(nx, ny)) continue;

                const newPath = [...current.path, { x: nx, y: ny }];

                if (Math.abs(nx - targetX) + Math.abs(ny - targetY) <= 1) {
                    return newPath.length > 0 ? newPath[0] : { x: nx, y: ny };
                }

                visited.add(key);
                queue.push({ x: nx, y: ny, path: newPath });
            }
        }

        return null;
    }

    private moveEnemyTowardsPlayer(enemy: BattleUnit): void {
        const players = this.units.filter(u => u.type === 'player');
        if (players.length === 0) {
            this.endBattle('lose');
            return;
        }

        const target = players.reduce((a, b) =>
            a.character.getHp() < b.character.getHp() ? a : b
        );

        const dist = Math.abs(target.x - enemy.x) + Math.abs(target.y - enemy.y);

        if (dist <= 1) {
            this.enemyAttack(enemy, target);
            return;
        }

        const nextStep = this.findPathToTarget(enemy.x, enemy.y, target.x, target.y);

        if (nextStep && this.battleGrid.isWalkable(nextStep.x, nextStep.y)) {
            this.battleGrid.setOccupied(enemy.x, enemy.y, null);

            const targetWorldX = nextStep.x * this.cellSize + this.cellSize / 2;
            const targetWorldY = nextStep.y * this.cellSize + this.cellSize / 2;
            const startX = enemy.character.getX();
            const startY = enemy.character.getY();

            this.isAnimating = true;
            enemy.character.setBattleAnimation(true, 0);

            let step = 0;
            const totalSteps = 50;
            const stepDelay = 20;

            const timer = this.time.addEvent({
                delay: stepDelay,
                repeat: totalSteps - 1,
                callback: () => {
                    step++;
                    const t = step / totalSteps;
                    enemy.character.setPosition(
                        startX + (targetWorldX - startX) * t,
                        startY + (targetWorldY - startY) * t
                    );
                    enemy.character.setBattleAnimation(true, step * 0.3);
                },
                callbackScope: this
            });

            this.time.delayedCall(stepDelay * totalSteps, () => {
                timer.remove();
                enemy.character.setBattleAnimation(false, 0);
                enemy.character.setPosition(targetWorldX, targetWorldY);

                enemy.x = nextStep.x;
                enemy.y = nextStep.y;
                this.battleGrid.setOccupied(enemy.x, enemy.y, 'enemy', enemy.id);

                this.isAnimating = false;
                this.currentEnemyIndex++;
                this.processNextEnemy();
            });
        } else {
            this.currentEnemyIndex++;
            this.processNextEnemy();
        }
    }

    private enemyAttack(attacker: BattleUnit, target: BattleUnit): void {
        const { damage, isCrit } = this.calculateDamage(attacker, target);
        const isDead = target.character.takeDamage(damage);

        const targetX = target.character.getX();
        const targetY = target.character.getY();

        this.showDamageNumber(targetX, targetY, damage, isCrit);
        this.playHitEffect(targetX, targetY);

        attacker.character.setBattleAnimation(false, 0, true);
        target.character.playHitFlash();
        this.time.delayedCall(300, () => {
            attacker.character.setBattleAnimation(false, 0, false);
            if (isDead) {
                this.playDeathEffect(target);
                this.removeUnit(target);
            }
            this.currentEnemyIndex++;
            this.processNextEnemy();
        });
    }

    private endEnemyTurn(): void {
        this.currentTurn = 'player';
        this.menuState = 'none';
        this.battleGrid.clearHighlight();
        this.updateTurnIndicator();

        const alivePlayers = this.units.filter(u => u.type === 'player');
        if (alivePlayers.length === 0) {
            this.endBattle('lose');
        }
    }

    private persistPlayerProgress(): void {
        const players = this.units.filter((u) => u.type === 'player');
        if (players.length === 0) return;

        SaveManager.getInstance().updateSave(this.saveSlot, (saveData) => {
            const lead = players[0].character;
            saveData.player = snapshotFromCharacter(lead, {
                id: saveData.player?.id ?? 'wukong',
                playerClass: saveData.player?.playerClass ?? 'WuKong',
                position: saveData.player?.position ?? { x: 0, y: 0 },
                currentScene: saveData.player?.currentScene ?? 'WorldMapScene',
            });
            saveData.party = saveData.party?.length
                ? saveData.party.map((p, i) =>
                    i === 0 || p.id === saveData.player.id ? { ...saveData.player } : p
                  )
                : [{ ...saveData.player }];
        });
    }

    private showBattleResult(result: 'win' | 'lose'): void {
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        overlay.setDepth(500);

        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2;

        this.add.text(cx, cy - 60, result === 'win' ? '战斗胜利！' : '战斗失败...', {
            fontSize: '36px',
            color: result === 'win' ? '#FFD700' : '#FF4444',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(501);

        if (result === 'win') {
            this.add.text(cx, cy + 10, [
                `击败敌人: ${this.battleStats.enemiesDefeated}`,
                `造成伤害: ${this.battleStats.damageDealt}`,
                `暴击次数: ${this.battleStats.criticalHits}`,
                `获得经验: ${this.battleStats.expGained}`,
            ].join('\n'), {
                fontSize: '14px',
                color: '#CCCCCC',
                fontFamily: 'monospace',
                align: 'center',
                lineSpacing: 6,
            }).setOrigin(0.5).setDepth(501);

            const tipText = this.add.text(cx, cy + 80, '继续...', {
                fontSize: '12px',
                color: '#FFD700',
                fontFamily: 'monospace',
            }).setOrigin(0.5).setDepth(501);

            this.tweens.add({
                targets: tipText,
                alpha: { from: 1, to: 0.3 },
                duration: 500,
                yoyo: true,
                repeat: -1,
            });
        }

        // 自动过渡
        this.time.delayedCall(result === 'win' ? 2000 : 1500, () => {
            if (this.onBattleEnd) {
                const next = this.onBattleEnd(result);
                if (typeof next === 'string') {
                    this.scene.start(next);
                } else if (next) {
                    this.scene.start(next.key, next.data);
                }
            } else {
                this.scene.start('WorldMapScene');
            }
        });
    }

    private endBattle(result: 'win' | 'lose'): void {
        if (this.battleEnded) return;
        this.battleEnded = true;
        this.battleGrid.clearHighlight();
        if (result === 'win') {
            this.persistPlayerProgress();
        }
        this.showBattleResult(result);
    }
}