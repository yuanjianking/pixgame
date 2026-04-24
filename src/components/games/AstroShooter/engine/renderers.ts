// engine/renderers.ts
import type { GameObjects } from './types';

// 动态背景星群
const stars: Array<{ x: number; y: number; size: number; alpha: number; speed: number }> = [];
for (let i = 0; i < 150; i++) {
  stars.push({
    x: Math.random() * 480,
    y: Math.random() * 640,
    size: 1 + Math.random() * 2,
    alpha: 0.3 + Math.random() * 0.5,
    speed: 0.2 + Math.random() * 0.8
  });
}
let bgOffset = 0;

export function drawGame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  objects: GameObjects
) {
  const W = width, H = height;

  // 清空画布
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#030318";
  ctx.fillRect(0, 0, W, H);

  // 动态星空背景
  bgOffset = (bgOffset + 0.3) % H;
  for (const s of stars) {
    const y = (s.y + bgOffset * s.speed) % H;
    ctx.fillStyle = `rgba(255,240,200,${s.alpha * (0.6 + Math.sin(Date.now() * 0.001 + s.x) * 0.3)})`;
    ctx.fillRect(s.x, y, s.size, s.size);
  }

  // 星云光晕
  ctx.fillStyle = "rgba(80,100,180,0.03)";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(100 + i * 150 + Math.sin(Date.now() * 0.0005) * 20, 200 + Math.cos(Date.now() * 0.0003) * 15, 70, 0, Math.PI * 2);
    ctx.fill();
  }

  // 绘制陨石
  for (const a of objects.asteroids) {
    ctx.save();
    ctx.shadowBlur = 5;
    ctx.fillStyle = "#9aaebf";
    ctx.beginPath();
    const verts = a.vertices;
    if (verts && verts.length) {
      ctx.moveTo(a.x + verts[0].x * (a.currentRadius / a.baseRadius), a.y + verts[0].y * (a.currentRadius / a.baseRadius));
      for (let i = 1; i < verts.length; i++) {
        ctx.lineTo(a.x + verts[i].x * (a.currentRadius / a.baseRadius), a.y + verts[i].y * (a.currentRadius / a.baseRadius));
      }
    } else {
      ctx.arc(a.x, a.y, a.currentRadius, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.fillStyle = "#6b7f8f";
    ctx.beginPath();
    if (verts && verts.length) {
      ctx.moveTo(a.x + verts[0].x * (a.currentRadius / a.baseRadius) * 0.7, a.y + verts[0].y * (a.currentRadius / a.baseRadius) * 0.7);
      for (let i = 1; i < verts.length; i++) {
        ctx.lineTo(a.x + verts[i].x * (a.currentRadius / a.baseRadius) * 0.7, a.y + verts[i].y * (a.currentRadius / a.baseRadius) * 0.7);
      }
    } else {
      ctx.arc(a.x - 2, a.y - 2, a.currentRadius * 0.6, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.fillStyle = "#c0d0e0";
    ctx.beginPath();
    ctx.arc(a.x - a.currentRadius * 0.2, a.y - a.currentRadius * 0.2, a.currentRadius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "#4a5a6a";
    ctx.lineWidth = 1.8;
    for (let cr = 0; cr < 3; cr++) {
      const angle1 = a.crackSeed + cr * 1.2;
      const len = a.currentRadius * 0.7;
      ctx.moveTo(a.x + Math.cos(angle1) * len * 0.3, a.y + Math.sin(angle1) * len * 0.3);
      ctx.lineTo(a.x + Math.cos(angle1 + 0.8) * len * 0.8, a.y + Math.sin(angle1 + 0.8) * len * 0.8);
      ctx.stroke();
    }

    if (a.hp > 1) {
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = "#FFE0AA";
      ctx.fillText("🪨" + a.hp, a.x - 12, a.y - 12);
    }
    ctx.restore();
  }

  // 绘制敌机
  for (const ef of objects.enemyFighters) {
    ctx.save();
    ctx.shadowBlur = 4;
    if (ef.type === 'raider') {
      ctx.fillStyle = "#C73E3E";
      ctx.beginPath();
      ctx.moveTo(ef.x, ef.y - 18);
      ctx.lineTo(ef.x - 10, ef.y - 4);
      ctx.lineTo(ef.x - 12, ef.y);
      ctx.lineTo(ef.x - 8, ef.y + 2);
      ctx.lineTo(ef.x - 8, ef.y + 6);
      ctx.lineTo(ef.x - 12, ef.y + 10);
      ctx.lineTo(ef.x - 5, ef.y + 8);
      ctx.lineTo(ef.x, ef.y + 13);
      ctx.lineTo(ef.x + 5, ef.y + 8);
      ctx.lineTo(ef.x + 12, ef.y + 10);
      ctx.lineTo(ef.x + 8, ef.y + 6);
      ctx.lineTo(ef.x + 8, ef.y + 2);
      ctx.lineTo(ef.x + 12, ef.y);
      ctx.lineTo(ef.x + 10, ef.y - 4);
      ctx.fill();
      ctx.fillStyle = "#5AC8FA";
      ctx.beginPath();
      ctx.ellipse(ef.x, ef.y - 9, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FF8844";
      ctx.beginPath();
      ctx.moveTo(ef.x - 5, ef.y + 11);
      ctx.lineTo(ef.x, ef.y + 17);
      ctx.lineTo(ef.x + 5, ef.y + 11);
      ctx.fill();
    } else if (ef.type === 'bastion') {
      ctx.fillStyle = "#7B2F9D";
      ctx.beginPath();
      ctx.ellipse(ef.x, ef.y, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5A1F7A";
      ctx.beginPath();
      ctx.ellipse(ef.x, ef.y - 2, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#444";
      ctx.fillRect(ef.x - 18, ef.y + 2, 8, 6);
      ctx.fillRect(ef.x + 10, ef.y + 2, 8, 6);
      ctx.fillStyle = "#5AC8FA";
      ctx.beginPath();
      ctx.ellipse(ef.x, ef.y - 7, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      if (ef.hp > 2) {
        ctx.font = "bold 11px monospace";
        ctx.fillStyle = "#FFE0AA";
        ctx.fillText("🛡️" + ef.hp, ef.x - 15, ef.y - 14);
      }
    } else {
      ctx.fillStyle = "#E6B422";
      ctx.beginPath();
      ctx.moveTo(ef.x, ef.y - 20);
      ctx.lineTo(ef.x - 14, ef.y - 4);
      ctx.lineTo(ef.x - 10, ef.y - 2);
      ctx.lineTo(ef.x - 10, ef.y + 4);
      ctx.lineTo(ef.x - 16, ef.y + 8);
      ctx.lineTo(ef.x - 5, ef.y + 6);
      ctx.lineTo(ef.x, ef.y + 14);
      ctx.lineTo(ef.x + 5, ef.y + 6);
      ctx.lineTo(ef.x + 16, ef.y + 8);
      ctx.lineTo(ef.x + 10, ef.y + 4);
      ctx.lineTo(ef.x + 10, ef.y - 2);
      ctx.lineTo(ef.x + 14, ef.y - 4);
      ctx.fill();
      ctx.fillStyle = "#FFE484";
      ctx.beginPath();
      ctx.ellipse(ef.x, ef.y - 11, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFAA33";
      ctx.beginPath();
      ctx.moveTo(ef.x - 8, ef.y + 12);
      ctx.lineTo(ef.x, ef.y + 19);
      ctx.lineTo(ef.x + 8, ef.y + 12);
      ctx.fill();
      if (ef.hp > 2) {
        ctx.font = "bold 11px monospace";
        ctx.fillStyle = "#FFE0A3";
        ctx.fillText("👑" + ef.hp, ef.x - 12, ef.y - 18);
      }
    }
    ctx.restore();
  }

  // 绘制道具
  for (const p of objects.powerups) {
    const color = p.type === 'weapon' ? "#FFD966" : (p.type === 'health' ? "#FF6B6B" : "#44AAFF");
    ctx.fillStyle = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold 14px monospace";
    const icon = p.type === 'weapon' ? "⚡" : (p.type === 'health' ? "❤️" : "💣");
    ctx.fillText(icon, p.x - 6, p.y + 6);
  }

  // 绘制玩家战机
  const playerX = objects.playerX;
  const playerY = objects.playerY;
  const invincibleFrames = objects.invincibleFrames;

  ctx.save();
  if (invincibleFrames > 0 && (Math.floor(Date.now() / 60) % 3 === 0)) {
    ctx.globalAlpha = 0.55;
  }
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#3efffc";
  ctx.beginPath();
  ctx.moveTo(playerX, playerY - 18);
  ctx.lineTo(playerX + 12, playerY - 4);
  ctx.lineTo(playerX + 8, playerY + 2);
  ctx.lineTo(playerX + 14, playerY + 8);
  ctx.lineTo(playerX + 5, playerY + 6);
  ctx.lineTo(playerX, playerY + 12);
  ctx.lineTo(playerX - 5, playerY + 6);
  ctx.lineTo(playerX - 14, playerY + 8);
  ctx.lineTo(playerX - 8, playerY + 2);
  ctx.lineTo(playerX - 12, playerY - 4);
  ctx.closePath();
  const grad = ctx.createLinearGradient(playerX - 5, playerY - 10, playerX + 5, playerY + 8);
  grad.addColorStop(0, "#3cc7ff");
  grad.addColorStop(1, "#0a5f8a");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "#aaffff";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(playerX, playerY - 10, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#88ddff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(playerX, playerY - 10, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = "#f0fcff";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(playerX - 4, playerY + 10);
  ctx.lineTo(playerX, playerY + 16);
  ctx.lineTo(playerX + 4, playerY + 10);
  ctx.fillStyle = `rgba(255, 100, 30, ${0.6 + Math.sin(Date.now() * 0.015) * 0.3})`;
  ctx.fill();
  ctx.restore();

  // 绘制子弹
  for (const b of objects.bullets) {
    ctx.fillStyle = "#ffff88";
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = "#ffcc55";
    ctx.fillRect(b.x + 1, b.y, b.w - 2, b.h);
  }

  // 绘制敌方子弹
  for (const eb of objects.enemyBullets) {
    ctx.fillStyle = "#FF5566";
    ctx.beginPath();
    ctx.arc(eb.x, eb.y, eb.radius - 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // 绘制爆炸特效
  for (const ex of objects.explosions) {
    const fade = ex.life / 14;
    ctx.fillStyle = `rgba(255, 100, 30, ${fade})`;
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, ex.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // UI文字
    ctx.font = "bold 13px monospace";
    ctx.fillStyle = "#b5f0ff";
    ctx.fillText("⚡" + objects.powerLevel, 16, 35);

    ctx.fillStyle = "#ffaa66";
    ctx.fillText("💣" + objects.bombCount, width - 35, 35);
}