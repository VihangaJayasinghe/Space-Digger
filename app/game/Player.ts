import { Scene } from 'phaser';
import { TILE_SIZE } from './constants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  // Define WASD Keys
  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  private moveSpeed = 200; 
  private jetpackForce = -250; 

  // 1. NEW: Add Emitter Property
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

    // 2. NEW: Initialize Jetpack Particles
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

    // Horizontal Movement (A = Left, D = Right)
    if (this.keys.A.isDown) {
      this.setVelocityX(-this.moveSpeed);
      this.setFlipX(true); 
    } else if (this.keys.D.isDown) {
      this.setVelocityX(this.moveSpeed);
      this.setFlipX(false); 
    } else {
      this.setVelocityX(0);
    }

    // Vertical Movement (W = Jetpack/Jump)
    if (this.keys.W.isDown) {
      this.setVelocityY(this.jetpackForce);
      // 3. NEW: Turn ON fire when flying
      this.emitter.start();
    } else {
      // 4. NEW: Turn OFF fire when falling/idle
      this.emitter.stop();
    }
  }
}