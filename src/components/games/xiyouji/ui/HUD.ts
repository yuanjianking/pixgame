import * as Phaser from 'phaser';
import { TaskManager } from '../task/TaskManager';

export class HUD {
  private container: Phaser.GameObjects.Container;
  private levelText: Phaser.GameObjects.Text;
  private taskText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, getLevel: () => number) {
    this.container = scene.add.container(0, 0).setDepth(300).setScrollFactor(0);

    this.levelText = scene.add.text(scene.cameras.main.width - 8, 8, '', {
      fontSize: '13px',
      color: '#FFD700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      backgroundColor: '#00000088',
      padding: { x: 6, y: 3 },
    }).setOrigin(1, 0);
    this.container.add(this.levelText);

    this.taskText = scene.add.text(scene.cameras.main.width - 8, 32, '', {
      fontSize: '11px',
      color: '#88CCFF',
      fontFamily: 'monospace',
      backgroundColor: '#00000077',
      padding: { x: 5, y: 2 },
    }).setOrigin(1, 0);
    this.container.add(this.taskText);

    // 每秒刷新一次
    scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const level = getLevel();
        this.levelText.setText(`Lv.${level}`);

        const tasks = TaskManager.getInstance().getAllTasks().filter(t => !t.completed);
        if (tasks.length > 0) {
          this.taskText.setText(`任务: ${tasks[0].name}`);
          this.taskText.setVisible(true);
        } else {
          this.taskText.setVisible(false);
        }
      },
    });
  }

  destroy(): void {
    this.container.destroy();
  }
}
