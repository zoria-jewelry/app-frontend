import CurrentPriceListComponent from '../components/pl/CurrentPriceListComponent.tsx';
import { Box, useTheme } from '@mui/material';
import commonStyles from '../styles/Common.module.css';
import ExpiredPriceListsComponent from '../components/pl/ExpiredPriceListsComponent.tsx';

const PriceListsPage = () => {
    const theme = useTheme();

    return (
        <Box className={commonStyles.flexColumn} gap={theme.spacing(4)} sx={{ width: '100%' }}>
            <CurrentPriceListComponent />
            <ExpiredPriceListsComponent />
        </Box>
    );
};

export default PriceListsPage;
