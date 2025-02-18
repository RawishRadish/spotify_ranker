import React, { useState } from 'react';
import api from './axiosConfig';
import { useAuth } from './UserAuthContext';

const LoginForm = () => {
    const { checkUserAuthState } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!username || !password) {
            return setError('Vul zowel je gebruikersnaam als wachtwoord in');
        }

        setIsLoggingIn(true);

        try {
            await api.post('auth/login', {username, password });
            await checkUserAuthState(); //Check log in state
        } catch (error) {
            if (error.response && error.response.status === 400) {
                if (error.response.data === 'Invalid username') {
                    setError('Onjuiste gebruikersnaam');
                } else if (error.response.data === 'Invalid password') {
                    setError('Onjuist wachtwoord');
                }
            } else {
                setError('Er is een fout opgetreden');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Inloggen</h2>
            <input
                type="text"
                placeholder="Gebruikersnaam"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
            />
            <input
                type="password"
                placeholder="Wachtwoord"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />
            <button type="submit" disabled={isLoggingIn}>
                {isLoggingIn ? 'Inloggen...' : 'Inloggen'}
            </button>
            {error && <p>{error}</p>}
        </form>
    );
}

export default LoginForm;