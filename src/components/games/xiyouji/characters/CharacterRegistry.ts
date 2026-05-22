import * as Phaser from 'phaser';
import type { BaseCharacter } from './player/BaseCharacter';
import { WuKong } from './player/WuKong';
import { BaiLongMa } from './player/BaiLongMa';
import { BaJie } from './player/BaJie';
import { ShaSeng } from './player/ShaSeng';
import { TangSeng } from './player/TangSeng';
import { Shrimp } from './npc/Shrimp';
import { Crab } from './npc/Crab';
import { DragonKing } from './npc/DragonKing';

export type BattleCharacterFactory = (
  graphics: Phaser.GameObjects.Graphics,
  scene: Phaser.Scene
) => BaseCharacter;

const registry = new Map<string, BattleCharacterFactory>();

export function registerBattleCharacter(key: string, factory: BattleCharacterFactory): void {
  registry.set(key, factory);
}

export function createBattleCharacter(
  characterClass: string,
  graphics: Phaser.GameObjects.Graphics,
  scene: Phaser.Scene
): BaseCharacter {
  const factory = registry.get(characterClass);
  if (!factory) {
    throw new Error(`未注册的战斗角色类型: "${characterClass}"`);
  }
  return factory(graphics, scene);
}

// 内置角色注册（新增角色只需在此追加一行）
registerBattleCharacter('WuKong', (g, s) => new WuKong(g, s));
registerBattleCharacter('BaiLongMa', (g, s) => new BaiLongMa(g, s));
registerBattleCharacter('BaJie', (g, s) => new BaJie(g, s));
registerBattleCharacter('ShaSeng', (g, s) => new ShaSeng(g, s));
registerBattleCharacter('TangSeng', (g, s) => new TangSeng(g, s));
registerBattleCharacter('Shrimp', (g, s) => new Shrimp(g, s));
registerBattleCharacter('Crab', (g, s) => new Crab(g, s));
registerBattleCharacter('DragonKing', (g, s) => new DragonKing(g, s));
