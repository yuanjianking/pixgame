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

  private typewriterTimer: Phaser.Time.TimerEvent | null = null;
  private currentDialogIndex: number = 0;

  private createDialogBox(name: string, dialogues: string[]): void {
    let canAdvance = false;
    let isTyping = false;
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    this.currentDialogIndex = 0;

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
    this.dialogText = this.scene.add.text(width / 2, height - 85, '', {
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

    // 打字机效果：逐字显示
    const startTypewriter = (text: string) => {
      if (this.typewriterTimer) {
        this.typewriterTimer.remove();
        this.typewriterTimer = null;
      }
      isTyping = true;
      continueHint.setAlpha(0);
      let charIndex = 0;
      this.dialogText?.setText('');

      this.typewriterTimer = this.scene.time.addEvent({
        delay: 30,
        repeat: text.length - 1,
        callback: () => {
          if (this.dialogText) {
            this.dialogText.setText(text.substring(0, charIndex + 1));
          }
          charIndex++;
          if (charIndex >= text.length) {
            isTyping = false;
            continueHint.setAlpha(1);
            canAdvance = true;
            if (this.typewriterTimer) {
              this.typewriterTimer.remove();
              this.typewriterTimer = null;
            }
          }
        },
      });
    };

    // 开始显示第一句
    startTypewriter(dialogues[0]);

    // 创建新的监听器
    this.keyHandler = (event: KeyboardEvent) => {
      if (!canAdvance && !isTyping) return;
      if (event.code === 'Space' || event.code === 'Enter' || event.code === 'KeyJ') {
        if (isTyping) {
          // 正在打字：立即显示完整文本
          if (this.typewriterTimer) {
            this.typewriterTimer.remove();
            this.typewriterTimer = null;
          }
          if (this.dialogText) {
            this.dialogText.setText(dialogues[this.currentDialogIndex]);
          }
          isTyping = false;
          continueHint.setAlpha(1);
          canAdvance = true;
          return;
        }
        this.currentDialogIndex++;
        if (this.currentDialogIndex >= dialogues.length) {
          this.close();
        } else if (this.dialogText) {
          canAdvance = false;
          startTypewriter(dialogues[this.currentDialogIndex]);
        }
      }
    };

    this.scene.input.keyboard?.on('keydown', this.keyHandler);
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