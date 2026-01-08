import { Scene, Physics } from 'phaser';
import { generateWorld } from './worldGen';
import { BLOCK_Df, TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from './constants';
import { BlockId } from './types';
import { Player } from './Player';
import { useGameStore } from './store'; // Import the store for UI updates

export class MainScene extends Scene {
  private player!: Player;
  private blocks!: Physics.Arcade.StaticGroup;
  
  // Storage for physics bodies & Data
  private blockMap: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private worldData!: BlockId[][];

  // Visuals
  private reticle!: Phaser.GameObjects.Rectangle;
  
  // --- MINING STATE ---
  private isClicking = false;
  private currentMiningTarget: { x: number, y: number } | null = null;
  private miningProgress = 0; // ms accumulated
  
  // How many milliseconds does 1 Hardness equal?
  // Dirt (1) = 800ms, Stone (3) = 2400ms
  private MINING_SPEED_Fb = 800; 
  private MINING_RANGE = 2 * TILE_SIZE; 

  // --- OXYGEN STATE ---
  private oxygen = 100;
  private maxOxygen = 100;
  private OXYGEN_DRAIN_RATE = 5; // Lost per second underwater
  private OXYGEN_REGEN_RATE = 20; // Gained per second on surface
  private SURFACE_Y = 15 * TILE_SIZE; // Depth where surface ends
// SAVE SYSTEM CONSTANTS
  private SAVE_KEY_WORLD = 'spacedigger-world';
  private SAVE_KEY_PLAYER = 'spacedigger-player';
  private autoSaveTimer = 0;
  private AUTOSAVE_INTERVAL = 5000; 

  constructor() {
    super('MainScene');
  }

  preload() {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    
    // Base Block
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, 1, 1);
    graphics.generateTexture('base-block', 1, 1);
    
    // Player
    graphics.generateTexture('player-texture', 1, 1);
  }

  create() {
    // 1. Setup Physics
    this.physics.world.setBounds(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);
    this.blocks = this.physics.add.staticGroup();

    // --- LOAD WORLD LOGIC ---
    const savedWorld = localStorage.getItem(this.SAVE_KEY_WORLD);
    
    if (savedWorld) {
      console.log("Loading saved world...");
      // Parse the JSON string back into an array
      this.worldData = JSON.parse(savedWorld);
    } else {
      console.log("Generating new world...");
      this.worldData = generateWorld();
    }
    
    this.renderWorld();
    // ------------------------

    // --- LOAD PLAYER LOGIC ---
    let spawnX = (WORLD_WIDTH * TILE_SIZE) / 2;
    let spawnY = 10 * TILE_SIZE;

    const savedPlayer = localStorage.getItem(this.SAVE_KEY_PLAYER);
    if (savedPlayer) {
      const parsed = JSON.parse(savedPlayer);
      spawnX = parsed.x;
      spawnY = parsed.y;
    }

    this.player = new Player(this, spawnX, spawnY);
    this.physics.add.collider(this.player, this.blocks);
    // -------------------------

    // ... Camera setup ...
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // ... Reticle & Inputs ...
    this.reticle = this.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE);
    this.reticle.setStrokeStyle(2, 0xffff00);
    this.reticle.setVisible(false);
    this.reticle.setDepth(10);
    
    this.input.on('pointerdown', () => { this.isClicking = true; });
    this.input.on('pointerup', () => { 
      this.isClicking = false; 
      this.resetMiningProgress(); 
    });
  }

  update(time: number, delta: number) {
    this.player.update();
    this.handleOxygen(delta);
    this.handleMining(delta);

    // --- AUTO SAVE TIMER ---
    this.autoSaveTimer += delta;
    if (this.autoSaveTimer > this.AUTOSAVE_INTERVAL) {
      this.saveGame();
      this.autoSaveTimer = 0;
    }
  }

  private saveGame() {
    // 1. Save World Layout (Holes dug)
    localStorage.setItem(this.SAVE_KEY_WORLD, JSON.stringify(this.worldData));

    // 2. Save Player Position
    const playerState = { x: this.player.x, y: this.player.y };
    localStorage.setItem(this.SAVE_KEY_PLAYER, JSON.stringify(playerState));
    
    // Note: Inventory/Money is handled automatically by Zustand!
    console.log("Game Saved!");
  }

  /**
   * Manages Oxygen Drain/Regen and Death
   */
  private handleOxygen(delta: number) {
    const deltaSeconds = delta / 1000;
    const isBelowSurface = this.player.y > this.SURFACE_Y;
    
    // Get Dynamic Max Oxygen
    const { maxOxygen } = this.getStats();
    
    // Update local max property
    this.maxOxygen = maxOxygen;

    // 1. Update Oxygen Value
    if (isBelowSurface) {
      this.oxygen -= this.OXYGEN_DRAIN_RATE * deltaSeconds;
    } else {
      // Regen faster if you have a bigger tank? Optional.
      this.oxygen += this.OXYGEN_REGEN_RATE * deltaSeconds;
    }

    // Clamp
    this.oxygen = Phaser.Math.Clamp(this.oxygen, 0, this.maxOxygen);
    
    // 2. Sync BOTH Current and Max to Store
    // This ensures the HUD (which reads store.maxOxygen) resizes the bar correctly
    const store = useGameStore.getState();
    store.setOxygen(this.oxygen);
    
    // We hackily set maxOxygen on the store directly here to ensure UI sync
    // Ideally this would be an action, but this works for now
    useGameStore.setState({ maxOxygen: this.maxOxygen });

    if (store.isOnSurface === isBelowSurface) { 
        store.setIsOnSurface(!isBelowSurface);
    }

    // 3. Check Death
    if (this.oxygen <= 0) {
      this.handlePassOut();
    }
  }

  private handlePassOut() {
    // 1. Shake Camera (Visual feedback)
    this.cameras.main.shake(500, 0.01);

    // 2. Respawn at Surface
    this.player.setPosition((WORLD_WIDTH * TILE_SIZE) / 2, 10 * TILE_SIZE);
    this.player.setVelocity(0, 0);

    // 3. PUNISHMENT: Lose 70% of items
    useGameStore.getState().loseInventory(0.7);

    // 4. Reset Stats
    this.oxygen = this.maxOxygen;
    this.isClicking = false;
    this.resetMiningProgress();
  }

  private getStats() {
    // Read directly from the store without hooks (getState)
    const upgrades = useGameStore.getState().upgrades;
    
    // 1. SPEED CALCULATION
    // Base: 800ms per hardness.
    // Formula: Base / (1 + (Level * 0.5)) -> Higher level = Lower time (Faster)
    const baseSpeed = 800;
    const speed = baseSpeed / (1 + ((upgrades.speed - 1) * 0.5));

    // 2. RANGE CALCULATION
    // Base: 2 Blocks (64px).
    // Formula: Base + (Level * 1 Block) -> Higher level = Further reach
    const baseRange = 2 * TILE_SIZE;
    const range = baseRange + ((upgrades.range - 1) * TILE_SIZE);
    const maxOxygen = 100 + ((upgrades.tank - 1) * 50);

    return { speed, range, maxOxygen };
  }

 

  /**
   * Manages Raycasting and Block Damage
   */
  private handleMining(delta: number) {
    // 1. Get current Range from upgrades
    const { range } = this.getStats();

    // 2. Pass dynamic range to raycast
    const newTarget = this.getRaycastTarget(range);

    // 3. Check if we switched targets (or looked at nothing)
    if (!this.targetsMatch(newTarget, this.currentMiningTarget)) {
      this.resetMiningProgress();
      this.currentMiningTarget = newTarget;
    }

    if (this.currentMiningTarget) {
      // Show Reticle
      this.reticle.setVisible(true);
      this.reticle.setPosition(
        this.currentMiningTarget.x * TILE_SIZE + (TILE_SIZE / 2), 
        this.currentMiningTarget.y * TILE_SIZE + (TILE_SIZE / 2)
      );

      // Handle Mining
      if (this.isClicking) {
        this.processMining(this.currentMiningTarget.x, this.currentMiningTarget.y, delta);
      } else {
        this.resetMiningProgress();
      }
    } else {
      this.reticle.setVisible(false);
    }
  }

  /**
   * Main Logic loop for damaging a block
   */
  private processMining(x: number, y: number, delta: number) {
    const blockId = this.worldData[y][x];
    const def = BLOCK_Df[blockId];
    const key = `${x}_${y}`;
    const sprite = this.blockMap.get(key);

    if (!sprite) return;

    // 1. Get current Speed from upgrades
    const { speed } = this.getStats();

    // 2. Calculate Time Required using dynamic speed
    const timeToMine = def.hardness * speed;

    // 3. Add time
    this.miningProgress += delta;

    // 4. Calculate Damage Percentage (0.0 to 1.0)
    const damagePct = Math.min(1, this.miningProgress / timeToMine);

    // 5. Update Color (Interpolate original color towards Black)
    const originalColor = Phaser.Display.Color.ValueToColor(def.color);
    const black = Phaser.Display.Color.ValueToColor(0x000000);
    
    const darkenedColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      originalColor,
      black,
      100,
      damagePct * 100 
    );

    const colorInt = Phaser.Display.Color.GetColor(darkenedColor.r, darkenedColor.g, darkenedColor.b);
    sprite.setTint(colorInt);

    // 6. Check Destruction
    if (this.miningProgress >= timeToMine) {
      this.mineBlock(x, y);
      this.resetMiningProgress();
    }
  }

  /**
   * UPDATED: Now accepts 'range' as a parameter
   */
  /**
   * UPDATED: Now accepts 'range' as a parameter to support upgrades
   */
  private getRaycastTarget(range: number): { x: number, y: number } | null {
    const pointer = this.input.activePointer;
    const worldMouseX = pointer.worldX;
    const worldMouseY = pointer.worldY;
    const startX = this.player.x;
    const startY = this.player.y;
    
    // We removed 'const range = this.MINING_RANGE;' 
    // We now use the 'range' argument passed into the function.
    const stepSize = TILE_SIZE / 2;

    const angle = Phaser.Math.Angle.Between(startX, startY, worldMouseX, worldMouseY);
    
    let currentDist = 0;
    while (currentDist < range) {
      currentDist += stepSize;
      const checkX = startX + Math.cos(angle) * currentDist;
      const checkY = startY + Math.sin(angle) * currentDist;

      const gridX = Math.floor(checkX / TILE_SIZE);
      const gridY = Math.floor(checkY / TILE_SIZE);

      if (gridX < 0 || gridX >= WORLD_WIDTH || gridY < 0 || gridY >= WORLD_HEIGHT) {
        return null;
      }

      const blockId = this.worldData[gridY][gridX];
      if (blockId !== BlockId.EMPTY) {
        return { x: gridX, y: gridY };
      }
    }
    return null;
  }

  private resetMiningProgress() {
    if (this.currentMiningTarget) {
      const { x, y } = this.currentMiningTarget;
      const key = `${x}_${y}`;
      const sprite = this.blockMap.get(key);
      
      if (sprite) {
        const blockId = this.worldData[y][x];
        if (blockId !== BlockId.EMPTY) {
           sprite.setTint(BLOCK_Df[blockId].color);
        }
      }
    }
    this.miningProgress = 0;
  }

  // Helper to compare two {x,y} objects
  private targetsMatch(a: {x:number, y:number} | null, b: {x:number, y:number} | null) {
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;
    return a.x === b.x && a.y === b.y;
  }

  

  private mineBlock(x: number, y: number) {
    const key = `${x}_${y}`;
    const blockSprite = this.blockMap.get(key);

    if (blockSprite) {
      // 1. Get the Block ID
      const blockId = this.worldData[y][x];

      // 2. ADD TO REACT INVENTORY
      // This connects the game logic to your UI Sidebar
      useGameStore.getState().addToInventory(blockId, 1);

      // 3. Destroy Game Object
      blockSprite.destroy();
      this.blockMap.delete(key);
      this.worldData[y][x] = BlockId.EMPTY;
    }
  }

  private renderWorld() {
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        const blockId = this.worldData[y][x];
        
        if (blockId === BlockId.EMPTY) continue;

        const blockDef = BLOCK_Df[blockId];
        
        const block = this.blocks.create(
          x * TILE_SIZE + (TILE_SIZE / 2), 
          y * TILE_SIZE + (TILE_SIZE / 2), 
          'base-block'
        ) as Phaser.Physics.Arcade.Sprite;

        block.setDisplaySize(TILE_SIZE, TILE_SIZE);
        block.setTint(blockDef.color);
        block.refreshBody();

        this.blockMap.set(`${x}_${y}`, block as unknown as Phaser.GameObjects.Sprite);
      }
    }
  }
}