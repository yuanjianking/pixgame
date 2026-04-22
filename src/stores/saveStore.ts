import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameSave, GameType } from '../types/game.types';

interface SaveStore {
  // All game saves
  saves: GameSave[];

  // Current active save for each game type
  activeSaves: Record<GameType, string | null>;

  // Actions
  addSave: (save: GameSave) => void;
  updateSave: (id: string, data: Partial<GameSave>) => void;
  deleteSave: (id: string) => void;
  loadSave: (id: string) => GameSave | null;
  setActiveSave: (gameType: GameType, saveId: string | null) => void;
  clearAllSaves: () => void;
  clearGameSaves: (gameType: GameType) => void;

  // Utilities
  getGameSaves: (gameType: GameType) => GameSave[];
  getActiveSave: (gameType: GameType) => GameSave | null;
}

export const useSaveStore = create<SaveStore>()(
  persist(
    (set, get) => ({
      saves: [],
      activeSaves: {
        'brick-breaker': null,
      },

      addSave: (save) => {
        set((state) => ({
          saves: [...state.saves, save],
          activeSaves: {
            ...state.activeSaves,
            [save.gameType]: save.id,
          },
        }));
      },

      updateSave: (id, data) => {
        set((state) => ({
          saves: state.saves.map((save) =>
            save.id === id ? { ...save, ...data } : save
          ),
        }));
      },

      deleteSave: (id) => {
        set((state) => {
          const save = state.saves.find((s) => s.id === id);
          const newSaves = state.saves.filter((s) => s.id !== id);

          // If deleting active save, clear active save for that game
          let newActiveSaves = { ...state.activeSaves };
          if (save && state.activeSaves[save.gameType] === id) {
            newActiveSaves = {
              ...newActiveSaves,
              [save.gameType]: null,
            };
          }

          return {
            saves: newSaves,
            activeSaves: newActiveSaves,
          };
        });
      },

      loadSave: (id) => {
        return get().saves.find((save) => save.id === id) || null;
      },

      setActiveSave: (gameType, saveId) => {
        set((state) => ({
          activeSaves: {
            ...state.activeSaves,
            [gameType]: saveId,
          },
        }));
      },

      clearAllSaves: () => {
        set({
          saves: [],
          activeSaves: {
            'brick-breaker': null,
          },
        });
      },

      clearGameSaves: (gameType) => {
        set((state) => ({
          saves: state.saves.filter((save) => save.gameType !== gameType),
          activeSaves: {
            ...state.activeSaves,
            [gameType]: null,
          },
        }));
      },

      getGameSaves: (gameType) => {
        return get().saves.filter((save) => save.gameType === gameType);
      },

      getActiveSave: (gameType) => {
        const saveId = get().activeSaves[gameType];
        if (!saveId) return null;
        return get().saves.find((save) => save.id === saveId) || null;
      },
    }),
    {
      name: 'pixgame-saves', // localStorage key
      version: 1, // schema version for migrations
    }
  )
);

// Utility functions
export const createSave = (
  gameType: GameType,
  data: any,
  screenshot?: string
): GameSave => {
  return {
    id: `${gameType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    gameType,
    timestamp: Date.now(),
    data,
    screenshot,
  };
};

export const formatSaveDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};