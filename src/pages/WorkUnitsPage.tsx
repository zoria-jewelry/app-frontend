import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import { Box, Button, Grid, Paper, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import type { WorkUnitsReportDto } from '../dto/work-units.ts';
import { WorkUnitsApiClient } from '../api/workUnitsApiClient.ts';
import { toLocalDate } from '../utils.ts';

const WorkUnitsPage = () => {
    const theme = useTheme();

    const [report, setReport] = useState<WorkUnitsReportDto | undefined>();

    useEffect(() => {
        WorkUnitsApiClient.getReportForPeriod({
            startDate: new Date(),
            endDate: new Date(),
            employeeId: 1,
            metalId: 1,
        })
            .then(setReport)
            .catch((error) => console.log(error));
    }, []);

    return (
        <Paper
            className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
            style={{ gap: theme.spacing(4), borderRadius: '10px', maxHeight: '80vh' }}
        >
            {/* Page name and button */}
            <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                style={{ gap: theme.spacing(4) }}
            >
                <Grid>
                    {report && (
                        <>
                            <Typography variant="h3">
                                Наряди ({report.employeeFullName}){' '}
                            </Typography>
                            <Typography variant="body1">
                                {toLocalDate(report.periodStart)} – {toLocalDate(report.periodEnd)}
                            </Typography>
                        </>
                    )}
                </Grid>
                <Grid>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ marginBottom: theme.spacing(1) }}
                        onClick={() => {}}
                    >
                        Нова видача
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default WorkUnitsPage;
