---
name: next-chapter
description: Orchestrate creating a new chapter — Map class, Scene, NPCs, task, world node, registration
---

# Command: 创建下一关卡

执行完整的下一关卡创建流程。

## 执行步骤

### Step 1: 世界地图节点
编辑 `data/WorldData.ts`，添加 `WorldNode` 条目。

### Step 2: 创建地图文件
`src/components/games/xiyouji/maps/<SceneName>Map.ts`
- 渐变背景/纹理，不得留纯色
- 装饰 ≥2 种，15-20 个实例
- 环境光 + 动态光效
- 导出 `obstacles[]`

### Step 3: 创建 NPC 角色
`src/components/games/xiyouji/characters/npc/<Character>.ts`
- 继承 `BaseNPC`
- 3+ 材质，3 层明暗，完整肢体

### Step 4: 创建场景文件
`src/components/games/xiyouji/scenes/chapter<N>/<SceneName>Scene.ts`
- Map 分离模式：场景只做逻辑编排
- 入口位置：`entryPosition` > `saved.position` > 默认

### Step 5: 创建任务
编辑 `task/task.json`，添加 arrive + talk 步骤

### Step 6: 场景注册
编辑 `scenes/index.ts`，导入并注册新场景

### Step 7: 类型检查
运行 `npx tsc --noEmit`

### Step 8: 验证
- [ ] 世界地图节点可进入
- [ ] 场景背景正确渲染
- [ ] NPC 可见并有碰撞
- [ ] J 键对话正常
- [ ] 任务 arrive/talk 正确推进
- [ ] 走到底部边缘返回世界地图
- [ ] 重新进入不重复触发
- [ ] `npx tsc --noEmit` 无错误
