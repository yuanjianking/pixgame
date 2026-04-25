import type { GameInfo } from '../types/game.types';
import brickBreakerThumbnail from '../assets/BrickBreaker2D.png';
import chineseChessThumbnail from '../assets/ChineseChess.png';
import sokobanThumbnail from '../assets/Sokoban.png';
import astroShooterThumbnail from '../assets/AstroShooter.png';
import ironTankBattleThumbnail from '../assets/IronTankBattle.png';
import rageRacerThumbnail from '../assets/RageRacer.png';

export const games: GameInfo[] = [
  {
    id: 'brick-breaker',
    name: '打砖块',
    thumbnail: brickBreakerThumbnail,
    route: '/game/brick-breaker'
  },
  {
    id: 'chinese-chess',
    name: '中国象棋',
    thumbnail: chineseChessThumbnail,
    route: '/game/chinese-chess'
  },
  {
    id: 'sokoban',
    name: '推箱子',
    thumbnail: sokobanThumbnail,
    route: '/game/sokoban'
  },
  {
    id: 'astro-shooter',
    name: '太空射击',
    thumbnail: astroShooterThumbnail,
    route: '/game/astro-shooter'
  },
  {
    id: 'iron-tank-battle',
    name: '坦克大战',
    thumbnail: ironTankBattleThumbnail,
    route: '/game/iron-tank-battle'
  },
  {
    id: 'rage-racer',
    name: '暴力赛车',
    thumbnail: rageRacerThumbnail,
    route: '/game/rage-racer'
  }
];

export const getGameById = (id: string): GameInfo | undefined => {
  return games.find(game => game.id === id);
};