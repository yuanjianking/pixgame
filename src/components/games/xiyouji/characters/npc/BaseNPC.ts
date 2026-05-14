// npc/BaseNPC.ts
import * as Phaser from 'phaser';
import { DialogBox } from '../../ui/DialogBox';
import { TaskManager } from '../../task/TaskManager';

export abstract class BaseNPC {
  protected scene: Phaser.Scene;
  protected sprite: Phaser.GameObjects.Container;
  protected dialogBox: DialogBox;
  protected name: string;
  protected dialogues: string[];
  public x: number;
  public y: number;
  // 缩放系数
  protected static readonly S = 0.6;
  protected static readonly WIDTH_SCALE = 1.1;
  constructor(scene: Phaser.Scene, x: number, y: number, name: string, dialogues: string[],  dialogBox: DialogBox) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.name = name;
    this.dialogues = dialogues;
    this.dialogBox = dialogBox;
    this.sprite = this.createSprite();
  }

  // 子类实现具体外观
  protected abstract createSprite(): Phaser.GameObjects.Container;

  // 交互
  public interact(): void {
    if (this.dialogBox.isDialogActive()) {
      console.log('对话框已激活，其他无法打断');
      return;
    }

    // 先检查是否有任务需要交互
    const tasks = TaskManager.getInstance().getTasksByNpc(this.name);

    if (tasks.length > 0) {
        // 有任务，显示任务对话
        const task = tasks[0];
        const currentStep = task.steps.find(step => !step.completed);
        if (currentStep && currentStep.target.dialogues) {
            this.dialogBox.show(this.name, currentStep.target.dialogues);
        }
    } else {
        // 没有任务，显示普通问候
        this.dialogBox.show(this.name, this.dialogues);
    }
  }

  // 是否正在对话
  public isDialogActive(): boolean {
    return this.dialogBox.isDialogActive();
  }

  // 获取位置
  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  // 获取碰撞区域
  public getCollisionRect(): { x: number; y: number; width: number; height: number } {
    return { x: this.x - 15, y: this.y - 15, width: 30, height: 30 };
  }

  // 销毁
  public destroy(): void {
    this.sprite.destroy();
  }
}