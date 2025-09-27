import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import EmployeesIcon from '@mui/icons-material/Groups2';
import DiamondIcon from '@mui/icons-material/Diamond';
import { styled } from '@mui/material/styles';
import { Button, CircularProgress, Divider, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate } from 'react-router-dom';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CustomerIcon from '@mui/icons-material/Portrait';
import PercentIcon from '@mui/icons-material/Percent';
import StoreIcon from '@mui/icons-material/Store';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { useCallback, useEffect, useState } from 'react';
import { VchasnoApiClient } from '../api/vchasnoApiClient.ts';

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

export interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = (props: SidebarProps) => {
    const toggleDrawer = (newOpen: boolean) => () => {
        props.setIsOpen(newOpen);
    };

    const navigate = useNavigate();

    const [isShiftOpen, setIsShiftOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchShiftState = useCallback(() => {
        VchasnoApiClient.isShiftActive()
            .then(setIsShiftOpen)
            .catch((err) => {
                // TODO: add toast
                console.log(err);
            });
    }, [isShiftOpen]);

    const handleApiError = (errorText?: string) => {
        if (errorText && errorText.trim() !== '') {
            // TODO: add toast
            console.error('API reported error:', errorText);
        }
    };

    const onStartShift = async () => {
        setLoading(true);
        try {
            const response = await VchasnoApiClient.startShift();
            handleApiError(response?.errortxt);
            fetchShiftState();
        } catch (e) {
            console.error('Failed to open shift:', e);
        } finally {
            setLoading(false);
        }
    };

    const onEndShift = async () => {
        setLoading(true);
        try {
            const response = await VchasnoApiClient.endShift();
            handleApiError(response?.errortxt);
            fetchShiftState();
        } catch (e) {
            console.error('Failed to close shift:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShiftState();
    }, [isShiftOpen]);

    const DrawerList = (
        <Box sx={{ width: 300, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <DrawerHeader>
                <IconButton onClick={() => props.setIsOpen(false)}>
                    <ChevronLeftIcon />
                </IconButton>
            </DrawerHeader>
            <Divider />

            <List sx={{ flexGrow: 1 }}>
                <ListItem key="Orders" disablePadding>
                    <ListItemButton onClick={() => navigate('/orders')}>
                        <ListItemIcon>
                            <StoreIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Замовлення" />
                    </ListItemButton>
                </ListItem>
                <ListItem key="Customers" disablePadding>
                    <ListItemButton onClick={() => navigate('/customers')}>
                        <ListItemIcon>
                            <CustomerIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Клієнти" />
                    </ListItemButton>
                </ListItem>
                <ListItem key="WorkUnites" disablePadding>
                    <ListItemButton onClick={() => navigate('/work-units')}>
                        <ListItemIcon>
                            <PercentIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Наряди" />
                    </ListItemButton>
                </ListItem>
                <ListItem key="PriceLists" disablePadding>
                    <ListItemButton onClick={() => navigate('/pricing')}>
                        <ListItemIcon>
                            <LocalOfferIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Прайс-листи" />
                    </ListItemButton>
                </ListItem>
                <ListItem key="Materials" disablePadding>
                    <ListItemButton onClick={() => navigate('/materials')}>
                        <ListItemIcon>
                            <DiamondIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Каталог матеріалів" />
                    </ListItemButton>
                </ListItem>
                <ListItem key="Employees" disablePadding>
                    <ListItemButton onClick={() => navigate('/employees')}>
                        <ListItemIcon>
                            <EmployeesIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Працівники" />
                    </ListItemButton>
                </ListItem>
                <ListItem key="Products" disablePadding>
                    <ListItemButton onClick={() => navigate('/products')}>
                        <ListItemIcon>
                            <ListAltIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Каталог виробів" />
                    </ListItemButton>
                </ListItem>
                <ListItem key="Statistics" disablePadding>
                    <ListItemButton onClick={() => navigate('/stats')}>
                        <ListItemIcon>
                            <QueryStatsIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Статистика" />
                    </ListItemButton>
                </ListItem>
            </List>

            <Box
                sx={{
                    p: 2,
                    borderTop: '1px solid #eee',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                }}
            >
                {!isShiftOpen && (
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={onStartShift}
                        disabled={loading}
                        startIcon={
                            loading ? <CircularProgress size={18} color="inherit" /> : undefined
                        }
                    >
                        Відкрити зміну
                    </Button>
                )}
                {isShiftOpen && (
                    <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        onClick={onEndShift}
                        disabled={loading}
                        startIcon={
                            loading ? <CircularProgress size={18} color="inherit" /> : undefined
                        }
                    >
                        Закрити зміну
                    </Button>
                )}
            </Box>
        </Box>
    );

    return (
        <Drawer open={props.isOpen} onClose={toggleDrawer(false)}>
            {DrawerList}
        </Drawer>
    );
};

export default Sidebar;
