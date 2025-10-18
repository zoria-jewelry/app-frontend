import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import { Tooltip } from '@mui/material';
import { useAuth } from '../../auth/AuthContext.tsx';

const ProfileHeaderPartComponent = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const onLogout = (): void => {
        logout().then(() => {
            navigate('/login');
        });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50px',
                padding: '6px 12px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                maxWidth: '400px',
            }}
        >
            <Tooltip title={user?.full_name} arrow>
                <Typography
                    variant="body1"
                    noWrap
                    sx={{
                        color: 'white',
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        marginLeft: 1,
                        maxWidth: '200px',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {user?.full_name}
                </Typography>
            </Tooltip>

            <Box
                component="span"
                sx={{
                    width: '1px',
                    height: '24px',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    marginX: 1,
                }}
            />

            <IconButton
                size="large"
                onClick={onLogout}
                sx={{
                    color: 'white',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'scale(1.15) rotate(-10deg)',
                        color: '#FF5252',
                    },
                }}
            >
                <LogoutIcon />
            </IconButton>
        </Box>
    );
};

export default ProfileHeaderPartComponent;
