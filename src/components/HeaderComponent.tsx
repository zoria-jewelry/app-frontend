import { AppBar, Box, type Theme, Typography, useTheme } from '@mui/material';
import headerStyles from '../styles/HeaderComponent.module.css';
import commonStyles from '../styles/Common.module.css';
import ProfileHeaderPartComponent from './common/ProfileHeaderPartComponent.tsx';
import { APP_HEADER_BAR_HEIGHT } from '../constants/appShell.ts';

const HeaderComponent = () => {
    const theme: Theme = useTheme();
    return (
        <AppBar
            position="relative"
            elevation={0}
            className={headerStyles.headerComponent}
            sx={{
                marginBottom: 0,
                padding: theme.spacing(5),
                flexDirection: 'row',
                flexShrink: 0,
                width: '100%',
                height: APP_HEADER_BAR_HEIGHT,
                minHeight: APP_HEADER_BAR_HEIGHT,
                boxSizing: 'border-box',
                borderBottom: 1,
                borderColor: 'divider',
            }}
        >
            <Box className={commonStyles.flexRow} style={{ gap: theme.spacing(5) }}>
                <Typography variant="h2">Zoria</Typography>
            </Box>

            <ProfileHeaderPartComponent />
        </AppBar>
    );
};

export default HeaderComponent;
