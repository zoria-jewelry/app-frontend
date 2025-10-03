import { AppBar, Box, type Theme, Typography, useTheme } from '@mui/material';
import headerStyles from '../styles/HeaderComponent.module.css';
import MenuIcon from '@mui/icons-material/Menu';
import iconsStyles from '../styles/Icons.module.css';
import commonStyles from '../styles/Common.module.css';
import ProfileHeaderPartComponent from './common/ProfileHeaderPartComponent.tsx';

export interface HeaderComponentProps {
    toggleOpenSidebar: () => void;
}

const HeaderComponent = (props: HeaderComponentProps) => {
    const theme: Theme = useTheme();
    return (
        <AppBar
            position="sticky"
            className={headerStyles.headerComponent}
            sx={{
                marginBottom: theme.spacing(10),
                padding: theme.spacing(5),
                flexDirection: 'row',
            }}
        >
            <Box className={commonStyles.flexRow} style={{ gap: theme.spacing(5) }}>
                <Box
                    sx={{
                        width: 50,
                        height: 50,
                        border: '2px solid white',
                        transition: 'transform 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: 'pointer',
                        '&:hover': {
                            transform: 'rotate(45deg)',
                            '& .menu-icon': {
                                transform: 'rotate(-45deg)',
                            },
                        },
                    }}
                    onClick={props.toggleOpenSidebar}
                >
                    <MenuIcon
                        className={`menu-icon ${iconsStyles.burgerMenuIcon}`}
                        sx={{
                            width: 30,
                            height: 30,
                            transition: 'transform 0.15s ease',
                        }}
                    />
                </Box>
                <Typography variant="h2">Zoria</Typography>
            </Box>

            <ProfileHeaderPartComponent />
        </AppBar>
    );
};

export default HeaderComponent;
