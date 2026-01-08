'use client'
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from '../game/MainScene'; // Import your new scene

export default function Game() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        backgroundColor: '#000000',
        scene: [MainScene], // <--- Add your scene here!
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 }, // No gravity yet (camera fly mode)
            debug: false
          }
        }
      };
      
      gameRef.current = new Phaser.Game(config);
    }
    
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    }
  }, []);

  return <div id="game-container" />;
}