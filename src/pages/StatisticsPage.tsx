import GlobalStatisticsComponent from '../components/stats/GlobalStatisticsComponent.tsx';
import GlobalAuditRecordsComponent from '../components/stats/GlobalAuditRecordsComponent.tsx';
import { useState } from 'react';

const StatisticsPage = () => {
    const [refresher, setRefresher] = useState<number>(0);

    return (
        <>
            <GlobalStatisticsComponent onUpdate={() => setRefresher((v) => v + 1)} />
            <GlobalAuditRecordsComponent refresher={refresher} />
        </>
    );
};

export default StatisticsPage;
