import React, { createContext, useState, useContext } from 'react';

// Create context
const PlaylistContext = createContext();

// Provider component
export const PlaylistProvider = ({ children }) => {
    const [playlistId, setPlaylistId] = useState(null);

    return (
        <PlaylistContext.Provider value={{ playlistId, setPlaylistId }}>
            {children}
        </PlaylistContext.Provider>
    );
};

// Custom hook to use the playlist context
export const usePlaylist = () => useContext(PlaylistContext);