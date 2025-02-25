import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../axiosConfig';

//Create context
const SpotifyAuthContext = createContext();

//Share state with all components
export const SpotifyAuthProvider = ({ children }) => {
    const [spotifyUser, setSpotifyUser] = useState(null);
    const [spotifyLoading, setSpotifyLoading] = useState(true);

    useEffect(() => {
        checkSpotifyAuth();
    }, []);

    const checkSpotifyAuth = async () => {
        setSpotifyLoading(true);
        try {
            const { data } = await api.get('/spotify/status');
            setSpotifyUser ({
                connected: true,
                username: data.username
            });
        } catch {
            setSpotifyUser(null);
        } finally {
            setSpotifyLoading(false);
        }
    };

    const connectSpotify = async (user) => {
        try {
            const { data } = await api.get('/spotify/connect',
                { params: { user: user }
            });
            window.location.href = data.authURL;
        } catch (error) {
            console.error('Error connecting to Spotify:', error);
        }
    };

    return (
        <SpotifyAuthContext.Provider value={{ spotifyUser, connectSpotify, spotifyLoading }}>
            {children}
        </SpotifyAuthContext.Provider>
    );
};

//Custom hook for easier use of context
export const useSpotifyAuth = () => useContext(SpotifyAuthContext);