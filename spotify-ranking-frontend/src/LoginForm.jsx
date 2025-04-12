import React, { useState, useContext } from 'react';
import { AuthContext } from './context/UserAuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const navigate = useNavigate();
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
            navigate('/'); // Redirect to home page after successful login
        } catch (error) {
            console.error('Error logging in:', error);
            setError('Er is iets misgegaan bij het inloggen. Probeer het opnieuw.');
        } finally {
            setIsLoggingIn(false);
            
        }
    };

    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-100 px-4'>
                <form 
                    onSubmit={handleSubmit}
                    className='bg-white p-6 rounded-2xl shadow-md w-full max-w-md space-y-4'
                >
                <h2 className='text-2xl font-bold text-center text-gray-800'>Inloggen</h2>
                <input
                    type="text"
                    placeholder="Gebruikersnaam"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                    type="password"
                    placeholder="Wachtwoord"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <button 
                    type="submit" 
                    disabled={isLoggingIn}
                    className='w-full bg-blue-600 text-white font-semibold py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50'
                >
                    {isLoggingIn ? 'Inloggen...' : 'Inloggen'}
                </button>
                {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

                <p className="mt-6 text-center text-sm text-gray-500">
                    Nog geen account?{' '}
                    <Link to="/register" className="font-medium text-blue-600 hover:underline">
                        Registreer hier
                    </Link>
                </p>
            </form>
        </div>

    );
}

export default LoginForm;