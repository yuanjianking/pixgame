// scenes/MenuScene.ts
import * as Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  private hasSaveData: boolean = false;
  private selectedIndex: number = 0;
  private menuItems: { text: string; action: () => void }[] = [];
  private menuTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'MenuScene' });
  }

  init(data: { hasSaveData: boolean }) {
    this.hasSaveData = data.hasSaveData;
    // 重置状态
    this.selectedIndex = 0;
    this.menuTexts = [];
    this.menuItems = [];
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 渐变背景
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e);
    bg.fillRect(0, 0, width, height);

    // 装饰性星星
    this.addStars();

    // 游戏标题
    const title = this.add.text(width / 2, height / 4, '西 游 记', {
      fontSize: '76px',
      color: '#FFD700',
      fontStyle: 'bold',
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      stroke: '#FF8C00',
      strokeThickness: 4,
      shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 6, fill: true }
    });
    title.setOrigin(0.5);

    // 副标题
    const subtitle = this.add.text(width / 2, height / 4 + 70, '取经之路', {
      fontSize: '24px',
      color: '#AAAAAA',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    });
    subtitle.setOrigin(0.5);

    // 菜单项
    const startY = height / 2 + 50;

    // 开始新游戏
    this.menuItems.push({
      text: '🌟 开始新游戏',
      action: () => this.startNewGame()
    });

    // 继续游戏（只有在有存档时才显示）
    if (this.hasSaveData) {
      this.menuItems.push({
        text: '📀 继续游戏',
        action: () => this.continueGame()
      });
    }


    // 创建菜单文字
    this.menuItems.forEach((item, index) => {
      const y = startY + index * 50;
      const text = this.add.text(width / 2, y, item.text, {
        fontSize: '28px',
        color: index === 0 ? '#FFD700' : '#CCCCCC',
        fontFamily: 'Arial'
      });
      text.setOrigin(0.5);
      text.setInteractive({ useHandCursor: true });

      // 悬停效果
      text.on('pointerover', () => {
        this.setSelectedIndex(index);
      });

      text.on('pointerout', () => {
        // 不需要额外处理
      });

      text.on('pointerdown', () => {
        item.action();
      });

      this.menuTexts.push(text);
    });

    // 选中第一个
    this.updateSelectedStyle();

    // 键盘控制
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-UP', () => {
        const newIndex = Math.max(0, this.selectedIndex - 1);
        this.setSelectedIndex(newIndex);
      });

      this.input.keyboard.on('keydown-DOWN', () => {
        const newIndex = Math.min(this.menuItems.length - 1, this.selectedIndex + 1);
        this.setSelectedIndex(newIndex);
      });

      this.input.keyboard.on('keydown-ENTER', () => {
        if (this.menuItems[this.selectedIndex]) {
          this.menuItems[this.selectedIndex].action();
        }
      });
    }

    // 底部版权信息
    const footer = this.add.text(width / 2, height - 40, '© 西游记游戏 | 方向键 ↑ ↓ 选择 | Enter 确认', {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'Arial'
    });
    footer.setOrigin(0.5);
  }

  private addStars() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const star = this.add.circle(x, y, 1.5, 0xFFFFFF, 0.6);

      // 星星闪烁动画
      this.tweens.add({
        targets: star,
        alpha: { from: 0.3, to: 0.8 },
        duration: 800 + Math.random() * 1500,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000
      });
    }
  }

  private updateSelectedStyle() {
    // 安全地更新所有菜单项的样式
    this.menuTexts.forEach((text, i) => {
      if (text && text.active) {  // 检查 text 是否存在且活跃
        if (i === this.selectedIndex) {
          text.setColor('#FFD700');
          text.setScale(1.05);
        } else {
          text.setColor('#CCCCCC');
          text.setScale(1);
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
    // 清除旧存档
    localStorage.removeItem('xiyouji_save');
    // 启动游戏场景
    this.scene.start('GameScene', { isNewGame: true });
  }

  private continueGame() {
    console.log('继续游戏');
    const saveData = localStorage.getItem('xiyouji_save');
    this.scene.start('GameScene', {
      isNewGame: false,
      saveData: saveData ? JSON.parse(saveData) : null
    });
  }


}