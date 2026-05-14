import { SaveManager } from "../save/SaveManager";
import type { Task } from "../types";
import taskData from './task.json';

export class TaskManager {
    private static instance: TaskManager;
    private tasks: Map<string, Task> = new Map();

    constructor() {
        this.loadTasksFromJSON();
    }

     // 获取全局实例
    public static getInstance(): TaskManager {
        if (!TaskManager.instance) {
            TaskManager.instance = new TaskManager();
        }
        return TaskManager.instance;
    }

    // 从同目录的 tasks.json 加载所有任务
    private async loadTasksFromJSON(): Promise<void> {
        try {

            const saveData = SaveManager.getInstance().loadGame(1);

            // 判断是数组还是单个对象
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


    // 根据场景和NPC过滤任务
    getTasksBySceneAndNpc(scene: string, npcId: string): Task[] {
        const result: Task[] = [];

        for (const task of this.tasks.values()) {
            for (const step of task.steps) {
                const target = step.target;
                if (target.type === 'arrive' && target.scene === scene) {
                    result.push(task);
                    break;
                } else if (target.type === 'talk' && target.npcId === npcId) {
                    result.push(task);
                    break;
                }
            }
        }

        return result;
    }

    // 根据场景过滤任务
    getTasksByScene(scene: string): Task[] {
        const result: Task[] = [];

        for (const task of this.tasks.values()) {
            for (const step of task.steps) {
                if (step.target.type === 'arrive' && step.target.scene === scene) {
                    result.push(task);
                    break;
                }
            }
        }

        return result;
    }

    // 根据NPC过滤任务
    getTasksByNpc(npcId: string): Task[] {
        const result: Task[] = [];

        for (const task of this.tasks.values()) {
            for (const step of task.steps) {
                if (step.target.type === 'talk' && step.target.npcId === npcId) {
                    result.push(task);
                    break;
                }
            }
        }

        return result;
    }

    getTaskById(taskId: string): Task | null {
        return this.tasks.get(taskId) || null;
    }

    getAllTasks(): Task[] {
        return Array.from(this.tasks.values());
    }

}