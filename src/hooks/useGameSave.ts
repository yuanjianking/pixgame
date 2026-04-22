import { useCallback, useEffect, useRef } from 'react';
import { useSaveStore, createSave } from '../stores/saveStore';
import type { GameType } from '../types/game.types';

interface UseGameSaveOptions {
  gameType: GameType;
  autoSaveInterval?: number; // milliseconds, 0 to disable
  maxAutoSaves?: number;
}

export const useGameSave = ({
  gameType,
  autoSaveInterval = 30000, // 30 seconds
  maxAutoSaves = 10,
}: UseGameSaveOptions) => {
  const {
    saves,
    addSave,
    updateSave,
    deleteSave,
    loadSave,
    setActiveSave,
    getGameSaves,
    getActiveSave,
  } = useSaveStore();

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get all saves for this game
  const gameSaves = getGameSaves(gameType);

  // Get active save for this game
  const activeSave = getActiveSave(gameType);

  // Manual save function
  const saveGame = useCallback(
    (data: any, screenshot?: string) => {
      const save = createSave(gameType, data, screenshot);
      addSave(save);
      return save;
    },
    [gameType, addSave]
  );

  // Update existing save
  const updateGameSave = useCallback(
    (saveId: string, data: Partial<any>) => {
      updateSave(saveId, { data: { ...activeSave?.data, ...data } });
    },
    [updateSave, activeSave]
  );

  // Load specific save
  const loadGame = useCallback(
    (saveId: string) => {
      const save = loadSave(saveId);
      if (save) {
        setActiveSave(gameType, saveId);
        return save.data;
      }
      return null;
    },
    [loadSave, setActiveSave, gameType]
  );

  // Delete save
  const deleteGameSave = useCallback(
    (saveId: string) => {
      deleteSave(saveId);
    },
    [deleteSave]
  );

  // New game (clear active save)
  const newGame = useCallback(() => {
    setActiveSave(gameType, null);
  }, [setActiveSave, gameType]);

  // Auto-save functionality
  const setupAutoSave = useCallback(
    (getGameState: () => any) => {
      if (autoSaveInterval <= 0) return;

      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setInterval(() => {
        const gameState = getGameState();
        if (gameState) {
          // Create auto-save with special prefix
          const autoSave = createSave(gameType, gameState);
          addSave(autoSave);

          // Limit number of auto-saves
          const autoSaves = gameSaves.filter((s) => s.id.startsWith('auto-'));
          if (autoSaves.length > maxAutoSaves) {
            // Delete oldest auto-save
            const oldest = autoSaves.sort((a, b) => a.timestamp - b.timestamp)[0];
            if (oldest) deleteSave(oldest.id);
          }
        }
      }, autoSaveInterval);
    },
    [autoSaveInterval, gameType, addSave, deleteSave, gameSaves, maxAutoSaves]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Quick save (manual trigger)
  const quickSave = useCallback(
    (gameState: any) => {
      const save = saveGame(gameState);
      return save.id;
    },
    [saveGame]
  );

  // Quick load (load latest save)
  const quickLoad = useCallback(() => {
    if (gameSaves.length === 0) return null;

    const latestSave = gameSaves.sort((a, b) => b.timestamp - a.timestamp)[0];
    if (latestSave) {
      setActiveSave(gameType, latestSave.id);
      return latestSave.data;
    }
    return null;
  }, [gameSaves, setActiveSave, gameType]);

  return {
    // State
    saves: gameSaves,
    activeSave,
    hasSaves: gameSaves.length > 0,

    // Actions
    saveGame,
    updateGameSave,
    loadGame,
    deleteGameSave,
    newGame,
    quickSave,
    quickLoad,

    // Auto-save
    setupAutoSave,

    // Utilities
    getLatestSave: () => {
      if (gameSaves.length === 0) return null;
      return gameSaves.sort((a, b) => b.timestamp - a.timestamp)[0];
    },

    getSaveById: (saveId: string) => {
      return gameSaves.find((save) => save.id === saveId) || null;
    },

    // Clear all saves for this game
    clearAllSaves: () => {
      gameSaves.forEach((save) => deleteSave(save.id));
    },
  };
};

export type UseGameSaveReturn = ReturnType<typeof useGameSave>;