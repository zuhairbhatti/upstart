import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, requiredPermission = null }) => {
    const location = useLocation();
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (requiredPermission) {
                    const hasPermission = await checkPermission(requiredPermission);
                    setIsAuthorized(hasPermission);
                } else {
                    // If no specific permission required, just check if logged in
                    setIsAuthorized(document.cookie.includes('access_token'));
                }
            } catch (error) {
                setIsAuthorized(false);
            } finally {
                setIsLoading(false);
            }
        };
        
        checkAuth();
    }, [requiredPermission]);

    if (isLoading) {
        return <div>Loading...</div>; // Or your loading component
    }

    if (!isAuthorized) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute; 