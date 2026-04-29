import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    Box,
    FormControl,
    FormHelperText,
    IconButton,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { EmployeeDto } from '../../dto/employees.ts';
import { EmployeesApiClient } from '../../api/employeesApiClient.ts';
import type { MaterialDto } from '../../dto/materials.ts';
import { MaterialsApiClient } from '../../api/materialsApiClient.ts';
import { OrdersApiClient } from '../../api/ordersApiClient.ts';
import type { WorkUnitsFilterData } from '../../dto/work-units.ts';
import { workUnitsFilterSchema, type WorkUnitsFilterFormData } from '../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { formatDateToYYYYMMDD, getCurrentMonthRange } from '../../utils.ts';
import { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from '../Sidebar.tsx';
import { APP_HEADER_BAR_HEIGHT, SIDEBAR_ICON_FONT_PX } from '../../constants/appShell.ts';

const STORAGE_KEY = 'zoria-work-units-sidebar-expanded';

export interface WorkUnitsFilterSidebarProps {
    onApply: (filterData: WorkUnitsFilterData) => void;
}

function snapshotWorkUnitsForm(data: WorkUnitsFilterFormData, employees: EmployeeDto[]): string {
    const emp =
        data.employeeId && data.employeeId > 0
            ? employees.find((e) => e.id === data.employeeId)
            : undefined;
    return JSON.stringify({
        employeeId: data.employeeId,
        employeeFullName: emp?.name ?? null,
        materialId: data.materialId,
        orderId: data.orderId ?? null,
        periodStart: data.periodStart instanceof Date ? data.periodStart.getTime() : null,
        periodEnd: data.periodEnd instanceof Date ? data.periodEnd.getTime() : null,
    });
}

const WorkUnitsFilterSidebar = ({ onApply }: WorkUnitsFilterSidebarProps) => {
    const [expanded, setExpanded] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === null) return true;
            return stored === 'true';
        } catch {
            return true;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, String(expanded));
        } catch {
            /* ignore */
        }
    }, [expanded]);

    const currentMonth = getCurrentMonthRange();
    const [employees, setEmployees] = useState<EmployeeDto[]>([]);
    const [metals, setMetals] = useState<MaterialDto[]>([]);
    const [ordersIds, setOrdersIds] = useState<number[]>([]);

    const {
        control,
        setValue,
        watch,
        trigger,
        getValues,
        formState: { errors },
    } = useForm<WorkUnitsFilterFormData>({
        resolver: zodResolver(workUnitsFilterSchema),
        reValidateMode: 'onChange',
        defaultValues: {
            periodStart: currentMonth.start,
            periodEnd: currentMonth.end,
            employeeId: 0,
            materialId: 0,
            orderId: undefined,
        },
    });

    const onApplyRef = useRef(onApply);
    onApplyRef.current = onApply;
    const lastAppliedSnapshotRef = useRef<string | null>(null);

    const notifyParentIfChanged = useCallback(() => {
        void trigger().then((valid) => {
            if (!valid) return;
            const data = getValues();
            const key = snapshotWorkUnitsForm(data, employees);
            if (key === lastAppliedSnapshotRef.current) {
                return;
            }
            lastAppliedSnapshotRef.current = key;
            const emp =
                data.employeeId && data.employeeId > 0
                    ? employees.find((e) => e.id === data.employeeId)
                    : undefined;
            onApplyRef.current({
                employeeId: data.employeeId,
                employeeFullName: emp?.name,
                periodStart: data.periodStart,
                periodEnd: data.periodEnd,
                materialId: data.materialId,
                orderId: data.orderId,
            });
        });
    }, [trigger, getValues, employees]);

    const notifyRef = useRef(notifyParentIfChanged);
    notifyRef.current = notifyParentIfChanged;

    useEffect(() => {
        EmployeesApiClient.getAllActive().then((es) => {
            setEmployees(es ?? []);
            queueMicrotask(() => notifyRef.current());
        });
        MaterialsApiClient.getAll().then((ms) => {
            setMetals(ms ?? []);
            queueMicrotask(() => notifyRef.current());
        });
        OrdersApiClient.getAllActiveIds().then((ids) => setOrdersIds(ids ?? []));
    }, []);

    /** Keep required fields on first list item; no empty selection. */
    useLayoutEffect(() => {
        if (employees.length === 0) {
            return;
        }
        const id = getValues('employeeId');
        if (!id || !employees.some((e) => e.id === id)) {
            setValue('employeeId', employees[0].id, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: false,
            });
            queueMicrotask(() => notifyRef.current());
        }
    }, [employees, getValues, setValue]);

    useLayoutEffect(() => {
        if (metals.length === 0) {
            return;
        }
        const id = getValues('materialId');
        if (!id || !metals.some((m) => m.id === id)) {
            setValue('materialId', metals[0].id, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: false,
            });
            queueMicrotask(() => notifyRef.current());
        }
    }, [metals, getValues, setValue]);

    const width = expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

    const employeeIdWatched = useWatch({ control, name: 'employeeId', defaultValue: 0 }) ?? 0;
    const materialIdWatched = useWatch({ control, name: 'materialId', defaultValue: 0 }) ?? 0;

    const employeeSelectValue =
        employees.length === 0
            ? ''
            : employees.some((e) => e.id === employeeIdWatched)
              ? employeeIdWatched
              : employees[0].id;

    const metalSelectValue =
        metals.length === 0
            ? ''
            : metals.some((m) => m.id === materialIdWatched)
              ? materialIdWatched
              : metals[0].id;

    return (
        <Box
            component="aside"
            aria-label="Фільтри нарядів"
            sx={{
                width,
                flexShrink: 0,
                alignSelf: 'stretch',
                minHeight: `calc(100vh - ${APP_HEADER_BAR_HEIGHT})`,
                height: `calc(100vh - ${APP_HEADER_BAR_HEIGHT})`,
                maxHeight: `calc(100vh - ${APP_HEADER_BAR_HEIGHT})`,
                display: 'flex',
                flexDirection: 'column',
                borderRight: 1,
                borderBottom: 'none',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: (theme) =>
                    theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                overflowX: 'hidden',
                overflowY: 'hidden',
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
                        aria-label={
                            expanded ? 'Згорнути панель фільтрів' : 'Розгорнути панель фільтрів'
                        }
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

            {expanded && (
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        px: 5,
                        py: 2,
                    }}
                >
                    <Typography variant="h4" component="h4" sx={{ mb: 3, fontWeight: 600 }}>
                        Фільтри
                    </Typography>

                    <Stack spacing={6} sx={{ width: '100%' }}>
                        <Box sx={{ width: '100%' }}>
                            <Typography
                                id="work-units-filter-employee-label"
                                variant="body2"
                                component="div"
                                sx={{ mb: 1, fontWeight: 600 }}
                            >
                                Працівник
                            </Typography>
                            <FormControl
                                fullWidth
                                margin="none"
                                variant="outlined"
                                size="small"
                                error={!!errors.employeeId}
                            >
                                <Select
                                    fullWidth
                                    disabled={employees.length === 0}
                                    value={employeeSelectValue}
                                    onChange={(e) => {
                                        setValue('employeeId', Number(e.target.value), {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                            shouldTouch: false,
                                        });
                                        queueMicrotask(() => notifyRef.current());
                                    }}
                                >
                                    {employees.map((emp) => (
                                        <MenuItem key={emp.id} value={emp.id}>
                                            {emp.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormHelperText error={!!errors.employeeId} sx={{ mx: 0 }}>
                                {errors.employeeId ? errors.employeeId.message : ''}
                            </FormHelperText>
                        </Box>

                        <Box sx={{ width: '100%' }}>
                            <Typography
                                variant="body2"
                                component="div"
                                sx={{ mb: 1, fontWeight: 600 }}
                            >
                                За період
                            </Typography>
                            <Stack spacing={1.25}>
                                <Box>
                                    <Typography
                                        variant="caption"
                                        component="div"
                                        sx={{ mb: 0, lineHeight: 1.2, display: 'block' }}
                                    >
                                        З дати включно
                                    </Typography>
                                    <TextField
                                        type="date"
                                        fullWidth
                                        size="small"
                                        margin="none"
                                        value={
                                            watch('periodStart')
                                                ? formatDateToYYYYMMDD(watch('periodStart'))
                                                : ''
                                        }
                                        onChange={(e) => {
                                            setValue('periodStart', new Date(e.target.value));
                                            queueMicrotask(() => notifyRef.current());
                                        }}
                                        error={!!errors.periodStart}
                                        sx={{ mt: 0.25 }}
                                    />
                                    <FormHelperText
                                        error={!!errors.periodStart}
                                        sx={{ mx: 0, mt: 0.25 }}
                                    >
                                        {errors.periodStart ? errors.periodStart.message : ''}
                                    </FormHelperText>
                                </Box>
                                <Box>
                                    <Typography
                                        variant="caption"
                                        component="div"
                                        sx={{ mb: 0, lineHeight: 1.2, display: 'block' }}
                                    >
                                        До дати включно
                                    </Typography>
                                    <TextField
                                        type="date"
                                        fullWidth
                                        size="small"
                                        margin="none"
                                        value={
                                            watch('periodEnd')
                                                ? formatDateToYYYYMMDD(watch('periodEnd'))
                                                : ''
                                        }
                                        onChange={(e) => {
                                            setValue('periodEnd', new Date(e.target.value));
                                            queueMicrotask(() => notifyRef.current());
                                        }}
                                        error={!!errors.periodEnd}
                                        sx={{ mt: 0.25 }}
                                    />
                                    <FormHelperText
                                        error={!!errors.periodEnd}
                                        sx={{ mx: 0, mt: 0.25 }}
                                    >
                                        {errors.periodEnd ? errors.periodEnd.message : ''}
                                    </FormHelperText>
                                </Box>
                            </Stack>
                        </Box>

                        <Box sx={{ width: '100%' }}>
                            <Typography
                                variant="body2"
                                component="div"
                                sx={{ mb: 1, fontWeight: 600 }}
                            >
                                Тип металу
                            </Typography>
                            <FormControl
                                fullWidth
                                margin="none"
                                variant="outlined"
                                size="small"
                                error={!!errors.materialId}
                            >
                                <Select
                                    fullWidth
                                    disabled={metals.length === 0}
                                    value={metalSelectValue}
                                    onChange={(e) => {
                                        setValue('materialId', Number(e.target.value));
                                        queueMicrotask(() => notifyRef.current());
                                    }}
                                >
                                    {metals.map((m) => (
                                        <MenuItem key={m.id} value={m.id}>
                                            {m.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormHelperText error={!!errors.materialId} sx={{ mx: 0 }}>
                                {errors.materialId ? errors.materialId.message : ''}
                            </FormHelperText>
                        </Box>

                        <Box sx={{ width: '100%' }}>
                            <Typography
                                variant="body2"
                                component="div"
                                sx={{ mb: 1, fontWeight: 600 }}
                            >
                                Замовлення (№)
                            </Typography>
                            <FormControl
                                fullWidth
                                margin="none"
                                variant="outlined"
                                size="small"
                                error={!!errors.orderId}
                            >
                                <Select
                                    fullWidth
                                    value={watch('orderId') ?? ''}
                                    onChange={(e) => {
                                        setValue(
                                            'orderId',
                                            e.target.value ? Number(e.target.value) : undefined,
                                        );
                                        queueMicrotask(() => notifyRef.current());
                                    }}
                                    displayEmpty
                                >
                                    <MenuItem value="">Оберіть замовлення</MenuItem>
                                    {ordersIds.map((o) => (
                                        <MenuItem key={o} value={o}>
                                            {o}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormHelperText error={!!errors.orderId} sx={{ mx: 0 }}>
                                {errors.orderId ? errors.orderId.message : ''}
                            </FormHelperText>
                        </Box>
                    </Stack>
                </Box>
            )}
        </Box>
    );
};

export default WorkUnitsFilterSidebar;
