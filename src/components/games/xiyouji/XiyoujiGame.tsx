// index.tsx
import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { gameConfig } from './config/GameConfig';

const XiyoujiGame: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gameRef.current = new Phaser.Game({
      ...gameConfig,
      parent: containerRef.current.id
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div
        id="phaser-game-container"
        ref={containerRef}
        style={{ width: '800px', height: '600px', margin: '0 auto' }}
      />
    </div>
  );
};

export default XiyoujiGame;