import { Scene, Physics } from 'phaser';
import { generateWorld } from './worldGen';
import { BLOCK_Df, TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from './constants';
import { BlockId } from './types';
import { Player } from './Player';
import { useGameStore } from './store'; 

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
  private miningProgress = 0; 
  private MINING_SPEED_Fb = 800; 
  private MINING_RANGE = 2 * TILE_SIZE; 

  // --- OXYGEN STATE ---
  private oxygen = 100;
  private maxOxygen = 100;
  private OXYGEN_DRAIN_RATE = 5; 
  private OXYGEN_REGEN_RATE = 20; 
  private SURFACE_Y = 15 * TILE_SIZE; 

  // --- SHADOW / FOG OF WAR STATE ---
  private darkness!: Phaser.GameObjects.RenderTexture; 
  private lightBrush!: Phaser.GameObjects.Image;       

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

    // --- GENERATE LIGHT BRUSH TEXTURE (GRADIENT) ---
    const texture = this.textures.createCanvas('light-brush', 200, 200);
    
    // FIX: Check if texture exists before using it
    if (texture) {
      const ctx = texture.getContext();
      const grd = ctx.createRadialGradient(100, 100, 0, 100, 100, 100);
      
      grd.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 200, 200);
      
      texture.refresh();
    }
  }

  create() {
    // 1. Setup Physics
    this.physics.world.setBounds(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);
    this.blocks = this.physics.add.staticGroup();

    // --- LOAD WORLD LOGIC ---
    const savedWorld = localStorage.getItem(this.SAVE_KEY_WORLD);
    
    if (savedWorld) {
      console.log("Loading saved world...");
      this.worldData = JSON.parse(savedWorld);
    } else {
      console.log("Generating new world...");
      this.worldData = generateWorld();
    }
    
    this.renderWorld();
    
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

    // ... Camera setup ...
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // --- SETUP SHADOWS (FOG) ---
    // 1. Create Brush Image (Hidden)
    this.lightBrush = this.add.image(0, 0, 'light-brush');
    this.lightBrush.setVisible(false);

    // 2. Create Darkness Layer
    const size = Math.max(this.scale.width, this.scale.height) * 2;

    this.darkness = this.add.renderTexture(spawnX, spawnY, size, size);
    this.darkness.setOrigin(0.5, 0.5); 
    this.darkness.setScrollFactor(1); 
    this.darkness.setDepth(100);     
    this.darkness.setAlpha(0.98);    

    // ... Reticle & Inputs ...
    this.reticle = this.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE);
    this.reticle.setStrokeStyle(2, 0xffff00);
    this.reticle.setVisible(false);
    this.reticle.setDepth(101);
    
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
    
    // --- UPDATE SHADOWS ---
    this.updateFog();

    // --- AUTO SAVE TIMER ---
    this.autoSaveTimer += delta;
    if (this.autoSaveTimer > this.AUTOSAVE_INTERVAL) {
      this.saveGame();
      this.autoSaveTimer = 0;
    }
  }

  // --- SHADOW LOGIC ---
  private updateFog() {
    this.darkness.setPosition(this.player.x, this.player.y);
    this.darkness.fill(0x000000);

    const { visibilityRadius } = this.getStats();
    
    const scale = visibilityRadius / 100;
    this.lightBrush.setScale(scale);

    this.darkness.erase(this.lightBrush, this.darkness.width / 2, this.darkness.height / 2);
  }

  private saveGame() {
    localStorage.setItem(this.SAVE_KEY_WORLD, JSON.stringify(this.worldData));
    const playerState = { x: this.player.x, y: this.player.y };
    localStorage.setItem(this.SAVE_KEY_PLAYER, JSON.stringify(playerState));
    console.log("Game Saved!");
  }

  private handleOxygen(delta: number) {
    const deltaSeconds = delta / 1000;
    const isBelowSurface = this.player.y > this.SURFACE_Y;
    const { maxOxygen } = this.getStats();
    this.maxOxygen = maxOxygen;

    if (isBelowSurface) {
      this.oxygen -= this.OXYGEN_DRAIN_RATE * deltaSeconds;
    } else {
      this.oxygen += this.OXYGEN_REGEN_RATE * deltaSeconds;
    }

    this.oxygen = Phaser.Math.Clamp(this.oxygen, 0, this.maxOxygen);
    const store = useGameStore.getState();
    store.setOxygen(this.oxygen);
    useGameStore.setState({ maxOxygen: this.maxOxygen });

    if (store.isOnSurface === isBelowSurface) { 
        store.setIsOnSurface(!isBelowSurface);
    }

    if (this.oxygen <= 0) {
      this.handlePassOut();
    }
  }

  private handlePassOut() {
    this.cameras.main.shake(500, 0.01);
    this.player.setPosition((WORLD_WIDTH * TILE_SIZE) / 2, 10 * TILE_SIZE);
    this.player.setVelocity(0, 0);
    useGameStore.getState().loseInventory(0.7);
    this.oxygen = this.maxOxygen;
    this.isClicking = false;
    this.resetMiningProgress();
  }

  private getStats() {
    const upgrades = useGameStore.getState().upgrades;
    
    const speedLvl = upgrades.speed || 1;
    const rangeLvl = upgrades.range || 1;
    const tankLvl  = upgrades.tank  || 1;
    const lightLvl = upgrades.lights || 1;

    // 1. SPEED
    const baseSpeed = 800;
    const speed = baseSpeed / (1 + ((speedLvl - 1) * 0.5));

    // 2. RANGE
    const baseRange = 2 * TILE_SIZE;
    const range = baseRange + ((rangeLvl - 1) * TILE_SIZE);
    
    // 3. OXYGEN
    const maxOxygen = 100 + ((tankLvl - 1) * 50);

    // 4. VISIBILITY
    const visibilityRadius = (3 * TILE_SIZE) + ((lightLvl - 1) * (0.5 * TILE_SIZE));

    return { speed, range, maxOxygen, visibilityRadius };
  }

  private handleMining(delta: number) {
    const { range } = this.getStats();
    const newTarget = this.getRaycastTarget(range);

    if (!this.targetsMatch(newTarget, this.currentMiningTarget)) {
      this.resetMiningProgress();
      this.currentMiningTarget = newTarget;
    }

    if (this.currentMiningTarget) {
      this.reticle.setVisible(true);
      this.reticle.setPosition(
        this.currentMiningTarget.x * TILE_SIZE + (TILE_SIZE / 2), 
        this.currentMiningTarget.y * TILE_SIZE + (TILE_SIZE / 2)
      );

      if (this.isClicking) {
        this.processMining(this.currentMiningTarget.x, this.currentMiningTarget.y, delta);
      } else {
        this.resetMiningProgress();
      }
    } else {
      this.reticle.setVisible(false);
    }
  }

  private processMining(x: number, y: number, delta: number) {
    const blockId = this.worldData[y][x];
    const def = BLOCK_Df[blockId];
    const key = `${x}_${y}`;
    const sprite = this.blockMap.get(key);

    if (!sprite) return;

    const { speed } = this.getStats();
    const timeToMine = def.hardness * speed;
    this.miningProgress += delta;

    const damagePct = Math.min(1, this.miningProgress / timeToMine);
    const originalColor = Phaser.Display.Color.ValueToColor(def.color);
    const black = Phaser.Display.Color.ValueToColor(0x000000);
    
    const darkenedColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      originalColor, black, 100, damagePct * 100 
    );

    const colorInt = Phaser.Display.Color.GetColor(darkenedColor.r, darkenedColor.g, darkenedColor.b);
    sprite.setTint(colorInt);

    if (this.miningProgress >= timeToMine) {
      this.mineBlock(x, y);
      this.resetMiningProgress();
    }
  }

  private getRaycastTarget(range: number): { x: number, y: number } | null {
    const pointer = this.input.activePointer;
    const worldMouseX = pointer.worldX;
    const worldMouseY = pointer.worldY;
    const startX = this.player.x;
    const startY = this.player.y;
    
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

  private targetsMatch(a: {x:number, y:number} | null, b: {x:number, y:number} | null) {
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;
    return a.x === b.x && a.y === b.y;
  }

  private mineBlock(x: number, y: number) {
    const key = `${x}_${y}`;
    const blockSprite = this.blockMap.get(key);

    if (blockSprite) {
      const blockId = this.worldData[y][x];
      useGameStore.getState().addToInventory(blockId, 1);
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