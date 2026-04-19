import GlobalStatisticsComponent from '../components/stats/GlobalStatisticsComponent.tsx';
import GlobalAuditRecordsComponent from '../components/stats/GlobalAuditRecordsComponent.tsx';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.tsx';
import { CircularProgress, Box } from '@mui/material';

const StatisticsPage = () => {
    const [refresher, setRefresher] = useState<number>(0);
    const { loading } = useAuth();

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

    return (
        <>
            <GlobalStatisticsComponent
                onUpdate={() => setRefresher((v) => v + 1)}
                refresher={refresher}
            />
            <GlobalAuditRecordsComponent refresher={refresher} />
        </>
    );
};

export default StatisticsPage;
