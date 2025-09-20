import { Box, Button, Paper, type Theme, Typography, useTheme } from '@mui/material';
import commonStyles from '../styles/Common.module.css';
import paperStyles from '../styles/Paper.module.css';
import logo from '/logo.jpg';
import imageStyles from '../styles/Image.module.css';
import { useState } from 'react';

const ThemeDemoPage = () => {
    const [count, setCount] = useState<number>(0);
    const theme: Theme = useTheme();

    return (
        <Paper
            className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
            style={{ gap: theme.spacing(4), borderRadius: '10px' }}
        >
            <Box
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'center' }}
                width="100%"
                gap={{ xs: 3, sm: 2, md: 4 }}
                sx={{
                    padding: { xs: 2, sm: 3 },
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
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
                    Скарбниця Зоря
                </Typography>
            </Box>
            <img src={logo} alt="Application logo" className={imageStyles.largeImage} />
            <Button
                onClick={() => setCount((count) => count + 1)}
                variant="contained"
                color="primary"
            >
                Count is {count}
            </Button>

            <hr />

            <Box width={'100%'}>
                <Typography variant="h1">Заголовок h1</Typography>
                <Typography variant="h2">Заголовок h2</Typography>
                <Typography variant="h3">Заголовок h3</Typography>
                <Typography variant="h4">Заголовок h4</Typography>
                <Typography variant="h5">Заголовок h5</Typography>

                <Typography variant="body1">
                    Звичайний текст основного типу. Lorem Ipsum є псевдо- латинський текст
                    використовується у веб - дизайні, типографіка, верстка, і друку замість
                    англійської підкреслити елементи дизайну над змістом. Це також називається
                    заповнювач ( або наповнювач) текст. Це зручний інструмент для макетів. Це
                    допомагає намітити візуальні елементи в документ або презентацію, наприклад,
                    друкарня, шрифт, або макет. Lorem Ipsum в основному частиною латинського тексту
                    за класичною автор і філософа Цицерона. Це слова і букви були змінені додаванням
                    або видаленням, так навмисно роблять його зміст безглуздо, це не є справжньою,
                    правильно чи зрозумілою Латинської більше. У той час як Lorem Ipsum все ще
                    нагадує класичну латину, він насправді не має ніякого значення. Як текст
                    Цицерона не містить літери K, W, або Z, чужі латина, ці та інші часто
                    вставляється випадково імітувати типографський Зовнішність європейських мовах,
                    як і орграфов будуть знайдено в оригіналі.
                </Typography>
                <Typography variant="body2">
                    Звичайний текст другорядного типу. Lorem Ipsum є псевдо- латинський текст
                    використовується у веб - дизайні, типографіка, верстка, і друку замість
                    англійської підкреслити елементи дизайну над змістом. Це також називається
                    заповнювач ( або наповнювач) текст. Це зручний інструмент для макетів. Це
                    допомагає намітити візуальні елементи в документ або презентацію, наприклад,
                    друкарня, шрифт, або макет. Lorem Ipsum в основному частиною латинського тексту
                    за класичною автор і філософа Цицерона. Це слова і букви були змінені додаванням
                    або видаленням, так навмисно роблять його зміст безглуздо, це не є справжньою,
                    правильно чи зрозумілою Латинської більше. У той час як Lorem Ipsum все ще
                    нагадує класичну латину, він насправді не має ніякого значення. Як текст
                    Цицерона не містить літери K, W, або Z, чужі латина, ці та інші часто
                    вставляється випадково імітувати типографський Зовнішність європейських мовах,
                    як і орграфов будуть знайдено в оригіналі.
                </Typography>

                <Box
                    className={commonStyles.flexColumn}
                    gap={theme.spacing(5)}
                    marginTop={theme.spacing(5)}
                    alignItems={'flex-start'}
                >
                    <Button color="primary" variant="contained" style={{ display: 'block' }}>
                        Основна кнопка
                    </Button>
                    <Button color="secondary" variant="contained" style={{ display: 'block' }}>
                        Другорядна кнопка
                    </Button>
                    <Button color="error" variant="contained" style={{ display: 'block ' }}>
                        Небезпечна кнопка
                    </Button>
                </Box>

                <Paper
                    style={{
                        backgroundColor: theme.palette.warning.main,
                        marginTop: theme.spacing(4),
                        padding: theme.spacing(6),
                    }}
                >
                    <Typography variant="h4">Попередження</Typography>
                    <Typography variant="body2">
                        Необхідно додати <b>265314.78 грн.</b>
                    </Typography>
                    <Typography variant="body2">
                        406104.54 - 24999.00 - 100000.00 - 5101.76 - 10689.00 ={' '}
                        <b>265314.78 грн.</b>
                    </Typography>
                </Paper>
            </Box>
        </Paper>
    );
};

export default ThemeDemoPage;
