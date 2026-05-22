// WaterMap.ts
import * as Phaser from 'phaser';

export class WaterMap {
  public static readonly TERRAIN = {
    DEEP_WATER: 1,
    SHALLOW_WATER: 2,
    SAND: 3,
    CORAL: 4
  };

  public readonly mapWidth: number = 20;
  public readonly mapHeight: number = 15;
  public readonly tileSize: number = 40;

  public data: number[][] = [];
  public name: string = '';

  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private titleText!: Phaser.GameObjects.Text;
  private waveOffset: number = 0;

  constructor(scene: Phaser.Scene, name: string = '水域', mapWidth: number = 20, mapHeight: number = 15) {
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
        // 默认深水
        let type = WaterMap.TERRAIN.DEEP_WATER;

        // 边缘生成沙滩
        if (x === 0 || x === this.mapWidth - 1 || y === 0 || y === this.mapHeight - 1) {
          type = WaterMap.TERRAIN.SAND;
        }
        // 随机浅水区
        else if (Math.random() < 0.15) {
          type = WaterMap.TERRAIN.SHALLOW_WATER;
        }
        // 随机珊瑚
        else if (Math.random() < 0.08) {
          type = WaterMap.TERRAIN.CORAL;
        }

        this.data[y][x] = type;
      }
    }

    // 平滑处理，让浅水区连接成片
    for (let y = 1; y < this.mapHeight - 1; y++) {
      for (let x = 1; x < this.mapWidth - 1; x++) {
        if (this.data[y][x] === WaterMap.TERRAIN.SHALLOW_WATER) {
          let shallowCount = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (this.data[y + dy][x + dx] === WaterMap.TERRAIN.SHALLOW_WATER) {
                shallowCount++;
              }
            }
          }
          if (shallowCount < 2) {
            this.data[y][x] = WaterMap.TERRAIN.DEEP_WATER;
          }
        }
      }
    }
  }

  public get(x: number, y: number): number {
    if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
      return WaterMap.TERRAIN.DEEP_WATER;
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
    const wave = Math.sin(this.waveOffset + x * 0.3 + y * 0.2) * 0.1;

    if (type === WaterMap.TERRAIN.DEEP_WATER) {
      // 深海蓝
      g.fillStyle(0x1a4d8c, 0.9);
      g.fillRect(0, 0, this.tileSize, this.tileSize);

      // 波浪纹理
      g.fillStyle(0x2a6dac, 0.5);
      for (let i = 0; i < 8; i++) {
        g.fillEllipse(
          10 + Math.random() * 20 + wave * 5,
          10 + Math.random() * 20,
          6, 3
        );
      }

      // 深色波纹
      g.fillStyle(0x0a3d6c, 0.4);
      for (let i = 0; i < 6; i++) {
        g.fillEllipse(
          5 + Math.random() * 30,
          5 + Math.random() * 30,
          8, 2
        );
      }

      // 水光
      g.fillStyle(0x4a8dcc, 0.3);
      g.fillEllipse(8 + wave * 3, 5, 6, 2);

    } else if (type === WaterMap.TERRAIN.SHALLOW_WATER) {
      // 浅海青
      g.fillStyle(0x3a9e8c, 0.85);
      g.fillRect(0, 0, this.tileSize, this.tileSize);

      // 沙底质感
      g.fillStyle(0x5abeac, 0.4);
      for (let i = 0; i < 12; i++) {
        g.fillRect(2 + Math.random() * 36, 2 + Math.random() * 36, 4, 2);
      }

      // 水纹
      g.fillStyle(0x7adecc, 0.5);
      for (let i = 0; i < 5; i++) {
        g.fillEllipse(
          5 + Math.random() * 30 + wave * 4,
          8 + Math.random() * 24,
          10, 2
        );
      }

      // 反光
      g.fillStyle(0x9afeee, 0.35);
      g.fillEllipse(12 + wave * 2, 6, 5, 2);

    } else if (type === WaterMap.TERRAIN.SAND) {
      // 沙滩
      g.fillStyle(0xe8d4a8, 0.95);
      g.fillRect(0, 0, this.tileSize, this.tileSize);

      // 沙粒
      g.fillStyle(0xd4c098, 0.6);
      for (let i = 0; i < 20; i++) {
        g.fillCircle(5 + Math.random() * 30, 5 + Math.random() * 30, 1);
      }

      // 湿沙区域
      g.fillStyle(0xc8b488, 0.4);
      for (let i = 0; i < 8; i++) {
        g.fillRect(2 + Math.random() * 36, 15 + Math.random() * 20, 8, 4);
      }

      // 贝壳装饰
      if (Math.random() > 0.85) {
        g.fillStyle(0xf0e0c0, 0.8);
        g.fillEllipse(28, 32, 4, 3);
        g.fillStyle(0xe0d0b0, 0.8);
        g.fillEllipse(30, 33, 3, 2);
      }

    } else if (type === WaterMap.TERRAIN.CORAL) {
      // 珊瑚礁底
      g.fillStyle(0x2a6d8c, 0.9);
      g.fillRect(0, 0, this.tileSize, this.tileSize);

      // 珊瑚
      g.fillStyle(0xcc6666, 0.8);
      for (let i = 0; i < 3; i++) {
        g.fillRect(8 + i * 10, 28, 4, 10);
        g.fillEllipse(10 + i * 10, 28, 6, 4);
      }

      // 海草
      g.fillStyle(0x4aac6a, 0.7);
      g.fillRect(24, 20, 3, 18);
      g.fillRect(28, 24, 3, 14);
      g.fillStyle(0x5acc7a, 0.6);
      g.fillRect(26, 18, 2, 22);

      // 小丑鱼
      if (Math.random() > 0.9) {
        g.fillStyle(0xff8844, 0.9);
        g.fillEllipse(10, 15, 6, 4);
        g.fillStyle(0xffffff, 0.9);
        g.fillEllipse(8, 14, 2, 2);
        g.fillStyle(0x000000, 0.9);
        g.fillEllipse(7.5, 14, 1, 1);
      }
    }

    // 网格线（水波纹状）
    g.lineStyle(0.5, 0xffffff, 0.15);
    g.strokeRect(0, 0, this.tileSize, this.tileSize);

    tile.add(g);
    tile.setDepth(10);
    this.container.add(tile);
  }

  private renderTitle(): void {
    this.titleText = this.scene.add.text(400, 20, this.name, {
      fontSize: '24px',
      color: '#88CCFF',
      backgroundColor: '#0a2a4a',
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