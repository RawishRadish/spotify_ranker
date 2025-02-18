import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './axiosConfig';

//Create context
const SpotifyAuthContext = createContext();

//Share state with all components
export const SpotifyAuthProvider = ({ children }) => {
    const [isSpotifyLoggedIn, setIsSpotifyLoggedIn] = useState(false);
    const [isCheckingSpotifyAuth, setIsCheckingSpotifyAuth] = useState(true);

    //Function to renew Spotify access token
    const refreshSpotifyToken = async () => {
        try {
            
        } catch {
            
        }
    }
}