import React, { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGameById } from '../data/games';
import { getGameComponent, hasGameComponent } from '../components/games';

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const game = getGameById(gameId || '');

  if (!game) {
    return (
      <div className="game-not-found">
        <h2 className="game-not-found-title">游戏未找到</h2>
        <p className="game-not-found-text">抱歉，您请求的游戏不存在。</p>
        <Link
          to="/"
          className="game-not-found-link"
        >
          返回主页
        </Link>
      </div>
    );
  }

  // 根据游戏ID动态加载对应的组件
  const renderGame = () => {
    if (hasGameComponent(game.id)) {
      const GameComponent = getGameComponent(game.id);
      return <GameComponent key={game.id} />;
    }
    return <div>游戏组件未实现</div>;
  };


  return (
    <>
      <div className="game-page-container">
        {/* Game Header */}
        <div className="game-header">
          <div className="game-header-left">
            <div className="game-breadcrumb">
              <Link
                to="/"
                className="game-back-link"
              >
                <svg className="game-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                返回主页
              </Link>
              <span className="game-breadcrumb-separator">/</span>
              <span className="game-breadcrumb-name">{game.name}</span>
            </div>
          </div>
        </div>

        {/* Game Canvas Area */}
        <div className="game-canvas-area">
          <div className="game-canvas-inner">
            <Suspense
              fallback={
                <div className="game-loading">
                  <div className="text-center">
                    <div className="game-loading-spinner"></div>
                    <p className="game-loading-text">加载游戏场景...</p>
                  </div>
                </div>
              }
            >
              {renderGame()}
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
};

export default GamePage;