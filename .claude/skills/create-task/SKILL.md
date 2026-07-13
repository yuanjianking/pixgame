---
name: create-task
description: Create a new task following the project's step-driven task system, including task.json definition and NPC/arrive progression
user-invocable: false
---

# Skill: 创建任务

在 `src/components/games/xiyouji/task/task.json` 中定义新任务。

## 任务系统架构

```
task/task.json           → 任务定义（静态数据）
task/TaskManager.ts      → 任务运行时（单例）
  ├── markArrive(scene)  → 推进 arrive 类步骤
  ├── markTalk(npcId)    → 推进 talk 类步骤
  └── completeTask(id)   → 直接完成（战斗胜利等）
types/index.ts           → Task / GameSaveData 接口
scenes/sceneSave.ts      → 场景进入时自动触发 markArrive
characters/npc/BaseNPC.ts → interact() 自动触发 markTalk
```

## 步骤

### 1. 定义任务（task.json）

```json
{
    "id": "unique_task_id",
    "name": "任务名称",
    "completed": false,
    "steps": [
        {
            "stepId": 1,
            "description": "步骤1描述",
            "target": {
                "type": "arrive",
                "scene": "SceneName"
            }
        },
        {
            "stepId": 2,
            "description": "与某某对话",
            "target": {
                "type": "talk",
                "scene": "SceneName",
                "npcId": "NPC名称",
                "dialogues": ["对话1", "对话2"]
            }
        }
    ],
    "rewards": {
        "exp": 50,
        "items": [],
        "unlockScenes": []
    }
}
```

### 2. 步骤类型说明

| type | 触发方式 | 自动/手动 | 说明 |
|------|---------|-----------|------|
| `arrive` | `markArrive()` | 自动 | 进入场景时触发 |
| `talk` | `BaseNPC.interact()` → `markTalk()` | 手动（按J） | NPC 对话 |
| `kill` | 战斗胜利后 `completeTask()` | 手动 | 战斗结算 |
| `collect` | (预留) | 手动 | 暂未实现 |

### 3. 步骤推进规则

- 任务按 `stepId` 顺序推进
- 只有当前活跃步骤可被触发
- 最后一步完成后自动结算奖励
- 已完成任务通过 `completedTasks.includes(taskId)` 判断

### 4. NPC 对话集成

`BaseNPC.interact()` 自动执行：
1. 调用 `TaskManager.getTasksByNpc(this.name)` 查找关联任务
2. 找到未完成任务 → 显示 `currentStep.target.dialogues`
3. 对话回调 → `TaskManager.markTalk(this.name, sceneName)`
4. 无关联任务 → 显示默认对话

**重要限制**：`getTasksByNpc()` 匹配 `npcId` 字段，NPC 的 `name` 参数必须与 task.json 的 `npcId` 完全一致（包括空格）。

### 5. 场景集成要点

```typescript
// arrive 步骤自动触发
saveEnterSceneProgress(this.wukong, 'SceneName', { x, y });

// 首次进入对话判断
private showIntroDialog(): void {
  const completed = this.saveData?.progress?.completedTasks?.includes('task_id') ?? false;
  if (completed) return;
  // 显示开场对话...
}
```

---

## 验证清单

- [ ] task.json 格式正确（JSON 合法，无尾逗号）
- [ ] `npcId` 与 NPC 构造函数 `name` 参数一致
- [ ] `scene` 名称与场景 key 一致
- [ ] arrive 步骤在进入场景时自动触发
- [ ] talk 步骤在按 J 对话时正确触发
- [ ] 已完成任务不再重复触发
- [ ] `npx tsc --noEmit` 无错误
