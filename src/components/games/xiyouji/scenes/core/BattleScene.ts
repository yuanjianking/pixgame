import * as Phaser from 'phaser';
import { BattleGrid } from "../../maps/BattleGrid";
import { WuKong } from '../../characters/player/WuKong';
import { BaiLongMa } from '../../characters/player/BaiLongMa';

interface Enemy {
    id: string;
    name: string;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    character: BaiLongMa;
}

type MenuState = 'none' | 'main' | 'move' | 'attack';

export class BattleScene extends Phaser.Scene {
    private battleGrid!: BattleGrid;
    private wukong!: WuKong;
    private enemies: Enemy[] = [];

    // 光标相关
    private cursorX: number = 11;
    private cursorY: number = 7;
    private cursorGraphics!: Phaser.GameObjects.Graphics;

    // 移动相关
    private selectedUnit: { x: number; y: number } | null = null;
    private moveRange: { x: number; y: number }[] = [];
    private attackRange: { x: number; y: number }[] = [];
    private currentTurn: 'player' | 'enemy' = 'player';
    private isAnimating: boolean = false;
    private currentEnemyIndex: number = 0;

    // 菜单相关
    private menuState: MenuState = 'none';
    private menuContainer!: Phaser.GameObjects.Container;
    private selectedMenuIndex: number = 0;
    private menuCursor!: Phaser.GameObjects.Graphics;
    private menuTexts: Phaser.GameObjects.Text[] = [];

    private cellSize: number = 50;

    create() {
        this.battleGrid = new BattleGrid(this, 16, 12, this.cellSize);
        this.battleGrid.setPosition(0, 0);
        this.battleGrid.render();

        // 添加孙悟空
        const playerGraphics = this.add.graphics();
        this.wukong = new WuKong(playerGraphics, this);
        const startGridX = 11;
        const startGridY = 7;
        const playerX = startGridX * this.cellSize + this.cellSize / 2;
        const playerY = startGridY * this.cellSize + this.cellSize / 2;
        this.wukong.setScale(0.4, 1.5);
        this.wukong.setCollisionRadius(15);
        this.wukong.setPosition(playerX, playerY);

        this.selectedUnit = { x: startGridX, y: startGridY };
        this.battleGrid.setOccupied(startGridX, startGridY, 'player', 'wukong');

        // 添加敌人
        this.createEnemy(3, 5, '白龙马', 60, 60, 18, 8);
        this.createEnemy(4, 6, '白龙马', 60, 60, 18, 8);

        // 创建菜单
        this.createMenu();

        // 创建光标
        this.createCursor();

        // 设置键盘控制
        this.setupKeyboard();
    }

    private createEnemy(x: number, y: number, name: string, hp: number, maxHp: number, attack: number, defense: number): void {
        const graphics = this.add.graphics();
        const enemyChar = new BaiLongMa(graphics, this);
        enemyChar.setScale(0.4, 1.5);
        enemyChar.setCollisionRadius(15);

        const worldX = x * this.cellSize + this.cellSize / 2;
        const worldY = y * this.cellSize + this.cellSize / 2;
        enemyChar.setPosition(worldX, worldY);

        const enemy: Enemy = {
            id: `enemy_${Date.now()}_${Math.random()}`,
            name: name,
            x: x,
            y: y,
            hp: hp,
            maxHp: maxHp,
            attack: attack,
            defense: defense,
            character: enemyChar
        };

        this.enemies.push(enemy);
        this.battleGrid.setOccupied(x, y, 'enemy', enemy.id);
        this.drawEnemyHealthBar(enemy);
    }

    private drawEnemyHealthBar(enemy: Enemy): void {
        const x = enemy.x * this.cellSize;
        const y = enemy.y * this.cellSize;
        const graphics = this.add.graphics();

        graphics.fillStyle(0x333333, 0.8);
        graphics.fillRect(x + 5, y - 8, 40, 6);

        const hpPercent = enemy.hp / enemy.maxHp;
        graphics.fillStyle(0x00AA00, 1);
        graphics.fillRect(x + 5, y - 8, 40 * hpPercent, 5);

        (enemy as any).healthBar = graphics;
    }

    private updateEnemyHealthBar(enemy: Enemy): void {
        if ((enemy as any).healthBar) {
            (enemy as any).healthBar.destroy();
        }
        this.drawEnemyHealthBar(enemy);
    }

    private createMenu(): void {
        this.menuContainer = this.add.container(0, 0);
        this.menuContainer.setDepth(200);
        this.menuContainer.setVisible(false);

        // 菜单背景 - 宽100，高70
        const bg = this.add.rectangle(0, 0, 100, 70, 0x000000, 0.85);
        bg.setStrokeStyle(2, 0xFFD700);
        bg.setOrigin(0, 0);  // 关键：设置锚点为左上角

        // 菜单文字 - 坐标相对于背景左上角
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

        // 菜单光标
        this.menuCursor = this.add.graphics();
        this.menuContainer.add(this.menuCursor);
        this.drawMenuCursor();
    }

    private drawMenuCursor(): void {
        this.menuCursor.clear();
        const y = 18 + this.selectedMenuIndex * 30;
        this.menuCursor.fillStyle(0xFFD700, 1);
        this.menuCursor.fillTriangle(8, y, 8, y + 10, 15, y + 5);
    }

    private updateMenuTextColor(): void {
        for (let i = 0; i < this.menuTexts.length; i++) {
            if (i === this.selectedMenuIndex) {
                this.menuTexts[i].setColor('#FFD700');
            } else {
                this.menuTexts[i].setColor('#FFFFFF');
            }
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
        if (this.selectedUnit) {
            this.showMoveRange(this.selectedUnit.x, this.selectedUnit.y);
            this.menuState = 'move';
        }
    }

    private selectAttack(): void {
        this.hideMenu();
        if (this.selectedUnit) {
            this.showAttackRange(this.selectedUnit.x, this.selectedUnit.y);
            this.menuState = 'attack';
        }
    }

    private setupKeyboard(): void {
        const keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        const keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        const keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        const keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // 光标移动 - 在 none、move、attack 状态下都可以移动
        const moveCursorHandler = (dx: number, dy: number) => {
            if (this.menuState === 'none' || this.menuState === 'move' || this.menuState === 'attack') {
                this.moveCursor(dx, dy);
            }
        };

        keyW.on('down', () => moveCursorHandler(0, -1));
        keyS.on('down', () => moveCursorHandler(0, 1));
        keyA.on('down', () => moveCursorHandler(-1, 0));
        keyD.on('down', () => moveCursorHandler(1, 0));

        // 菜单导航（W/S）- 只在 main 状态
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
                if (this.selectedUnit && this.cursorX === this.selectedUnit.x && this.cursorY === this.selectedUnit.y) {
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

        if (newX >= 0 && newX < 16 && newY >= 0 && newY < 12) {
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
            this.movePlayerTo(this.cursorX, this.cursorY);
            this.menuState = 'none';
        }
    }

    private handleAttackConfirm(): void {
        const enemy = this.enemies.find(e => e.x === this.cursorX && e.y === this.cursorY);

        if (enemy && this.attackRange.some(pos => pos.x === this.cursorX && pos.y === this.cursorY)) {
            this.attackEnemy(enemy);
            this.menuState = 'none';
        }
    }

    private showMoveRange(x: number, y: number): void {
        const moveDistance = 3;
        this.moveRange = this.calculateMoveRange(x, y, moveDistance);
        this.battleGrid.highlightMoveRange(this.moveRange);
    }

    private showAttackRange(x: number, y: number): void {
        const directions = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 1, y: 0 }
        ];

        this.attackRange = [];
        for (const dir of directions) {
            const newX = x + dir.x;
            const newY = y + dir.y;
            if (newX >= 0 && newX < 16 && newY >= 0 && newY < 12) {
                this.attackRange.push({ x: newX, y: newY });
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

    private movePlayerTo(x: number, y: number): void {
        if (this.selectedUnit) {
            this.battleGrid.setOccupied(this.selectedUnit.x, this.selectedUnit.y, null);
        }

        const targetX = x * this.cellSize + this.cellSize / 2;
        const targetY = y * this.cellSize + this.cellSize / 2;
        const startX = this.wukong.getX();
        const startY = this.wukong.getY();

        this.isAnimating = true;
        this.wukong.updateAnimation(true, 0);

        let step = 0;
        const totalSteps = 50;
        const stepDelay = 20;

        const timer = this.time.addEvent({
            delay: stepDelay,
            repeat: totalSteps - 1,
            callback: () => {
                step++;
                const t = step / totalSteps;
                const newX = startX + (targetX - startX) * t;
                const newY = startY + (targetY - startY) * t;
                this.wukong.setPosition(newX, newY);
                this.wukong.updateAnimation(true, step * 0.3);
            },
            callbackScope: this
        });

        this.time.delayedCall(stepDelay * totalSteps, () => {
            timer.remove();
            this.wukong.updateAnimation(false, 0);
            this.wukong.setPosition(targetX, targetY);

            this.battleGrid.setOccupied(x, y, 'player', 'wukong');
            this.selectedUnit = { x, y };
            this.cursorX = x;
            this.cursorY = y;
            this.drawCursor();

            this.clearMoveRange();
            this.isAnimating = false;
            this.endPlayerTurn();
        });
    }

    private attackEnemy(enemy: Enemy): void {
        const damage = Math.max(1, 25 - enemy.defense);
        enemy.hp -= damage;
        console.log(`攻击 ${enemy.name}，造成 ${damage} 伤害，剩余 HP: ${enemy.hp}`);

        this.updateEnemyHealthBar(enemy);

        this.wukong.updateAnimation(false, 0, true);
        this.time.delayedCall(200, () => {
            this.wukong.updateAnimation(false, 0, false);
        });

        if (enemy.hp <= 0) {
            this.removeEnemy(enemy);
        }

        this.clearAttackRange();
        this.endPlayerTurn();
    }

    private removeEnemy(enemy: Enemy): void {
        console.log(`${enemy.name} 被击败`);
        this.battleGrid.setOccupied(enemy.x, enemy.y, null);
        if ((enemy as any).healthBar) {
            (enemy as any).healthBar.destroy();
        }
        enemy.character.graphics.clear();
        this.enemies = this.enemies.filter(e => e.id !== enemy.id);
    }

    private clearMoveRange(): void {
        this.battleGrid.clearHighlight();
        this.moveRange = [];
    }

    private endPlayerTurn(): void {
        this.currentTurn = 'enemy';
        console.log('玩家回合结束，开始敌人回合');
        this.clearMoveRange();
        this.clearAttackRange();
        this.hideMenu();
        this.enemyTurn();
    }

    private enemyTurn(): void {
        if (this.enemies.length === 0) {
            this.endEnemyTurn();
            return;
        }

        this.currentEnemyIndex = 0;
        this.processNextEnemy();
    }

    private processNextEnemy(): void {
        if (this.currentEnemyIndex >= this.enemies.length) {
            this.endEnemyTurn();
            return;
        }

        const enemy = this.enemies[this.currentEnemyIndex];
        this.moveEnemyTowardsPlayer(enemy);
    }

    private moveEnemyTowardsPlayer(enemy: Enemy): void {
        if (!this.selectedUnit) return;

        const dx = this.selectedUnit.x - enemy.x;
        const dy = this.selectedUnit.y - enemy.y;

        let moveX = 0;
        let moveY = 0;

        if (Math.abs(dx) > Math.abs(dy)) {
            moveX = Math.sign(dx);
        } else {
            moveY = Math.sign(dy);
        }

        const newX = enemy.x + moveX;
        const newY = enemy.y + moveY;

        const isAdjacent = Math.abs(this.selectedUnit.x - enemy.x) + Math.abs(this.selectedUnit.y - enemy.y) === 1;

        if (isAdjacent) {
            this.enemyAttack(enemy);
        } else if (this.battleGrid.isWalkable(newX, newY)) {
            this.battleGrid.setOccupied(enemy.x, enemy.y, null);
            enemy.x = newX;
            enemy.y = newY;
            this.battleGrid.setOccupied(enemy.x, enemy.y, 'enemy', enemy.id);

            const worldX = enemy.x * this.cellSize + this.cellSize / 2;
            const worldY = enemy.y * this.cellSize + this.cellSize / 2;
            enemy.character.setPosition(worldX, worldY);

            this.time.delayedCall(300, () => {
                this.currentEnemyIndex++;
                this.processNextEnemy();
            });
        } else {
            this.currentEnemyIndex++;
            this.processNextEnemy();
        }
    }

    private enemyAttack(enemy: Enemy): void {
        const damage = Math.max(1, enemy.attack - 5);
        console.log(`${enemy.name} 攻击孙悟空，造成 ${damage} 伤害`);

        this.time.delayedCall(500, () => {
            this.currentEnemyIndex++;
            this.processNextEnemy();
        });
    }

    private endEnemyTurn(): void {
        this.currentTurn = 'player';
        console.log('敌人回合结束，轮到玩家');
        this.menuState = 'none';
        this.battleGrid.clearHighlight();
    }
}