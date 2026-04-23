import type { GameInfo } from '../types/game.types';
import brickBreakerThumbnail from '../assets/BrickBreaker2D.png';
import chineseChessThumbnail from '../assets/ChineseChess.png';
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
  }
];

export const getGameById = (id: string): GameInfo | undefined => {
  return games.find(game => game.id === id);
};