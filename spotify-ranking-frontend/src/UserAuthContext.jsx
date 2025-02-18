import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './axiosConfig';

//Create context
const AuthContext = createContext();

//Share state with all components
export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    //Function to renew access token
    const refreshAccessToken = async () => {
        try {
            console.log('Trying to refresh access token...');
            const response = await api.post('/auth/refresh');

            if (response.status === 200) {
                console.log('Access token refreshed!');
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error('Vernieuwen van access token mislukt:', error);
            logoutUser();
        }
    };

    // Check if user is authenticated
    const checkUserAuthState = async () => {
        console.log('Checking user authentication state...');
        try {
            // Make a request to the backend to check authentication state
            const response = await api.get('/auth/check-auth');
            if (response.status === 200) {
                console.log('User is authenticated/logged in');
                setIsLoggedIn(true);
                return true;
            }
        } catch (error) {
            console.error('User is not logged in:', error);
            setIsLoggedIn(false);
            return false;
        } finally {
            setIsCheckingAuth(false);
        }
    };

    const logoutUser = async () => {
        console.log('Logging out user...');
        setIsLoggedIn(false);

        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    useEffect(() => {
        const authenticateUser = async () => {
            const isAuthenticated = await checkUserAuthState();
            if (!isAuthenticated) {
                console.log('User is not authenticated, attempting token refresh');
                await refreshAccessToken();
            }
        };
        authenticateUser();
    }, []);

    if (isCheckingAuth) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, checkUserAuthState, logoutUser, setIsLoggedIn, refreshAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

//Custom hook for easier use of context
export const useAuth = () => useContext(AuthContext);