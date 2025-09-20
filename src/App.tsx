import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ThemeDemoPage from './pages/ThemeDemoPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import PrivateRoutes from './auth/PrivateRoutes.tsx';
import MaterialsPage from './pages/MaterialsPage.tsx';
import commonStyles from './styles/Common.module.css';
import HeaderComponent from './components/HeaderComponent.tsx';
import { Box } from '@mui/material';
import EmployeePage from './pages/EmployeePage.tsx';
import Sidebar from './components/Sidebar.tsx';
import { useState } from 'react';
import PriceListsPage from './pages/PriceListsPage.tsx';
import CustomersPage from './pages/CustomersPage.tsx';
import ProductsCataloguePage from './pages/ProductsCataloguePage.tsx';
import CustomerInfoPage from './pages/CustomerInfoPage.tsx';
import CompleteOrderPage from './pages/CompleteOrderPage.tsx';
import OrdersPage from './pages/OrdersPage.tsx';

const App = () => {
    const path = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <Box className={`${commonStyles.bodyBox} ${commonStyles.flexColumn}`}>
            {/* Only authenticated user will see header and will be able to open the sidebar */}
            {path?.pathname !== '/login' && (
                <>
                    <HeaderComponent toggleOpenSidebar={() => setIsSidebarOpen((v) => !v)} />
                    <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                </>
            )}
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
                    <Route path="/*" element={<Navigate to="/materials" />} />
                </Route>
                {/* Guests */}
                <Route element={<PrivateRoutes />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Route>
            </Routes>
        </Box>
    );
};

export default App;
