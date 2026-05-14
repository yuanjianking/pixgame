// ui/DialogBox.ts
import * as Phaser from 'phaser';

export class DialogBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private dialogText: Phaser.GameObjects.Text | null = null;
  private isActive: boolean = false;
  private onCompleteCallback: (() => void) | null = null;
  private keyHandler: ((event: KeyboardEvent) => void) | null = null;  // 保存监听器引用

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // 显示对话框
  public show(name: string, dialogues: string[], onComplete?: () => void): void {
    if (this.isActive) return;

    this.isActive = true;
    this.onCompleteCallback = onComplete || null;
    this.createDialogBox(name, dialogues);
  }

  private createDialogBox(name: string, dialogues: string[]): void {
    let canAdvance = false;  // 初始不允许跳过
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    let currentIndex = 0;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(200);
    this.container.setScrollFactor(0);

    // 背景
    const boxBg = this.scene.add.rectangle(width / 2, height - 90, 600, 100, 0x000000, 0.9);
    boxBg.setStrokeStyle(2, 0xFFD700);

    // 顶部装饰线
    const topLine = this.scene.add.graphics();
    topLine.lineStyle(1, 0xFFD700);
    topLine.beginPath();
    topLine.moveTo(width / 2 - 290, height - 130);
    topLine.lineTo(width / 2 + 290, height - 130);
    topLine.strokePath();

    // 名字标签
    const nameLabel = this.scene.add.text(width / 2 - 270, height - 120, name, {
      fontSize: '14px',
      color: '#FFD700',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });

    // 对话内容
    this.dialogText = this.scene.add.text(width / 2, height - 85, dialogues[0], {
      fontSize: '16px',
      color: '#F5DEB3',
      fontFamily: 'monospace',
      wordWrap: { width: 520 }
    });
    this.dialogText.setOrigin(0.5);

    // 继续提示（闪烁光标）
    const continueHint = this.scene.add.text(width - 80, height - 55, '▼', {
      fontSize: '16px',
      color: '#FFD700',
      fontFamily: 'monospace'
    });

    this.scene.tweens.add({
      targets: continueHint,
      alpha: { from: 1, to: 0 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.container.add([boxBg, topLine, nameLabel, this.dialogText, continueHint]);

    // 移除之前的监听器（如果有）
    if (this.keyHandler) {
      this.scene.input.keyboard?.off('keydown', this.keyHandler);
    }

    // 创建新的监听器
    this.keyHandler = (event: KeyboardEvent) => {
      if (!canAdvance) return;  // 还没到允许跳过的时间
      if (event.code === 'Space' || event.code === 'Enter' || event.code === 'KeyJ') {
        currentIndex++;
        if (currentIndex >= dialogues.length) {
          this.close();
        } else if (this.dialogText) {
          this.dialogText.setText(dialogues[currentIndex]);
        }
      }
    };

    this.scene.input.keyboard?.on('keydown', this.keyHandler);

    this.scene.time.delayedCall(150, () => {
        canAdvance = true;
    });
  }

  // 关闭对话框
  public close(): void {
    console.log(`[DialogBox.close] 调用, 当前 isActive = ${this.isActive}`);

    if (this.keyHandler) {
      this.scene.input.keyboard?.off('keydown', this.keyHandler);
      this.keyHandler = null;
    }

    if (this.container) {
      this.container.destroy();
      this.container = null;
      this.dialogText = null;
    }

    // 延迟重置，避免同一帧内的重复触发
    this.scene.time.delayedCall(100, () => {
      this.isActive = false;
      console.log(`[DialogBox.close] 延迟设置 isActive = false`);

      if (this.onCompleteCallback) {
        const callback = this.onCompleteCallback;
        this.onCompleteCallback = null;
        callback();
      }
    });
  }

  // 是否激活
  public isDialogActive(): boolean {
    return this.isActive;
  }
}