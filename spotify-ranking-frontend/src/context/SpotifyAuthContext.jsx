import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../axiosConfig';
import { AuthContext } from './UserAuthContext';

//Create context
const SpotifyAuthContext = createContext();

//Share state with all components
export const SpotifyAuthProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [spotifyUser, setSpotifyUser] = useState(null);
    const [spotifyLoading, setSpotifyLoading] = useState(true);

    useEffect(() => {
        if (user) {
            checkSpotifyAuth();
        }
    }, [user]);

    const checkSpotifyAuth = async () => {
        setSpotifyLoading(true);
        try {
            const { data } = await api.get('/spotify/status');
            console.log('Spotify user:', data);
            setSpotifyUser ({
                connected: true,
                username: data
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

    const fetchToken = async (user) => {
        try {
            const response = await api.get('/spotify/token', {
                params: { user: user },
            });
            console.log("Spotify token ontvangen:", response.data);
            return response.data.access_token;
        } catch (error) {
            console.error('Error fetching Spotify token:', error);
        }
    };

    return (
        <SpotifyAuthContext.Provider value={{ spotifyUser, connectSpotify, fetchToken, spotifyLoading }}>
            {children}
        </SpotifyAuthContext.Provider>
    );
};

//Custom hook for easier use of context
export const useSpotifyAuth = () => useContext(SpotifyAuthContext);