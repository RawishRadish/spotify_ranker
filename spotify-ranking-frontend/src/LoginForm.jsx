import React, { useState, useContext } from 'react';
import { AuthContext } from './context/UserAuthContext';

const LoginForm = () => {
    const { login } = useContext(AuthContext);
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
            await login(username, password);
        } catch (error) {
            console.error('Error logging in:', error);
            setError('Er is iets misgegaan bij het inloggen. Probeer het opnieuw.');
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