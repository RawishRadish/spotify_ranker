import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setAuthToken } from '../axiosConfig';

//Create context
export const AuthContext = createContext();

//Share state with all components
export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        setLoading(true);
        console.log('Checking auth');
        try {
            const { data } = await api.post('/auth/refresh');
            setAuthToken(data.accessToken);
            setUser({
                loggedIn: true,
                username: data.username,
            });
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    const login = async (username, password) => {
        const { data } = await api.post('/auth/login', { username, password });
        setAuthToken(data.accessToken);
        setUser({ 
            username: data.username,
            loggedIn: true,
        });
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setAuthToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

//Custom hook for easier use of context
export const useAuth = () => useContext(AuthContext);