// src/game/Player.ts
import { Scene, Physics } from 'phaser';
import { TILE_SIZE } from './constants';

export class Player extends Physics.Arcade.Sprite {
  // Variables to tweak how the character feels
  private moveSpeed = 150;
  private jetpackForce = -300;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

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
        this.cursors = scene.input.keyboard.createCursorKeys();
    }
  }

  update() {
    if (!this.cursors) return;

    // 1. Horizontal Movement (Walk)
    if (this.cursors.left.isDown) {
      this.setVelocityX(-this.moveSpeed);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(this.moveSpeed);
    } else {
      // Friction / Stop immediately
      this.setVelocityX(0);
    }

    // 2. Vertical Movement (Jetpack)
    if (this.cursors.up.isDown) {
      this.setVelocityY(this.jetpackForce);
    }
    // Note: We don't need an 'else' here because Gravity (setGravityY) 
    // automatically pulls us down when we aren't jetpacking.
  }
}