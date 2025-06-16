import { AppBar, Box, type Theme, Typography, useTheme } from '@mui/material';
import headerStyles from '../styles/HeaderComponent.module.css';
import MenuIcon from '@mui/icons-material/Menu';
import iconsStyles from '../styles/Icons.module.css';
import commonStyles from '../styles/Common.module.css';

const HeaderComponent = () => {
    const theme: Theme = useTheme();
    return (
        <AppBar
            position="sticky"
            className={headerStyles.headerComponent}
            style={{ marginBottom: theme.spacing(10), padding: theme.spacing(5) }}
        >
            <Box className={commonStyles.flexRow} style={{ gap: theme.spacing(5) }}>
                <MenuIcon
                    className={iconsStyles.burgerMenuIcon}
                    style={{ width: 40, height: 40 }}
                />
                <Typography variant="h2">Zoria</Typography>
            </Box>
        </AppBar>
    );
};

export default HeaderComponent;
