import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/UserAuthContext';
import { useSpotifyAuth } from './context/SpotifyAuthContext';
import { usePlaylist } from './context/PlaylistContext';

const NavBar = () => {
    const [ menuOpen, setMenuOpen ] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const { spotifyUser, connectSpotify } = useSpotifyAuth();
    const { setPlaylistId } = usePlaylist();
    const navigate = useNavigate();
  
    const handleLogout = async () => {
      try {
        await logout();
        setPlaylistId(null);
        console.log('Logged out');
        navigate('/'); // Redirect to home page
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };

    return (
      <nav className='fixed top-0 w-full bg-gray-900 text-white h-16 shadow-lg z-50'>
        <div className='container mx-auto flex justify-between items-center h-full'>

          {/* Logo */}
          <div className='text-xl font-bold'>Spotify Ranker</div>

          {/* Links for desktop */}
          <div className='hidden md:flex space-x-6'>
            <Link className="hover:text-gray-300" to="/">Home</Link>
            <Link className="hover:text-gray-300" to="/compare">Compare</Link>
            <Link className="hover:text-gray-300" to="/ranking">Ranking</Link>
            <Link className='hover:text-gray-300' to='/statistics'>Statistics</Link>
          </div>

          {/* User info and Logout button */}
          <div className='hidden md:flex items-center space-x-4'>
            {user?.loggedIn ? (
              <>
                <div className="nav-item">
                  {spotifyUser?.connected ? (
                    <p>Connected to Spotify as {spotifyUser.username}</p>
                  ) : (
                    <button onClick={() => connectSpotify(user)}>
                      Connect to Spotify
                    </button>
                  )}
                </div>
                <span className="text-sm text-gray-300">
                  User: <strong>{ user.username }</strong>
                </span>
                <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link className='bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold' to='/'>Inloggen</Link>
            )}
          </div>      
          {/* Mobile menu button */}
          <button
            className='md:hidden focus:outline-none'
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>   
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className='md:hidden mt-2 bg-gray-800 p-4 space-y-2'>
            <Link className="block text-white hover:text-gray-300" to="/">Home</Link>
            <Link className="block text-white hover:text-gray-300" to="/compare">Compare</Link>
            <Link className="block text-white hover:text-gray-300" to="/ranking">Ranking</Link>
            {user?.loggedIn ? (
              <>
                <div className="nav-item">
                  {spotifyUser?.connected ? (
                    <p>Connected to Spotify as {spotifyUser.username}</p>
                  ) : (
                    <button onClick={() => connectSpotify(user)}>
                      Connect to Spotify
                    </button>
                  )}
                </div>
                <span className="text-sm text-gray-300">
                  User: <strong>{ user.username }</strong>
                </span>
                <button className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link className='block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold text-center' to='/'>Inloggen</Link>
            )}
          </div>
        )}

      </nav>
    );
  };

export default NavBar;