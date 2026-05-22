// DonghaiVictoryScene.ts
import * as Phaser from 'phaser';
import { DialogBox } from '../../ui/DialogBox';
import { SaveManager } from '../../save/SaveManager';
import { getSavedPlayerOrDefaults } from '../../save/playerSave';
import type { GameSaveData } from '../../types';

export default class DonghaiVictoryScene extends Phaser.Scene {
    private dialogBox!: DialogBox;
    private saveData?: GameSaveData;

    constructor() {
        super({ key: 'DonghaiVictoryScene' });
    }

    init(data?: { saveData?: GameSaveData }): void {
        this.saveData = data?.saveData ?? SaveManager.getInstance().loadGame(1) ?? undefined;
    }

    create(): void {
        this.dialogBox = new DialogBox(this);

        // 黑色背景
        this.cameras.main.setBackgroundColor(0x000000);

        // 金色光线效果（武器登场）
        this.showWeaponRewardSequence();
    }

    private showWeaponRewardSequence(): void {
        // 延迟一小段时间开始
        this.time.delayedCall(300, () => {
            // 1. 龙王认输对话
            this.dialogBox.show('东海龙王', [
                '大圣果然神通广大！我东海龙宫心服口服！',
                '这枚定海神珍铁——如意金箍棒，就赠予大圣了！',
                '此棒重一万三千五百斤，可随心意变化大小，望大圣善用！',
            ], () => {
                // 2. 金箍棒登场特效
                this.showGoldenLightEffect();
            });
        });
    }

    private showGoldenLightEffect(): void {
        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2;

        // 金色光柱
        const glow = this.add.graphics();
        glow.fillStyle(0xFFD700, 0.6);
        glow.fillRect(cx - 60, 0, 120, this.cameras.main.height);

        // 中心金箍棒文字
        const weaponText = this.add.text(cx, cy - 30, '— 如意金箍棒 —', {
            fontSize: '28px',
            color: '#FFD700',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#8B4513',
            strokeThickness: 4,
        }).setOrigin(0.5).setAlpha(0);

        // 描述文字
        const descText = this.add.text(cx, cy + 20, '重一万三千五百斤', {
            fontSize: '16px',
            color: '#FFAA00',
            fontFamily: 'monospace',
        }).setOrigin(0.5).setAlpha(0);

        // 获得提示
        const gotText = this.add.text(cx, cy + 50, '获得神兵！', {
            fontSize: '20px',
            color: '#FF6600',
            fontFamily: 'monospace',
            fontStyle: 'bold',
        }).setOrigin(0.5).setAlpha(0);

        // 任务完成提示
        const questText = this.add.text(cx, cy + 90, '任务完成：东海取兵器', {
            fontSize: '14px',
            color: '#00FF00',
            fontFamily: 'monospace',
        }).setOrigin(0.5).setAlpha(0);

        // 经验奖励
        const stats = this.saveData?.player ?? getSavedPlayerOrDefaults();
        const expText = this.add.text(cx, cy + 120, `获得经验 +100  当前等级 Lv.${stats.level}`, {
            fontSize: '12px',
            color: '#88CCFF',
            fontFamily: 'monospace',
        }).setOrigin(0.5).setAlpha(0);

        // 动画序列
        this.tweens.add({
            targets: [glow],
            alpha: { from: 0, to: 0.6 },
            duration: 500,
        });

        this.time.delayedCall(400, () => {
            this.tweens.add({
                targets: weaponText,
                alpha: 1,
                y: cy - 40,
                duration: 600,
                ease: 'Back.easeOut',
            });
        });

        this.time.delayedCall(900, () => {
            this.tweens.add({
                targets: descText,
                alpha: 1,
                duration: 500,
            });
        });

        this.time.delayedCall(1400, () => {
            this.tweens.add({
                targets: gotText,
                alpha: 1,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 400,
                ease: 'Back.easeOut',
                onComplete: () => {
                    this.tweens.add({
                        targets: gotText,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 200,
                    });
                },
            });
        });

        this.time.delayedCall(1900, () => {
            this.tweens.add({
                targets: questText,
                alpha: 1,
                duration: 400,
            });
        });

        this.time.delayedCall(2300, () => {
            this.tweens.add({
                targets: expText,
                alpha: 1,
                duration: 400,
            });
        });

        // 3. 淡出过渡回东海
        this.time.delayedCall(3500, () => {
            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('DonghaiScene', { victory: true });
            });
        });
    }
}
