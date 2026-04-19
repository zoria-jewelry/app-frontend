import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ThemeDemoPage from './pages/ThemeDemoPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import PrivateRoutes from './auth/PrivateRoutes.tsx';
import MaterialsPage from './pages/MaterialsPage.tsx';
import HeaderComponent from './components/HeaderComponent.tsx';
import { Box } from '@mui/material';
import EmployeePage from './pages/EmployeePage.tsx';
import Sidebar from './components/Sidebar.tsx';
import { useEffect, useState } from 'react';
import PriceListsPage from './pages/PriceListsPage.tsx';
import CustomersPage from './pages/CustomersPage.tsx';
import ProductsCataloguePage from './pages/ProductsCataloguePage.tsx';
import CustomerInfoPage from './pages/CustomerInfoPage.tsx';
import CompleteOrderPage from './pages/CompleteOrderPage.tsx';
import WorkUnitsPage from './pages/WorkUnitsPage.tsx';
import OrdersPage from './pages/OrdersPage.tsx';
import StatisticsPage from './pages/StatisticsPage.tsx';
import PublicRoutes from './auth/PublicRoutes.tsx';

const SIDEBAR_EXPANDED_KEY = 'zoria-sidebar-expanded';

const App = () => {
    const path = useLocation();

    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        try {
            const stored = localStorage.getItem(SIDEBAR_EXPANDED_KEY);
            if (stored === null) return true;
            return stored === 'true';
        } catch {
            return true;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(SIDEBAR_EXPANDED_KEY, String(sidebarExpanded));
        } catch {
            /* ignore */
        }
    }, [sidebarExpanded]);

    const isLogin = path?.pathname === '/login' || path?.pathname === '/login/';

    return (
        <Box
            sx={{
                width: '100%',
                height: '100vh',
                maxHeight: '100vh',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                overflow: 'hidden',
            }}
        >
            {!isLogin && <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />}
            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                }}
            >
                {!isLogin && <HeaderComponent />}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 0,
                        overflow: 'auto',
                        boxSizing: 'border-box',
                        px: 0,
                    }}
                >
                    <Routes>
                        {/* Any user */}
                        <Route path="/demo" element={<ThemeDemoPage />} />
                        {/* Authenticated user */}
                        <Route element={<PrivateRoutes />}>
                            <Route path="/customers" element={<CustomersPage />} />
                            <Route path="/customers/:customerId" element={<CustomerInfoPage />} />
                            <Route path="/materials" element={<MaterialsPage />} />
                            <Route path="/employees" element={<EmployeePage />} />
                            <Route path="/pricing" element={<PriceListsPage />} />
                            <Route path="/products" element={<ProductsCataloguePage />} />
                            <Route path="/complete-order/:orderId" element={<CompleteOrderPage />} />
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/work-units" element={<WorkUnitsPage />} />
                            <Route path="/stats" element={<StatisticsPage />} />
                            <Route path="*" element={<Navigate to="/materials" />} />
                        </Route>
                        {/* Guests */}
                        <Route element={<PublicRoutes />}>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="*" element={<Navigate to="/login" />} />
                        </Route>
                    </Routes>
                </Box>
            </Box>
        </Box>
    );
};

export default App;
