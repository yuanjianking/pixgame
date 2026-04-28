// gameConfig.ts
import * as Phaser from 'phaser';
import TestScene from '../scenes/TestScene';
import BootScene from '../scenes/BootScene';
import MenuScene from '../scenes/MenuScene';
import OpeningScene from '../scenes/OpeningScene';
import HuaguoshanScene from '../scenes/HuaguoshanScene';
import WaterCurtainCaveScene from '../scenes/WaterCurtainCaveScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [HuaguoshanScene, BootScene, MenuScene, OpeningScene, WaterCurtainCaveScene,TestScene,],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  }
};