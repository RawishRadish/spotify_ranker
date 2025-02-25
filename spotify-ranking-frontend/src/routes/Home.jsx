import React, { useState, useEffect, useContext } from 'react';
import LoginForm from '../LoginForm';
import PlaylistSelect from './PlaylistSelect';
import { AuthContext } from '../context/UserAuthContext';

const Home = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Spotify Ranker</h1>

            {!user && <LoginForm/>}

            {(user?.loggedIn === true) && <PlaylistSelect/>}
        </div>
    );
}

export default Home;