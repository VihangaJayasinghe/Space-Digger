import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BlockId } from './types';
import { BLOCK_Df } from './constants'; 

type Inventory = Partial<Record<BlockId, number>>;

// 1. ADD 'lights' to UpgradeType
export type UpgradeType = 'speed' | 'range' | 'tank' | 'lights';

interface GameState {
  oxygen: number;
  maxOxygen: number;
  money: number;
  isOnSurface: boolean;
  inventory: Inventory;
  
  // 2. ADD 'lights' to upgrades state
  upgrades: {
    speed: number;
    range: number;
    tank: number;
    lights: number;
  };

  setOxygen: (v: number) => void;
  setIsOnSurface: (v: boolean) => void;
  addToInventory: (id: BlockId, amount?: number) => void;
  sellItems: () => void;
  loseInventory: (percentage: number) => void;
  resetSave: () => void;
  buyUpgrade: (type: UpgradeType) => void;
}

// 3. DEFINE COST for Lights
export const getUpgradeCost = (type: UpgradeType, currentLevel: number) => {
  let basePrice = 50; 
  if (type === 'range') basePrice = 100;
  if (type === 'tank') basePrice = 75;
  if (type === 'lights') basePrice = 60; // Base cost for lights

  const safeLevel = (currentLevel && !isNaN(currentLevel)) ? currentLevel : 1;
  return Math.floor(basePrice * Math.pow(1.5, safeLevel - 1));
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      oxygen: 100,
      maxOxygen: 100,
      money: 0,
      isOnSurface: true,
      inventory: {},
      
      // 4. INITIALIZE 'lights: 1'
      upgrades: { speed: 1, range: 1, tank: 1, lights: 1 },

      // ... (Keep existing setters/actions exactly as they were) ...
      setOxygen: (val) => set({ oxygen: val }),
      setIsOnSurface: (val) => set({ isOnSurface: val }),
      addToInventory: (id, amount = 1) => set((state) => {
        const currentCount = state.inventory[id] || 0;
        return { inventory: { ...state.inventory, [id]: currentCount + amount } };
      }),
      sellItems: () => set((state) => {
        let totalValue = 0;
        Object.entries(state.inventory).forEach(([idString, count]) => {
          const id = Number(idString) as BlockId;
          const def = BLOCK_Df[id];
          if (def && def.value) totalValue += def.value * (count || 0);
        });
        return { money: state.money + totalValue, inventory: {} };
      }),
      loseInventory: (percentage) => set((state) => {
        const newInventory: Inventory = {};
        const keepFactor = 1 - percentage; 
        Object.entries(state.inventory).forEach(([idString, count]) => {
          const id = Number(idString) as BlockId;
          const kept = Math.floor((count || 0) * keepFactor);
          if (kept > 0) newInventory[id] = kept;
        });
        return { inventory: newInventory };
      }),

      resetSave: () => {
        console.log("HARD RESET INITIATED");
        set({
            money: 0,
            oxygen: 100,
            inventory: {},
            upgrades: { speed: 1, range: 1, tank: 1, lights: 1 }
        });
        localStorage.clear();
        setTimeout(() => { window.location.reload(); }, 100);
      },

      buyUpgrade: (type) => set((state) => {
        const currentLevel = state.upgrades[type] || 1;
        const cost = getUpgradeCost(type, currentLevel);

        if (state.money >= cost) {
          return {
            money: state.money - cost,
            upgrades: {
              ...state.upgrades,
              [type]: currentLevel + 1
            }
          };
        }
        return {};
      }),
    }),
    {
      name: 'spacedigger-storage',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState: any, currentState: GameState) => {
        return {
          ...currentState,
          ...persistedState,
          upgrades: {
            ...currentState.upgrades, 
            ...(persistedState.upgrades || {}),
          },
        };
      },
    }
  )
);