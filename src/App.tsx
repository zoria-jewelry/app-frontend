import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ThemeDemoPage from './pages/ThemeDemoPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import PrivateRoutes from './auth/PrivateRoutes.tsx';
import MaterialsPage from './pages/MaterialsPage.tsx';
import commonStyles from './styles/Common.module.css';
import HeaderComponent from './components/HeaderComponent.tsx';
import { Box } from '@mui/material';
import PublicRoutes from './auth/PublicRoutes.tsx';
import EmployeePage from './pages/EmployeePage.tsx';

const App = () => {
    const path = useLocation();
    return (
        <Box className={`${commonStyles.bodyBox} ${commonStyles.flexColumn}`}>
            {path?.pathname !== '/login' && <HeaderComponent />}
            <Routes>
                {/* Any user */}
                <Route path="/demo" element={<ThemeDemoPage />} />
                {/* Authenticated user */}
                <Route element={<PrivateRoutes />}>
                    <Route path="/materials" element={<MaterialsPage />} />
                    <Route path="/employees" element={<EmployeePage />} />
                    <Route path="/*" element={<Navigate to="/materials" />} />
                </Route>
                {/* Guests */}
                <Route element={<PublicRoutes />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Route>
            </Routes>
        </Box>
    );
};

export default App;
