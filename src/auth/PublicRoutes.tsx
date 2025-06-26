import { Navigate, Outlet } from 'react-router-dom';

const PublicRoutes = () => {
    // TODO: Replace with real auth token fetching: Context or Redux Toolkit
    const authToken: string | null = 'PLACEHOLDER_AUTH_TOKEN';
    return authToken ? <Navigate to="/materials" /> : <Outlet />;
};

export default PublicRoutes;
