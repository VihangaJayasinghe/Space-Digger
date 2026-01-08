// src/game/constants.ts
import { BlockId, BlockDefinition } from './types';

export const WORLD_WIDTH = 20;   // Columns
export const WORLD_HEIGHT = 200; // Rows
export const TILE_SIZE = 32;     // Pixels

// A dictionary mapping IDs to their stats
export const BLOCK_Df: Record<BlockId, BlockDefinition> = {
  [BlockId.EMPTY]: { 
    id: BlockId.EMPTY, name: "Empty", color: 0x000000, hardness: 0 
  },
  [BlockId.DIRT]: { 
    id: BlockId.DIRT, name: "Dirt", color: 0x8B4513, hardness: 1 
  },
  [BlockId.STONE]: { 
    id: BlockId.STONE, name: "Stone", color: 0x808080, hardness: 3 
  },
  [BlockId.BEDROCK]: { 
    id: BlockId.BEDROCK, name: "Bedrock", color: 0x000000, hardness: 9999 
  },
  [BlockId.COAL]: { 
    id: BlockId.COAL, name: "Coal", color: 0x333333, hardness: 2, value: 5 
  },
  [BlockId.IRON]: { 
    id: BlockId.IRON, name: "Iron", color: 0xA9A9A9, hardness: 4, value: 15 
  },
  [BlockId.GOLD]: { 
    id: BlockId.GOLD, name: "Gold", color: 0xFFD700, hardness: 6, value: 50 
  },
  [BlockId.DIAMOND]: { 
    id: BlockId.DIAMOND, name: "Diamond", color: 0x00FFFF, hardness: 10, value: 200 
  },
  [BlockId.UNOBTANIUM]: { 
    id: BlockId.UNOBTANIUM, name: "Unobtanium", color: 0xFF00FF, hardness: 25, value: 1000 
  }
};