import CurrentPriceListComponent from '../components/pl/CurrentPriceListComponent.tsx';
import { Box, useTheme } from '@mui/material';
import commonStyles from '../styles/Common.module.css';
import ExpiredPriceListsComponent from '../components/pl/ExpiredPriceListsComponent.tsx';
import { useState } from 'react';

const PriceListsPage = () => {
    const theme = useTheme();

    const [refreshExpiredLists, setRefreshExpiredLists] = useState(0);

    const handlePriceListCreation = () => {
        setRefreshExpiredLists((prev) => prev + 1);
    };

    return (
        <Box className={commonStyles.flexColumn} gap={theme.spacing(4)} sx={{ width: '100%' }}>
            <CurrentPriceListComponent onPriceListCreated={handlePriceListCreation} />
            <ExpiredPriceListsComponent refreshTrigger={refreshExpiredLists} />
        </Box>
    );
};

export default PriceListsPage;
