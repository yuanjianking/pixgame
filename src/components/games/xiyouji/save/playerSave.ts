import type { BaseCharacter } from '../characters/player/BaseCharacter';
import type { PlayerSaveData } from '../types';
import { createDefaultPlayer } from './saveDefaults';

/** 从角色实例生成存档用玩家数据 */
export function snapshotFromCharacter(
  char: BaseCharacter,
  overrides: Partial<PlayerSaveData> = {}
): PlayerSaveData {
  const defaults = createDefaultPlayer(overrides.playerClass ?? 'WuKong');
  return {
    ...defaults,
    ...overrides,
    level: char.getLevel(),
    exp: char.getExp(),
    hp: char.getHp(),
    maxHp: char.getMaxHp(),
    attack: char.getAttack(),
    defense: char.getDefense(),
    battleMoveRange: char.getBattleMoveRange(),
    battleAttackRange: char.getBattleAttackRange(),
    weapon: char.getWeapon(),
    clothes: char.getClothes(),
  };
}

/** 将存档数据灌入角色（等级、经验、战斗属性、装备） */
export function applySaveToCharacter(char: BaseCharacter, data?: PlayerSaveData): void {
  const p = data ?? createDefaultPlayer();
  char.setHp(p.hp, p.maxHp);
  char.setBattleStats({
    attack: p.attack,
    defense: p.defense,
    moveRange: p.battleMoveRange,
    attackRange: p.battleAttackRange,
    level: p.level,
    exp: p.exp,
  });
  char.setWeapon(p.weapon);
  char.setClothes(p.clothes);
}

/** 从存档或悟空默认属性读取兜底值 */
export function getSavedPlayerOrDefaults(saved?: PlayerSaveData) {
  const d = createDefaultPlayer();
  const s = saved;
  return {
    hp: s?.hp ?? d.hp,
    maxHp: s?.maxHp ?? d.maxHp,
    attack: s?.attack ?? d.attack,
    defense: s?.defense ?? d.defense,
    battleMoveRange: s?.battleMoveRange ?? d.battleMoveRange,
    battleAttackRange: s?.battleAttackRange ?? d.battleAttackRange,
    level: s?.level ?? d.level,
    exp: s?.exp ?? d.exp,
  };
}
