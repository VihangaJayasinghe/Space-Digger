// src/game/types.ts

// Enum makes code readable. Instead of typing '1', you type BlockId.DIRT
export enum BlockId {
  EMPTY = 0,
  DIRT = 1,
  STONE = 2,
  BEDROCK = 99,
  
  // Minerals
  COAL = 10,
  IRON = 11,
  GOLD = 12,
  DIAMOND = 13,
  UNOBTANIUM = 14
}

// What properties does every block have?
export interface BlockDefinition {
  id: BlockId;
  name: string;
  color: number; // Hex color for Phaser (e.g., 0xffffff)
  hardness: number; // How long to mine
  value?: number; // Selling price (optional, as Dirt has no value)
}