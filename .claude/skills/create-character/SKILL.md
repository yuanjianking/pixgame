---
name: create-character
description: Create a new NPC character following the project's code-drawn visual standards and class hierarchy
user-invocable: false
---

# Skill: 创建角色

在 `src/components/games/xiyouji/characters/npc/` 下创建新的 NPC 角色文件。

## 模式选择

有两种模式，根据需求选择：

### 模式 A: BaseNPC（普通 NPC，可对话，无战斗）
适用：商店老板、路人、剧情 NPC

已有参考：
- `TaibaiJinxing.ts` — 无战斗交互NPC
- `HeavenlySoldier.ts` — 无战斗交互NPC
- `DaMaHou.ts` / `SmallMonkey.ts` — 简单NPC

### 模式 B: BaseCharacter（有世界 + 战斗双形态）
适用：可战斗的敌我角色（DragonKing, Shrimp, Crab）

已有参考：
- `DragonKing.ts` — 双形态（世界NPC + 战斗单位）
- `Shrimp.ts` / `Crab.ts` — 同上

---

## 步骤

### 1. 创建文件

`src/components/games/xiyouji/characters/npc/<角色英文名>.ts`

### 2. 基础框架（BaseNPC 模式）

```typescript
// npc/<角色名>.ts
import * as Phaser from 'phaser';
import { BaseNPC } from './BaseNPC';
import type { DialogBox } from '../../ui/DialogBox';

export class <角色类名> extends BaseNPC {
  private static readonly COLORS = {
    // 定义材质颜色常量，按材质分组
    // SKIN_*, ARMOR_*, CLOTH_*, etc.
  };

  // 必须的私有字段（用于动画引用）
  private leftArm!: Phaser.GameObjects.Graphics;
  private rightArm!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, name: string, dialogues: string[], dialogBox: DialogBox) {
    super(scene, x, y, name, dialogues, dialogBox);
  }

  private px(v: number): number {
    return v * <类名>.S;
  }

  private pxw(v: number): number {
    return v * <类名>.S * <类名>.WIDTH_SCALE;
  }

  protected createSprite(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(this.x, this.y);
    const bodyY = 0;
    const C = <类名>.COLORS;
    const px = this.px.bind(this);
    const pxw = this.pxw.bind(this);

    // === 渲染层次（从下到上）===
    // 1. 地面阴影 — 半透明椭圆
    // 2. 脚/鞋
    // 3. 腿部 / 下摆
    // 4. 躯干（暗部→中调→亮部→高光，至少3层）
    // 5. 衣物/盔甲细节
    // 6. 手臂（左右分开）
    // 7. 手部/持物（武器、法器）
    // 8. 脖子
    // 9. 头部（暗部→中调→亮部）
    // 10. 面部细节（眼睛、眉毛、鼻子、嘴）
    // 11. 发型/帽子/头饰
    // 12. 披风/飘带

    // === 动画（可选）===
    // let time = 0;
    // this.scene.time.addEvent({ delay: 70, callback: () => { ... }, loop: true });

    container.setDepth(20);
    return container;
  }
}
```

### 3. 角色渲染规范

| 层次 | 要求 | 参考 |
|------|------|------|
| 材质 | ≥3种（皮肤/金属/布料） | TaibaiJinxing（皮肤/白袍/金边） |
| 明暗 | ≥3层（暗部→固有色→高光） | 每个部件用 `*_MID/_DARK/_LIGHT` 常量 |
| 轮廓光 | 半透明亮线在一侧 | 在身体一侧加 `fillRect` |
| 身体分区 | 头/躯干/左右臂/左右腿 | 必须齐全 |
| 签名特征 | 角色标志性特征 | 太白金星长白须、天兵金盔红缨 |

### 4. 对话配置

```typescript
new 角色类名(this, x * TILE, y * TILE, '显示名称', ['对话1'], this.dialogBox);
```

### 5. 场景注册

在场景文件的 `spawnNpcs()` 方法中：
```typescript
this.npcs.push(npc);
this.obstacles.push(npc.getCollisionRect());
```

---

## 验证清单

- [ ] `npx tsc --noEmit` 无错误
- [ ] 角色在场景中可见
- [ ] 角色有碰撞（NPC 不可穿过）
- [ ] 按 J 可交互对话
- [ ] 动画不报错（time.addEvent 循环正确）
