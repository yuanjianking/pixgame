// controllers/MovementController.ts
import * as Phaser from 'phaser';

export class MovementController {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
  }

  // 获取移动方向向量
  public getDirection(): { dx: number; dy: number } {
    let dx = 0, dy = 0;

    if (this.wasd.left.isDown || this.cursors.left.isDown) dx = -1;
    else if (this.wasd.right.isDown || this.cursors.right.isDown) dx = 1;

    if (this.wasd.up.isDown || this.cursors.up.isDown) dy = -1;
    else if (this.wasd.down.isDown || this.cursors.down.isDown) dy = 1;

    return { dx, dy };
  }
}