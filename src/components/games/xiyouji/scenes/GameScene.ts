// scenes/GameScene.ts
import * as Phaser from 'phaser';
import type { SaveData } from '../types';

export default class GameScene extends Phaser.Scene {
  private isNewGame: boolean = true;
  private gameMenu!: Phaser.GameObjects.Container;
  private isMenuOpen: boolean = false;
  private saveData?: SaveData;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { isNewGame: boolean; saveData?: SaveData }) {
    this.isNewGame = data.isNewGame;
    this.saveData = data.saveData;
    console.log('GameScene 初始化:', this.isNewGame ? '新游戏' : '继续游戏');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a472a);
    bg.fillRect(0, 0, width, height);

    // 提示文字
    const text = this.add.text(width / 2, height / 2 - 50, '游戏主场景\n开发中...', {
      fontSize: '32px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      align: 'center'
    });
    text.setOrigin(0.5);

    // 快捷键提示
    const hint = this.add.text(width / 2, height / 2 + 50, '按 ` 键 或 ESC 键打开游戏菜单', {
      fontSize: '18px',
      color: '#FFD700',
      fontFamily: 'Arial'
    });
    hint.setOrigin(0.5);

    // 创建游戏菜单
    this.createGameMenu();

    // 确保键盘输入被捕获
    this.input.keyboard?.addCapture('BACKQUOTE');
    this.input.keyboard?.addCapture('ESC');

    // 监听键盘事件
    if (this.input.keyboard) {
      // ` 键（反引号）
      this.input.keyboard.on('keydown-BACKQUOTE', (event: KeyboardEvent) => {
        event.preventDefault();
        console.log('按下了 ~ 键');
        this.toggleGameMenu();
      });

      // ESC 键
      this.input.keyboard.on('keydown-ESC', (event: KeyboardEvent) => {
        event.preventDefault();
        console.log('按下了 ESC 键');
        if (this.isMenuOpen) {
          this.closeGameMenu();
        }
      });
    }

    // 额外的全局键盘监听（备用方案）
    window.addEventListener('keydown', (event) => {
      if (event.key === '`' || event.key === '~') {
        event.preventDefault();
        console.log('全局监听: 按下了 ~ 键');
        this.toggleGameMenu();
      }
      if (event.key === 'Escape' && this.isMenuOpen) {
        event.preventDefault();
        console.log('全局监听: 按下了 ESC 键');
        this.closeGameMenu();
      }
    });

    // 返回菜单按钮（测试用）
    const backBtn = this.add.text(100, height - 50, '← 返回菜单', {
      fontSize: '20px',
      color: '#FFD700',
      fontFamily: 'Arial'
    });
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      console.log('返回菜单');
      this.scene.start('MenuScene');
    });

    backBtn.on('pointerover', () => {
      backBtn.setColor('#FFFFFF');
      backBtn.setScale(1.05);
    });

    backBtn.on('pointerout', () => {
      backBtn.setColor('#FFD700');
      backBtn.setScale(1);
    });

    // 调试信息
    console.log('GameScene 创建完成');
    console.log('键盘事件已监听，按 ~ 键测试');
  }

  private createGameMenu() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建菜单容器（全屏半透明遮罩）
    this.gameMenu = this.add.container(0, 0);
    this.gameMenu.setDepth(1000);
    this.gameMenu.setVisible(false);

    // 半透明遮罩背景
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setInteractive();
    overlay.on('pointerdown', () => {
      this.closeGameMenu();
    });

    // 菜单面板
    const menuWidth = 350;
    const menuHeight = 450;
    const menuX = width / 2;
    const menuY = height / 2;

    const menuBg = this.add.rectangle(menuX, menuY, menuWidth, menuHeight, 0x1a1a2e, 0.95);
    menuBg.setStrokeStyle(2, 0xFFD700, 0.8);

    // 标题
    const title = this.add.text(menuX, menuY - 180, '游戏菜单', {
      fontSize: '28px',
      color: '#FFD700',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    });
    title.setOrigin(0.5);

    // 关闭按钮
    const closeBtn = this.add.text(menuX + 150, menuY - 190, '✕', {
      fontSize: '28px',
      color: '#FF6666',
      fontFamily: 'Arial'
    });
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.closeGameMenu();
    });

    // 菜单项配置
    const menuItems = [
      { icon: '📊', label: '人物状态', yOffset: -110, action: () => this.showCharacterStatus() },
      { icon: '📦', label: '背包物品', yOffset: -60, action: () => this.showInventory() },
      { icon: '🔧', label: '角色设置', yOffset: -10, action: () => this.showCharacterSettings() },
      { icon: '💾', label: '保存游戏', yOffset: 40, action: () => this.saveGame() },
      { icon: '🏠', label: '返回菜单', yOffset: 90, action: () => this.backToMenu() },
      { icon: '❌', label: '退出游戏', yOffset: 140, action: () => this.exitGame() }
    ];

    const itemContainer = this.add.container(0, 0);

    menuItems.forEach((item) => {
      const itemBg = this.add.rectangle(menuX, menuY + item.yOffset, 280, 45, 0x2a2a3e, 0.8);
      itemBg.setStrokeStyle(1, 0x444466);
      itemBg.setInteractive({ useHandCursor: true });

      const iconText = this.add.text(menuX - 120, menuY + item.yOffset - 8, item.icon, {
        fontSize: '24px'
      });

      const labelText = this.add.text(menuX - 80, menuY + item.yOffset - 12, item.label, {
        fontSize: '20px',
        color: '#EEEEEE',
        fontFamily: 'Arial'
      });

      // 悬停效果
      itemBg.on('pointerover', () => {
        itemBg.setFillStyle(0xFFD700, 0.3);
        itemBg.setStrokeStyle(2, 0xFFD700);
        labelText.setColor('#FFD700');
      });

      itemBg.on('pointerout', () => {
        itemBg.setFillStyle(0x2a2a3e, 0.8);
        itemBg.setStrokeStyle(1, 0x444466);
        labelText.setColor('#EEEEEE');
      });

      // 点击事件
      itemBg.on('pointerdown', () => {
        item.action();
      });

      itemContainer.add([itemBg, iconText, labelText]);
    });

    // 版本信息
    const version = this.add.text(menuX, menuY + 200, 'Version 1.0.0', {
      fontSize: '12px',
      color: '#666666',
      fontFamily: 'Arial'
    });
    version.setOrigin(0.5);

    this.gameMenu.add([overlay, menuBg, title, closeBtn, itemContainer, version]);
  }

  private toggleGameMenu() {
    if (this.isMenuOpen) {
      this.closeGameMenu();
    } else {
      this.openGameMenu();
    }
  }

  private openGameMenu() {
    this.gameMenu.setVisible(true);
    this.isMenuOpen = true;
    console.log('菜单已打开');
  }

  private closeGameMenu() {
    this.gameMenu.setVisible(false);
    this.isMenuOpen = false;
    console.log('菜单已关闭');
  }

  // 人物状态
  private showCharacterStatus() {
    this.closeGameMenu();

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const panel = this.add.container(0, 0);
    panel.setDepth(1001);

    const bg = this.add.rectangle(width / 2, height / 2, 400, 320, 0x000000, 0.95);
    bg.setStrokeStyle(2, 0xFFD700);

    const title = this.add.text(width / 2, height / 2 - 130, '人物状态', {
      fontSize: '24px',
      color: '#FFD700',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    });
    title.setOrigin(0.5);

    const avatar = this.add.circle(width / 2 - 120, height / 2 - 40, 40, 0xD4893A);
    avatar.setStrokeStyle(2, 0xFFD700);
    const avatarText = this.add.text(width / 2 - 120, height / 2 - 45, '🐒', {
      fontSize: '36px'
    });
    avatarText.setOrigin(0.5);

    const stats = [
      '孙悟空',
      '等级: 15',
      '生命: 450/450',
      '法力: 200/200',
      '攻击: 125',
      '防御: 98',
      '经验: 3200/5000'
    ];

    const statTexts = stats.map((stat, index) => {
      const color = index === 0 ? '#FFD700' : '#FFFFFF';
      return this.add.text(width / 2 - 40, height / 2 - 100 + index * 32, stat, {
        fontSize: '16px',
        color: color,
        fontFamily: 'Arial'
      });
    });

    const closeBtn = this.add.text(width / 2 + 170, height / 2 - 150, '✕', {
      fontSize: '24px',
      color: '#FF6666',
      fontFamily: 'Arial'
    });
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      panel.destroy();
    });

    panel.add([bg, title, avatar, avatarText, closeBtn, ...statTexts]);

    this.input.once('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const bounds = bg.getBounds();
      if (!bounds.contains(pointer.worldX, pointer.worldY)) {
        panel.destroy();
      }
    });
  }

  // 背包物品
  private showInventory() {
    this.closeGameMenu();

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const panel = this.add.container(0, 0);
    panel.setDepth(1001);

    const bg = this.add.rectangle(width / 2, height / 2, 450, 350, 0x000000, 0.95);
    bg.setStrokeStyle(2, 0xFFD700);

    const title = this.add.text(width / 2, height / 2 - 150, '背包物品', {
      fontSize: '24px',
      color: '#FFD700',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    });
    title.setOrigin(0.5);

    const items = [
      { icon: '🍎', name: '仙桃', count: 3 },
      { icon: '⚔️', name: '金箍棒', count: 1 },
      { icon: '💊', name: '仙丹', count: 2 },
      { icon: '📿', name: '佛珠', count: 1 },
      { icon: '🍑', name: '蟠桃', count: 1 },
      { icon: '📜', name: '经书', count: 5 }
    ];

    const startX = width / 2 - 180;
    const startY = height / 2 - 80;

    items.forEach((item, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = startX + col * 120;
      const y = startY + row * 80;

      const slot = this.add.rectangle(x, y, 100, 60, 0x2a2a3e, 0.8);
      slot.setStrokeStyle(1, 0x444466);

      const iconText = this.add.text(x - 40, y - 5, item.icon, {
        fontSize: '28px'
      });

      const nameText = this.add.text(x - 30, y + 15, `${item.name} x${item.count}`, {
        fontSize: '12px',
        color: '#CCCCCC',
        fontFamily: 'Arial'
      });

      panel.add([slot, iconText, nameText]);
    });

    const closeBtn = this.add.text(width / 2 + 200, height / 2 - 170, '✕', {
      fontSize: '24px',
      color: '#FF6666',
      fontFamily: 'Arial'
    });
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      panel.destroy();
    });

    panel.add([bg, title, closeBtn]);

    this.input.once('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const bounds = bg.getBounds();
      if (!bounds.contains(pointer.worldX, pointer.worldY)) {
        panel.destroy();
      }
    });
  }

  private showCharacterSettings() {
    this.closeGameMenu();
    this.showToast('⚙️ 角色设置功能开发中...');
  }

  private saveGame() {
    this.closeGameMenu();

    const saveData: SaveData = {
      playerPosition: { x: this.cameras.main.worldView.x, y: this.cameras.main.worldView.y },
      level: 15,
      experience: 3200,
      inventory: ['仙桃', '金箍棒', '仙丹', '佛珠']
    };

    localStorage.setItem('xiyouji_save', JSON.stringify(saveData));
    this.showToast('💾 游戏已保存！');
  }

  private backToMenu() {
    this.closeGameMenu();
    this.showConfirmDialog('确定要返回菜单吗？未保存的进度可能会丢失。', () => {
      this.scene.start('MenuScene');
    });
  }

  private exitGame() {
    this.closeGameMenu();
    this.showConfirmDialog('确定要退出游戏吗？', () => {
      this.scene.start('MenuScene');
    });
  }

  private showToast(message: string) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const toast = this.add.text(width / 2, height - 80, message, {
      fontSize: '18px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    });
    toast.setOrigin(0.5);
    toast.setDepth(1002);

    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: height - 60,
      duration: 2000,
      onComplete: () => {
        toast.destroy();
      }
    });
  }

  private showConfirmDialog(message: string, onConfirm: () => void) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const dialog = this.add.container(0, 0);
    dialog.setDepth(1001);

    const bg = this.add.rectangle(width / 2, height / 2, 400, 150, 0x000000, 0.95);
    bg.setStrokeStyle(2, 0xFFD700);

    const msgText = this.add.text(width / 2, height / 2 - 25, message, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 350 }
    });
    msgText.setOrigin(0.5);

    const confirmBtn = this.add.rectangle(width / 2 - 90, height / 2 + 35, 100, 40, 0x4CAF50);
    confirmBtn.setInteractive({ useHandCursor: true });
    const confirmText = this.add.text(width / 2 - 90, height / 2 + 35, '确定', {
      fontSize: '16px',
      color: '#FFFFFF'
    });
    confirmText.setOrigin(0.5);

    confirmBtn.on('pointerdown', () => {
      dialog.destroy();
      onConfirm();
    });

    const cancelBtn = this.add.rectangle(width / 2 + 90, height / 2 + 35, 100, 40, 0x666666);
    cancelBtn.setInteractive({ useHandCursor: true });
    const cancelText = this.add.text(width / 2 + 90, height / 2 + 35, '取消', {
      fontSize: '16px',
      color: '#FFFFFF'
    });
    cancelText.setOrigin(0.5);

    cancelBtn.on('pointerdown', () => {
      dialog.destroy();
    });

    dialog.add([bg, msgText, confirmBtn, confirmText, cancelBtn, cancelText]);
  }
}