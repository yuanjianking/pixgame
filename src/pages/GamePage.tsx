import React, { Suspense, lazy, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGameById } from '../data/games';
import SaveLoadUI from '../components/ui/SaveLoadUI';

// 动态导入游戏组件
const BrickBreaker2D = lazy(() => import('../components/games/BrickBreaker/BrickBreaker2D'));

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const game = getGameById(gameId || '');
  const [showSaveLoadUI, setShowSaveLoadUI] = useState(false);
  const [currentGameState, setCurrentGameState] = useState<any>(null);
  const [saveLoadMode, setSaveLoadMode] = useState<'save' | 'load'>('load');

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

  // 根据游戏ID选择对应的组件
  const renderGame = () => {
    switch (game.id) {
      case 'brick-breaker':
        return <BrickBreaker2D
          key="brick-breaker"
          onBack={() => window.history.back()}
          onGameStateChange={setCurrentGameState}
        />;
      default:
        return <div>游戏组件未实现</div>;
    }
  };

  const handleSave = (saveId: string) => {
    console.log('保存成功:', saveId);
    setShowSaveLoadUI(false);
  };

  const handleLoad = (data: any) => {
    console.log('加载游戏状态:', data);
    setShowSaveLoadUI(false);
    setCurrentGameState(data);
  };

  const handleCloseSaveLoadUI = () => {
    setShowSaveLoadUI(false);
  };

  return (
    <>
      {showSaveLoadUI && (
        <SaveLoadUI
          key={`save-load-${saveLoadMode}`}
          gameType={game.id}
          onSave={handleSave}
          onLoad={handleLoad}
          onClose={handleCloseSaveLoadUI}
          currentGameState={currentGameState}
          initialTab={saveLoadMode}
        />
      )}
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

          <div className="game-actions">
            <button
              onClick={() => {
                setSaveLoadMode('save');
                setShowSaveLoadUI(true);
              }}
              className="game-button game-button-save"
            >
              <svg className="game-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              保存游戏
            </button>
            <button
              onClick={() => {
                setSaveLoadMode('load');
                setShowSaveLoadUI(true);
              }}
              className="game-button game-button-load"
            >
              <svg className="game-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              加载存档
            </button>
            <button
              onClick={() => {
                setCurrentGameState(null);
              }}
              className="game-button game-button-new"
            >
              新游戏
            </button>
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