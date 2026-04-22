import React, { useState } from 'react';
import { useGameSave } from '../../hooks/useGameSave';
import type { GameType } from '../../types/game.types';
import { formatSaveDate } from '../../stores/saveStore';

interface SaveLoadUIProps {
  gameType: GameType;
  onSave?: (saveId: string) => void;
  onLoad?: (data: any) => void;
  onClose?: () => void;
  currentGameState?: any;
  initialTab?: 'save' | 'load';
}

const SaveLoadUI: React.FC<SaveLoadUIProps> = ({
  gameType,
  onSave,
  onLoad,
  onClose,
  currentGameState,
  initialTab = 'load',
}) => {
  const [activeTab, setActiveTab] = useState<'save' | 'load'>(initialTab);
  const [saveName, setSaveName] = useState('');
  const [selectedSaveId, setSelectedSaveId] = useState<string | null>(null);

  const {
    saves,
    activeSave,
    saveGame,
    loadGame,
    deleteGameSave,
    newGame,
    quickSave,
    quickLoad,
  } = useGameSave({ gameType });

  const handleSave = () => {
    if (!currentGameState) return;

    const name = saveName.trim() || `保存 ${new Date().toLocaleTimeString('zh-CN')}`;
    const save = saveGame({ ...currentGameState, _saveName: name });

    setSaveName('');
    onSave?.(save.id);

    setTimeout(() => onClose?.(), 1000);
  };

  const handleLoad = () => {
    if (!selectedSaveId) return;

    const data = loadGame(selectedSaveId);
    if (data) {
      onLoad?.(data);
      onClose?.();
    }
  };

  const handleDelete = (saveId: string) => {
    if (confirm('确定要删除这个存档吗？')) {
      deleteGameSave(saveId);
      if (selectedSaveId === saveId) {
        setSelectedSaveId(null);
      }
    }
  };

  const handleQuickSave = () => {
    if (!currentGameState) return;

    const saveId = quickSave(currentGameState);
    onSave?.(saveId);

    const message = document.createElement('div');
    message.className = 'save-success-toast';
    message.textContent = '快速保存成功！';
    message.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      background-color: #10b981;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      z-index: 10000;
      animation: fadeOut 2s ease-out forwards;
    `;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
  };

  const handleQuickLoad = () => {
    const data = quickLoad();
    if (data) {
      onLoad?.(data);
      onClose?.();
    } else {
      alert('没有找到存档！');
    }
  };

  const handleNewGame = () => {
    if (confirm('开始新游戏将丢失当前进度，确定要继续吗？')) {
      newGame();
      onLoad?.({});
      onClose?.();
    }
  };

  return (
    <div className="save-load-overlay">
      <div className="save-load-modal">
        {/* Header */}
        <div className="save-load-header">
          <h2>游戏存档</h2>
          <button onClick={onClose} className="save-load-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="save-load-tabs">
          <button
            className={`save-load-tab save-load-tab-load ${activeTab === 'load' ? 'active' : ''}`}
            onClick={() => setActiveTab('load')}
          >
            📂 加载存档
          </button>
          <button
            className={`save-load-tab save-load-tab-save ${activeTab === 'save' ? 'active' : ''}`}
            onClick={() => setActiveTab('save')}
          >
            💾 保存存档
          </button>
        </div>

        {/* Content */}
        <div className="save-load-content">
          {activeTab === 'load' ? (
            <div className="save-load-list">
              {saves.length === 0 ? (
                <div className="save-load-empty">
                  <div className="save-load-empty-icon">📭</div>
                  <p className="save-load-empty-text">暂无存档</p>
                  <p className="save-load-empty-hint">开始游戏后可以保存进度</p>
                </div>
              ) : (
                saves
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((save) => (
                    <div
                      key={save.id}
                      className={`save-item ${selectedSaveId === save.id ? 'selected' : ''}`}
                      onClick={() => setSelectedSaveId(save.id)}
                    >
                      <div className="save-item-header">
                        <div>
                          <div className="save-item-info">
                            <span className="save-item-icon">
                              {save.id.startsWith('auto-') ? '🔄' : '💾'}
                            </span>
                            <span className="save-item-name">
                              {save.data?._saveName || '未命名存档'}
                            </span>
                            {save.id === activeSave?.id && (
                              <span className="save-item-badge">当前</span>
                            )}
                          </div>
                          <p className="save-item-date">
                            {formatSaveDate(save.timestamp)}
                          </p>
                          {save.data?.score !== undefined && (
                            <p className="save-item-score">
                              分数: <span>{save.data.score}</span>
                            </p>
                          )}
                        </div>
                        <div className="save-item-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoad();
                            }}
                            className="save-item-load-btn"
                            disabled={!selectedSaveId}
                          >
                            加载
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(save.id);
                            }}
                            className="save-item-delete-btn"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          ) : (
            <div className="save-form">
              <div>
                <label className="save-form-label">存档名称</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="输入存档名称（可选）"
                  className="save-form-input"
                />
              </div>

              {currentGameState && (
                <div className="game-state-preview">
                  <h4>当前游戏状态</h4>
                  <div className="game-state-stats">
                    {currentGameState.score !== undefined && (
                      <div>
                        <span className="game-state-stat-label">分数:</span>
                        <span className="game-state-stat-value game-state-score">
                          {currentGameState.score}
                        </span>
                      </div>
                    )}
                    {currentGameState.lives !== undefined && (
                      <div>
                        <span className="game-state-stat-label">生命:</span>
                        <span className="game-state-stat-value game-state-lives">
                          {currentGameState.lives}
                        </span>
                      </div>
                    )}
                    {currentGameState.level !== undefined && (
                      <div>
                        <span className="game-state-stat-label">关卡:</span>
                        <span className="game-state-stat-value game-state-level">
                          {currentGameState.level}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="game-state-stat-label">时间:</span>
                      <span className="game-state-stat-value game-state-time">
                        {new Date().toLocaleTimeString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="save-load-buttons">
                <button
                  onClick={handleSave}
                  disabled={!currentGameState}
                  className="btn btn-save"
                >
                  💾 保存存档
                </button>
                <button
                  onClick={handleQuickSave}
                  disabled={!currentGameState}
                  className="btn btn-quick-save"
                >
                  ⚡ 快速保存
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="save-load-footer">
          <div className="footer-buttons">
            <button
              onClick={handleQuickLoad}
              disabled={saves.length === 0}
              className="btn btn-quick-load"
            >
              ⚡ 快速加载
            </button>
            <button
              onClick={handleNewGame}
              className="btn btn-new-game"
            >
              🆕 新游戏
            </button>
            <button
              onClick={onClose}
              className="btn btn-cancel"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveLoadUI;