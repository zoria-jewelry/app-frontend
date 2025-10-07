import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext.tsx';
import { CircularProgress, Box } from '@mui/material';

const PublicRoutes = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    height: '100vh',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }
    return isAuthenticated ? <Navigate to="/materials" /> : <Outlet />;
};

export default PublicRoutes;
