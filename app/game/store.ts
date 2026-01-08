import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BlockId } from './types';
import { BLOCK_Df } from './constants';
import { supabase } from '../lib/supabase';

export type UpgradeType = 'speed' | 'range' | 'tank' | 'lights';

interface PlayerStats {
  totalBlocksMined: number;
  blocksMined: Record<string, number>;
  totalEarnings: number;
  maxDepth: number;
  deathCount: number;
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

  // Auth & Cloud
  user: any | null;
  setUser: (user: any) => void;
  
  // Cloud Data Transfer (Holds loaded data for MainScene)
  loadedWorldData: BlockId[][] | null;
  loadedPlayerPos: { x: number, y: number } | null;
  clearLoadedData: () => void;

  // Cloud Actions (SPLIT SAVING)
  loadFromCloud: () => Promise<void>;
  saveStatsToCloud: () => Promise<void>; // Saves only lightweight data
  saveWorldToCloud: (world: BlockId[][], pos: {x: number, y: number}) => Promise<void>; // Saves heavy map data
  
  // Legacy single save (optional fallback)
  saveToCloud: (worldData?: BlockId[][], playerPos?: {x: number, y: number}) => Promise<void>;

  // Game Actions
  addToInventory: (blockId: BlockId, amount: number) => void;
  sellItems: () => void;
  loseInventory: (percentage: number) => void;
  setOxygen: (amount: number) => void;
  setIsOnSurface: (isSurface: boolean) => void;
  buyUpgrade: (type: UpgradeType) => void;
  updateMaxDepth: (depth: number) => void;
  incrementDeath: () => void;
  resetSave: () => void;
}

export const getUpgradeCost = (type: UpgradeType, currentLevel: number) => {
  const baseCosts = { speed: 50, range: 300, tank: 50, lights: 200 };
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
        deathCount: 0,
      },

      user: null,
      setUser: (user) => set({ user }),
      
      loadedWorldData: null,
      loadedPlayerPos: null,
      clearLoadedData: () => set({ loadedWorldData: null, loadedPlayerPos: null }),

      // --- 1. SAVE STATS (Lightweight, frequent) ---
      saveStatsToCloud: async () => {
        const state = get();
        if (!state.user) return;

        const statsData = {
          money: state.money,
          inventory: state.inventory,
          oxygen: state.oxygen,
          upgrades: state.upgrades,
          isOnSurface: state.isOnSurface,
          stats: state.stats 
        };

        const { error } = await supabase.from('profiles').update({ 
            game_data: statsData, // Save to 'game_data' column
            updated_at: new Date()
        }).eq('id', state.user.id);

        if (error) console.error("Stats Save Error:", error.message);
      },

      // --- 2. SAVE WORLD (Heavy, infrequent) ---
      saveWorldToCloud: async (world, pos) => {
        const state = get();
        if (!state.user) return;

        const worldPackage = { map: world, player: pos };

        const { error } = await supabase.from('profiles').update({ 
            world_dump: worldPackage, // Save to 'world_dump' column
            updated_at: new Date()
        }).eq('id', state.user.id);

        if (error) console.error("World Save Error:", error.message);
        else console.log("World Cloud Save Successful");
      },

      // --- 3. LEGACY/FALLBACK SAVE ---
      saveToCloud: async (worldData, playerPos) => {
          if (worldData && playerPos) {
              await get().saveWorldToCloud(worldData, playerPos);
          }
          await get().saveStatsToCloud();
      },

      // --- 4. LOAD (Gets both columns) ---
      loadFromCloud: async () => {
        const state = get();
        if (!state.user) return;

        console.log("Attempting to load data from Cloud...");

        const { data, error } = await supabase
          .from('profiles')
          .select('game_data, world_dump, max_depth, total_earnings, death_count')
          .eq('id', state.user.id)
          .single();

        if (error) {
            console.error("Cloud Load Error:", error.message);
            return;
        }

        if (data) {
          console.log("Cloud Found Profile. Stats:", !!data.game_data, "Map:", !!data.world_dump);

          // A. Load Stats
          if (data.game_data) {
             set({
               money: data.game_data.money ?? state.money,
               inventory: data.game_data.inventory ?? {},
               upgrades: data.game_data.upgrades ?? state.upgrades,
               stats: {
                 ...state.stats,
                 ...data.game_data.stats,
                 maxDepth: data.max_depth ?? state.stats.maxDepth,
                 totalEarnings: data.total_earnings ?? state.stats.totalEarnings,
                 deathCount: data.death_count ?? state.stats.deathCount,
               }
             });
          }

          // B. Load World
          if (data.world_dump && data.world_dump.map && data.world_dump.map.length > 0) {
             console.log("Map Data Successfully Loaded into Store");
             set({
               loadedWorldData: data.world_dump.map,
               loadedPlayerPos: data.world_dump.player
             });
          } else {
             console.warn("Cloud has no map data. Generating new world.");
          }
        }
      },

      // --- GAME ACTIONS ---
      addToInventory: (blockId, amount) => set((state) => {
        const newInventory = { ...state.inventory };
        newInventory[blockId] = (newInventory[blockId] || 0) + amount;

        const newStats = { ...state.stats };
        newStats.totalBlocksMined += amount;
        newStats.blocksMined[blockId] = (newStats.blocksMined[blockId] || 0) + amount;

        return { inventory: newInventory, stats: newStats };
      }),

      sellItems: () => {
        set((state) => {
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
        });
        get().saveStatsToCloud(); 
      },

      loseInventory: (percentage) => set((state) => {
        const newInv: Record<string, number> = {};
        Object.entries(state.inventory).forEach(([id, count]) => {
          newInv[id] = Math.floor(count * (1 - percentage));
        });
        return { inventory: newInv };
      }),

      setOxygen: (val) => set({ oxygen: val }),
      setIsOnSurface: (val) => set({ isOnSurface: val }),

      buyUpgrade: (type) => {
        set((state) => {
          const level = state.upgrades[type] || 1;
          const cost = getUpgradeCost(type, level);
          if (state.money >= cost) {
            return {
              money: state.money - cost,
              upgrades: { ...state.upgrades, [type]: level + 1 }
            };
          }
          return {};
        });
        get().saveStatsToCloud();
      },

      updateMaxDepth: (depth) => {
        set((state) => {
          if (depth > state.stats.maxDepth) {
            return { stats: { ...state.stats, maxDepth: depth } };
          }
          return {};
        });
      },

      incrementDeath: () => {
        set((state) => ({
          stats: { ...state.stats, deathCount: state.stats.deathCount + 1 }
        }));
        get().saveStatsToCloud();
      },

      resetSave: () => {
        localStorage.clear();
        window.location.reload();
      }
    }),
    { 
      name: 'spacedigger-storage',
      // NEW: IMPORTANT! Prevents "loadedWorldData" from saving to localStorage.
      // This stops the map from getting stuck in memory and clashing on reload.
      partialize: (state) => ({
        money: state.money,
        inventory: state.inventory,
        oxygen: state.oxygen,
        maxOxygen: state.maxOxygen,
        isOnSurface: state.isOnSurface,
        upgrades: state.upgrades,
        stats: state.stats,
        user: state.user,
      }),
    }
  )
);