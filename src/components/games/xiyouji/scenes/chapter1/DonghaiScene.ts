import * as Phaser from 'phaser';
import { DialogBox } from '../../ui/DialogBox';
import { WuKong } from '../../characters/player/WuKong';
import { TaskManager } from '../../task/TaskManager';

export class DonghaiScene extends Phaser.Scene {
    private dialogBox!: DialogBox;
    private wukong!: WuKong;
    private dragonKing!: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'DonghaiScene' });
    }

    create(): void {
        console.log('进入东海龙宫');

        // 设置深海背景色
        this.cameras.main.setBackgroundColor(0x0a2f6a);

        // 绘制龙宫场景
        this.drawDragonPalace();

        // 绘制龙王
        this.drawDragonKing();

        // 添加气泡效果
        this.addBubbles();

        // 添加海底光线
        this.addLightRays();


        const tasks = TaskManager.getInstance().getAllTasks()
        const task = tasks.find(t => t.id === 'get_weapon_from_dragon');

        if(task?.completed) {
            const playerGraphics = this.add.graphics();
            this.wukong = new WuKong(playerGraphics, this);
            const startGridX = 10;
            const startGridY = 7;
            const playerX = startGridX * 40;
            const playerY = startGridY * 40;
            this.wukong.setPosition(playerX, playerY);
            this.wukong.setCollisionRadius(15);
        } else {
            this.dialogBox = new DialogBox(this);
            this.dialogBox.show('东海龙王', [
                '何方妖孽，竟敢擅闯我东海龙宫！',
                '嗯？你就是花果山水帘洞的孙悟空？',
                '本王听说过你的名号，来我龙宫有何贵干？'
            ], () => {
                this.dialogBox.show('孙悟空', [
                    '嘿嘿，老龙王，俺老孙听说你这龙宫有不少宝贝兵器！',
                    '特来借一件耍耍，也好保俺花果山平安！'
                ], () => {
                    this.dialogBox.show('东海龙王', [
                        '哼！你这猴子，口气不小！',
                        '你想要兵器？我东海龙宫确实有些宝贝...',
                        '不过，得看你有没有本事拿走了！'
                    ], () => {
                        this.startBattleOrTask();
                    });
                });
            });
        }
    }

    private drawDragonPalace(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 海底地面
        const ground = this.add.rectangle(width / 2, height - 50, width, 150, 0x1a4a6a);
        ground.setAlpha(0.8);

        // 龙宫主殿
        const palace = this.add.container(width / 2, height / 2 + 50);

        // 宫殿地基
        const foundation = this.add.rectangle(0, 80, 400, 120, 0x3a6ea5);
        foundation.setStrokeStyle(3, 0xffd700);

        // 宫殿墙壁
        const walls = this.add.rectangle(0, 0, 360, 160, 0x2a5a8a);
        walls.setStrokeStyle(2, 0xffd700);

        // 大门
        const door = this.add.rectangle(0, 40, 60, 80, 0x1a3a5a);
        door.setStrokeStyle(2, 0xffd700);

        // 门环
        const doorKnocker = this.add.circle(15, 40, 5, 0xffd700);

        // 龙宫牌匾
        const sign = this.add.rectangle(0, -70, 180, 40, 0x8b4513);
        sign.setStrokeStyle(2, 0xffd700);

        const signText = this.add.text(0, -70, '东 海 龙 宫', {
            fontSize: '20px',
            color: '#ffd700',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        });
        signText.setOrigin(0.5);

        // 龙形装饰（左右两侧）
        const leftDragon = this.add.graphics();
        leftDragon.lineStyle(3, 0xffd700);
        leftDragon.beginPath();
        leftDragon.moveTo(-200, -30);
        leftDragon.lineTo(-180, -50);
        leftDragon.lineTo(-160, -30);
        leftDragon.lineTo(-140, -50);
        leftDragon.lineTo(-120, -30);
        leftDragon.strokePath();

        const rightDragon = this.add.graphics();
        rightDragon.lineStyle(3, 0xffd700);
        rightDragon.beginPath();
        rightDragon.moveTo(200, -30);
        rightDragon.lineTo(180, -50);
        rightDragon.lineTo(160, -30);
        rightDragon.lineTo(140, -50);
        rightDragon.lineTo(120, -30);
        rightDragon.strokePath();

        palace.add([foundation, walls, door, doorKnocker, sign, signText, leftDragon, rightDragon]);

        // 宫殿两侧的柱子
        const leftPillar = this.add.rectangle(width / 2 - 220, height / 2, 20, 200, 0xc0392b);
        leftPillar.setStrokeStyle(2, 0xffd700);

        const rightPillar = this.add.rectangle(width / 2 + 220, height / 2, 20, 200, 0xc0392b);
        rightPillar.setStrokeStyle(2, 0xffd700);

        // 珊瑚装饰
        for (let i = 0; i < 8; i++) {
            const x = width / 2 - 300 + i * 80;
            const coral = this.add.graphics();
            coral.fillStyle(0xff6b6b, 0.8);
            coral.fillRect(x, height - 80, 15, 40);
            coral.fillStyle(0xff9f43, 0.8);
            coral.fillRect(x + 8, height - 100, 12, 30);
            coral.fillRect(x - 5, height - 90, 12, 35);
        }

        // 珍珠装饰
        const pearls = this.add.graphics();
        pearls.fillStyle(0xffffff, 0.9);
        for (let i = 0; i < 12; i++) {
            const x = width / 2 - 350 + i * 60;
            pearls.fillCircle(x, height - 45, 5);
        }
    }

    private drawDragonKing(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.dragonKing = this.add.container(width / 2, height / 2 - 50);

        // 龙身（绿色）
        const body = this.add.graphics();
        body.fillStyle(0x2ecc71, 1);
        body.fillRect(-30, -20, 60, 80);

        // 龙头
        const head = this.add.graphics();
        head.fillStyle(0x27ae60, 1);
        head.fillRect(-40, -50, 80, 50);

        // 龙角
        const leftHorn = this.add.graphics();
        leftHorn.fillStyle(0xf1c40f, 1);
        leftHorn.fillTriangle(-30, -50, -40, -80, -20, -55);

        const rightHorn = this.add.graphics();
        rightHorn.fillStyle(0xf1c40f, 1);
        rightHorn.fillTriangle(30, -50, 40, -80, 20, -55);

        // 龙须
        const leftWhisker = this.add.graphics();
        leftWhisker.lineStyle(2, 0xffd700);
        leftWhisker.beginPath();
        leftWhisker.moveTo(-35, -30);
        leftWhisker.lineTo(-60, -20);
        leftWhisker.lineTo(-70, -30);
        leftWhisker.strokePath();

        const rightWhisker = this.add.graphics();
        rightWhisker.lineStyle(2, 0xffd700);
        rightWhisker.beginPath();
        rightWhisker.moveTo(35, -30);
        rightWhisker.lineTo(60, -20);
        rightWhisker.lineTo(70, -30);
        rightWhisker.strokePath();

        // 眼睛
        const leftEye = this.add.circle(-18, -40, 6, 0xffffff);
        const leftPupil = this.add.circle(-18, -40, 3, 0x000000);
        const rightEye = this.add.circle(18, -40, 6, 0xffffff);
        const rightPupil = this.add.circle(18, -40, 3, 0x000000);

        // 眉毛
        const leftEyebrow = this.add.graphics();
        leftEyebrow.lineStyle(3, 0xffd700);
        leftEyebrow.beginPath();
        leftEyebrow.moveTo(-28, -48);
        leftEyebrow.lineTo(-10, -45);
        leftEyebrow.strokePath();

        const rightEyebrow = this.add.graphics();
        rightEyebrow.lineStyle(3, 0xffd700);
        rightEyebrow.beginPath();
        rightEyebrow.moveTo(28, -48);
        rightEyebrow.lineTo(10, -45);
        rightEyebrow.strokePath();

        // 嘴巴
        const mouth = this.add.graphics();
        mouth.lineStyle(2, 0x000000);
        mouth.beginPath();
        mouth.arc(0, -25, 15, 0, Math.PI);
        mouth.strokePath();

        // 牙齿
        const tooth = this.add.graphics();
        tooth.fillStyle(0xffffff, 1);
        tooth.fillRect(-8, -20, 6, 10);
        tooth.fillRect(2, -20, 6, 10);

        // 龙袍
        const robe = this.add.graphics();
        robe.fillStyle(0xffd700, 0.7);
        robe.fillRect(-35, 20, 70, 40);

        // 龙纹
        const dragonPattern = this.add.text(0, 35, '龍', {
            fontSize: '24px',
            color: '#ff0000',
            fontFamily: 'monospace'
        });
        dragonPattern.setOrigin(0.5);

        this.dragonKing.add([
            body, head, leftHorn, rightHorn,
            leftWhisker, rightWhisker,
            leftEye, leftPupil, rightEye, rightPupil,
            leftEyebrow, rightEyebrow, mouth, tooth,
            robe, dragonPattern
        ]);

        // 让龙王浮动
        this.tweens.add({
            targets: this.dragonKing,
            y: height / 2 - 60,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private addBubbles(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 创建气泡粒子
        const particles = this.add.particles(0, 0, "", {
            x: { min: 50, max: width - 50 },
            y: { min: height - 100, max: height - 20 },
            lifespan: 4000,
            speedY: { min: -30, max: -80 },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.6, end: 0 },
            frequency: 500,
            quantity: 1
        });

        // 创建圆形纹理作为气泡
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 0.8);
        graphics.fillCircle(5, 5, 5);
        graphics.generateTexture('bubble', 10, 10);
        graphics.destroy();

        // 重新创建粒子使用气泡纹理
        particles.destroy();

        this.add.particles(0, 0, 'bubble', {
            x: { min: 20, max: width - 20 },
            y: height,
            lifespan: 3000,
            speedY: { min: -50, max: -100 },
            scale: { start: 0.5, end: 0.1 },
            alpha: { start: 0.7, end: 0 },
            frequency: 600,
            quantity: 2
        });
    }

    private addLightRays(): void {
        const height = this.cameras.main.height;

        // 添加从上方照射的光线
        for (let i = 0; i < 5; i++) {
            const x = 50 + i * 100;
            const lightRay = this.add.rectangle(x, 0, 30, height, 0xffffff, 0.05);
            lightRay.setOrigin(0.5, 0);

            // 光线缓慢移动
            this.tweens.add({
                targets: lightRay,
                x: x + 20,
                duration: 5000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    update() {

    }

    private startBattleOrTask(): void {
        console.log('准备与龙王战斗或获取任务');
        // 触发战斗或给任务
        this.scene.start('BattleScene', {
        playerUnits: [
            {
                id: 'wukong',
                name: '孙悟空',
                x: 11,
                y: 7,
                hp: 100,
                maxHp: 100,
                attack: 25,
                defense: 10,
                moveRange: 3,
                attackRange: 1,
                characterClass: 'WuKong'
            }
        ],
        enemyUnits: [
            {
                id: 'bailongma_1',
                name: '白龙马',
                x: 3,
                y: 5,
                hp: 60,
                maxHp: 60,
                attack: 18,
                defense: 8,
                moveRange: 4,
                attackRange: 1,
                characterClass: 'BaiLongMa'
            },
            {
                id: 'bailongma_2',
                name: '白龙马',
                x: 4,
                y: 6,
                hp: 60,
                maxHp: 60,
                attack: 18,
                defense: 8,
                moveRange: 4,
                attackRange: 1,
                characterClass: 'BaiLongMa'
            }
        ]});
    }
}