import { SaveManager } from "../save/SaveManager";
import type { Task, GameSaveData } from "../types";
import taskData from './task.json';

export class TaskManager {
    private static instance: TaskManager;
    private tasks: Map<string, Task> = new Map();

    constructor() {
        this.loadTasksFromJSON();
    }

    public static getInstance(): TaskManager {
        if (!TaskManager.instance) {
            TaskManager.instance = new TaskManager();
        }
        return TaskManager.instance;
    }

    private async loadTasksFromJSON(): Promise<void> {
        try {
            const saveData = SaveManager.getInstance().loadGame(1);

            taskData.tasks.forEach((task: Task) => {
                this.tasks.set(task.id, task);
            });

            if (saveData?.progress?.completedTasks) {
                saveData.progress.completedTasks.forEach((completedTaskId: string) => {
                    const task = this.tasks.get(completedTaskId);
                    if (task) {
                        task.completed = true;
                    }
                });
            }
        } catch (error) {
            console.error('加载任务失败:', error);
        }
    }

    /** 获取任务当前应执行的步骤（第一个未完成的 step） */
    private getCurrentStep(task: Task, saveData: GameSaveData) {
        if (task.completed) return null;
        const doneStepId = saveData.progress.taskStepProgress?.[task.id] ?? 0;
        return task.steps.find((s) => s.stepId > doneStepId) ?? null;
    }

    private applyTaskRewards(saveData: GameSaveData, task: Task): void {
        for (const scene of task.rewards?.unlockScenes ?? []) {
            if (!saveData.progress.unlockedScenes.includes(scene)) {
                saveData.progress.unlockedScenes.push(scene);
            }
        }
        for (const itemName of task.rewards?.items ?? []) {
            const existing = saveData.inventory.items.find((i) => i.id === itemName);
            if (existing) {
                existing.count += 1;
            } else {
                saveData.inventory.items.push({ id: itemName, count: 1 });
            }
        }
        if (task.rewards?.exp) {
            saveData.player.exp += task.rewards.exp;
        }
    }

    private finalizeTask(saveData: GameSaveData, task: Task): void {
        task.completed = true;
        this.tasks.set(task.id, task);

        if (!saveData.progress.completedTasks.includes(task.id)) {
            saveData.progress.completedTasks.push(task.id);
        }
        const lastStep = task.steps[task.steps.length - 1];
        if (lastStep) {
            saveData.progress.taskStepProgress = saveData.progress.taskStepProgress ?? {};
            saveData.progress.taskStepProgress[task.id] = lastStep.stepId;
        }
        this.applyTaskRewards(saveData, task);
    }

    /** 完成指定步骤；若已是最后一步则结算整个任务 */
    private completeStep(
        task: Task,
        stepId: number,
        saveData: GameSaveData
    ): boolean {
        saveData.progress.taskStepProgress = saveData.progress.taskStepProgress ?? {};
        saveData.progress.taskStepProgress[task.id] = stepId;

        const lastStep = task.steps[task.steps.length - 1];
        if (lastStep && stepId >= lastStep.stepId) {
            this.finalizeTask(saveData, task);
            return true;
        }
        return false;
    }

    /**
     * 标记任务已完成并持久化（用于战斗胜利等直接结算）
     * 只改 progress / 奖励，不覆盖玩家当前属性
     */
    public completeTask(taskId: string, saveSlot: number = 1): boolean {
        const task = this.tasks.get(taskId);
        if (!task) return false;
        if (task.completed) return true;

        try {
            return SaveManager.getInstance().updateSave(saveSlot, (saveData) => {
                this.finalizeTask(saveData, task);
            });
        } catch (e) {
            console.error('保存任务进度失败', e);
            return false;
        }
    }

    /**
     * 到达场景时推进「arrive」类步骤，不会误完成整个任务
     * 返回本次新完成的任务 id 列表
     */
    public markArrive(sceneName: string, saveSlot: number = 1): string[] {
        const finished: string[] = [];

        try {
            SaveManager.getInstance().updateSave(saveSlot, (saveData) => {
                for (const task of this.tasks.values()) {
                    if (task.completed) continue;

                    const step = this.getCurrentStep(task, saveData);
                    if (
                        step?.target.type === 'arrive' &&
                        step.target.scene === sceneName
                    ) {
                        const taskDone = this.completeStep(task, step.stepId, saveData);
                        if (taskDone) {
                            finished.push(task.id);
                        }
                    }
                }
            });
        } catch (e) {
            console.error('保存到达任务失败', e);
        }

        return finished;
    }

    /**
     * 与 NPC 对话后推进「talk」类步骤
     */
    public markTalk(npcId: string, sceneName: string, saveSlot: number = 1): string[] {
        const finished: string[] = [];

        try {
            SaveManager.getInstance().updateSave(saveSlot, (saveData) => {
                for (const task of this.tasks.values()) {
                    if (task.completed) continue;

                    const step = this.getCurrentStep(task, saveData);
                    if (
                        step?.target.type === 'talk' &&
                        step.target.npcId === npcId &&
                        (!step.target.scene || step.target.scene === sceneName)
                    ) {
                        const taskDone = this.completeStep(task, step.stepId, saveData);
                        if (taskDone) {
                            finished.push(task.id);
                        }
                    }
                }
            });
        } catch (e) {
            console.error('保存对话任务失败', e);
        }

        return finished;
    }

    getTasksBySceneAndNpc(scene: string, npcId: string): Task[] {
        const saveData = SaveManager.getInstance().loadGame(1);
        const result: Task[] = [];

        for (const task of this.tasks.values()) {
            if (task.completed) continue;
            const step = saveData ? this.getCurrentStep(task, saveData) : task.steps[0];
            if (!step) continue;

            const target = step.target;
            if (target.type === 'arrive' && target.scene === scene) {
                result.push(task);
            } else if (target.type === 'talk' && target.npcId === npcId) {
                result.push(task);
            }
        }

        return result;
    }

    getTasksByScene(scene: string): Task[] {
        const saveData = SaveManager.getInstance().loadGame(1);
        const result: Task[] = [];

        for (const task of this.tasks.values()) {
            if (task.completed) continue;
            const step = saveData ? this.getCurrentStep(task, saveData) : task.steps[0];
            if (step?.target.type === 'arrive' && step.target.scene === scene) {
                result.push(task);
            }
        }

        return result;
    }

    getTasksByNpc(npcId: string): Task[] {
        const saveData = SaveManager.getInstance().loadGame(1);
        const result: Task[] = [];

        for (const task of this.tasks.values()) {
            if (task.completed) continue;
            const step = saveData ? this.getCurrentStep(task, saveData) : task.steps[0];
            if (step?.target.type === 'talk' && step.target.npcId === npcId) {
                result.push(task);
            }
        }

        return result;
    }

    /** 获取任务当前进行中的步骤（供对话等 UI 使用） */
    public getActiveStep(task: Task, saveSlot: number = 1) {
        const saveData = SaveManager.getInstance().getOrCreateSave(saveSlot);
        return this.getCurrentStep(task, saveData);
    }

    getTaskById(taskId: string): Task | null {
        return this.tasks.get(taskId) || null;
    }

    getAllTasks(): Task[] {
        return Array.from(this.tasks.values());
    }
}
