import * as Phaser from 'phaser';

export class TerrainMap {
  public static readonly TERRAIN = {
    GRASS: 1,
    DIRT: 2
  };

  public readonly mapWidth: number = 20;
  public readonly mapHeight: number = 15;
  public readonly tileSize: number = 40;

  public data: number[][] = [];
  public name: string = '';

  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private titleText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, name: string = '场景名称',mapWidth: number = 20, mapHeight: number = 15) {
    this.scene = scene;
    this.name = name;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.container = scene.add.container(0, 0);
    this.generate();
  }

  private generate(): void {
    for (let y = 0; y < this.mapHeight; y++) {
      this.data[y] = [];
      for (let x = 0; x < this.mapWidth; x++) {
        this.data[y][x] = TerrainMap.TERRAIN.GRASS;
      }
    }

    for (let x = 0; x < this.mapWidth; x++) {
      this.data[0][x] = TerrainMap.TERRAIN.DIRT;
      this.data[this.mapHeight - 1][x] = TerrainMap.TERRAIN.DIRT;
    }
    for (let y = 0; y < this.mapHeight; y++) {
      this.data[y][0] = TerrainMap.TERRAIN.DIRT;
      this.data[y][this.mapWidth - 1] = TerrainMap.TERRAIN.DIRT;
    }
  }

  public get(x: number, y: number): number {
    if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
      return TerrainMap.TERRAIN.DIRT;
    }
    return this.data[y][x];
  }

  public render(): void {
    this.renderTiles();
    this.renderTitle();
  }

  private renderTiles(): void {
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        const terrainType = this.get(x, y);
        this.renderTile(px, py, terrainType);
      }
    }
  }

  private renderTile(x: number, y: number, type: number): void {
    const tile = this.scene.add.container(x, y);
    const g = this.scene.add.graphics();

    if (type === TerrainMap.TERRAIN.GRASS) {
      g.fillStyle(0x5A9E4A);
      g.fillRect(0, 0, this.tileSize, this.tileSize);
      g.fillStyle(0x4A8E3A, 0.4);
      for (let i = 0; i < 6; i++) {
        g.fillRect(4 + Math.random() * 32, 4 + Math.random() * 32, 3, 3);
      }
      g.fillStyle(0x6AAE54, 0.3);
      for (let i = 0; i < 4; i++) {
        g.fillRect(2 + Math.random() * 36, 2 + Math.random() * 36, 2, 2);
      }
    } else if (type === TerrainMap.TERRAIN.DIRT) {
      g.fillStyle(0xD4A35C);
      g.fillRect(0, 0, this.tileSize, this.tileSize);
      g.fillStyle(0xC4903A, 0.5);
      for (let i = 0; i < 6; i++) {
        g.fillRect(5 + Math.random() * 30, 5 + Math.random() * 30, 6, 4);
      }
      g.fillStyle(0xDEB060, 0.4);
      for (let i = 0; i < 5; i++) {
        g.fillRect(2 + Math.random() * 36, 2 + Math.random() * 36, 4, 3);
      }
      g.fillStyle(0xA87828, 0.3);
      for (let i = 0; i < 4; i++) {
        g.fillEllipse(8 + Math.random() * 24, 8 + Math.random() * 24, 4, 3);
      }
    }

    tile.add(g);
    tile.setDepth(10);
    this.container.add(tile);
  }

  private renderTitle(): void {
    this.titleText = this.scene.add.text(400, 20, this.name, {
      fontSize: '24px',
      color: '#FFD700',
      backgroundColor: '#000000',
      padding: { x: 15, y: 5 },
      fontFamily: 'monospace'
    });
    this.titleText.setOrigin(0.5);
    this.titleText.setScrollFactor(0);
    this.titleText.setDepth(100);
  }

  public setTitle(text: string): void {
    this.name = text;
    if (this.titleText) {
      this.titleText.setText(text);
    }
  }

  public clear(): void {
    this.container.removeAll(true);
    if (this.titleText) {
      this.titleText.destroy();
    }
  }

  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  public setDepth(depth: number): void {
    this.container.setDepth(depth);
  }

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
}