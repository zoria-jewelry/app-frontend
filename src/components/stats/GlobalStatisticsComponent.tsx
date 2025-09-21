import paperStyles from '../../styles/Paper.module.css';
import commonStyles from '../../styles/Common.module.css';
import { Box, Paper, TextField, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { formatDateToYYYYMMDD } from '../../utils.ts';

export interface GlobalStatisticsProps {
    refetchStats: () => void;
}

const GlobalStatisticsComponent = () => {
    const theme = useTheme();

    const [date, setDate] = useState<Date>(new Date());

    useEffect(() => {}, [date]);

    return (
        <Paper
            className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
            style={{ gap: theme.spacing(4), borderRadius: '10px', maxHeight: '80vh' }}
        >
            <Box
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'center' }}
                width="100%"
                sx={{
                    padding: { xs: 2, sm: 3 },
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    flex={1}
                    minWidth={0}
                    sx={{ textAlign: { xs: 'center', md: 'left' } }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 600,
                            lineHeight: 1.2,
                            marginBottom: 0.5,
                            wordBreak: 'break-word',
                        }}
                    >
                        Статистика
                    </Typography>
                </Box>

                <Box
                    display="flex"
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    gap={{ xs: 2, sm: 1.5, md: 2 }}
                    width={{ xs: '100%', md: 'auto' }}
                    minWidth={{ xs: 'auto', sm: 'fit-content' }}
                >
                    <TextField
                        type="date"
                        fullWidth
                        value={date && formatDateToYYYYMMDD(date)}
                        onChange={(e) => setDate(new Date(e.target.value))}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                            mb: theme.spacing(2),
                        }}
                    />
                </Box>
            </Box>

            <Paper
                className={paperStyles.paper}
                sx={{ width: '100%', my: theme.spacing(2), boxShadow: 4 }}
            >
                <Typography variant="h5">Металу в сховищі (загальне)</Typography>
                {}
            </Paper>

            <Paper
                className={paperStyles.paper}
                sx={{ width: '100%', mt: theme.spacing(2), mb: theme.spacing(4), boxShadow: 4 }}
            >
                <Typography variant="h5">Металу в сховищі (без клієнтського)</Typography>
            </Paper>
        </Paper>
    );
};

export default GlobalStatisticsComponent;
