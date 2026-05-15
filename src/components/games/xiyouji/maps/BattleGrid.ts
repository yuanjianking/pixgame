// grid/BattleGrid.ts
import * as Phaser from 'phaser';

export interface GridCell {
    x: number;          // 网格X坐标
    y: number;          // 网格Y坐标
    worldX: number;     // 世界X坐标
    worldY: number;     // 世界Y坐标
    type: 'walkable' | 'obstacle';
    occupiedBy: 'player' | 'enemy' | null;
    unitId?: string;
}

export class BattleGrid {
    public static readonly CELL_TYPE = {
        WALKABLE: 0,
        OBSTACLE: 1,
        MOVE_HIGHLIGHT: 2,
        ATTACK_HIGHLIGHT: 3
    };

    public readonly gridWidth: number;
    public readonly gridHeight: number;
    public readonly cellSize: number;

    public data: number[][] = [];
    public cells: GridCell[][] = [];

    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private graphicsLayer: Phaser.GameObjects.Graphics;
    private highlightGraphics: Phaser.GameObjects.Graphics;

    // 回调函数
    public onCellClick: ((x: number, y: number) => void) | null = null;
    public onCellHover: ((x: number, y: number) => void) | null = null;

    constructor(scene: Phaser.Scene, gridWidth: number = 8, gridHeight: number = 8, cellSize: number = 50) {
        this.scene = scene;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.cellSize = cellSize;

        this.container = scene.add.container(0, 0);
        this.graphicsLayer = scene.add.graphics();
        this.highlightGraphics = scene.add.graphics();

        this.container.add(this.graphicsLayer);
        this.container.add(this.highlightGraphics);

        this.generate();
        this.setupInput();
    }

    private generate(): void {
        for (let y = 0; y < this.gridHeight; y++) {
            this.data[y] = [];
            this.cells[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                // 默认所有格子可行走
                this.data[y][x] = BattleGrid.CELL_TYPE.WALKABLE;

                // 设置边界为障碍物
                if (x === 0 || x === this.gridWidth - 1 || y === 0 || y === this.gridHeight - 1) {
                    this.data[y][x] = BattleGrid.CELL_TYPE.OBSTACLE;
                }

                this.cells[y][x] = {
                    x: x,
                    y: y,
                    worldX: x * this.cellSize,
                    worldY: y * this.cellSize,
                    type: this.data[y][x] === BattleGrid.CELL_TYPE.WALKABLE ? 'walkable' : 'obstacle',
                    occupiedBy: null
                };
            }
        }
    }

    private setupInput(): void {
        this.container.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, this.gridWidth * this.cellSize, this.gridHeight * this.cellSize),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        this.container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const gridPos = this.getGridPosition(pointer.worldX, pointer.worldY);
            if (gridPos && this.onCellClick) {
                this.onCellClick(gridPos.x, gridPos.y);
            }
        });

        this.container.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            const gridPos = this.getGridPosition(pointer.worldX, pointer.worldY);
            if (gridPos && this.onCellHover) {
                this.onCellHover(gridPos.x, gridPos.y);
            }
        });
    }

    private getGridPosition(worldX: number, worldY: number): { x: number; y: number } | null {
        const containerX = this.container.x;
        const containerY = this.container.y;
        const relativeX = worldX - containerX;
        const relativeY = worldY - containerY;

        const gridX = Math.floor(relativeX / this.cellSize);
        const gridY = Math.floor(relativeY / this.cellSize);

        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            return { x: gridX, y: gridY };
        }
        return null;
    }

    public render(): void {
        this.renderGrid();
    }

    private renderGrid(): void {
    this.graphicsLayer.clear();

    for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
            const px = x * this.cellSize;
            const py = y * this.cellSize;
            const cellType = this.data[y][x];

            if (cellType === BattleGrid.CELL_TYPE.WALKABLE) {
                // 柔和的草地 - 加入轻微渐变
                this.graphicsLayer.fillStyle(0x5A9A4A, 0.85);
                this.graphicsLayer.fillRect(px, py, this.cellSize, this.cellSize);

                // 高光线
                this.graphicsLayer.fillStyle(0x7ABA5A, 0.3);
                this.graphicsLayer.fillRect(px, py, this.cellSize, 2);

                // 阴影线
                this.graphicsLayer.fillStyle(0x3A6A2A, 0.3);
                this.graphicsLayer.fillRect(px, py + this.cellSize - 2, this.cellSize, 2);

                // 左下角暗角
                this.graphicsLayer.fillStyle(0x3A6A2A, 0.15);
                this.graphicsLayer.fillRect(px, py + this.cellSize - 8, this.cellSize, 8);

            } else if (cellType === BattleGrid.CELL_TYPE.OBSTACLE) {
                // 石头质感
                this.graphicsLayer.fillStyle(0x7A7A7A, 0.9);
                this.graphicsLayer.fillRect(px, py, this.cellSize, this.cellSize);
                this.graphicsLayer.fillStyle(0x9A9A9A, 0.4);
                this.graphicsLayer.fillRect(px + 2, py + 2, this.cellSize - 4, 3);
                // 石头暗部
                this.graphicsLayer.fillStyle(0x5A5A5A, 0.3);
                this.graphicsLayer.fillRect(px + this.cellSize - 6, py + 4, 4, this.cellSize - 8);

            } else if (cellType === BattleGrid.CELL_TYPE.MOVE_HIGHLIGHT) {
                // 柔和绿光
                this.graphicsLayer.fillStyle(0x6AAA4A, 0.7);
                this.graphicsLayer.fillRect(px, py, this.cellSize, this.cellSize);
                this.graphicsLayer.fillStyle(0x8ACC6A, 0.5);
                this.graphicsLayer.fillCircle(px + this.cellSize/2, py + this.cellSize/2, this.cellSize/3);
                // 边缘光晕
                this.graphicsLayer.lineStyle(1.5, 0xAAFF88, 0.5);
                this.graphicsLayer.strokeRect(px + 3, py + 3, this.cellSize - 6, this.cellSize - 6);

            } else if (cellType === BattleGrid.CELL_TYPE.ATTACK_HIGHLIGHT) {
                // 柔和红光
                this.graphicsLayer.fillStyle(0xAA4A4A, 0.7);
                this.graphicsLayer.fillRect(px, py, this.cellSize, this.cellSize);
                this.graphicsLayer.fillStyle(0xCC6A6A, 0.5);
                this.graphicsLayer.fillCircle(px + this.cellSize/2, py + this.cellSize/2, this.cellSize/3);
                // 边缘光晕
                this.graphicsLayer.lineStyle(1.5, 0xFF8888, 0.5);
                this.graphicsLayer.strokeRect(px + 3, py + 3, this.cellSize - 6, this.cellSize - 6);
            }

            // 淡网格线
            this.graphicsLayer.lineStyle(0.5, 0x2A2A2A, 0.25);
            this.graphicsLayer.strokeRect(px, py, this.cellSize, this.cellSize);
        }
    }
}

    // 高亮移动范围
    public highlightMoveRange(positions: { x: number; y: number }[]): void {
        this.clearHighlight();
        positions.forEach(pos => {
            if (this.data[pos.y][pos.x] === BattleGrid.CELL_TYPE.WALKABLE) {
                this.data[pos.y][pos.x] = BattleGrid.CELL_TYPE.MOVE_HIGHLIGHT;
            }
        });
        this.renderGrid();
    }

    // 高亮攻击范围
    public highlightAttackRange(positions: { x: number; y: number }[]): void {
        this.clearHighlight();
        positions.forEach(pos => {
            if (this.data[pos.y][pos.x] === BattleGrid.CELL_TYPE.WALKABLE) {
                this.data[pos.y][pos.x] = BattleGrid.CELL_TYPE.ATTACK_HIGHLIGHT;
            }
        });
        this.renderGrid();
    }

    // 清除高亮
    public clearHighlight(): void {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.data[y][x] === BattleGrid.CELL_TYPE.MOVE_HIGHLIGHT ||
                    this.data[y][x] === BattleGrid.CELL_TYPE.ATTACK_HIGHLIGHT) {
                    this.data[y][x] = BattleGrid.CELL_TYPE.WALKABLE;
                }
            }
        }
        this.renderGrid();
    }

    // 设置障碍物
    public setObstacle(x: number, y: number, isObstacle: boolean): void {
        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
            this.data[y][x] = isObstacle ? BattleGrid.CELL_TYPE.OBSTACLE : BattleGrid.CELL_TYPE.WALKABLE;
            this.cells[y][x].type = isObstacle ? 'obstacle' : 'walkable';
            this.renderGrid();
        }
    }

    // 获取格子类型
    public getCellType(x: number, y: number): number {
        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
            return this.data[y][x];
        }
        return BattleGrid.CELL_TYPE.OBSTACLE;
    }

    // 检查格子是否可行走
    public isWalkable(x: number, y: number): boolean {
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return false;
        // WALKABLE 或 MOVE_HIGHLIGHT 或 ATTACK_HIGHLIGHT 都可走
        const isWalkableType = this.data[y][x] === BattleGrid.CELL_TYPE.WALKABLE ||
                            this.data[y][x] === BattleGrid.CELL_TYPE.MOVE_HIGHLIGHT ||
                            this.data[y][x] === BattleGrid.CELL_TYPE.ATTACK_HIGHLIGHT;
        return isWalkableType && this.cells[y][x].occupiedBy === null;
    }

    // 设置单位占用
    public setOccupied(x: number, y: number, unit: 'player' | 'enemy' | null, unitId?: string): void {
        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
            this.cells[y][x].occupiedBy = unit;
            this.cells[y][x].unitId = unitId;
        }
    }

    // 获取单位占用
    public getOccupied(x: number, y: number): 'player' | 'enemy' | null {
        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
            return this.cells[y][x].occupiedBy;
        }
        return null;
    }

    // 清空所有占用
    public clearOccupied(): void {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.cells[y][x].occupiedBy = null;
                this.cells[y][x].unitId = undefined;
            }
        }
    }

    // 获取世界坐标
    public getWorldPosition(gridX: number, gridY: number): { x: number; y: number } {
        return {
            x: gridX * this.cellSize + this.cellSize / 2,
            y: gridY * this.cellSize + this.cellSize / 2
        };
    }

    // 设置位置和深度
    public setPosition(x: number, y: number): void {
        this.container.setPosition(x, y);
    }

    public setDepth(depth: number): void {
        this.container.setDepth(depth);
    }

    public getContainer(): Phaser.GameObjects.Container {
        return this.container;
    }

    public clear(): void {
        this.graphicsLayer.clear();
        this.highlightGraphics.clear();
        this.container.removeAll(true);
    }
}