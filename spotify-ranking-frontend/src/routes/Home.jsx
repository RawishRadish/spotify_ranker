import React, { useState, useEffect, useContext } from 'react';
import LoginForm from '../LoginForm';
import PlaylistSelect from './PlaylistSelect';
import { AuthContext } from '../context/UserAuthContext';
import { SpotifyAuthContext } from '../context/SpotifyAuthContext';

const Home = () => {
    const { user, loading } = useContext(AuthContext);
    const { spotifyUser, connectSpotify } = useContext(SpotifyAuthContext);

    if (loading) {
        return <div className='flex items-center justify-center h-screen text-gray-600'>Loading...</div>;
    }

    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'>
            {!spotifyUser?.connected && (
                <div className='items-center justify-center flex flex-col bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md'>
                    <h1 className='text-2xl font-bold mb-4'>Welkom bij Spotify Ranking</h1>
                    <p className='mb-4'>Log in bij Spotify om je playlists in te laden.</p>
                    <button 
                        onClick={() => connectSpotify(user)}
                        className='px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition duration-200'
                    >
                      Connect to Spotify
                    </button>
                </div>
            )}
            {(spotifyUser?.connected === true) && <PlaylistSelect/>}
        </div>
    );
}

export default Home;