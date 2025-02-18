import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import PlaylistSelect from './PlaylistSelect';
import { useAuth } from './UserAuthContext';
import api from './axiosConfig';

const Home = () => {
    const { isLoggedIn, handleLogin } = useAuth();

    return (
        <div>
            <h1>Spotify Wanker</h1>

            {!isLoggedIn && <LoginForm/>}

            {isLoggedIn && <PlaylistSelect/>}
        </div>
    );
}

export default Home;