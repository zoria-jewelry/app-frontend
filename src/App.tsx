import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ThemeDemoPage from './pages/ThemeDemoPage.tsx';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/demo" element={<ThemeDemoPage />} />
                <Route path="*" element={<Navigate to="/demo" />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
