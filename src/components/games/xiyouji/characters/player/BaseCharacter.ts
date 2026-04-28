// characters/player/BaseCharacter.ts
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

  // 可选：使用控制器
  protected movementController?: MovementController;

  constructor(graphics: Phaser.GameObjects.Graphics, useController: boolean = false, scene?: Phaser.Scene) {
    this.graphics = graphics;
    if (useController && scene) {
      this.movementController = new MovementController(scene);
    }
  }

  // 抽象方法
  public abstract draw(x: number, y: number): void;
  public abstract updateAnimation(isMoving: boolean, walkCycle: number): void;

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

      // 碰撞检测
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

      // 边界限制
      this.x = Math.max(this.boundsMinX, Math.min(this.boundsMaxX, this.x));
      this.y = Math.max(this.boundsMinY, Math.min(this.boundsMaxY, this.y));

      this.walkCycle += 0.15;
    } else {
      this.walkCycle = 0;
    }

    this.updateAnimation(this.isMoving, this.walkCycle);
    this.draw(this.x, this.y);
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
}