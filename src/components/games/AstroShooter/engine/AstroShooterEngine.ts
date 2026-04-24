// engine/AstroShooterEngine.ts
import type { Asteroid, AsteroidVertex, Bullet, EnemyBullet, EnemyFighter, Explosion, Powerup, GameState, Vector2 } from './types';

export class AstroShooterEngine {
  private W = 480;
  private H = 640;

  // 子弹常量
  private readonly BULLET_W = 5;
  private readonly BULLET_H = 12;
  private readonly BULLET_SPEED = -8;
  private readonly SHOT_DELAY = 5;
  private readonly ENEMY_BULLET_RADIUS = 5;
  private readonly ENEMY_BULLET_SPEED = 5.2;
  private readonly POWERUP_DURATION = 450;
  private readonly PLAYER_RADIUS = 14;
  private readonly INVINCIBLE_DURATION = 50;

  // 游戏状态
  private gameRunning = true;
  private score = 0;
  private playerHealth = 3;
  private invincibleFrames = 0;
  private gameTimeSeconds = 0;
  private frameCounter = 0;

  // 玩家
  private playerX = this.W / 2;
  private playerY = this.H - 70;

  // 子弹系统
  private powerLevel = 1;
  private powerUpTimer = 0;
  private bullets: Bullet[] = [];
  private shotCooldown = 0;
  private bombCount = 0;

  // 游戏对象
  private asteroids: Asteroid[] = [];
  private powerups: Powerup[] = [];
  private enemyFighters: EnemyFighter[] = [];
  private enemyBullets: EnemyBullet[] = [];
  private explosions: Explosion[] = [];

  // 难度
  private difficultyWave = 0;
  private dynamicSpeedFactor = 1.0;
  private spawnDelayCounter = 0;

  // 回调
  private onStateChange: ((state: Partial<GameState>) => void) | null = null;
  private onExplosion: ((x: number, y: number, size: number) => void) | null = null;

  constructor() {}

  setCallbacks(
    onStateChange: (state: Partial<GameState>) => void,
    onExplosion: (x: number, y: number, size: number) => void
  ) {
    this.onStateChange = onStateChange;
    this.onExplosion = onExplosion;
  }

  private notifyState() {
    this.onStateChange?.({
      gameRunning: this.gameRunning,
      score: Math.floor(this.score),
      playerHealth: this.playerHealth,
      gameTimeSeconds: this.gameTimeSeconds,
      powerLevel: this.powerLevel,
      bombCount: this.bombCount,
    });
  }

  private addExplosion(x: number, y: number, size = 12) {
    this.explosions.push({ x, y, life: 14, radius: size });
    this.onExplosion?.(x, y, size);
  }

  getPlayerPosition(): Vector2 {
    return { x: this.playerX, y: this.playerY };
  }

  getPlayerRadius(): number {
    return this.PLAYER_RADIUS;
  }

  getInvincibleFrames(): number {
    return this.invincibleFrames;
  }

  isGameRunning(): boolean {
    return this.gameRunning;
  }

  getGameObjects() {
    return {
      asteroids: this.asteroids,
      powerups: this.powerups,
      enemyFighters: this.enemyFighters,
      enemyBullets: this.enemyBullets,
      explosions: this.explosions,
      bullets: this.bullets,
      powerLevel: this.powerLevel,
      bombCount: this.bombCount,
      invincibleFrames: this.invincibleFrames,
      playerX: this.playerX,
      playerY: this.playerY,
    };
  }

  updatePlayerPosition(x: number, y: number) {
    this.playerX = Math.min(Math.max(x, this.PLAYER_RADIUS), this.W - this.PLAYER_RADIUS);
    this.playerY = Math.min(Math.max(y, this.PLAYER_RADIUS + 10), this.H - this.PLAYER_RADIUS);
  }

  useBomb(): boolean {
    if (!this.gameRunning || this.bombCount <= 0) return false;
    this.bombCount--;
    this.notifyState();

    for (const a of this.asteroids) this.addExplosion(a.x, a.y, a.currentRadius);
    for (const e of this.enemyFighters) this.addExplosion(e.x, e.y, e.radius);
    this.asteroids = [];
    this.enemyFighters = [];
    this.enemyBullets = [];
    this.addExplosion(this.W / 2, this.H / 2, 40);
    return true;
  }

  restart() {
    this.gameRunning = true;
    this.score = 0;
    this.playerHealth = 3;
    this.gameTimeSeconds = 0;
    this.powerLevel = 1;
    this.powerUpTimer = 0;
    this.bombCount = 0;
    this.invincibleFrames = 0;
    this.difficultyWave = 0;
    this.dynamicSpeedFactor = 1.0;
    this.asteroids = [];
    this.enemyFighters = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.powerups = [];
    this.explosions = [];
    this.playerX = this.W / 2;
    this.playerY = this.H - 70;
    this.spawnDelayCounter = 8;
    this.frameCounter = 0;

    for (let i = 0; i < 3; i++) this.spawnAsteroid();
    this.notifyState();
  }

  // ========== 生成方法 ==========
  private spawnAsteroid() {
    const r = Math.random();
    let type = 'medium';
    let baseRadius = 16;
    let hp = 2;
    let scoreVal = 15;
    let speedYBase = 1.8;

    if (r < 0.3) { type = 'large'; baseRadius = 26; hp = 4; scoreVal = 40; speedYBase = 1.1; }
    else if (r < 0.65) { type = 'medium'; baseRadius = 18; hp = 2; scoreVal = 20; speedYBase = 1.7; }
    else { type = 'small'; baseRadius = 12; hp = 1; scoreVal = 10; speedYBase = 2.3; }

    const timeBonus = Math.min(2.8, this.dynamicSpeedFactor * 0.8);
    const finalSpeed = speedYBase + timeBonus + Math.random() * 1.3;
    const speedX = (Math.random() - 0.5) * 1.3;

    const vertices: AsteroidVertex[] = [];
    const numPoints = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const radiusVar = baseRadius * (0.7 + Math.random() * 0.6);
      vertices.push({ x: Math.cos(angle) * radiusVar, y: Math.sin(angle) * radiusVar });
    }

    this.asteroids.push({
      x: Math.random() * (this.W - baseRadius * 2) + baseRadius,
      y: -baseRadius - Math.random() * 25,
      baseRadius, currentRadius: baseRadius,
      hp, maxHp: hp, type, speedY: finalSpeed, speedX,
      scoreValue: scoreVal, vertices, hasDroppedItem: false,
      crackSeed: Math.random() * Math.PI * 2
    });
  }

  private spawnPowerup(x: number, y: number) {
    const rand = Math.random() * 100;
    if (rand < 5) {
      this.powerups.push({ x, y, radius: 9, type: 'weapon', speedY: 2.2, speedX: (Math.random() - 0.5) * 1.2 });
    } else if (rand < 7) {
      if (this.bombCount < 3) {
        this.powerups.push({ x, y, radius: 9, type: 'bomb', speedY: 2.2, speedX: (Math.random() - 0.5) * 1.2 });
      } else {
        this.score += 60;
        this.notifyState();
        this.addExplosion(x, y, 10);
      }
    } else if (rand < 8) {
      if (this.playerHealth < 5) {
        this.powerups.push({ x, y, radius: 9, type: 'health', speedY: 2.2, speedX: (Math.random() - 0.5) * 1.2 });
      } else {
        this.score += 50;
        this.notifyState();
        this.addExplosion(x, y, 12);
      }
    }
  }

  private spawnEnemyByType(type: string) {
    let radius = 18, hp = 2, scoreVal = 30, speedY = 2.0 + this.dynamicSpeedFactor * 0.5;
    let speedX = (Math.random() - 0.5) * 1.2, shootDelayBase = 25, bulletPattern = 'normal';

    if (type === 'raider') {
      radius = 19; hp = 2; scoreVal = 28; speedY = 3.4 + this.dynamicSpeedFactor * 0.8;
      speedX = (Math.random() - 0.5) * 2.2; shootDelayBase = 18; bulletPattern = 'fast';
    } else if (type === 'bastion') {
      radius = 25; hp = 5; scoreVal = 70; speedY = 1.1 + this.dynamicSpeedFactor * 0.3;
      speedX = (Math.random() - 0.5) * 0.6; shootDelayBase = 40; bulletPattern = 'spread';
    } else {
      radius = 22; hp = 4; scoreVal = 95; speedY = 1.9 + this.dynamicSpeedFactor * 0.55;
      speedX = (Math.random() - 0.5) * 1.1; shootDelayBase = 28; bulletPattern = 'triple';
    }

    this.enemyFighters.push({
      x: Math.random() * (this.W - radius * 2) + radius,
      y: -radius - 10,
      radius, hp, maxHp: hp, type,
      speedY, speedX,
      shootTimer: Math.floor(Math.random() * shootDelayBase),
      shootDelayBase, bulletPattern,
      scoreValue: scoreVal,
      wigglePhase: Math.random() * Math.PI * 2
    });
  }

  private spawnRandomEnemy() {
    const r = Math.random();
    if (r < 0.45) this.spawnEnemyByType('raider');
    else if (r < 0.75) this.spawnEnemyByType('bastion');
    else this.spawnEnemyByType('imperator');
  }

  private breakAsteroid(ast: Asteroid, index: number, fromBullet = true) {
    if (!ast.hasDroppedItem && fromBullet) {
      this.spawnPowerup(ast.x, ast.y);
      ast.hasDroppedItem = true;
    }
    if (ast.type === 'large') {
      for (let frag = 0; frag < 2; frag++) {
        const newRad = 12;
        const newVertices: AsteroidVertex[] = [];
        for (let i = 0; i < 7; i++) {
          const angle = (i / 7) * Math.PI * 2;
          const radVar = newRad * (0.7 + Math.random() * 0.5);
          newVertices.push({ x: Math.cos(angle) * radVar, y: Math.sin(angle) * radVar });
        }
        this.asteroids.push({
          x: ast.x + (Math.random() - 0.5) * 18, y: ast.y + 5,
          baseRadius: newRad, currentRadius: newRad, hp: 1, maxHp: 1,
          type: 'fragment', speedY: ast.speedY * 0.9 + 1.2, speedX: (Math.random() - 0.5) * 2.2,
          scoreValue: 0, vertices: newVertices, hasDroppedItem: true, crackSeed: Math.random() * Math.PI * 2
        });
      }
    } else if (ast.type === 'medium' && Math.random() < 0.45) {
      const newRad = 9;
      const newVertices: AsteroidVertex[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const radVar = newRad * (0.7 + Math.random() * 0.5);
        newVertices.push({ x: Math.cos(angle) * radVar, y: Math.sin(angle) * radVar });
      }
      this.asteroids.push({
        x: ast.x + (Math.random() - 0.5) * 12, y: ast.y,
        baseRadius: newRad, currentRadius: newRad, hp: 1, maxHp: 1,
        type: 'small_frag', speedY: ast.speedY + 0.9, speedX: (Math.random() - 0.5) * 2,
        scoreValue: 0, vertices: newVertices, hasDroppedItem: true, crackSeed: Math.random() * Math.PI * 2
      });
    }
    this.addExplosion(ast.x, ast.y, ast.baseRadius + 4);
    this.asteroids.splice(index, 1);
  }

  // ========== 移动方法 ==========
  private moveObjects() {
    // 陨石移动
    for (let i = 0; i < this.asteroids.length; i++) {
      const a = this.asteroids[i];
      a.y += a.speedY;
      a.x += a.speedX;
      const hpRatio = a.hp / a.maxHp;
      a.currentRadius = a.baseRadius * (0.6 + hpRatio * 0.5);
      if (a.x - a.currentRadius > this.W + 60 || a.x + a.currentRadius < -60 ||
          a.y - a.currentRadius > this.H + 120 || a.y + a.currentRadius < -80) {
        this.asteroids.splice(i, 1);
        i--;
      }
    }

    // 敌机移动
    for (let i = 0; i < this.enemyFighters.length; i++) {
      const e = this.enemyFighters[i];
      e.y += e.speedY;
      if (e.type === 'imperator') {
        e.wigglePhase += 0.06;
        const wiggle = Math.sin(e.wigglePhase) * 1.5;
        e.x += e.speedX + wiggle * 0.4;
      } else {
        e.x += e.speedX;
      }
      if (e.x - e.radius > this.W + 70 || e.x + e.radius < -70 ||
          e.y - e.radius > this.H + 120 || e.y + e.radius < -80) {
        this.enemyFighters.splice(i, 1);
        i--;
        continue;
      }

      // 敌机射击
      if (e.shootTimer <= 0 && e.y > 20 && e.y < this.H - 40) {
        if (Math.random() < 0.58) {
          if (e.bulletPattern === 'fast') {
            this.enemyBullets.push({
              x: e.x, y: e.y + e.radius * 0.4,
              radius: this.ENEMY_BULLET_RADIUS - 1,
              speedY: this.ENEMY_BULLET_SPEED + 1.8,
              speedX: (Math.random() - 0.5) * 1.2
            });
          } else if (e.bulletPattern === 'spread') {
            for (let ang = -1; ang <= 1; ang++) {
              this.enemyBullets.push({
                x: e.x + ang * 6, y: e.y + e.radius * 0.3,
                radius: this.ENEMY_BULLET_RADIUS,
                speedY: this.ENEMY_BULLET_SPEED - 0.3,
                speedX: ang * 2.0
              });
            }
          } else if (e.bulletPattern === 'triple') {
            this.enemyBullets.push({
              x: e.x - 5, y: e.y + e.radius * 0.4,
              radius: this.ENEMY_BULLET_RADIUS,
              speedY: this.ENEMY_BULLET_SPEED,
              speedX: -1.5
            });
            this.enemyBullets.push({
              x: e.x + 5, y: e.y + e.radius * 0.4,
              radius: this.ENEMY_BULLET_RADIUS,
              speedY: this.ENEMY_BULLET_SPEED,
              speedX: 1.5
            });
            this.enemyBullets.push({
              x: e.x, y: e.y + e.radius * 0.5,
              radius: this.ENEMY_BULLET_RADIUS,
              speedY: this.ENEMY_BULLET_SPEED + 1.0,
              speedX: 0
            });
          }
        }
        e.shootTimer = e.shootDelayBase;
      } else {
        e.shootTimer--;
      }
    }

    // 道具移动
    for (let i = 0; i < this.powerups.length; i++) {
      const p = this.powerups[i];
      p.y += p.speedY;
      p.x += p.speedX;
      if (p.y + p.radius > this.H + 80 || p.y + p.radius < -40 ||
          p.x + p.radius < -50 || p.x - p.radius > this.W + 60) {
        this.powerups.splice(i, 1);
        i--;
      }
    }

    // 敌方子弹移动
    for (let i = 0; i < this.enemyBullets.length; i++) {
      const eb = this.enemyBullets[i];
      eb.y += eb.speedY;
      eb.x += eb.speedX;
      if (eb.y + eb.radius > this.H + 80 || eb.y + eb.radius < -40 ||
          eb.x + eb.radius < -60 || eb.x - eb.radius > this.W + 60) {
        this.enemyBullets.splice(i, 1);
        i--;
      }
    }
  }

  private shootByPower() {
    if (this.powerLevel === 1) {
      this.bullets.push({ x: this.playerX - this.BULLET_W / 2, y: this.playerY - 18, w: this.BULLET_W, h: this.BULLET_H });
    } else if (this.powerLevel === 2) {
      this.bullets.push({ x: this.playerX - this.BULLET_W / 2 - 6, y: this.playerY - 18, w: this.BULLET_W, h: this.BULLET_H });
      this.bullets.push({ x: this.playerX - this.BULLET_W / 2 + 6, y: this.playerY - 18, w: this.BULLET_W, h: this.BULLET_H });
    } else if (this.powerLevel === 3) {
      this.bullets.push({ x: this.playerX - this.BULLET_W / 2, y: this.playerY - 20, w: this.BULLET_W, h: this.BULLET_H });
      this.bullets.push({ x: this.playerX - this.BULLET_W / 2 - 8, y: this.playerY - 18, w: this.BULLET_W, h: this.BULLET_H });
      this.bullets.push({ x: this.playerX - this.BULLET_W / 2 + 8, y: this.playerY - 18, w: this.BULLET_W, h: this.BULLET_H });
      this.bullets.push({ x: this.playerX - this.BULLET_W / 2 - 3, y: this.playerY - 22, w: this.BULLET_W - 1, h: this.BULLET_H - 2 });
      this.bullets.push({ x: this.playerX - this.BULLET_W / 2 + 3, y: this.playerY - 22, w: this.BULLET_W - 1, h: this.BULLET_H - 2 });
    }
  }

  private handleBulletCollisions() {
    for (let i = 0; i < this.bullets.length; i++) {
      const bullet = this.bullets[i];
      const bulletRect = { x: bullet.x, y: bullet.y, w: bullet.w, h: bullet.h };
      let hit = false;

      for (let j = 0; j < this.asteroids.length; j++) {
        const ast = this.asteroids[j];
        const closestX = Math.max(bulletRect.x, Math.min(ast.x, bulletRect.x + bullet.w));
        const closestY = Math.max(bulletRect.y, Math.min(ast.y, bulletRect.y + bullet.h));
        const dx = closestX - ast.x, dy = closestY - ast.y;
        if (dx * dx + dy * dy < ast.currentRadius * ast.currentRadius) {
          hit = true;
          ast.hp -= 1;
          if (ast.hp <= 0) {
            this.score += ast.scoreValue;
            this.notifyState();
            this.breakAsteroid(ast, j, true);
          } else {
            this.addExplosion(ast.x - 2, ast.y - 2, 7);
          }
          break;
        }
      }

      if (!hit) {
        for (let k = 0; k < this.enemyFighters.length; k++) {
          const ef = this.enemyFighters[k];
          const closestX = Math.max(bulletRect.x, Math.min(ef.x, bulletRect.x + bullet.w));
          const closestY = Math.max(bulletRect.y, Math.min(ef.y, bulletRect.y + bullet.h));
          const dx = closestX - ef.x, dy = closestY - ef.y;
          if (dx * dx + dy * dy < ef.radius * ef.radius) {
            hit = true;
            ef.hp -= 1;
            if (ef.hp <= 0) {
              this.score += ef.scoreValue;
              this.notifyState();
              this.addExplosion(ef.x, ef.y, ef.radius + 4);
              this.enemyFighters.splice(k, 1);
            } else {
              this.addExplosion(ef.x - 3, ef.y - 2, 9);
            }
            break;
          }
        }
      }

      if (hit) {
        this.bullets.splice(i, 1);
        i--;
      }
    }
  }

  private handlePowerupCollection() {
    for (let i = 0; i < this.powerups.length; i++) {
      const p = this.powerups[i];
      const dx = this.playerX - p.x;
      const dy = this.playerY - p.y;
      if (Math.hypot(dx, dy) < this.PLAYER_RADIUS + p.radius) {
        if (p.type === 'weapon') {
          if (this.powerLevel < 3) this.powerLevel++;
          else this.score += 80;
          this.powerUpTimer = this.POWERUP_DURATION;
          this.addExplosion(p.x, p.y, 10);
          this.notifyState();
        } else if (p.type === 'health') {
          if (this.playerHealth < 5) {
            this.playerHealth++;
            this.addExplosion(p.x, p.y, 12);
          } else {
            this.score += 50;
            this.addExplosion(p.x, p.y, 12);
          }
          this.notifyState();
        } else if (p.type === 'bomb') {
          if (this.bombCount < 3) this.bombCount++;
          else this.score += 60;
          this.addExplosion(p.x, p.y, 14);
          this.notifyState();
        }
        this.powerups.splice(i, 1);
        i--;
      }
    }

    if (this.powerUpTimer > 0) {
      this.powerUpTimer--;
      if (this.powerUpTimer <= 0 && this.powerLevel > 1) {
        this.powerLevel--;
        this.notifyState();
      }
    }
  }

  private handlePlayerCollisions() {
    if (!this.gameRunning) return;

    for (let i = 0; i < this.asteroids.length; i++) {
      const a = this.asteroids[i];
      if (Math.hypot(this.playerX - a.x, this.playerY - a.y) < this.PLAYER_RADIUS + a.currentRadius) {
        if (this.invincibleFrames <= 0) {
          this.playerHealth--;
          this.notifyState();
          this.addExplosion(this.playerX, this.playerY, 18);
          if (this.playerHealth <= 0) {
            this.gameRunning = false;
            this.powerLevel = 1;
            this.powerUpTimer = 0;
            this.notifyState();
            return;
          }
          this.invincibleFrames = this.INVINCIBLE_DURATION;
        }
        this.addExplosion(a.x, a.y, a.currentRadius);
        this.asteroids.splice(i, 1);
        i--;
      }
    }

    for (let i = 0; i < this.enemyFighters.length; i++) {
      const ef = this.enemyFighters[i];
      if (Math.hypot(this.playerX - ef.x, this.playerY - ef.y) < this.PLAYER_RADIUS + ef.radius) {
        if (this.invincibleFrames <= 0) {
          this.playerHealth--;
          this.notifyState();
          this.addExplosion(this.playerX, this.playerY, 18);
          if (this.playerHealth <= 0) {
            this.gameRunning = false;
            this.powerLevel = 1;
            this.powerUpTimer = 0;
            this.notifyState();
            return;
          }
          this.invincibleFrames = this.INVINCIBLE_DURATION;
        }
        this.addExplosion(ef.x, ef.y, ef.radius);
        this.enemyFighters.splice(i, 1);
        i--;
      }
    }

    for (let i = 0; i < this.enemyBullets.length; i++) {
      const eb = this.enemyBullets[i];
      if (Math.hypot(this.playerX - eb.x, this.playerY - eb.y) < this.PLAYER_RADIUS + eb.radius) {
        if (this.invincibleFrames <= 0) {
          this.playerHealth--;
          this.notifyState();
          if (this.playerHealth <= 0) {
            this.gameRunning = false;
            this.powerLevel = 1;
            this.powerUpTimer = 0;
            this.notifyState();
            return;
          }
          this.invincibleFrames = this.INVINCIBLE_DURATION;
          this.addExplosion(this.playerX - 2, this.playerY - 2, 12);
        }
        this.enemyBullets.splice(i, 1);
        i--;
      }
    }
  }

  private manageSpawning() {
    if (!this.gameRunning) return;
    const timeSec = this.gameTimeSeconds;
    this.difficultyWave = Math.floor(timeSec / 25) + 1;
    const baseDelay = Math.max(10, 32 - this.difficultyWave * 1.5 - Math.floor(timeSec / 20));
    const scoreBonus = Math.min(6, Math.floor(this.score / 500));
    const finalDelay = Math.max(8, baseDelay - scoreBonus);

    if (this.spawnDelayCounter <= 0) {
      let countAsteroids = 1;
      if (Math.random() < 0.4 + this.difficultyWave * 0.05) countAsteroids = 2;
      if (this.difficultyWave > 3 && Math.random() < 0.3) countAsteroids = 3;
      for (let i = 0; i < countAsteroids; i++) this.spawnAsteroid();

      let fighterProb = 0.3 + (timeSec / 70) + this.difficultyWave * 0.02;
      if (fighterProb > 0.75) fighterProb = 0.75;
      if (Math.random() < fighterProb) this.spawnRandomEnemy();
      if (this.difficultyWave > 2 && Math.random() < 0.2) this.spawnRandomEnemy();

      this.spawnDelayCounter = finalDelay;
    } else {
      this.spawnDelayCounter--;
    }
    this.dynamicSpeedFactor = 1.0 + (timeSec / 35) + this.difficultyWave * 0.08;
    if (this.dynamicSpeedFactor > 2.8) this.dynamicSpeedFactor = 2.8;
  }

  // ========== 主更新循环 ==========
  update() {
    if (!this.gameRunning) return;

    if (this.invincibleFrames > 0) this.invincibleFrames--;

    this.frameCounter++;
    if (this.frameCounter >= 60) {
      this.frameCounter = 0;
      this.gameTimeSeconds++;
      this.notifyState();
    }

    // 射击
    if (this.shotCooldown <= 0) {
      this.shootByPower();
      this.shotCooldown = this.SHOT_DELAY;
    } else {
      this.shotCooldown--;
    }

    // 子弹移动
    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].y += this.BULLET_SPEED;
      if (this.bullets[i].y + this.bullets[i].h < 0 || this.bullets[i].y > this.H) {
        this.bullets.splice(i, 1);
        i--;
      }
    }

    this.moveObjects();
    this.handleBulletCollisions();
    this.handlePowerupCollection();
    this.handlePlayerCollisions();
    this.manageSpawning();

    // 爆炸特效更新
    for (let i = 0; i < this.explosions.length; i++) {
      this.explosions[i].life--;
      if (this.explosions[i].life <= 0) {
        this.explosions.splice(i, 1);
        i--;
      }
    }
  }
}