import type { GameInfo } from '../types/game.types';
import brickBreakerThumbnail from '../assets/BrickBreaker2D.png';

export const games: GameInfo[] = [
  {
    id: 'brick-breaker',
    name: '打砖块',
    thumbnail: brickBreakerThumbnail,
    route: '/game/brick-breaker'
  }
];

export const getGameById = (id: string): GameInfo | undefined => {
  return games.find(game => game.id === id);
};