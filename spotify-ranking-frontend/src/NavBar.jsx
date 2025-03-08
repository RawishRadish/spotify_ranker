import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/UserAuthContext';
import { useSpotifyAuth } from './context/SpotifyAuthContext';
import { usePlaylist } from './context/PlaylistContext';
import './NavBar.css';

const NavBar = () => {
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
      <nav>
        <Link className="nav-item" to="/">Home</Link>
        <Link className="nav-item" to="/compare">Compare</Link>
        <Link className="nav-item" to="/ranking">Ranking</Link>
        {user?.loggedIn && (
          <>
          <div className="nav-item">
            {spotifyUser?.connected ? (
              <p>Connected to Spotify as {spotifyUser.username}</p>
            ) : (
              <button onClick={() => connectSpotify(user)}>Connect to Spotify</button>
            )}
          </div>
          <p className="nav-item">User: { user.username }</p>
          <button className="nav-item" onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>
    );
  };

export default NavBar;