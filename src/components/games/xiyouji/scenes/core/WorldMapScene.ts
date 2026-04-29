// world/WorldMapScene.ts
import * as Phaser from 'phaser';
import { WuKong } from '../../characters/player/WuKong';
import { WorldNodesData } from '../../data/WorldData';
import type { WorldNode } from '../../types';

export default class WorldMapScene extends Phaser.Scene {
  private wukong!: WuKong;
  private obstacles: { x: number; y: number; width: number; height: number }[] = [];
  private isEnteringCave: boolean = false;
  private nodes: Map<string, Phaser.GameObjects.Container> = new Map();
  private mapWidth: number = 11520;
  private mapHeight: number = 6480;
  private returnNodeId: string | null = null;

  // 小地图
  private minimapPlayerMarker!: Phaser.GameObjects.Graphics;


  constructor() {
    super({ key: 'WorldMapScene' });
  }


  init(data?: { returnNodeId?: string }) {
    this.isEnteringCave = false;
    this.obstacles = [];
    this.returnNodeId = data?.returnNodeId || null;
  }

  create() {
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

    // 加载纹理
    this.buildMapTexture();
    this.events.emit('mapReady');

    this.createWorldNodes();
    this.createPlayer();

    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setZoom(0.6);
    this.cameras.main.startFollow(this.wukong, true, 0.1, 0.1);



    this.createMinimap();
  }

  private buildMapTexture(): void {

    if (this.textures.exists('worldMapBg')) {
      console.log('纹理已存在，直接使用缓存');
      this.add.image(0, 0, 'worldMapBg').setOrigin(0).setDepth(0);

    }
    else{
      const g = this.add.graphics();

      // 1. 绿色基底
      g.fillStyle(0x2d5a27, 1);
      g.fillRect(0, 0, this.mapWidth, this.mapHeight);

      // 2. 根据每个节点的icon绘制周围地形，并收集障碍物
      WorldNodesData.forEach(node => {
        switch(node.icon) {
          case 'mountain':
            this.drawMountainTerrain(g, node.x, node.y);
            break;
          case 'forest':
            this.drawForestTerrain(g, node.x, node.y);
            break;
          case 'water':
            this.drawWaterTerrain(g, node.x, node.y);
            break;
          case 'desert':
            this.drawDesertTerrain(g, node.x, node.y);
            break;
          case 'fire':
            this.drawFireTerrain(g, node.x, node.y);
            break;
          case 'temple':
            this.drawTempleTerrain(g, node.x, node.y);
            break;
          default:
            this.drawDefaultTerrain(g, node.x, node.y);
        }
      });

      // ★ 关键：生成纹理，销毁 Graphics
      g.generateTexture('worldMapBg', this.mapWidth, this.mapHeight);
      g.destroy();

      // 添加静态背景图片
      this.add.image(0, 0, 'worldMapBg').setOrigin(0).setDepth(0);
    }

    // 添加碰撞
    WorldNodesData.forEach(node => {
      switch(node.icon) {
        case 'mountain':
          this.drawMountainTerrainCollision(node.x, node.y);
          break;
        case 'forest':
          this.drawForestTerrainCollision(node.x, node.y);
          break;
        case 'water':
          this.drawWaterTerrainCollision(node.x, node.y);
          break;
        case 'desert':
          this.drawDesertTerrainCollision(node.x, node.y);
          break;
        case 'fire':
          this.drawFireTerrainCollision(node.x, node.y);
          break;
        case 'temple':
          this.drawTempleTerrainCollision(node.x, node.y);
          break;
        default:
          this.drawDefaultTerrainCollision(node.x, node.y);
      }
    });
  }

  /**
   * 山脉地形（只在节点上方和左右，下方完全不画）
   */
  private drawMountainTerrain(g: Phaser.GameObjects.Graphics, centerX: number, centerY: number): void {
    const gridSize = 40;

    // 山脉位置
    const mountainPositions = [
      // 上方山脉
      [-3, -5], [-2, -5], [-1, -5], [0, -5], [1, -5], [2, -5], [3, -5],
      [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4],
      [-4, -3], [-3, -3], [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3],
      [-3, -6], [0, -6], [3, -6],
      [-5, -4], [5, -4],
      // 左侧山脉
      [-5, -2], [-4, -2], [-5, -1], [-4, -1],
      [-6, -1],
      // 右侧山脉
      [4, -2], [5, -2], [4, -1], [5, -1],
      [6, -1],
    ];

    // 树木位置（已移除与山脉重复的位置）
    const treePositions = [
      // 上方区域（移除了 [-3,-5],[-2,-5],[-1,-5],[0,-5],[1,-5],[2,-5],[3,-5] 等）
      [-4, -6], [-3, -6], [-2, -6], [-1, -6], [0, -6], [1, -6], [2, -6], [3, -6], [4, -6],
      [-5, -5], [-4, -5], [4, -5], [5, -5],  // 移除了 [-3,-5],[-2,-5],[-1,-5],[0,-5],[1,-5],[2,-5],[3,-5]
      [-6, -4], [-5, -4], [5, -4], [6, -4],  // 移除了 [-4,-4],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[4,-4]
      [-6, -3], [-5, -3], [5, -3], [6, -3],  // 移除了 [-4,-3],[-3,-3],[-2,-3],[-1,-3],[0,-3],[1,-3],[2,-3],[3,-3],[4,-3]
      // 左侧区域（移除了 [-5,-2],[-4,-2],[-5,-1],[-4,-1],[-6,-1]）
      [-7, -2], [-6, -2], [-3, -2], [-2, -2],
      [-7, -1], [-3, -1], [-2, -1],
      // 右侧区域（移除了 [4,-2],[5,-2],[4,-1],[5,-1],[6,-1]）
      [2, -2], [3, -2], [6, -2], [7, -2],
      [2, -1], [3, -1], [6, -1], [7, -1],
      // 下面一行
      [-6, 0], [-5, 0], [-4, 0], [-3, 0], [-2, 0],
      [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],
    ];

    // 绘制树木并添加碰撞
    treePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.drawTree(g, x, y);
    });

    // 绘制山脉并添加碰撞
    mountainPositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.drawMountain(g, x, y);
    });
  }

  /**
   * 森林地形（只在节点上方和左右，下方完全不画）
   */
  private drawForestTerrain(g: Phaser.GameObjects.Graphics, centerX: number, centerY: number): void {
    const gridSize = 40;

    // 树木位置（密集分布，覆盖左右上区域）
    const treePositions = [
      // 上方区域（密集）
      [-4, -6], [-3, -6], [-2, -6], [-1, -6], [0, -6], [1, -6], [2, -6], [3, -6], [4, -6],
      [-5, -5], [-4, -5], [-3, -5], [-2, -5], [-1, -5], [0, -5], [1, -5], [2, -5], [3, -5], [4, -5], [5, -5],
      [-6, -4], [-5, -4], [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4], [5, -4], [6, -4],
      [-6, -3], [-5, -3], [-4, -3], [-3, -3], [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3], [5, -3], [6, -3],
      [-6, -2], [-5, -2], [-4, -2], [-3, -2], [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [5, -2], [6, -2],
      [-6, -1], [-5, -1], [-4, -1], [-3, -1], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [3, -1], [4, -1], [5, -1], [6, -1],
      // 左侧区域
      [-7, -5], [-7, -4], [-7, -3], [-7, -2], [-7, -1],
      [-8, -4], [-8, -3], [-8, -2], [-8, -1],
      // 右侧区域
      [7, -5], [7, -4], [7, -3], [7, -2], [7, -1],
      [8, -4], [8, -3], [8, -2], [8, -1],
    ];

    // 绘制树木并添加碰撞
    treePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.drawTree(g, x, y);
    });
  }

  /**
   * 水域地形（只在节点上方和左右，下方完全不画）
   */
  private drawWaterTerrain(g: Phaser.GameObjects.Graphics, centerX: number, centerY: number): void {
    const gridSize = 40;

    // 水域位置
    const waterPositions = [
      // 中心水域
      [0, -1], [0, -2], [0, -3], [0, -4], [0, -5],
      [-1, -1], [-1, -2], [-1, -3], [-1, -4], [-1, -5],
      [1, -1], [1, -2], [1, -3], [1, -4], [1, -5],
      [-2, -1], [-2, -2], [-2, -3], [-2, -4],
      [2, -1], [2, -2], [2, -3], [2, -4],
      [-3, -1], [-3, -2], [-3, -3],
      [3, -1], [3, -2], [3, -3],
      [-4, -1], [-4, -2],
      [4, -1], [4, -2],
      [-5, -1],
      [5, -1],
    ];

    // 绘制水域并添加碰撞
    waterPositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.drawWater(g, x, y);
    });

    // 岸边树木位置
    const treePositions = [
      // 左侧
      [-6, -3], [-6, -2], [-6, -1],
      // 右侧
      [6, -3], [6, -2], [6, -1],
      // 上方
      [-4, -6], [-3, -6], [3, -6], [4, -6],
      [-5, -5], [-4, -5], [-3, -5], [3, -5], [4, -5], [5, -5],
    ];

    // 绘制树木并添加碰撞
    treePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.drawTree(g, x, y);
    });
  }

  /**
   * 沙漠地形（只在节点上方和左右，下方完全不画）
   */
  private drawDesertTerrain(g: Phaser.GameObjects.Graphics, centerX: number, centerY: number): void {
    const gridSize = 40;

    // 沙丘位置（固定，覆盖整个区域）
    const sandDunePositions = [
      // 上方区域
      [-4, -5], [-3, -5], [-2, -5], [-1, -5], [0, -5], [1, -5], [2, -5], [3, -5], [4, -5],
      [-5, -4], [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4], [5, -4],
      [-5, -3], [-4, -3], [-3, -3], [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3], [5, -3],
      [-5, -2], [-4, -2], [-3, -2], [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [5, -2],
      [-5, -1], [-4, -1], [-3, -1], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [3, -1], [4, -1], [5, -1],
      // 左侧区域
      [-6, -4], [-6, -3], [-6, -2], [-6, -1],
      // 右侧区域
      [6, -4], [6, -3], [6, -2], [6, -1],
    ];

    // 绘制沙丘并添加碰撞
    sandDunePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.drawSandDune(g, x, y);
    });

    // 枯树/仙人掌位置
    const cactusPositions = [
      // 上方
      [-4, -5], [-3, -5], [-2, -5], [-1, -5], [0, -5], [1, -5], [2, -5], [3, -5], [4, -5],
      [-5, -4], [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4], [5, -4],
      // 左侧
      [-6, -3], [-6, -2], [-6, -1],
      // 右侧
      [6, -3], [6, -2], [6, -1],
      // 内圈
      [-3, -3], [-2, -2], [-1, -3], [0, -2], [1, -3], [2, -2], [3, -3],
    ];

    // 绘制仙人掌并添加碰撞
    cactusPositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.drawCactus(g, x, y);
    });
  }

  /**
   * 火焰地形（只在节点上方和左右，下方完全不画）
   */
  private drawFireTerrain(g: Phaser.GameObjects.Graphics, centerX: number, centerY: number): void {
    const gridSize = 40;

    // 灼烧地面位置（固定，覆盖整个区域）
    const burntGroundPositions = [
      // 中心区域
      [0, -1], [0, -2], [0, -3], [0, -4], [0, -5],
      [-1, -1], [-1, -2], [-1, -3], [-1, -4], [-1, -5],
      [1, -1], [1, -2], [1, -3], [1, -4], [1, -5],
      [-2, -1], [-2, -2], [-2, -3], [-2, -4],
      [2, -1], [2, -2], [2, -3], [2, -4],
      [-3, -1], [-3, -2], [-3, -3],
      [3, -1], [3, -2], [3, -3],
      [-4, -1], [-4, -2],
      [4, -1], [4, -2],
      [-5, -1],
      [5, -1],
      // 额外区域
      [-3, -4], [-2, -5], [2, -5], [3, -4],
      [-4, -3], [4, -3],
    ];

    // 绘制灼烧地面并添加碰撞
    burntGroundPositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.drawBurntGround(g, x, y);
    });

    // 火焰位置
    const firePositions = [
      // 上方
      [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4],
      [-5, -3], [-4, -3], [-3, -3], [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3], [5, -3],
      // 左侧
      [-5, -2], [-5, -1],
      // 右侧
      [5, -2], [5, -1],
      // 内圈
      [-3, -2], [-2, -1], [-1, -2], [0, -1], [1, -2], [2, -1], [3, -2],
    ];

    // 绘制火焰并添加碰撞
    firePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.drawFire(g, x, y);
    });
  }

  /**
   * 寺庙地形（石头块象征，只在节点上方和左右，下方留空）
   */
  private drawTempleTerrain(g: Phaser.GameObjects.Graphics, centerX: number, centerY: number): void {
    const gridSize = 40;

    // 石头位置
    const stonePositions = [
      // 上方
      [-3, -5], [-2, -5], [-1, -5], [0, -5], [1, -5], [2, -5], [3, -5],
      [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4],
      [-4, -3], [-3, -3], [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3],
      [-3, -6], [0, -6], [3, -6],
      [-5, -4], [5, -4],
      // 左侧
      [-5, -2], [-4, -2], [-5, -1], [-4, -1],
      [-6, -1],
      // 右侧
      [4, -2], [5, -2], [4, -1], [5, -1],
      [6, -1],
    ];

    // 树木位置（已移除与石头重复的位置）
    const treePositions = [
      // 上方区域（移除了与石头重复的位置）
      [-4, -6], [4, -6],  // 保留了 [-3,-6]? 检查石头有没有 [-3,-6]? 石头有 [-3,-6] 吗？没有，所以保留
      // 重新整理上方区域
      [-4, -6], [-3, -6], [-2, -6], [-1, -6], [0, -6], [1, -6], [2, -6], [3, -6], [4, -6],
      // [-5,-5] 到 [5,-5] 中移除 [-3,-5],[-2,-5],[-1,-5],[0,-5],[1,-5],[2,-5],[3,-5]
      [-5, -5], [-4, -5], [4, -5], [5, -5],
      // [-6,-4] 到 [6,-4] 中移除 [-4,-4],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[4,-4]
      [-6, -4], [-5, -4], [5, -4], [6, -4],
      // [-6,-3] 到 [6,-3] 中移除 [-4,-3],[-3,-3],[-2,-3],[-1,-3],[0,-3],[1,-3],[2,-3],[3,-3],[4,-3]
      [-6, -3], [-5, -3], [5, -3], [6, -3],
      // 左侧区域（移除了 [-5,-2],[-4,-2],[-5,-1],[-4,-1],[-6,-1]）
      [-7, -2], [-6, -2], [-3, -2], [-2, -2],
      [-7, -1], [-3, -1], [-2, -1],
      // 右侧区域（移除了 [4,-2],[5,-2],[4,-1],[5,-1],[6,-1]）
      [2, -2], [3, -2], [6, -2], [7, -2],
      [2, -1], [3, -1], [6, -1], [7, -1],
      // 下面一行（dy = 0）
      [-6, 0], [-5, 0], [-4, 0], [-3, 0], [-2, 0],
      [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],
    ];

    // 绘制树木并添加碰撞
    treePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.drawTree(g, x, y);
    });

    // 绘制石头块并添加碰撞
    stonePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.drawStoneBlock(g, x, y, dx === 0 && dy === 0);
    });
  }

  /**
   * 默认地形（只在节点上方，下方完全不画）
   */
  private drawDefaultTerrain(g: Phaser.GameObjects.Graphics, centerX: number, centerY: number): void {
    const gridSize = 40;

    // 树木位置（固定，覆盖上方区域）
    const treePositions = [
      // 上方区域
      [-4, -5], [-3, -5], [-2, -5], [-1, -5], [1, -5], [2, -5], [3, -5], [4, -5],
      [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4],
      [-4, -3], [-3, -3], [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3],
      [-4, -2], [-3, -2], [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2],
      [-4, -1], [-3, -1], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [3, -1], [4, -1],
      // 左侧区域
      [-5, -4], [-5, -3], [-5, -2], [-5, -1],
      // 右侧区域
      [5, -4], [5, -3], [5, -2], [5, -1],
    ];

    // 绘制树木并添加碰撞
    treePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.drawTree(g, x, y);
    });
  }

  // ==================== 创建碰撞 ====================
/**
   * 山脉地形（只在节点上方和左右，下方完全不画）
   */
  private drawMountainTerrainCollision(centerX: number, centerY: number): void {
    const gridSize = 40;

    // 山脉位置
    const mountainPositions = [
      // 上方山脉
      [-3, -5], [-2, -5], [-1, -5], [0, -5], [1, -5], [2, -5], [3, -5],
      [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4],
      [-4, -3], [-3, -3], [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3],
      [-3, -6], [0, -6], [3, -6],
      [-5, -4], [5, -4],
      // 左侧山脉
      [-5, -2], [-4, -2], [-5, -1], [-4, -1],
      [-6, -1],
      // 右侧山脉
      [4, -2], [5, -2], [4, -1], [5, -1],
      [6, -1],
    ];

    // 树木位置（已移除与山脉重复的位置）
    const treePositions = [
      // 上方区域（移除了 [-3,-5],[-2,-5],[-1,-5],[0,-5],[1,-5],[2,-5],[3,-5] 等）
      [-4, -6], [-3, -6], [-2, -6], [-1, -6], [0, -6], [1, -6], [2, -6], [3, -6], [4, -6],
      [-5, -5], [-4, -5], [4, -5], [5, -5],  // 移除了 [-3,-5],[-2,-5],[-1,-5],[0,-5],[1,-5],[2,-5],[3,-5]
      [-6, -4], [-5, -4], [5, -4], [6, -4],  // 移除了 [-4,-4],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[4,-4]
      [-6, -3], [-5, -3], [5, -3], [6, -3],  // 移除了 [-4,-3],[-3,-3],[-2,-3],[-1,-3],[0,-3],[1,-3],[2,-3],[3,-3],[4,-3]
      // 左侧区域（移除了 [-5,-2],[-4,-2],[-5,-1],[-4,-1],[-6,-1]）
      [-7, -2], [-6, -2], [-3, -2], [-2, -2],
      [-7, -1], [-3, -1], [-2, -1],
      // 右侧区域（移除了 [4,-2],[5,-2],[4,-1],[5,-1],[6,-1]）
      [2, -2], [3, -2], [6, -2], [7, -2],
      [2, -1], [3, -1], [6, -1], [7, -1],
      // 下面一行
      [-6, 0], [-5, 0], [-4, 0], [-3, 0], [-2, 0],
      [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],
    ];

    // 绘制树木并添加碰撞
    treePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.obstacles.push({ x: x, y: y, width: 40, height: 40 });
    });

    // 绘制山脉并添加碰撞
    mountainPositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.obstacles.push({ x: x, y: y, width: 40, height: 40 });
    });
  }

  /**
   * 森林地形（只在节点上方和左右，下方完全不画）
   */
  private drawForestTerrainCollision(centerX: number, centerY: number): void {
    const gridSize = 40;

    // 树木位置（密集分布，覆盖左右上区域）
    const treePositions = [
      // 上方区域（密集）
      [-4, -6], [-3, -6], [-2, -6], [-1, -6], [0, -6], [1, -6], [2, -6], [3, -6], [4, -6],
      [-5, -5], [-4, -5], [-3, -5], [-2, -5], [-1, -5], [0, -5], [1, -5], [2, -5], [3, -5], [4, -5], [5, -5],
      [-6, -4], [-5, -4], [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4], [5, -4], [6, -4],
      [-6, -3], [-5, -3], [-4, -3], [-3, -3], [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3], [5, -3], [6, -3],
      [-6, -2], [-5, -2], [-4, -2], [-3, -2], [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [5, -2], [6, -2],
      [-6, -1], [-5, -1], [-4, -1], [-3, -1], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [3, -1], [4, -1], [5, -1], [6, -1],
      // 左侧区域
      [-7, -5], [-7, -4], [-7, -3], [-7, -2], [-7, -1],
      [-8, -4], [-8, -3], [-8, -2], [-8, -1],
      // 右侧区域
      [7, -5], [7, -4], [7, -3], [7, -2], [7, -1],
      [8, -4], [8, -3], [8, -2], [8, -1],
    ];

    // 绘制树木并添加碰撞
    treePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.obstacles.push({ x: x, y: y, width: 40, height: 40 });
    });
  }

  /**
   * 水域地形（只在节点上方和左右，下方完全不画）
   */
  private drawWaterTerrainCollision(centerX: number, centerY: number): void {
    const gridSize = 40;

    // 水域位置
    const waterPositions = [
      // 中心水域
      [0, -1], [0, -2], [0, -3], [0, -4], [0, -5],
      [-1, -1], [-1, -2], [-1, -3], [-1, -4], [-1, -5],
      [1, -1], [1, -2], [1, -3], [1, -4], [1, -5],
      [-2, -1], [-2, -2], [-2, -3], [-2, -4],
      [2, -1], [2, -2], [2, -3], [2, -4],
      [-3, -1], [-3, -2], [-3, -3],
      [3, -1], [3, -2], [3, -3],
      [-4, -1], [-4, -2],
      [4, -1], [4, -2],
      [-5, -1],
      [5, -1],
    ];

    // 绘制水域并添加碰撞
    waterPositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.obstacles.push({ x: x, y: y, width: 40, height: 40 });
    });

    // 岸边树木位置
    const treePositions = [
      // 左侧
      [-6, -3], [-6, -2], [-6, -1],
      // 右侧
      [6, -3], [6, -2], [6, -1],
      // 上方
      [-4, -6], [-3, -6], [3, -6], [4, -6],
      [-5, -5], [-4, -5], [-3, -5], [3, -5], [4, -5], [5, -5],
    ];

    // 绘制树木并添加碰撞
    treePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.obstacles.push({ x: x, y: y, width: 40, height: 40 });
    });
  }

  /**
   * 沙漠地形（只在节点上方和左右，下方完全不画）
   */
  private drawDesertTerrainCollision(centerX: number, centerY: number): void {
    const gridSize = 40;

    // 沙丘位置（固定，覆盖整个区域）
    const sandDunePositions = [
      // 上方区域
      [-4, -5], [-3, -5], [-2, -5], [-1, -5], [0, -5], [1, -5], [2, -5], [3, -5], [4, -5],
      [-5, -4], [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4], [5, -4],
      [-5, -3], [-4, -3], [-3, -3], [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3], [5, -3],
      [-5, -2], [-4, -2], [-3, -2], [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [5, -2],
      [-5, -1], [-4, -1], [-3, -1], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [3, -1], [4, -1], [5, -1],
      // 左侧区域
      [-6, -4], [-6, -3], [-6, -2], [-6, -1],
      // 右侧区域
      [6, -4], [6, -3], [6, -2], [6, -1],
    ];

    // 绘制沙丘并添加碰撞
    sandDunePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.obstacles.push({ x: x, y: y, width: 40, height: 40 });
    });

    // 枯树/仙人掌位置
    const cactusPositions = [
      // 上方
      [-4, -5], [-3, -5], [-2, -5], [-1, -5], [0, -5], [1, -5], [2, -5], [3, -5], [4, -5],
      [-5, -4], [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4], [5, -4],
      // 左侧
      [-6, -3], [-6, -2], [-6, -1],
      // 右侧
      [6, -3], [6, -2], [6, -1],
      // 内圈
      [-3, -3], [-2, -2], [-1, -3], [0, -2], [1, -3], [2, -2], [3, -3],
    ];

    // 绘制仙人掌并添加碰撞
    cactusPositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.obstacles.push({ x: x, y: y, width: 40, height: 40 });
    });
  }

  /**
   * 火焰地形（只在节点上方和左右，下方完全不画）
   */
  private drawFireTerrainCollision(centerX: number, centerY: number): void {
    const gridSize = 40;

    // 灼烧地面位置（固定，覆盖整个区域）
    const burntGroundPositions = [
      // 中心区域
      [0, -1], [0, -2], [0, -3], [0, -4], [0, -5],
      [-1, -1], [-1, -2], [-1, -3], [-1, -4], [-1, -5],
      [1, -1], [1, -2], [1, -3], [1, -4], [1, -5],
      [-2, -1], [-2, -2], [-2, -3], [-2, -4],
      [2, -1], [2, -2], [2, -3], [2, -4],
      [-3, -1], [-3, -2], [-3, -3],
      [3, -1], [3, -2], [3, -3],
      [-4, -1], [-4, -2],
      [4, -1], [4, -2],
      [-5, -1],
      [5, -1],
      // 额外区域
      [-3, -4], [-2, -5], [2, -5], [3, -4],
      [-4, -3], [4, -3],
    ];

    // 绘制灼烧地面并添加碰撞
    burntGroundPositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.obstacles.push({ x: x, y: y, width: 40, height: 40 });
    });

    // 火焰位置
    const firePositions = [
      // 上方
      [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4],
      [-5, -3], [-4, -3], [-3, -3], [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3], [5, -3],
      // 左侧
      [-5, -2], [-5, -1],
      // 右侧
      [5, -2], [5, -1],
      // 内圈
      [-3, -2], [-2, -1], [-1, -2], [0, -1], [1, -2], [2, -1], [3, -2],
    ];

    // 绘制火焰并添加碰撞
    firePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.obstacles.push({ x: x, y: y, width: 40, height: 40 });
    });
  }

  /**
   * 寺庙地形（石头块象征，只在节点上方和左右，下方留空）
   */
  private drawTempleTerrainCollision(centerX: number, centerY: number): void {
    const gridSize = 40;

    // 石头位置
    const stonePositions = [
      // 上方
      [-3, -5], [-2, -5], [-1, -5], [0, -5], [1, -5], [2, -5], [3, -5],
      [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4],
      [-4, -3], [-3, -3], [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3],
      [-3, -6], [0, -6], [3, -6],
      [-5, -4], [5, -4],
      // 左侧
      [-5, -2], [-4, -2], [-5, -1], [-4, -1],
      [-6, -1],
      // 右侧
      [4, -2], [5, -2], [4, -1], [5, -1],
      [6, -1],
    ];

    // 树木位置（已移除与石头重复的位置）
    const treePositions = [
      // 上方区域（移除了与石头重复的位置）
      [-4, -6], [4, -6],  // 保留了 [-3,-6]? 检查石头有没有 [-3,-6]? 石头有 [-3,-6] 吗？没有，所以保留
      // 重新整理上方区域
      [-4, -6], [-3, -6], [-2, -6], [-1, -6], [0, -6], [1, -6], [2, -6], [3, -6], [4, -6],
      // [-5,-5] 到 [5,-5] 中移除 [-3,-5],[-2,-5],[-1,-5],[0,-5],[1,-5],[2,-5],[3,-5]
      [-5, -5], [-4, -5], [4, -5], [5, -5],
      // [-6,-4] 到 [6,-4] 中移除 [-4,-4],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[4,-4]
      [-6, -4], [-5, -4], [5, -4], [6, -4],
      // [-6,-3] 到 [6,-3] 中移除 [-4,-3],[-3,-3],[-2,-3],[-1,-3],[0,-3],[1,-3],[2,-3],[3,-3],[4,-3]
      [-6, -3], [-5, -3], [5, -3], [6, -3],
      // 左侧区域（移除了 [-5,-2],[-4,-2],[-5,-1],[-4,-1],[-6,-1]）
      [-7, -2], [-6, -2], [-3, -2], [-2, -2],
      [-7, -1], [-3, -1], [-2, -1],
      // 右侧区域（移除了 [4,-2],[5,-2],[4,-1],[5,-1],[6,-1]）
      [2, -2], [3, -2], [6, -2], [7, -2],
      [2, -1], [3, -1], [6, -1], [7, -1],
      // 下面一行（dy = 0）
      [-6, 0], [-5, 0], [-4, 0], [-3, 0], [-2, 0],
      [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],
    ];

    // 绘制树木并添加碰撞
    treePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.obstacles.push({ x: x, y: y, width: 40, height: 40 });
    });

    // 绘制石头块并添加碰撞
    stonePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.obstacles.push({ x: x, y: y, width: 40, height: 40 });
    });
  }

  /**
   * 默认地形（只在节点上方，下方完全不画）
   */
  private drawDefaultTerrainCollision(centerX: number, centerY: number): void {
    const gridSize = 40;

    // 树木位置（固定，覆盖上方区域）
    const treePositions = [
      // 上方区域
      [-4, -5], [-3, -5], [-2, -5], [-1, -5], [1, -5], [2, -5], [3, -5], [4, -5],
      [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [4, -4],
      [-4, -3], [-3, -3], [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3],
      [-4, -2], [-3, -2], [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2],
      [-4, -1], [-3, -1], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [3, -1], [4, -1],
      // 左侧区域
      [-5, -4], [-5, -3], [-5, -2], [-5, -1],
      // 右侧区域
      [5, -4], [5, -3], [5, -2], [5, -1],
    ];

    // 绘制树木并添加碰撞
    treePositions.forEach(([dx, dy]) => {
      const x = centerX + dx * gridSize;
      const y = centerY + dy * gridSize;
      this.obstacles.push({ x: x, y: y, width: 40, height: 40 });
    });
  }

  // ==================== 地形绘制方法 ====================

  private drawTree(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(x + 20, y + 34, 18, 6);
    g.fillStyle(0x8B5A2B);
    g.fillRect(x + 18, y + 22, 5, 12);
    g.fillStyle(0x3A7A2A);
    g.fillCircle(x + 20, y + 16, 14);
    g.fillStyle(0x5A9A4A);
    g.fillCircle(x + 15, y + 12, 9);
    g.fillCircle(x + 25, y + 12, 9);
    g.fillStyle(0x7ABA5A);
    g.fillCircle(x + 12, y + 10, 4);
    g.fillCircle(x + 28, y + 10, 4);
  }

  private drawMountain(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0x6B5A4A);
    g.beginPath();
    g.moveTo(x + 5, y + 35);
    g.lineTo(x + 20, y + 5);
    g.lineTo(x + 35, y + 35);
    g.fillPath();
    g.fillStyle(0x5A4A3A);
    g.beginPath();
    g.moveTo(x - 10, y + 35);
    g.lineTo(x + 5, y + 15);
    g.lineTo(x + 20, y + 35);
    g.fillPath();
    g.beginPath();
    g.moveTo(x + 20, y + 35);
    g.lineTo(x + 35, y + 15);
    g.lineTo(x + 50, y + 35);
    g.fillPath();
    g.fillStyle(0xF5F5F5);
    g.beginPath();
    g.moveTo(x + 17, y + 10);
    g.lineTo(x + 20, y + 3);
    g.lineTo(x + 23, y + 10);
    g.fillPath();
    g.fillStyle(0x7A6A5A, 0.5);
    g.fillEllipse(x + 20, y + 25, 8, 4);
    g.fillEllipse(x + 8, y + 28, 6, 3);
    g.fillEllipse(x + 32, y + 28, 6, 3);
  }

  private drawWater(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0x3399FF, 0.7);
    g.fillEllipse(x + 20, y + 20, 30, 20);
    g.fillStyle(0x66CCFF, 0.5);
    g.fillEllipse(x + 15, y + 18, 20, 8);
    g.fillEllipse(x + 25, y + 22, 18, 6);
  }

  private drawSandDune(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0xE8B55A, 0.8);
    g.fillEllipse(x + 20, y + 25, 35, 15);
    g.fillStyle(0xD4A34A, 0.9);
    g.fillEllipse(x + 15, y + 22, 25, 10);
  }

  private drawCactus(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0x5A7A3A);
    g.fillRect(x + 18, y + 20, 4, 15);
    g.fillRect(x + 14, y + 25, 12, 4);
    g.fillRect(x + 22, y + 22, 4, 8);
  }

  private drawBurntGround(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0x8B2500, 0.6);
    g.fillEllipse(x + 20, y + 20, 28, 20);
    g.fillStyle(0xAA3300, 0.4);
    g.fillEllipse(x + 20, y + 20, 20, 14);
  }

  private drawFire(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0xFF6600, 0.9);
    g.beginPath();
    g.moveTo(x + 18, y + 25);
    g.lineTo(x + 20, y + 12);
    g.lineTo(x + 22, y + 25);
    g.fillPath();
    g.fillStyle(0xFFDD44, 0.8);
    g.beginPath();
    g.moveTo(x + 19, y + 25);
    g.lineTo(x + 20, y + 16);
    g.lineTo(x + 21, y + 25);
    g.fillPath();
  }


  /**
   * 绘制石头块
   */
  private drawStoneBlock(g: Phaser.GameObjects.Graphics, x: number, y: number, isMain: boolean = false): void {
    if (isMain) {
      // 主殿大石块
      g.fillStyle(0x8A8A7A);
      g.fillRect(x + 12, y + 20, 16, 16);
      g.fillStyle(0x9A9A8A);
      g.fillRect(x + 14, y + 18, 12, 4);
      // 纹路
      g.fillStyle(0x6A6A5A);
      g.fillRect(x + 16, y + 24, 8, 2);
      g.fillRect(x + 16, y + 28, 8, 2);
    } else {
      // 普通石块
      const variant = (Math.floor(Math.random() * 3));
      if (variant === 0) {
        // 方形石块
        g.fillStyle(0x8A8A7A);
        g.fillRect(x + 14, y + 24, 12, 12);
        g.fillStyle(0x7A7A6A);
        g.fillRect(x + 16, y + 26, 8, 2);
      } else if (variant === 1) {
        // 圆形石墩
        g.fillStyle(0x8A8A7A);
        g.fillEllipse(x + 20, y + 30, 10, 8);
        g.fillStyle(0x7A7A6A);
        g.fillEllipse(x + 20, y + 28, 6, 4);
      } else {
        // 竖立石碑
        g.fillStyle(0x8A8A7A);
        g.fillRect(x + 17, y + 20, 6, 16);
        g.fillStyle(0x9A9A8A);
        g.fillRect(x + 16, y + 18, 8, 4);
      }
    }
  }
  // ==================== 节点和玩家 ====================

  private createWorldNodes(): void {
    WorldNodesData.forEach(nodeData => {
      const container = this.add.container(nodeData.x, nodeData.y);

      // 根据icon类型绘制不同的图标
      const iconGraphics = this.add.graphics();

      switch(nodeData.icon) {
        case 'mountain':
          this.drawMountainIcon(iconGraphics, 0, 0);
          break;
        case 'temple':
          this.drawTempleIcon(iconGraphics, 0, 0);
          break;
        case 'water':
          this.drawWaterIcon(iconGraphics, 0, 0);
          break;
        case 'city':
          this.drawCityIcon(iconGraphics, 0, 0);
          break;
        case 'cave':
          this.drawCaveIcon(iconGraphics, 0, 0);
          break;
        case 'desert':
          this.drawDesertIcon(iconGraphics, 0, 0);
          break;
        case 'forest':
          this.drawForestIcon(iconGraphics, 0, 0);
          break;
        case 'fire':
          this.drawFireIcon(iconGraphics, 0, 0);
          break;
        default:
          // 默认圆形
          iconGraphics.fillStyle(0xFFFFFF, 1);
          iconGraphics.fillCircle(0, 0, 8);
      }

      container.add(iconGraphics);

      const nameText = this.add.text(0, -30, nodeData.name, {
        fontSize: '24px',
        fontStyle: 'bold',
        color: nodeData.isUnlocked ? '#FFD700' : '#999999',
        fontFamily: 'monospace',
        align: 'center'
      }).setOrigin(0.5);
      container.add(nameText);
      container.setDepth(10);
      this.nodes.set(nodeData.id, container);
    });
  }

  // ==================== 节点图标绘制方法 ====================
  private drawMountainIcon(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 山峰
    g.fillStyle(0x8B8B7A, 1);
    g.beginPath();
    g.moveTo(x, y - 48);
    g.lineTo(x - 32, y + 16);
    g.lineTo(x + 32, y + 16);
    g.fillPath();
    // 雪顶
    g.fillStyle(0xFFFFFF, 1);
    g.beginPath();
    g.moveTo(x, y - 40);
    g.lineTo(x - 16, y - 8);
    g.lineTo(x + 16, y - 8);
    g.fillPath();
    // 山体
    g.fillStyle(0x6B6B5A, 1);
    g.beginPath();
    g.moveTo(x - 32, y + 16);
    g.lineTo(x - 48, y + 40);
    g.lineTo(x + 48, y + 40);
    g.lineTo(x + 32, y + 16);
    g.fillPath();
  }

  private drawTempleIcon(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 屋顶
    g.fillStyle(0x8B5A2B, 1);
    g.beginPath();
    g.moveTo(x, y - 40);
    g.lineTo(x - 40, y);
    g.lineTo(x + 40, y);
    g.fillPath();
    // 墙体
    g.fillStyle(0xC41E3A, 1);
    g.fillRect(x - 24, y, 48, 40);
    // 门
    g.fillStyle(0x5A3A1A, 1);
    g.fillRect(x - 8, y + 16, 16, 24);
  }

  private drawWaterIcon(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 水面
    g.fillStyle(0x3399FF, 0.8);
    g.fillEllipse(x, y + 8, 64, 40);
    // 波纹
    g.fillStyle(0x66CCFF, 0.8);
    g.fillEllipse(x - 16, y, 24, 12);
    g.fillEllipse(x + 8, y + 12, 20, 8);
    g.fillEllipse(x + 24, y, 16, 8);
  }

  private drawCityIcon(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 城墙
    g.fillStyle(0x9A8A6A, 1);
    g.fillRect(x - 40, y, 80, 40);
    // 城门
    g.fillStyle(0x6A5A4A, 1);
    g.fillRect(x - 12, y + 12, 24, 28);
    // 城楼
    g.fillStyle(0x8B5A2B, 1);
    g.fillRect(x - 20, y - 24, 40, 24);
    g.fillStyle(0xC41E3A, 1);
    g.beginPath();
    g.moveTo(x, y - 40);
    g.lineTo(x - 24, y - 24);
    g.lineTo(x + 24, y - 24);
    g.fillPath();
  }

  private drawCaveIcon(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 山洞背景
    g.fillStyle(0x5A4A3A, 1);
    g.fillEllipse(x, y + 8, 56, 48);
    // 洞口
    g.fillStyle(0x2A1A0A, 1);
    g.fillEllipse(x, y + 8, 40, 32);
    // 水滴
    g.fillStyle(0x88CCFF, 0.7);
    g.fillEllipse(x - 12, y + 16, 8, 12);
    g.fillEllipse(x + 12, y + 20, 8, 8);
  }

  private drawDesertIcon(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 沙丘
    g.fillStyle(0xE8B55A, 1);
    g.fillEllipse(x, y + 16, 56, 32);
    // 仙人掌
    g.fillStyle(0x5A7A3A, 1);
    g.fillRect(x - 8, y - 16, 16, 40);
    g.fillRect(x - 24, y - 8, 16, 24);
    g.fillRect(x + 8, y - 4, 16, 24);
  }

  private drawForestIcon(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 多棵树
    g.fillStyle(0x3A7A2A, 1);
    // 左树
    g.beginPath();
    g.moveTo(x - 24, y + 8);
    g.lineTo(x - 32, y - 16);
    g.lineTo(x - 16, y - 16);
    g.fillPath();
    // 中树
    g.beginPath();
    g.moveTo(x, y + 8);
    g.lineTo(x - 12, y - 32);
    g.lineTo(x + 12, y - 32);
    g.fillPath();
    // 右树
    g.beginPath();
    g.moveTo(x + 24, y + 8);
    g.lineTo(x + 16, y - 16);
    g.lineTo(x + 32, y - 16);
    g.fillPath();
    // 树干
    g.fillStyle(0x8B5A2B, 1);
    g.fillRect(x - 4, y - 8, 8, 24);
  }

  private drawFireIcon(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 火焰
    g.fillStyle(0xFF6600, 1);
    g.beginPath();
    g.moveTo(x, y - 32);
    g.lineTo(x - 20, y + 8);
    g.lineTo(x - 8, y + 8);
    g.lineTo(x - 12, y + 24);
    g.lineTo(x, y + 8);
    g.lineTo(x + 12, y + 24);
    g.lineTo(x + 8, y + 8);
    g.lineTo(x + 20, y + 8);
    g.fillPath();
    // 焰心
    g.fillStyle(0xFFDD44, 1);
    g.beginPath();
    g.moveTo(x, y - 16);
    g.lineTo(x - 8, y + 4);
    g.lineTo(x + 8, y + 4);
    g.fillPath();
  }

  private createPlayer(): void {
    const playerGraphics = this.add.graphics();
    this.wukong = new WuKong(playerGraphics, this);
    this.wukong.setBounds(0, this.mapWidth, 0, this.mapHeight);

    // 如果有返回的节点ID，使用该节点的位置
    let startNode: WorldNode | undefined;
    if (this.returnNodeId) {
      startNode = WorldNodesData.find(node => node.id === this.returnNodeId);
    }

    // 如果没有返回节点，使用第一个节点（花果山）
    if (!startNode) {
      startNode = WorldNodesData[0];
    }

    if (startNode) {
      this.wukong.setPosition(startNode.x, startNode.y + 50);
    }

    this.wukong.setCollisionRadius(15);
  }

  update(): void {
    if (this.wukong) {
      this.wukong.updateFromControllerWithCollision(this.obstacles);
      this.checkNodeInteraction();
      this.updateMinimap();
    }
  }

  private checkNodeInteraction(): void {
    // 遍历所有节点
    for (const [id, container] of this.nodes) {
      const nodeX = container.x;
      const nodeY = container.y;
      const playerX = this.wukong.getX();
      const playerY = this.wukong.getY();

      // 计算玩家与节点的距离
      const distance = Math.hypot(playerX - nodeX, playerY - nodeY);

      // 如果距离小于阈值（比如 30px），触发进入场景
      if (distance < 30) {
        const nodeData = WorldNodesData.find(n => n.id === id);
        if (nodeData && nodeData.isUnlocked) {
          this.enterNodeScene(nodeData);
        }
        break;
      }
    }
  }

  private enterNodeScene(nodeData: WorldNode): void {
    if (this.isEnteringCave) return;
    this.isEnteringCave = true;

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(nodeData.scene, {
        from: 'WorldMapScene',
        playerX: 400,
        playerY: 300
      });
    });
  }

  private createMinimap(): void {
    const minimapWidth = 240;
    const minimapHeight = 180;

    // 使用固定的屏幕尺寸，而不是摄像机的宽
    const screenWidth = 1050;
    const x = screenWidth - minimapWidth;
    const y = -180;

    // // 1. 创建简化版地图纹理
    // const minimapGraphics = this.add.graphics();

    // // 背景
    // minimapGraphics.fillStyle(0x2a2a2a, 1);
    // minimapGraphics.fillRect(0, 0, this.mapWidth, this.mapHeight);

    // // 绘制节点
    // WorldNodesData.forEach(node => {
    //   minimapGraphics.fillStyle(0xFFD700, 1);
    //   minimapGraphics.fillCircle(node.x, node.y, 80);
    // });

    // // 生成纹理
    // minimapGraphics.generateTexture('minimapBg', this.mapWidth, this.mapHeight);
    // minimapGraphics.destroy();

    // 2. 添加小地图图片
    this.add.image(x, y, 'worldMapBg')
      .setOrigin(0)
      .setDisplaySize(minimapWidth, minimapHeight)
      .setDepth(18)
      .setScrollFactor(0);

    const overlay = this.add.rectangle(x, y, minimapWidth, minimapHeight, 0x000000, 0.5);
    overlay.setOrigin(0);
    overlay.setDepth(19);
    overlay.setScrollFactor(0);

    // 3. 玩家标记
    this.minimapPlayerMarker = this.add.graphics();
    this.minimapPlayerMarker.setDepth(20);
    this.minimapPlayerMarker.setScrollFactor(0);

    // 4. 边框
    const border = this.add.graphics();
    border.lineStyle(2, 0xFFFFFF, 0.8);
    border.strokeRect(x, y, minimapWidth, minimapHeight);
    border.setDepth(25);
    border.setScrollFactor(0);
  }

  private updateMinimap(): void {
    if (!this.minimapPlayerMarker) return;

    this.minimapPlayerMarker.clear();

    const minimapWidth = 240;
    const minimapHeight = 180;
    const screenWidth = 1050;
    const minimapX = screenWidth - minimapWidth;
    const minimapY = -180;

    const progressX = this.wukong.getX() / this.mapWidth;
    const progressY = this.wukong.getY() / this.mapHeight;

    const markerX = minimapX + progressX * minimapWidth;
    const markerY = minimapY + progressY * minimapHeight;

    this.minimapPlayerMarker.fillStyle(0xFF4444, 1);
    this.minimapPlayerMarker.fillCircle(markerX, markerY, 6);

    this.minimapPlayerMarker.fillStyle(0xFFFFFF, 1);
    this.minimapPlayerMarker.fillCircle(markerX, markerY, 2);
  }
}