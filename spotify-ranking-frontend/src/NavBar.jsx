import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './UserAuthContext';
import api from './axiosConfig';

const NavBar = () => {
    const { isLoggedIn, setIsLoggedIn } = useAuth();
  
    const handleLogout = async () => {
      try {
        await api
    .post('/auth/logout');
        console.log('Logged out');
        setIsLoggedIn(false);
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };
  
    return (
      <nav>
        <Link className="nav-item" to="/">Home</Link>
        <Link className="nav-item" to="/compare">Compare</Link>
        <Link className="nav-item" to="/ranking">Ranking</Link>
        {isLoggedIn && (
          <button className="nav-item" onClick={handleLogout}>Logout</button>
        )}
      </nav>
    )
  }

export default NavBar;