import * as Phaser from 'phaser';
import { BattleGrid } from "../../maps/BattleGrid";
import { WuKong } from '../../characters/player/WuKong';

export class BattleScene extends Phaser.Scene {
    private battleGrid!: BattleGrid;
    private wukong!: WuKong;

    // 光标相关
    private cursorX: number = 11;
    private cursorY: number = 7;
    private cursorGraphics!: Phaser.GameObjects.Graphics;

    // 移动相关
    private selectedUnit: { x: number; y: number } | null = null;
    private moveRange: { x: number; y: number }[] = [];
    private isMoving: boolean = false;
    private currentTurn: 'player' | 'enemy' = 'player';
    private isAnimating: boolean = false;

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

        // 记录孙悟空所在的格子
        this.selectedUnit = { x: startGridX, y: startGridY };
        this.battleGrid.setOccupied(startGridX, startGridY, 'player', 'wukong');

        // 创建光标
        this.createCursor();

        // 设置键盘控制
        this.setupKeyboard();

        // 设置点击回调（保留，方便调试）
        this.battleGrid.onCellClick = (x, y) => {
            console.log(`点击: (${x}, ${y})`);
            this.handleCellClick(x, y);
        };
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

        // 主边框
        this.cursorGraphics.lineStyle(2, 0xFFD700, 1);
        this.cursorGraphics.strokeRect(x, y, s, s);

        // 内边框
        this.cursorGraphics.lineStyle(1, 0xFFD700, 0.6);
        this.cursorGraphics.strokeRect(x + 3, y + 3, s - 6, s - 6);

        // 四角小点
        this.cursorGraphics.fillStyle(0xFFD700, 1);
        this.cursorGraphics.fillCircle(x + 4, y + 4, 2);
        this.cursorGraphics.fillCircle(x + s - 4, y + 4, 2);
        this.cursorGraphics.fillCircle(x + 4, y + s - 4, 2);
        this.cursorGraphics.fillCircle(x + s - 4, y + s - 4, 2);
    }

    private setupKeyboard(): void {
        // WASD 移动光标
        const keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        const keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        const keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        const keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        keyW.on('down', () => this.moveCursor(0, -1));
        keyS.on('down', () => this.moveCursor(0, 1));
        keyA.on('down', () => this.moveCursor(-1, 0));
        keyD.on('down', () => this.moveCursor(1, 0));

        // J 键确认（等同于点击当前光标格子）
        const keyJ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        keyJ.on('down', () => {
            this.handleCellClick(this.cursorX, this.cursorY);
        });

        // K 键取消（清除移动范围）
        const keyK = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        keyK.on('down', () => {
            this.cancel();
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

    private handleCellClick(x: number, y: number): void {
        if (this.currentTurn !== 'player') return;
        if (this.isAnimating) return;

        if (this.isMoving) {
            const canMove = this.moveRange.some(pos => pos.x === x && pos.y === y);

            if (canMove && this.battleGrid.isWalkable(x, y)) {
                this.movePlayerTo(x, y);
            } else {
                this.clearMoveRange();
            }
        } else {
            if (this.selectedUnit && this.selectedUnit.x === x && this.selectedUnit.y === y) {
                this.showMoveRange(x, y);
            }
        }
    }

    private cancel(): void {
        if (this.currentTurn !== 'player') return;
        if (this.isAnimating) return;

        // 清除移动范围
        this.clearMoveRange();
        console.log('取消移动');
    }

    private showMoveRange(x: number, y: number): void {
        const moveDistance = 3;
        this.moveRange = this.calculateMoveRange(x, y, moveDistance);
        this.battleGrid.highlightMoveRange(this.moveRange);
        this.isMoving = true;
        console.log(`显示移动范围，共 ${this.moveRange.length} 个格子`);
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
        console.log(`移动到: (${x}, ${y})`);

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

            // 移动光标到新位置
            this.cursorX = x;
            this.cursorY = y;
            this.drawCursor();

            this.clearMoveRange();
            this.isAnimating = false;
            this.endPlayerTurn();
        });
    }

    private clearMoveRange(): void {
        this.battleGrid.clearHighlight();
        this.moveRange = [];
        this.isMoving = false;
    }

    private endPlayerTurn(): void {
        this.currentTurn = 'enemy';
        console.log('玩家回合结束，开始敌人回合');
        // 清除移动范围，防止敌人回合还显示
        this.clearMoveRange();
        this.enemyTurn();
    }

    private enemyTurn(): void {
        this.time.delayedCall(1000, () => {
            this.endEnemyTurn();
        });
    }

    private endEnemyTurn(): void {
        this.currentTurn = 'player';
        console.log('敌人回合结束，轮到玩家');
        // 重置移动状态，让玩家需要重新选中孙悟空
        this.isMoving = false;
        this.moveRange = [];
        // 清除高亮
        this.battleGrid.clearHighlight();
    }
}