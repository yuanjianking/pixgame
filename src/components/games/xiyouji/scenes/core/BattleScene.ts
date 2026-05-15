// BattleScene.ts
import * as Phaser from 'phaser';
import { BattleGrid } from "../../maps/BattleGrid";
import { WuKong } from '../../characters/player/WuKong';
import { BaiLongMa } from '../../characters/player/BaiLongMa';
import type { BaseCharacter } from '../../characters/player/BaseCharacter';

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
    characterClass: 'WuKong' | 'BaiLongMa' | 'Custom';
}

interface BattleConfig {
    playerUnits: Omit<BattleUnitData, 'type'>[];
    enemyUnits: Omit<BattleUnitData, 'type'>[];
    mapWidth?: number;
    mapHeight?: number;
    cellSize?: number;
    onBattleEnd?: (result: 'win' | 'lose') => void;
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
    private onBattleEnd: ((result: 'win' | 'lose') => void) | null = null;

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

    private cellSize: number = 50;
    private mapWidth: number = 16;
    private mapHeight: number = 12;

    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data: BattleConfig): void {
        this.battleConfig = data;
        this.onBattleEnd = data.onBattleEnd || null;
        this.mapWidth = data.mapWidth || 16;
        this.mapHeight = data.mapHeight || 12;
        this.cellSize = data.cellSize || 50;
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
        this.createCursor();
        this.setupKeyboard();
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

        // 设置血量和血条颜色
        const barColor = unit.type === 'player' ? 0x00AA00 : 0xAA0000;
        character.setHp(unit.hp, unit.maxHp, barColor);

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
        switch (characterClass) {
            case 'WuKong':
                return new WuKong(graphics, this);
            case 'BaiLongMa':
                return new BaiLongMa(graphics, this);
            default:
                return new WuKong(graphics, this);
        }
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
        unit.character.updateAnimation(true, 0);

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
                unit.character.updateAnimation(true, step * 0.3);
            },
            callbackScope: this
        });

        this.time.delayedCall(stepDelay * totalSteps, () => {
            timer.remove();
            unit.character.updateAnimation(false, 0);
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

    private attackEnemy(attacker: BattleUnit, target: BattleUnit): void {
        const damage = Math.max(1, attacker.attack - target.defense);
        const isDead = target.character.takeDamage(damage);

        console.log(`${attacker.name} 攻击 ${target.name}，造成 ${damage} 伤害，剩余 HP: ${target.character.getHp()}`);

        // 攻击动画
        attacker.character.updateAnimation(false, 0);
        this.time.delayedCall(200, () => {
            attacker.character.updateAnimation(false, 0);
        });

        if (isDead) {
            this.removeUnit(target);
        }

        this.clearAttackRange();
        this.endPlayerTurn();
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

    private moveEnemyTowardsPlayer(enemy: BattleUnit): void {
        const players = this.units.filter(u => u.type === 'player');
        if (players.length === 0) {
            this.endBattle('lose');
            return;
        }

        const target = players[0];
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;

        let moveX = 0, moveY = 0;
        if (Math.abs(dx) > Math.abs(dy)) {
            moveX = Math.sign(dx);
        } else {
            moveY = Math.sign(dy);
        }

        const newX = enemy.x + moveX;
        const newY = enemy.y + moveY;
        const isAdjacent = Math.abs(target.x - enemy.x) + Math.abs(target.y - enemy.y) === 1;

        if (isAdjacent) {
            this.enemyAttack(enemy, target);
        } else if (this.battleGrid.isWalkable(newX, newY)) {
            this.battleGrid.setOccupied(enemy.x, enemy.y, null);

            const targetWorldX = newX * this.cellSize + this.cellSize / 2;
            const targetWorldY = newY * this.cellSize + this.cellSize / 2;
            const startX = enemy.character.getX();
            const startY = enemy.character.getY();

            this.isAnimating = true;
            enemy.character.updateAnimation(true, 0);

            let step = 0;
            const totalSteps = 50;
            const stepDelay = 20;

            const timer = this.time.addEvent({
                delay: stepDelay,
                repeat: totalSteps - 1,
                callback: () => {
                    step++;
                    const t = step / totalSteps;
                    const newXPos = startX + (targetWorldX - startX) * t;
                    const newYPos = startY + (targetWorldY - startY) * t;
                    enemy.character.setPosition(newXPos, newYPos);
                    enemy.character.updateAnimation(true, step * 0.3);
                },
                callbackScope: this
            });

            this.time.delayedCall(stepDelay * totalSteps, () => {
                timer.remove();
                enemy.character.updateAnimation(false, 0);
                enemy.character.setPosition(targetWorldX, targetWorldY);

                enemy.x = newX;
                enemy.y = newY;
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
        const damage = Math.max(1, attacker.attack - target.defense);
        const isDead = target.character.takeDamage(damage);

        console.log(`${attacker.name} 攻击 ${target.name}，造成 ${damage} 伤害，剩余 HP: ${target.character.getHp()}`);

        if (isDead) {
            this.removeUnit(target);
        }

        this.time.delayedCall(500, () => {
            this.currentEnemyIndex++;
            this.processNextEnemy();
        });
    }

    private endEnemyTurn(): void {
        this.currentTurn = 'player';
        this.menuState = 'none';
        this.battleGrid.clearHighlight();

        const alivePlayers = this.units.filter(u => u.type === 'player');
        if (alivePlayers.length === 0) {
            this.endBattle('lose');
        }
    }

    private endBattle(result: 'win' | 'lose'): void {
        console.log(`战斗${result === 'win' ? '胜利' : '失败'}`);
        if (this.onBattleEnd) {
            this.onBattleEnd(result);
        }
        this.scene.start('WorldMapScene');
    }
}