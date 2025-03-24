import React, { useState, useEffect, useContext } from 'react';
import LoginForm from '../LoginForm';
import PlaylistSelect from './PlaylistSelect';
import { AuthContext } from '../context/UserAuthContext';
import { SpotifyAuthContext } from '../context/SpotifyAuthContext';

const Home = () => {
    const { user, loading } = useContext(AuthContext);
    const { spotifyUser, spotifyLoading } = useContext(SpotifyAuthContext);

    if (loading) {
        return <div className='flex items-center justify-center h-screen text-gray-600'>Loading...</div>;
    }

    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 dark-bg-gray-900 text gray-800 dark:text-gray-200'>
            {!user && <LoginForm/>}
            {(user?.loggedIn === true) && (spotifyUser?.connected === true) && <PlaylistSelect/>}
        </div>
    );
}

export default Home;