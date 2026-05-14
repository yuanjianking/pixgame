import * as Phaser from 'phaser';
import { SaveManager } from '../../save/SaveManager';

interface MenuText extends Phaser.GameObjects.Text {
  arrowRef?: Phaser.GameObjects.Text;
}

export default class MenuScene extends Phaser.Scene {
  private hasSaveData: boolean = false;
  private selectedIndex: number = 0;
  private menuItems: { text: string; action: () => void }[] = [];
  private menuTexts: MenuText[] = [];

  constructor() {
    super({ key: 'MenuScene' });
  }

  init(data: { hasSaveData: boolean }) {
    this.hasSaveData = data.hasSaveData;
    this.selectedIndex = 0;
    this.menuTexts = [];
    this.menuItems = [];
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // ========== 天空渐变背景 ==========
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4A90D9, 0x2C5F8A);
    bg.fillRect(0, 0, width, height);

    // 远处山峦
    this.addMountains();

    // 大地（底部草地）
    const ground = this.add.graphics();
    ground.fillStyle(0x4A7A2A);
    ground.fillRect(0, height - 120, width, 120);
    ground.fillStyle(0x3A6A1A);
    ground.fillRect(0, height - 120, width, 10);
    ground.fillStyle(0x5A8C3A);
    ground.fillRect(0, height - 110, width, 8);

    // 草地细节（小草）
    this.addGrassDetails();

    // 云朵
    this.addCloud(80, 70, 80, 45);
    this.addCloud(250, 100, 100, 50);
    this.addCloud(500, 60, 90, 48);
    this.addCloud(720, 90, 70, 42);
    this.addCloud(900, 70, 85, 46);
    this.addCloud(1100, 110, 75, 44);

    // 茂盛树木
    this.addLushTree(120, height - 145);
    this.addLushTree(320, height - 160);
    this.addLushTree(680, height - 150);
    this.addLushTree(880, height - 165);
    this.addLushTree(1080, height - 145);
    this.addLushTree(1250, height - 155);

    // ========== 标题面板 ==========
    const titlePanel = this.add.graphics();
    titlePanel.fillStyle(0x6B3A1A);
    titlePanel.fillRoundedRect(width / 2 - 230, height / 6 - 35, 460, 110, 15);
    titlePanel.fillStyle(0x8B5A2B);
    titlePanel.fillRoundedRect(width / 2 - 225, height / 6 - 32, 450, 104, 12);
    titlePanel.fillStyle(0xDEB887);
    titlePanel.fillRoundedRect(width / 2 - 220, height / 6 - 29, 440, 98, 10);
    titlePanel.fillStyle(0xF5DEB3);
    titlePanel.fillRoundedRect(width / 2 - 215, height / 6 - 26, 430, 92, 8);

    const title = this.add.text(width / 2, height / 6, '西 游 记', {
      fontSize: '44px',
      color: '#FF4500',
      fontStyle: 'bold',
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      stroke: '#FFD700',
      strokeThickness: 2
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(width / 2, height / 6 + 48, '—— 取经之路 ——', {
      fontSize: '18px',
      color: '#8B4513',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    });
    subtitle.setOrigin(0.5);

    // ========== 菜单窗口 ==========
    const winX = width / 2 - 180;
    const winY = height / 2 - 50;
    const winW = 360;
    const winH = 200;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(winX + 5, winY + 5, winW, winH, 10);

    const windowBg = this.add.graphics();
    windowBg.fillStyle(0x000000, 0.8);
    windowBg.fillRoundedRect(winX, winY, winW, winH, 10);
    windowBg.lineStyle(2, 0xFFD700);
    windowBg.strokeRoundedRect(winX, winY, winW, winH, 10);
    windowBg.fillStyle(0xFFD700);
    windowBg.fillRoundedRect(winX + 2, winY + 2, winW - 4, 6, 3);

    // 菜单项
    const startY = winY + 55;

    this.menuItems.push({
      text: '开始旅程',
      action: () => this.startNewGame()
    });

    if (this.hasSaveData) {
      this.menuItems.push({
        text: '继续征程',
        action: () => this.continueGame()
      });
    }

    // 创建菜单文字
    this.menuItems.forEach((item, index) => {
      const y = startY + index * 50;

      const arrow = this.add.text(winX + 30, y, '▶', {
        fontSize: '22px',
        color: '#FFD700',
        fontFamily: 'Arial'
      });
      arrow.setOrigin(0.5);
      arrow.setVisible(index === 0);

      const text = this.add.text(winX + 60, y, item.text, {
        fontSize: '24px',
        color: index === 0 ? '#FFD700' : '#CCCCCC',
        fontFamily: 'Arial'
      }) as MenuText;
      text.setOrigin(0, 0.5);
      text.setInteractive({ useHandCursor: true });
      text.arrowRef = arrow;

      text.on('pointerover', () => {
        this.setSelectedIndex(index);
      });

      text.on('pointerdown', () => {
        item.action();
      });

      this.menuTexts.push(text);
    });

    this.updateSelectedStyle();

    // ========== 键盘控制（WASD + J） ==========
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-W', () => {
        const newIndex = Math.max(0, this.selectedIndex - 1);
        this.setSelectedIndex(newIndex);
      });
      this.input.keyboard.on('keydown-S', () => {
        const newIndex = Math.min(this.menuItems.length - 1, this.selectedIndex + 1);
        this.setSelectedIndex(newIndex);
      });
      this.input.keyboard.on('keydown-UP', () => {
        const newIndex = Math.max(0, this.selectedIndex - 1);
        this.setSelectedIndex(newIndex);
      });
      this.input.keyboard.on('keydown-DOWN', () => {
        const newIndex = Math.min(this.menuItems.length - 1, this.selectedIndex + 1);
        this.setSelectedIndex(newIndex);
      });

      this.input.keyboard.on('keydown-J', () => {
        if (this.menuItems[this.selectedIndex]) {
          this.menuItems[this.selectedIndex].action();
        }
      });
      this.input.keyboard.on('keydown-ENTER', () => {
        if (this.menuItems[this.selectedIndex]) {
          this.menuItems[this.selectedIndex].action();
        }
      });
    }

    // 底部信息栏
    const infoBar = this.add.graphics();
    infoBar.fillStyle(0x000000, 0.6);
    infoBar.fillRect(0, height - 35, width, 35);

    const footer = this.add.text(width / 2, height - 17.5, 'W/S/↑/↓ 选择  |  J/⏎ 确定', {
      fontSize: '12px',
      color: '#FFD700',
      fontFamily: 'Arial'
    });
    footer.setOrigin(0.5);

    // 闪烁光标
    if (this.menuTexts[0] && this.menuTexts[0].arrowRef) {
      this.tweens.add({
        targets: this.menuTexts[0].arrowRef,
        alpha: { from: 1, to: 0 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private addMountains() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const mountains = this.add.graphics();

    mountains.fillStyle(0x5A7A5A, 0.5);
    mountains.beginPath();
    mountains.moveTo(0, height - 180);
    mountains.lineTo(100, height - 230);
    mountains.lineTo(220, height - 200);
    mountains.lineTo(300, height - 250);
    mountains.lineTo(400, height - 210);
    mountains.lineTo(500, height - 260);
    mountains.lineTo(600, height - 220);
    mountains.lineTo(700, height - 270);
    mountains.lineTo(800, height - 230);
    mountains.lineTo(width, height - 200);
    mountains.lineTo(width, height - 180);
    mountains.fillPath();

    mountains.fillStyle(0x4A6A4A, 0.6);
    mountains.beginPath();
    mountains.moveTo(0, height - 160);
    mountains.lineTo(150, height - 200);
    mountains.lineTo(280, height - 180);
    mountains.lineTo(420, height - 220);
    mountains.lineTo(550, height - 190);
    mountains.lineTo(680, height - 230);
    mountains.lineTo(850, height - 200);
    mountains.lineTo(width, height - 210);
    mountains.lineTo(width, height - 160);
    mountains.fillPath();
  }

  private addGrassDetails() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const grass = this.add.graphics();

    for (let i = 0; i < 120; i++) {
      const x = Math.random() * width;
      const y = height - 120 + Math.random() * 30;
      grass.fillStyle(0x5A8C3A);
      grass.beginPath();
      grass.moveTo(x, y);
      grass.lineTo(x - 3, y - 10);
      grass.lineTo(x + 3, y - 10);
      grass.fillPath();

      grass.fillStyle(0x4A7A2A);
      grass.beginPath();
      grass.moveTo(x + 2, y);
      grass.lineTo(x - 1, y - 7);
      grass.lineTo(x + 5, y - 7);
      grass.fillPath();
    }
  }

  private addCloud(x: number, y: number, w: number, h: number) {
    const cloud = this.add.graphics();
    cloud.fillStyle(0xFFFFFF, 0.9);
    cloud.fillEllipse(x, y, w, h);
    cloud.fillEllipse(x - w * 0.35, y + h * 0.15, w * 0.55, h * 0.7);
    cloud.fillEllipse(x + w * 0.35, y + h * 0.15, w * 0.55, h * 0.7);
    cloud.fillEllipse(x - w * 0.15, y - h * 0.2, w * 0.45, h * 0.55);
    cloud.fillEllipse(x + w * 0.15, y - h * 0.2, w * 0.45, h * 0.55);
    cloud.fillStyle(0xFFFFFF, 0.6);
    cloud.fillEllipse(x - w * 0.5, y + h * 0.05, w * 0.4, h * 0.5);
    cloud.fillEllipse(x + w * 0.5, y + h * 0.05, w * 0.4, h * 0.5);
  }

  private addLushTree(x: number, y: number) {
    const tree = this.add.graphics();

    // 树干
    tree.fillStyle(0x6B3A1A);
    tree.fillRect(x + 6, y - 25, 14, 50);
    tree.fillStyle(0x8B5A2B);
    tree.fillRect(x + 7, y - 23, 12, 46);

    // 树干纹理
    tree.lineStyle(1, 0x5A2A0A, 0.5);
    for (let i = 0; i < 5; i++) {
      tree.beginPath();
      tree.moveTo(x + 9, y - 20 + i * 12);
      tree.lineTo(x + 17, y - 17 + i * 12);
      tree.strokePath();
    }

    // 茂盛树冠（多层叠加）
    tree.fillStyle(0x2A6A2A);
    tree.fillEllipse(x + 13, y - 30, 34, 28);
    tree.fillEllipse(x - 4, y - 26, 26, 24);
    tree.fillEllipse(x + 30, y - 26, 26, 24);

    tree.fillStyle(0x3A7A3A);
    tree.fillEllipse(x - 8, y - 22, 22, 20);
    tree.fillEllipse(x + 34, y - 22, 22, 20);
    tree.fillEllipse(x + 13, y - 35, 28, 24);

    tree.fillStyle(0x3A8C3A);
    tree.fillEllipse(x + 13, y - 40, 28, 24);
    tree.fillEllipse(x - 2, y - 36, 22, 20);
    tree.fillEllipse(x + 28, y - 36, 22, 20);

    tree.fillStyle(0x4A9C4A);
    tree.fillEllipse(x - 6, y - 32, 18, 18);
    tree.fillEllipse(x + 32, y - 32, 18, 18);
    tree.fillEllipse(x + 13, y - 45, 22, 20);

    tree.fillStyle(0x4AA84A);
    tree.fillEllipse(x + 13, y - 50, 22, 20);
    tree.fillEllipse(x + 1, y - 46, 16, 16);
    tree.fillEllipse(x + 25, y - 46, 16, 16);

    tree.fillStyle(0x5AB85A);
    tree.fillEllipse(x + 13, y - 56, 16, 16);
    tree.fillEllipse(x + 6, y - 52, 12, 12);
    tree.fillEllipse(x + 20, y - 52, 12, 12);

    tree.fillStyle(0x6AC86A, 0.5);
    tree.fillEllipse(x + 8, y - 58, 6, 8);
    tree.fillEllipse(x + 19, y - 56, 5, 7);
    tree.fillEllipse(x + 13, y - 62, 4, 6);

    tree.fillStyle(0x7AD87A, 0.6);
    for (let i = 0; i < 15; i++) {
      const offsetX = -10 + Math.random() * 46;
      const offsetY = -35 + Math.random() * 35;
      tree.fillCircle(x + 13 + offsetX, y - 30 + offsetY, 1.5);
    }
  }

  private updateSelectedStyle() {
    this.menuTexts.forEach((text, i) => {
      if (text && text.active) {
        const arrow = text.arrowRef;
        if (i === this.selectedIndex) {
          text.setColor('#FFD700');
          text.setScale(1.05);
          if (arrow) arrow.setVisible(true);
        } else {
          text.setColor('#CCCCCC');
          text.setScale(1);
          if (arrow) arrow.setVisible(false);
        }
      }
    });
  }

  private setSelectedIndex(index: number) {
    if (index === this.selectedIndex) return;
    if (index < 0 || index >= this.menuItems.length) return;
    this.selectedIndex = index;
    this.updateSelectedStyle();
  }

  private startNewGame() {
    console.log('开始新游戏');
    localStorage.removeItem('xiyouji_save');
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('OpeningScene', { isNewGame: true });
    });
  }

  private continueGame() {
    console.log('继续游戏');
    const saveData = SaveManager.getInstance().loadGame(1); // 默认加载第一个存档位
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(saveData?.player.currentScene, {
        isNewGame: false,
        saveData: saveData
      });
    });
  }
}