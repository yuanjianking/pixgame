import { lazy } from 'react';

// 游戏组件懒加载映射
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const gameComponents: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'brick-breaker': lazy(() => import('./BrickBreaker/BrickBreaker2D')),
  'chinese-chess': lazy(() => import('./ChineseChess/ChineseChess')),
  'sokoban': lazy(() => import('./Sokoban/Sokoban')),
  'astro-shooter': lazy(() => import('./AstroShooter/AstroShooter')),
};

// 根据游戏ID获取对应的游戏组件
export const getGameComponent = (gameId: string) => {
  return gameComponents[gameId];
};

// 检查游戏是否有对应的组件
export const hasGameComponent = (gameId: string): gameId is string => {
  return gameId in gameComponents;
};