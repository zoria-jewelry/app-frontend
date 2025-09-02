import { useParams } from 'react-router-dom';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Paper,
    Typography,
    useTheme,
} from '@mui/material';
import paperStyles from '../styles/Paper.module.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CompleteOrderPage = () => {
    const theme = useTheme();

    const params = useParams();
    const orderId: number = Number(params.orderId);

    return (
        <Box
            width="100%"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap={theme.spacing(4)}
        >
            <Paper className={paperStyles.paper} sx={{ padding: theme.spacing(6) }}>
                <Typography variant="h3">Завершення замовлення №{orderId}</Typography>
            </Paper>

            <Accordion
                defaultExpanded
                disableGutters
                square
                className={paperStyles.paper}
                sx={{ padding: theme.spacing(4) }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography variant="h5">Крок 1. Загальні відомості</Typography>
                </AccordionSummary>
                <AccordionDetails></AccordionDetails>
            </Accordion>

            <Accordion
                disableGutters
                square
                className={paperStyles.paper}
                sx={{ padding: theme.spacing(4) }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                >
                    <Typography variant="h5">Крок 2. Розрахунок вартості</Typography>
                </AccordionSummary>
                <AccordionDetails></AccordionDetails>
            </Accordion>

            <Accordion
                disableGutters
                square
                className={paperStyles.paper}
                sx={{ padding: theme.spacing(4) }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3a-content"
                    id="panel3a-header"
                >
                    <Typography variant="h5">Крок 3. Оплата замовлення</Typography>
                </AccordionSummary>
                <AccordionDetails></AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default CompleteOrderPage;
