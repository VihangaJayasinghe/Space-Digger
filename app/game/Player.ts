import { Scene } from 'phaser';
import { TILE_SIZE } from './constants';
import { useGameStore } from './store'; // <--- Import Store

export class Player extends Phaser.Physics.Arcade.Sprite {
  // Define WASD Keys
  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  private baseMoveSpeed = 100; 
  private jetpackForce = -150; 

  // Particle Emitter
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'player-texture');

    // Add to Scene and Physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup Physics properties
    this.setCollideWorldBounds(true); 
    this.setGravityY(500); 
    
    // Resize player
    this.setDisplaySize(TILE_SIZE * 0.8, TILE_SIZE * 0.8);
    // Ensure player is on top of blocks (Depth 0)
    this.setDepth(50); 

    // Input Keys
    if (scene.input.keyboard) {
      this.keys = scene.input.keyboard.addKeys('W,A,S,D') as any;
    }

    // Initialize Jetpack Particles
    // We use the 'flare' texture generated in MainScene
    this.emitter = scene.add.particles(0, 0, 'flare', {
      speed: 100,             // Speed of particles
      angle: { min: 80, max: 100 }, // Direction (Downwards)
      lifespan: 200,          // How long they last (ms)
      scale: { start: 1, end: 0 }, // Shrink over time
      tint: 0xffaa00,         // Orange fire color
      blendMode: 'ADD',       // Makes it look glowing/hot
      emitting: false,        // Start turned off
    });

    // Attach emitter to player, slightly offset to the feet
    this.emitter.startFollow(this, 0, TILE_SIZE * 0.4);
    
    // Render behind the player (Depth 50) but in front of blocks (Depth 0)
    this.emitter.setDepth(40);
  }

  update() {
    if (!this.keys) return;

    // 1. CALCULATE SPEED BASED ON UPGRADES
    const upgrades = useGameStore.getState().upgrades;
    const speedLvl = upgrades.speed || 1;
    // Base 200, adds 50 speed per level
    const currentSpeed = this.baseMoveSpeed;

    // 2. HORIZONTAL MOVEMENT
    if (this.keys.A.isDown) {
      this.setVelocityX(-currentSpeed);
      this.setFlipX(true); 
    } else if (this.keys.D.isDown) {
      this.setVelocityX(currentSpeed);
      this.setFlipX(false); 
    } else {
      this.setVelocityX(0);
    }

    // 3. VERTICAL MOVEMENT (JETPACK)
    if (this.keys.W.isDown) {
      this.setVelocityY(this.jetpackForce);
      this.emitter.start(); // Fire ON
    } else {
      this.emitter.stop();  // Fire OFF
    }
  }
}