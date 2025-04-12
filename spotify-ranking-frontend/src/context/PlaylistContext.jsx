import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../axiosConfig';

// Create context
const PlaylistContext = createContext();

// Provider component
export const PlaylistProvider = ({ children }) => {
    const [playlistId, setPlaylistId] = useState(null);

    useEffect(() => {
        const storedPlaylistId = localStorage.getItem('selectedPlaylistId');

        if (storedPlaylistId && storedPlaylistId !== 'null' && storedPlaylistId !== 'undefined') {
            setPlaylistId(storedPlaylistId);
        } else {
            const fetchLastPlaylistId = async () => {
                try {
                    const response = await api.get('/user/last_playlist');
                    const lastPlaylistId = response.data.playlistId;
                    localStorage.setItem('selectedPlaylistId', lastPlaylistId);
                    setPlaylistId(lastPlaylistId);
                } catch (error) {
                    console.error('Error fetching last playlist ID:', error);
                }
            }
            fetchLastPlaylistId();
        }
    }, []);

    return (
        <PlaylistContext.Provider value={{ playlistId, setPlaylistId }}>
            {children}
        </PlaylistContext.Provider>
    );
};

// Custom hook to use the playlist context
export const usePlaylist = () => useContext(PlaylistContext);