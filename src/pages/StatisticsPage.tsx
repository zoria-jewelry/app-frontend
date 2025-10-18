import GlobalStatisticsComponent from '../components/stats/GlobalStatisticsComponent.tsx';
import GlobalAuditRecordsComponent from '../components/stats/GlobalAuditRecordsComponent.tsx';
import { useState } from 'react';
import { useAuth, UserRole } from '../auth/AuthContext.tsx';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

const StatisticsPage = () => {
    const [refresher, setRefresher] = useState<number>(0);
    const { user, loading } = useAuth();

    console.log('StatisticsPage - user:', user, 'loading:', loading);

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

    if (user?.role !== UserRole.OWNER) {
        return <Navigate to="/work-units" replace />;
    }

    console.log('User is OWNER, showing statistics page');
    return (
        <>
            <GlobalStatisticsComponent onUpdate={() => setRefresher((v) => v + 1)} />
            <GlobalAuditRecordsComponent refresher={refresher} />
        </>
    );
};

export default StatisticsPage;
