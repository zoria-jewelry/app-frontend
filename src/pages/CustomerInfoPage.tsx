// import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import UpdateCustomerInfoComponent from '../components/customer/UpdateCustomerInfoComponent.tsx';
import UpdateCustomerBalancesComponent from '../components/customer/UpdateCustomerBalancesComponent.tsx';
import CustomerAuditRecordsComponent from '../components/customer/CustomerAuditRecordsComponent.tsx';

const CustomerInfoPage = () => {
    const theme = useTheme();

    // const params = useParams();
    // const customerId: number | null = params.customerId ? Number(params.customerId) : null;

    const isMd = useMediaQuery(theme.breakpoints.down('md')); // < 900px

    return (
        <Box width="85%">
            <Box
                height={isMd ? 'fit-content' : '50vh'}
                display="flex"
                flexDirection="row"
                flexWrap="wrap"
                justifyContent="space-between"
            >
                <Paper
                    className={`${paperStyles.halfPaper} ${commonStyles.flexColumn}`}
                    style={{
                        width: isMd ? '100%' : '49%',
                        marginBottom: isMd ? theme.spacing(4) : 0,
                        borderRadius: '10px',
                        height: 'inherit',
                    }}
                >
                    <Typography variant="h3" textAlign="left" width="100%">
                        Особисті дані клієнта
                    </Typography>
                    <UpdateCustomerInfoComponent />
                </Paper>
                <Paper
                    className={`${paperStyles.halfPaper} ${commonStyles.flexColumn}`}
                    style={{
                        width: isMd ? '100%' : '49%',
                        borderRadius: '10px',
                        height: 'inherit',
                    }}
                >
                    <Typography variant="h3" textAlign="left" width="100%">
                        Баланси клієнта
                    </Typography>
                    <UpdateCustomerBalancesComponent />
                </Paper>
            </Box>
            <Paper
                className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
                sx={{
                    gap: theme.spacing(4),
                    width: '100%',
                    marginTop: theme.spacing(4),
                    maxHeight: '40vh',
                    borderRadius: '10px',
                    overflow: 'scroll',
                    alignItems: 'stretch',
                    paddingBottom: theme.spacing(4),
                }}
            >
                <Typography variant="h3" textAlign="left" width="100%">
                    Історія змін
                </Typography>
                <CustomerAuditRecordsComponent />
            </Paper>
            <Paper
                className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
                sx={{
                    gap: theme.spacing(4),
                    width: '100%',
                    marginTop: theme.spacing(4),
                    minHeight: '40vh',
                }}
            ></Paper>
        </Box>
    );
};

export default CustomerInfoPage;
