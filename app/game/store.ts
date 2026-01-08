import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BlockId } from './types';
import { BLOCK_Df } from './constants';

export type UpgradeType = 'speed' | 'range' | 'tank' | 'lights';

interface PlayerStats {
  totalBlocksMined: number;
  blocksMined: Record<string, number>;
  totalEarnings: number;
  maxDepth: number;
  deathCount: number; // <--- 1. NEW STAT
}

interface GameState {
  // Resources
  money: number;
  inventory: Record<string, number>;
  oxygen: number;
  maxOxygen: number;
  isOnSurface: boolean;
  
  // Upgrades
  upgrades: Record<UpgradeType, number>;
  
  // Stats
  stats: PlayerStats;

  // Actions
  addToInventory: (blockId: BlockId, amount: number) => void;
  sellItems: () => void;
  loseInventory: (percentage: number) => void;
  setOxygen: (amount: number) => void;
  setIsOnSurface: (isSurface: boolean) => void;
  buyUpgrade: (type: UpgradeType) => void;
  updateMaxDepth: (depth: number) => void;
  incrementDeath: () => void; // <--- 2. NEW ACTION
  resetSave: () => void;
}

export const getUpgradeCost = (type: UpgradeType, currentLevel: number) => {
  const baseCosts = { speed: 100, range: 300, tank: 150, lights: 200 };
  const multiplier = 2.5;
  return Math.floor(baseCosts[type] * Math.pow(multiplier, currentLevel - 1));
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      money: 0,
      inventory: {},
      oxygen: 100,
      maxOxygen: 100,
      isOnSurface: true,
      
      upgrades: { speed: 1, range: 1, tank: 1, lights: 1 },

      stats: {
        totalBlocksMined: 0,
        blocksMined: {},
        totalEarnings: 0,
        maxDepth: 0,
        deathCount: 0, // <--- 3. INITIALIZE
      },

      addToInventory: (blockId, amount) => set((state) => {
        const newInventory = { ...state.inventory };
        newInventory[blockId] = (newInventory[blockId] || 0) + amount;

        const newStats = { ...state.stats };
        newStats.totalBlocksMined += amount;
        newStats.blocksMined[blockId] = (newStats.blocksMined[blockId] || 0) + amount;

        return { inventory: newInventory, stats: newStats };
      }),

      sellItems: () => set((state) => {
        let revenue = 0;
        Object.entries(state.inventory).forEach(([blockId, count]) => {
          const value = BLOCK_Df[blockId as unknown as BlockId]?.value || 0;
          revenue += value * count;
        });

        return {
          money: state.money + revenue,
          inventory: {},
          stats: {
            ...state.stats,
            totalEarnings: state.stats.totalEarnings + revenue
          }
        };
      }),

      loseInventory: (percentage) => set((state) => {
        const newInv: Record<string, number> = {};
        Object.entries(state.inventory).forEach(([id, count]) => {
          newInv[id] = Math.floor(count * (1 - percentage));
        });
        return { inventory: newInv };
      }),

      setOxygen: (val) => set({ oxygen: val }),
      setIsOnSurface: (val) => set({ isOnSurface: val }),

      buyUpgrade: (type) => set((state) => {
        const level = state.upgrades[type] || 1;
        const cost = getUpgradeCost(type, level);
        if (state.money >= cost) {
          return {
            money: state.money - cost,
            upgrades: { ...state.upgrades, [type]: level + 1 }
          };
        }
        return {};
      }),

      updateMaxDepth: (depth) => set((state) => {
        if (depth > state.stats.maxDepth) {
          return { stats: { ...state.stats, maxDepth: depth } };
        }
        return {};
      }),

      // <--- 4. IMPLEMENT NEW ACTION
      incrementDeath: () => set((state) => ({
        stats: { ...state.stats, deathCount: state.stats.deathCount + 1 }
      })),

      resetSave: () => {
        localStorage.removeItem('spacedigger-world');
        localStorage.removeItem('spacedigger-player');
        set({
          money: 0, inventory: {}, upgrades: { speed: 1, range: 1, tank: 1, lights: 1 },
          stats: { totalBlocksMined: 0, blocksMined: {}, totalEarnings: 0, maxDepth: 0, deathCount: 0 }
        });
        window.location.reload();
      }
    }),
    { name: 'spacedigger-storage' }
  )
);