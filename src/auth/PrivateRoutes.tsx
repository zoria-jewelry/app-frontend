import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoutes = () => {
    // TODO: Replace with real auth token fetching: Context or Redux Toolkit
    const authToken: string | null = 'PLACEHOLDER_AUTH_TOKEN';
    return authToken ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
