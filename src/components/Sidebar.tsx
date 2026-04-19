import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import EmployeesIcon from '@mui/icons-material/Groups2';
import DiamondIcon from '@mui/icons-material/Diamond';
import { IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useLocation, useNavigate } from 'react-router-dom';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CustomerIcon from '@mui/icons-material/Portrait';
import PercentIcon from '@mui/icons-material/Percent';
import StoreIcon from '@mui/icons-material/Store';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import type { SvgIconComponent } from '@mui/icons-material';
import ShiftSidebarActions from './vchasno/ShiftSidebarActions.tsx';
import { APP_HEADER_BAR_HEIGHT, SIDEBAR_ICON_FONT_PX } from '../constants/appShell.ts';

export const SIDEBAR_WIDTH_EXPANDED = 260;
export const SIDEBAR_WIDTH_COLLAPSED = 56;

export interface SidebarProps {
    expanded: boolean;
    setExpanded: (expanded: boolean) => void;
}

type NavItem = {
    path: string;
    label: string;
    Icon: SvgIconComponent;
};

const navItems: NavItem[] = [
    { path: '/orders', label: 'Замовлення', Icon: StoreIcon },
    { path: '/customers', label: 'Клієнти', Icon: CustomerIcon },
    { path: '/work-units', label: 'Наряди', Icon: PercentIcon },
    { path: '/pricing', label: 'Прайс-листи', Icon: LocalOfferIcon },
    { path: '/materials', label: 'Каталог матеріалів', Icon: DiamondIcon },
    { path: '/employees', label: 'Працівники', Icon: EmployeesIcon },
    { path: '/products', label: 'Каталог виробів', Icon: ListAltIcon },
    { path: '/stats', label: 'Статистика', Icon: QueryStatsIcon },
];

const Sidebar = ({ expanded, setExpanded }: SidebarProps) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const width = expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

    const NavButton = ({ path, label, Icon }: NavItem) => {
        const selected =
            pathname === path || (path !== '/' && pathname.startsWith(path + '/'));
        const button = (
            <ListItemButton
                onClick={() => navigate(path)}
                selected={selected}
                sx={{
                    minHeight: 52,
                    justifyContent: expanded ? 'initial' : 'center',
                    px: expanded ? 2 : 1,
                    borderRadius: 1,
                    mx: 0.5,
                }}
            >
                <ListItemIcon
                    sx={{
                        minWidth: expanded ? 48 : 0,
                        mr: expanded ? 1 : 0,
                        justifyContent: 'center',
                        color: 'action.active',
                    }}
                >
                    <Icon sx={{ fontSize: SIDEBAR_ICON_FONT_PX }} />
                </ListItemIcon>
                {expanded && (
                    <ListItemText primary={label} primaryTypographyProps={{ variant: 'body2' }} />
                )}
            </ListItemButton>
        );

        if (!expanded) {
            return (
                <Tooltip title={label} placement="right" arrow enterDelay={300}>
                    <span>{button}</span>
                </Tooltip>
            );
        }
        return button;
    };

    return (
        <Box
            component="nav"
            aria-label="Головна навігація"
            sx={{
                width,
                flexShrink: 0,
                alignSelf: 'stretch',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRight: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: (theme) =>
                    theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                overflowX: 'hidden',
                overflowY: 'auto',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: expanded ? 'flex-end' : 'center',
                    height: APP_HEADER_BAR_HEIGHT,
                    minHeight: APP_HEADER_BAR_HEIGHT,
                    boxSizing: 'border-box',
                    px: 0.5,
                    flexShrink: 0,
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Tooltip title={expanded ? 'Згорнути' : 'Розгорнути'} placement="right" arrow>
                    <IconButton
                        size="medium"
                        onClick={() => setExpanded(!expanded)}
                        aria-label={expanded ? 'Згорнути бічну панель' : 'Розгорнути бічну панель'}
                        sx={{
                            p: 1.25,
                            borderRadius: 1,
                            color: 'action.active',
                            '& .MuiSvgIcon-root': {
                                fontSize: SIDEBAR_ICON_FONT_PX,
                            },
                        }}
                    >
                        {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </Tooltip>
            </Box>

            <List sx={{ flexGrow: 1, py: 1, px: 0 }}>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
                        <NavButton {...item} />
                    </ListItem>
                ))}
            </List>

            <ShiftSidebarActions collapsed={!expanded} />
        </Box>
    );
};

export default Sidebar;
