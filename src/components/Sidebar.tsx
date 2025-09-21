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
import { Divider, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate } from 'react-router-dom';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CustomerIcon from '@mui/icons-material/Portrait';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

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

    const DrawerList = (
        <Box sx={{ width: 300 }} role="presentation" onClick={toggleDrawer(false)}>
            {/* Close sidebar button */}
            <DrawerHeader>
                <IconButton onClick={() => props.setIsOpen(false)}>
                    <ChevronLeftIcon />
                </IconButton>
            </DrawerHeader>
            <Divider />
            {/* Sidebar buttons */}
            <List>
                <ListItem key="Customers" disablePadding>
                    <ListItemButton onClick={() => navigate('/customers')}>
                        <ListItemIcon>
                            <CustomerIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Клієнти" />
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
        </Box>
    );

    return (
        <Drawer open={props.isOpen} onClose={toggleDrawer(false)}>
            {DrawerList}
        </Drawer>
    );
};

export default Sidebar;
