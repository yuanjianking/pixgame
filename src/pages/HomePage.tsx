// HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { games } from '../data/games';

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <div className="home-inner">
        <div className="games-grid">
          {games.map((game) => (
            <div key={game.id} className="game-card">
              <Link to={game.route} className="game-link">
                <div className="game-image-container">
                  <img
                    src={game.thumbnail}
                    alt={game.name}
                    className="game-image"
                  />
                </div>
                <h2 className="game-name">{game.name}</h2>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;