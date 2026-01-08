// src/game/worldGen.ts
import { WORLD_WIDTH, WORLD_HEIGHT } from './constants';
import { BlockId } from './types';

/**
 * Generates the game world as a 2D array of BlockIds.
 * Access: world[y][x]
 */
export function generateWorld(): BlockId[][] {
  const world: BlockId[][] = [];

  for (let y = 0; y < WORLD_HEIGHT; y++) {
    const row: BlockId[] = [];

    for (let x = 0; x < WORLD_WIDTH; x++) {
      
      // 1. SKY ZONE (Layers 0-14)
      // This ensures the player spawns in empty space and falls down.
      if (y < 15) {
        row.push(BlockId.EMPTY);
        continue;
      }

      // 2. SURFACE LAYER (Layer 15)
      // A flat landing pad for the player.
      if (y === 15) {
        row.push(BlockId.DIRT);
        continue;
      }

      // 3. BEDROCK FLOOR (Bottom layer)
      if (y === WORLD_HEIGHT - 1) {
        row.push(BlockId.BEDROCK);
        continue;
      }

      // 4. CHECK FOR ORES (Probability Logic)
      const mineral = getMineralForDepth(y);
      if (mineral !== null) {
        row.push(mineral);
        continue;
      }

      // 5. GRADIENT SOIL LOGIC (Dirt vs Stone)
      // Transition starts at depth 20 (below surface).
      // By depth 120, it is 100% Stone.
      const stoneThreshold = Math.min(1, Math.max(0, (y - 20) / 100));
      
      if (Math.random() < stoneThreshold) {
        row.push(BlockId.STONE);
      } else {
        row.push(BlockId.DIRT);
      }
    }
    world.push(row);
  }

  return world;
}

/**
 * Calculates ore spawn probability based on depth (y).
 * Returns BlockId if spawned, null if nothing spawned.
 */
function getMineralForDepth(y: number): BlockId | null {
  const roll = Math.random(); // 0.0 to 1.0

  // --- RARE ORES (Check these first!) ---

  // Unobtanium: Starts at 0%, becomes possible deep down
  // Logic: 0.0000001 base + tiny increase per layer
  const unobtaniumChance = 0.0000001 + (y * 0.00005);
  if (Math.random() < unobtaniumChance) return BlockId.UNOBTANIUM;

  // Diamond: Starts rare (0.001%), increases with depth
  const diamondChance = 0.00001 + (y * 0.0001);
  if (Math.random() < diamondChance) return BlockId.DIAMOND;

  // Gold: Uncommon
  const goldChance = 0.0001 + (y * 0.0002);
  if (Math.random() < goldChance) return BlockId.GOLD;

  // --- COMMON ORES ---

  // Iron: Becomes more common deeper you go
  const ironChance = 0.001 + (y * 0.0005);
  if (Math.random() < ironChance) return BlockId.IRON;

  // Coal: Common near surface, spawn rate reduces slightly or stays flat
  // Logic: Starts at 5%, drops slowly as you go deeper
  const coalChance = Math.max(0, 0.05 - (y * 0.0001));
  if (roll < coalChance) return BlockId.COAL;

  return null;
}