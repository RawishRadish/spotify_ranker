import { Navigate } from 'react-router-dom';
import { useAuth } from './context/UserAuthContext';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
    const { user, loading, checkAuth } = useAuth();

    useEffect(() => {
        checkAuth();
    }, []);

    if (loading) {
        return <div>Checking authentication...</div>;
    }

    return user?.loggedIn ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
