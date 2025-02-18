import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './UserAuthContext';

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, isCheckingAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isCheckingAuth && !isLoggedIn) {
            navigate('/', { replace: true, state: { from: location } });
        }
    }, [isLoggedIn, isCheckingAuth, navigate, location]);

    if (isCheckingAuth) {
        return <div>Checking authentication...</div>;
    }

    return isLoggedIn ? children : null;
};

export default ProtectedRoute;
