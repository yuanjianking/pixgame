// InputJController.ts
import * as Phaser from 'phaser';

export class InputJController {
    private scene: Phaser.Scene;
    private lastJPressTime: number = 0;
    private jPressCooldown: number = 300;

    // 回调函数
    public onInteract: (() => void) | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupKeyboard();
    }

    private setupKeyboard(): void {
        // 监听 J 键
        const jKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.J);

        if (jKey) {
            jKey.on('down', () => {
                this.handleJPress();
            });
        }
    }

    private handleJPress(): void {
        // 防抖处理
        const now = Date.now();
        if (now - this.lastJPressTime < this.jPressCooldown) {
            console.log('[InputJController] 防抖，忽略');
            return;
        }
        this.lastJPressTime = now;

        // 触发回调
        if (this.onInteract) {
            this.onInteract();
        }
    }

    // 销毁时清理
    destroy(): void {
        // 清理键盘监听
        const jKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        if (jKey) {
            jKey.removeAllListeners();
        }
    }
}