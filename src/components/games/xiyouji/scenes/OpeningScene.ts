import * as Phaser from 'phaser';

export default class OpeningScene extends Phaser.Scene {
  private textContainer!: Phaser.GameObjects.Container;
  private articleText!: Phaser.GameObjects.Text;
  private pageIndicator!: Phaser.GameObjects.Text;
  private currentPage: number = 0;
  private storyPages: string[] = [];
  private autoFlipTimer!: Phaser.Time.TimerEvent;
  private isAutoFliping: boolean = true;

  constructor() {
    super({ key: 'OpeningScene' });
  }

  init() {
    this.storyPages = [
      // 第一页：天地初开，花果山（精简）
      '混沌未分天地乱，茫茫渺渺无人见。\n自从盘古破鸿蒙，开辟从兹清浊辨。\n\n在遥远的东方傲来国，临近大海处，\n有一座名山，唤为花果山。\n此山乃十洲之祖脉，三岛之来龙。\n\n山顶之上，有一块仙石，\n自开天辟地以来，受天真地秀，\n日精月华，感之既久，遂有灵通之意。',

      // 第二页：石猴出世，发现水帘洞（精简）
      '一日迸裂，产一石卵，\n似圆球样大，因见风，化作一个石猴。\n那猴在山中，行走跳跃，\n食草木，饮涧泉，采山花，觅树果。\n\n一日，群猴戏水，寻至源头，\n乃是一股瀑布飞泉。\n\n那石猴瞑目蹲身，纵身跳入瀑布，\n发现了一座天然石洞——水帘洞。',

      // 第三页：称王，求道（精简）
      '石猴跳出瀑布，引众猴入洞，\n自此，众猴拜他为美猴王。\n\n美猴王享乐天真，三五百年，\n忽一日，忧恼堕下泪来，\n恐将来年老血衰，暗中有阎王管着。\n\n于是，他独自乘筏，飘洋过海，\n寻访长生不老之术。',

      // 第四页：拜师学艺（精简）
      '历经艰辛，来到西牛贺洲，\n拜得菩提祖师为师。\n祖师见他是个猴子，\n为他取法名——孙悟空。\n\n祖师教他洒扫应对，进退周旋，\n七年之后，方传他长生妙道。\n又教他七十二般变化，\n能通幽驱神，担山禁水。',

      // 第五页：筋斗云与归来（精简）
      '祖师赠他一朵筋斗云，\n一个筋斗便是十万八千里。\n孙悟空艺成下山，\n神通广大，法力无边。\n\n回到花果山，见水帘洞一片荒凉，\n原来有一混世魔王占了洞府。\n\n悟空大怒，使个神通，\n将那魔王劈为两段，\n救出猴子猴孙，重整水帘洞。'
    ];
    this.currentPage = 0;
  }

  create() {
    const width = this.cameras.main.width;
    const sceneHeight = this.cameras.main.height;

    // ========== 水墨渐变背景 ==========
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2B1B0E, 0x2B1B0E, 0x3A2A1A, 0x3A2A1A);
    bg.fillRect(0, 0, width, sceneHeight);

    // 宣纸纹理效果
    const paperTexture = this.add.graphics();
    paperTexture.fillStyle(0xF5DEB3, 0.08);
    paperTexture.fillRect(0, 0, width, sceneHeight);

    // 水墨山峦背景
    this.addInkMountains();

    // 飞鸟
    this.addFlyingBirds();

    // 祥云
    this.addClouds(width);

    // 标题印章（固定位置，不移动）
    this.addTitleStamp(width);

    // 创建设备兼容的文本框
    this.createTextPage(width, sceneHeight);

    // 显示第一页
    this.showPage(this.currentPage);

    // 启动自动翻页（3秒一页）
    this.startAutoFlip();
  }

  private addInkMountains() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const mountains = this.add.graphics();

    mountains.fillStyle(0x4A6A5A, 0.35);
    mountains.beginPath();
    mountains.moveTo(0, height - 200);
    mountains.lineTo(80, height - 260);
    mountains.lineTo(180, height - 230);
    mountains.lineTo(280, height - 280);
    mountains.lineTo(380, height - 240);
    mountains.lineTo(480, height - 290);
    mountains.lineTo(600, height - 250);
    mountains.lineTo(720, height - 300);
    mountains.lineTo(840, height - 260);
    mountains.lineTo(width, height - 230);
    mountains.lineTo(width, height - 200);
    mountains.fillPath();

    mountains.fillStyle(0x5A7A6A, 0.25);
    mountains.beginPath();
    mountains.moveTo(0, height - 170);
    mountains.lineTo(120, height - 220);
    mountains.lineTo(240, height - 200);
    mountains.lineTo(360, height - 240);
    mountains.lineTo(500, height - 210);
    mountains.lineTo(640, height - 250);
    mountains.lineTo(780, height - 220);
    mountains.lineTo(width, height - 240);
    mountains.lineTo(width, height - 170);
    mountains.fillPath();

    this.addPineTree(100, height - 160);
    this.addPineTree(width - 120, height - 170);
  }

  private addPineTree(x: number, y: number) {
    const tree = this.add.graphics();

    tree.fillStyle(0x3A2A1A);
    tree.fillRect(x - 3, y - 30, 6, 35);

    tree.fillStyle(0x2A5A3A);
    tree.beginPath();
    tree.moveTo(x, y - 55);
    tree.lineTo(x - 15, y - 35);
    tree.lineTo(x + 15, y - 35);
    tree.fillPath();

    tree.beginPath();
    tree.moveTo(x, y - 45);
    tree.lineTo(x - 18, y - 25);
    tree.lineTo(x + 18, y - 25);
    tree.fillPath();

    tree.beginPath();
    tree.moveTo(x, y - 35);
    tree.lineTo(x - 20, y - 15);
    tree.lineTo(x + 20, y - 15);
    tree.fillPath();
  }

  private addFlyingBirds() {
    for (let i = 0; i < 8; i++) {
      const bird = this.add.graphics();
      bird.fillStyle(0x3A2A1A, 0.6);
      bird.beginPath();
      bird.moveTo(0, 0);
      bird.lineTo(-8, -6);
      bird.lineTo(-8, -2);
      bird.fillPath();
      bird.beginPath();
      bird.moveTo(0, 0);
      bird.lineTo(8, -6);
      bird.lineTo(8, -2);
      bird.fillPath();

      const startX = -50 - Math.random() * 200;
      const startY = 80 + Math.random() * 150;
      bird.setPosition(startX, startY);

      this.tweens.add({
        targets: bird,
        x: this.cameras.main.width + 100,
        y: startY + (Math.random() - 0.5) * 60,
        duration: 12000 + Math.random() * 8000,
        ease: 'Linear',
        repeat: -1,
        delay: Math.random() * 8000
      });
    }
  }

  private addClouds(width: number) {
    const cloudPositions = [
      { x: 60, y: 100, scale: 0.7, speed: 0.3 },
      { x: width - 100, y: 140, scale: 0.5, speed: 0.2 },
      { x: 180, y: 200, scale: 0.4, speed: 0.15 },
      { x: width - 200, y: 80, scale: 0.6, speed: 0.25 },
      { x: 350, y: 60, scale: 0.45, speed: 0.2 }
    ];

    cloudPositions.forEach(pos => {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xFFFFFF, 0.12);
      cloud.fillEllipse(pos.x, pos.y, 60 * pos.scale, 30 * pos.scale);
      cloud.fillEllipse(pos.x + 30 * pos.scale, pos.y - 10 * pos.scale, 40 * pos.scale, 25 * pos.scale);
      cloud.fillEllipse(pos.x - 30 * pos.scale, pos.y - 10 * pos.scale, 40 * pos.scale, 25 * pos.scale);

      this.tweens.add({
        targets: cloud,
        x: pos.x + 30,
        duration: 20000 / pos.speed,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private addTitleStamp(width: number) {
    const stampBg = this.add.graphics();
    stampBg.fillStyle(0x8B2222, 0.85);
    stampBg.fillRect(width / 2 - 80, 50, 160, 55);
    stampBg.lineStyle(2, 0xFFD700);
    stampBg.strokeRect(width / 2 - 78, 52, 156, 51);

    const stampTitle = this.add.text(width / 2, 67, '西 游 记', {
      fontSize: '28px',
      color: '#FFD700',
      fontStyle: 'bold',
      fontFamily: 'Georgia, "STKaiti", serif'
    });
    stampTitle.setOrigin(0.5);

    const stampSub = this.add.text(width / 2, 92, '开 篇', {
      fontSize: '16px',
      color: '#FFD700',
      fontFamily: 'Georgia, "STKaiti", serif'
    });
    stampSub.setOrigin(0.5);
  }

  private createTextPage(width: number, height: number) {
    // 古书卷轴 - 左右卷轴
    const leftScroll = this.add.graphics();
    leftScroll.fillStyle(0x8B6914);
    leftScroll.fillRect(width / 2 - 310, height / 2 - 160, 12, 320);
    leftScroll.fillStyle(0xCDA530);
    leftScroll.fillRect(width / 2 - 308, height / 2 - 158, 8, 316);

    const rightScroll = this.add.graphics();
    rightScroll.fillStyle(0x8B6914);
    rightScroll.fillRect(width / 2 + 298, height / 2 - 160, 12, 320);
    rightScroll.fillStyle(0xCDA530);
    rightScroll.fillRect(width / 2 + 300, height / 2 - 158, 8, 316);

    // 书页背景
    const pageBg = this.add.graphics();
    pageBg.fillStyle(0xF5DEB3, 0.88);
    pageBg.fillRoundedRect(width / 2 - 300, height / 2 - 155, 600, 310, 8);
    pageBg.lineStyle(2, 0xCDA530);
    pageBg.strokeRoundedRect(width / 2 - 298, height / 2 - 153, 596, 306, 6);
    pageBg.lineStyle(1, 0x8B6914, 0.5);
    pageBg.strokeRoundedRect(width / 2 - 285, height / 2 - 143, 570, 286, 4);

    // 文字容器
    this.textContainer = this.add.container(0, 0);

    // 调整文字大小和行距，确保不出框
    this.articleText = this.add.text(width / 2, height / 2 , '', {
      fontSize: '18px',
      color: '#3A2A1A',
      fontFamily: 'Georgia, "STKaiti", "Microsoft YaHei", serif',
      align: 'center',
      wordWrap: { width: 520 },
      lineSpacing: 5
    });
    this.articleText.setOrigin(0.5);
    this.textContainer.add(this.articleText);
  }

  private showPage(page: number) {
    if (page >= 0 && page < this.storyPages.length) {
      this.articleText.setText(this.storyPages[page]);

      this.articleText.setAlpha(0);
      this.tweens.add({
        targets: this.articleText,
        alpha: 1,
        duration: 300,
        ease: 'Power2'
      });

      this.currentPage = page;
    }
  }

  private nextPage() {
    if (this.currentPage < this.storyPages.length - 1) {
      this.tweens.add({
        targets: this.textContainer,
        x: -30,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          this.showPage(this.currentPage + 1);
          this.textContainer.setPosition(0, 0);
          this.textContainer.setAlpha(1);
        }
      });
    } else {
      this.stopAutoFlip();
      this.completeStory();
    }
  }

  private prevPage() {
    if (this.currentPage > 0) {
      this.stopAutoFlip();
      this.tweens.add({
        targets: this.textContainer,
        x: 30,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          this.showPage(this.currentPage - 1);
          this.textContainer.setPosition(0, 0);
          this.textContainer.setAlpha(1);
          this.startAutoFlip();
        }
      });
    }
  }

  private startAutoFlip() {
    if (this.autoFlipTimer) {
      this.autoFlipTimer.remove();
    }
    this.autoFlipTimer = this.time.addEvent({
      delay: 3000,
      callback: () => {
        if (this.isAutoFliping) {
          this.nextPage();
        }
      },
      repeat: this.storyPages.length - 1
    });
  }

  private stopAutoFlip() {
    if (this.autoFlipTimer) {
      this.autoFlipTimer.remove();
      this.autoFlipTimer.destroy();
    }
  }

  private completeStory() {
    this.tweens.add({
      targets: [this.textContainer],
      alpha: 0,
      scale: 0.9,
      duration: 500,
      onComplete: () => {
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('HuaguoshanScene');
        });
      }
    });
  }

  update() {
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors) {
      if (Phaser.Input.Keyboard.JustDown(cursors.left!)) {
        this.prevPage();
      }
      if (Phaser.Input.Keyboard.JustDown(cursors.right!)) {
        this.stopAutoFlip();
        this.nextPage();
        if (this.currentPage < this.storyPages.length - 1) {
          this.startAutoFlip();
        }
      }
    }
  }
}