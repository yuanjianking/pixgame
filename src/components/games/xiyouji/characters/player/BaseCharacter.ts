// BaseCharacter.ts
import * as Phaser from 'phaser';
import { MovementController } from '../../controllers/MovementController';

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export abstract class BaseCharacter {
  protected graphics: Phaser.GameObjects.Graphics;
  protected x: number = 0;
  protected y: number = 0;
  protected isMoving: boolean = false;
  protected walkCycle: number = 0;
  protected moveSpeed: number = 3;

  protected boundsMinX: number = 0;
  protected boundsMaxX: number = 800;
  protected boundsMinY: number = 0;
  protected boundsMaxY: number = 600;

  protected collisionRadius: number = 15;

  // 缩放系数（调整为更宽的比例）
  protected S = 0.6;
  protected WIDTH_SCALE = 1.2;  // 宽度额外放大

  // 可选：使用控制器
  protected movementController?: MovementController;

  // 血条
  protected healthBar: Phaser.GameObjects.Graphics | null = null;
  protected currentHp: number = 100;
  protected maxHp: number = 100;
  protected healthBarColor: number = 0x00AA00; // 默认绿色

  constructor(graphics: Phaser.GameObjects.Graphics, useController: boolean = false, scene?: Phaser.Scene) {
    this.graphics = graphics;
    if (useController && scene) {
      this.movementController = new MovementController(scene);
    }
  }

  // 抽象方法
  public abstract draw(x: number, y: number): void;
  public abstract updateAnimation(isMoving: boolean, walkCycle: number): void;

  // 设置血量
  public setHp(hp: number, maxHp: number, color?: number): void {
    this.currentHp = hp;
    this.maxHp = maxHp;
    if (color !== undefined) {
      this.healthBarColor = color;
    }
    this.updateHealthBar();
  }

  // 获取当前血量
  public getHp(): number {
    return this.currentHp;
  }

  // 获取最大血量
  public getMaxHp(): number {
    return this.maxHp;
  }

  // 受到伤害
  public takeDamage(amount: number): boolean {
      const damage = Math.min(amount, this.currentHp);
      this.currentHp -= damage;
      this.updateHealthBar();

      // 返回是否死亡
      return this.currentHp <= 0;
  }

  // 创建血条
  protected createHealthBar(): void {
    if (this.healthBar) {
      this.healthBar.destroy();
    }

    const graphics = this.graphics.scene.add.graphics();
    this.updateHealthBarGraphics(graphics);
    this.healthBar = graphics;
  }

  // 更新血条图形
  protected updateHealthBarGraphics(graphics: Phaser.GameObjects.Graphics): void {
    graphics.clear();

    const hpPercent = this.currentHp / this.maxHp;
    const barWidth = 40;
    const barHeight = 5;
    const barX = -barWidth / 2;
    const barY = -this.collisionRadius - 8;

    // 背景
    graphics.fillStyle(0x333333, 0.8);
    graphics.fillRect(barX, barY, barWidth, barHeight);

    // 血量条
    graphics.fillStyle(this.healthBarColor, 1);
    graphics.fillRect(barX, barY, barWidth * hpPercent, barHeight);
  }

  // 更新血条位置和数值
  public updateHealthBar(): void {
    if (!this.healthBar) {
      this.createHealthBar();
    }
    this.updateHealthBarGraphics(this.healthBar!);

    // 血条跟随角色移动
    this.healthBar!.setPosition(this.x, this.y);
  }

  // 碰撞检测
  private checkCollision(x: number, y: number, obstacle: Obstacle): boolean {
    const playerLeft = x - this.collisionRadius;
    const playerRight = x + this.collisionRadius;
    const playerTop = y - this.collisionRadius;
    const playerBottom = y + this.collisionRadius;

    const obsLeft = obstacle.x;
    const obsRight = obstacle.x + obstacle.width;
    const obsTop = obstacle.y;
    const obsBottom = obstacle.y + obstacle.height;

    return playerRight > obsLeft && playerLeft < obsRight &&
           playerBottom > obsTop && playerTop < obsBottom;
  }

  // 手动移动（无碰撞）
  public move(dx: number, dy: number): void {
    this.isMoving = (dx !== 0 || dy !== 0);

    if (this.isMoving) {
      if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
      }

      this.x += dx * this.moveSpeed;
      this.y += dy * this.moveSpeed;

      this.x = Math.max(this.boundsMinX, Math.min(this.boundsMaxX, this.x));
      this.y = Math.max(this.boundsMinY, Math.min(this.boundsMaxY, this.y));

      this.walkCycle += 0.15;
    } else {
      this.walkCycle = 0;
    }

    this.updateAnimation(this.isMoving, this.walkCycle);
    this.draw(this.x, this.y);
    this.updateHealthBar();
  }

  // 带碰撞的移动
  public moveWithCollision(dx: number, dy: number, obstacles: Obstacle[]): void {
    this.isMoving = (dx !== 0 || dy !== 0);

    if (this.isMoving) {
      if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
      }

      const newX = this.x + dx * this.moveSpeed;
      const newY = this.y + dy * this.moveSpeed;

      let canMoveX = true;
      let canMoveY = true;

      for (const obstacle of obstacles) {
        if (this.checkCollision(newX, this.y, obstacle)) {
          canMoveX = false;
        }
        if (this.checkCollision(this.x, newY, obstacle)) {
          canMoveY = false;
        }
      }

      if (canMoveX) this.x = newX;
      if (canMoveY) this.y = newY;

      this.x = Math.max(this.boundsMinX, Math.min(this.boundsMaxX, this.x));
      this.y = Math.max(this.boundsMinY, Math.min(this.boundsMaxY, this.y));

      this.walkCycle += 0.15;
    } else {
      this.walkCycle = 0;
    }

    this.updateAnimation(this.isMoving, this.walkCycle);
    this.draw(this.x, this.y);
    this.updateHealthBar();
  }

  // 自动从控制器获取方向并移动（无碰撞）
  public updateFromController(): void {
    if (this.movementController) {
      const { dx, dy } = this.movementController.getDirection();
      this.move(dx, dy);
    }
  }

  // 自动从控制器获取方向并移动（带碰撞）
  public updateFromControllerWithCollision(obstacles: Obstacle[]): void {
    if (this.movementController) {
      const { dx, dy } = this.movementController.getDirection();
      this.moveWithCollision(dx, dy, obstacles);
    }
  }

  // 设置位置
  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.draw(this.x, this.y);
    this.updateHealthBar();
  }

  public getX(): number { return this.x; }
  public getY(): number { return this.y; }

  public setCollisionRadius(radius: number): void {
    this.collisionRadius = radius;
  }

  public setBounds(minX: number, maxX: number, minY: number, maxY: number): void {
    this.boundsMinX = minX;
    this.boundsMaxX = maxX;
    this.boundsMinY = minY;
    this.boundsMaxY = maxY;
  }

  public setSpeed(speed: number): void {
    this.moveSpeed = speed;
  }

  public setScale(scale: number, widthScale?: number): void {
    this.S = scale;
    if (widthScale !== undefined) {
      this.WIDTH_SCALE = widthScale;
    }
  }

  public clear(): void {
    if (this.healthBar) {
      this.healthBar.destroy();
      this.healthBar = null;
    }
    this.graphics.clear();
  }
}