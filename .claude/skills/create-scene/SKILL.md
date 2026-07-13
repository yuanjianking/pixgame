---
name: create-scene
description: Create a new scene following the project's architecture, with separate Map class, NPCs, collision, and task integration
user-invocable: false
---

# Skill: 创建场景

在 `src/components/games/xiyouji/scenes/chapter<N>/` 下创建新的场景。

## 架构模式

每个场景由三部分组成：

```
maps/<SceneName>Map.ts             — 地图绘制 + 碰撞（背景/建筑/装饰/特效）
scenes/chapterN/<SceneName>Scene.ts — 场景逻辑（NPC/任务/输入/出口）
scenes/index.ts                    — 场景注册
```

## 步骤

### 1. 创建地图文件

`src/components/games/xiyouji/maps/<SceneName>Map.ts`

参考：`HeavenMap.ts`, `TerrainMap.ts`, `WaterMap.ts`

```typescript
// maps/<SceneName>Map.ts
import * as Phaser from 'phaser';

export class <Name>Map {
  static readonly MAP_COLS = 20;
  static readonly MAP_ROWS = 15;
  static readonly TILE = 40;
  static readonly MAP_W = <Name>Map.MAP_COLS * <Name>Map.TILE;
  static readonly MAP_H = <Name>Map.MAP_ROWS * <Name>Map.TILE;

  readonly obstacles: { x: number; y: number; width: number; height: number }[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) { this.scene = scene; }

  render(): void {
    this.drawBackground();
    this.drawStructures();
    this.drawDecorations();
    this.drawEffects();
  }
}
```

### 2. 创建场景文件

`src/components/games/xiyouji/scenes/chapter<N>/<SceneName>Scene.ts`

参考模板：

```typescript
export default class <SceneName>Scene extends Phaser.Scene {
  // 私有字段：wukong, obstacles[], dialogBox, isExiting, npcs[], inputJController, saveData, entryPosition

  constructor() { super({ key: '<SceneName>Scene' }); }

  init(data?: { playerX?: number; playerY?: number }): void {
    this.saveData = SaveManager.getInstance().loadGame(1) ?? undefined;
    this.entryPosition = (data?.playerX != null) ? { x: data.playerX, y: data.playerY } : undefined;
    this.obstacles = []; this.npcs = []; this.isExiting = false;
  }

  create(): void {
    // 1. 地图渲染
    const map = new <Name>Map(this); map.render();
    this.obstacles.push(...map.obstacles);

    // 2. 玩家（entryPosition > saved.position > 默认值）
    const playerGraphics = this.add.graphics().setDepth(20);
    this.wukong = new WuKong(playerGraphics, this);
    const saved = this.saveData?.player ?? SaveManager.getInstance().loadGame(1)?.player;
    applySaveToCharacter(this.wukong, saved);
    const startX = this.entryPosition?.x ?? saved?.position.x ?? 10 * TILE;
    const startY = this.entryPosition?.y ?? saved?.position.y ?? 7 * TILE;
    this.wukong.setPosition(startX, startY).setCollisionRadius(15).setBounds(0, MAP_W, 0, MAP_H);

    // 3. UI + 存档 + NPC + 输入 + 提示
    this.dialogBox = new DialogBox(this);
    new HUD(this, () => this.wukong.getLevel());
    saveEnterSceneProgress(this.wukong, '<SceneName>Scene', { x: startX, y: startY });
    this.spawnNpcs();
    this.inputJController = new InputJController(this);
    this.inputJController.onInteract = () => this.checkNPCInteraction();
    this.showControlHint();
    this.time.delayedCall(400, () => this.showIntroDialog());
  }

  update(): void {
    this.wukong.updateFromControllerWithCollision(this.obstacles);
    this.checkMapExit();
  }
}
```

### 3. 场景注册

编辑 `scenes/index.ts`：
```typescript
import <SceneName>Scene from "./chapter<N>/<SceneName>Scene";
const Chapter<N>Scenes = [..., <SceneName>Scene];
```

---

## 场景完整度检查清单

- [ ] 背景渐变/纹理，非纯色
- [ ] 至少 2 种装饰类型，15-20 个实例
- [ ] 光影层次：环境光 + 动态光效
- [ ] NPC 至少 1 个，可对话
- [ ] 出口（回世界地图或下一场景）
- [ ] 场景切换有 fade 过渡
- [ ] 操作提示（首次进入显示）
- [ ] 可读档恢复到正确位置
- [ ] `npx tsc --noEmit` 无错误
