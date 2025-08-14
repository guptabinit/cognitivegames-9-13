import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const PlayerContext = createContext();

// Create a provider component
export const PlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState(() => {
    // Try to load player data from localStorage on initial load
    const savedPlayer = localStorage.getItem('player');
    return savedPlayer ? JSON.parse(savedPlayer) : null;
  });

  // Save player data to localStorage whenever it changes
  useEffect(() => {
    if (player) {
      localStorage.setItem('player', JSON.stringify(player));
    } else {
      localStorage.removeItem('player');
    }
  }, [player]);

  const updatePlayer = (playerData) => {
    setPlayer(prev => ({
      ...prev,
      ...playerData
    }));
  };

  const clearPlayer = () => {
    setPlayer(null);
    localStorage.removeItem('player');
  };

  return (
    <PlayerContext.Provider value={{ player, updatePlayer, clearPlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};

// Custom hook to use the player context
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export default PlayerContext;
