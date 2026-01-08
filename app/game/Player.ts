import { Scene } from 'phaser';
import { TILE_SIZE } from './constants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  // 1. CHANGE: Define WASD Keys instead of CursorKeys
  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  private moveSpeed = 200; 
  private jetpackForce = -250; 

  constructor(scene: Scene, x: number, y: number) {
    // We create a simple white square as the player for now
    super(scene, x, y, 'player-texture');

    // Add this sprite to the scene and the physics engine
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup Physics properties
    this.setCollideWorldBounds(true); // Don't walk off screen
    this.setGravityY(500); // Standard falling gravity
    
    // Make the player slightly smaller than a block so he fits in tunnels
    this.setDisplaySize(TILE_SIZE * 0.8, TILE_SIZE * 0.8);

    // Input Keys
    if (scene.input.keyboard) {
      this.keys = scene.input.keyboard.addKeys('W,A,S,D') as any;
    }
  }

  update() {
    if (!this.keys) return;

    // 3. CHANGE: Use WASD Logic
    
    // Horizontal Movement (A = Left, D = Right)
    if (this.keys.A.isDown) {
      this.setVelocityX(-this.moveSpeed);
      this.setFlipX(true); // Visual: Face Left
    } else if (this.keys.D.isDown) {
      this.setVelocityX(this.moveSpeed);
      this.setFlipX(false); // Visual: Face Right
    } else {
      this.setVelocityX(0);
    }

    // Vertical Movement (W = Jetpack/Jump)
    if (this.keys.W.isDown) {
      this.setVelocityY(this.jetpackForce);
    }
  }
}