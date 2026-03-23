import {
    Box,
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import { useCallback, useEffect, useState } from 'react';
import type { MaterialDto } from '../dto/materials.ts';
import { MaterialsApiClient } from '../api/materialsApiClient.ts';
import CreateMaterialComponent from '../components/modal/materials/CreateMaterialComponent.tsx';
import EditMaterialComponent from '../components/modal/materials/EditMaterialComponent.tsx';
import { toFixedNumber } from '../utils.ts';
import { showToast } from '../components/common/Toast.tsx';

const MaterialsPage = () => {
    const theme = useTheme();
    const isCompactHeader = useMediaQuery(theme.breakpoints.down('sm'));
    const [page, setPage] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [entries, setEntries] = useState<MaterialDto[]>([]);

    const [isCreateMaterialModalOpen, setIsCreateMaterialModalOpen] = useState<boolean>(false);
    const [materialIdToEdit, setMaterialIdToEdit] = useState<number | null>(null);

    const fetchMaterials = useCallback(() => {
        MaterialsApiClient.get(page)
            .then((materialsList) => {
                if (!materialsList) {
                    showToast('Не вдалось завантажити реєстр матеріалів', 'error');
                } else {
                    setEntries(materialsList.entries);
                    setTotal(materialsList.total);
                }
            })
            .catch((err) => {
                showToast('Не вдалось завантажити реєстр матеріалів', 'error');
                console.log(err);
            });
    }, [page]);

    useEffect(() => {
        fetchMaterials();
    }, [page]);

    return (
        <Paper
            className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
            style={{ gap: theme.spacing(4), borderRadius: '10px' }}
            sx={{ alignItems: 'stretch' }}
        >
            {/* Page header */}
            <Box
                display="flex"
                flexDirection={isCompactHeader ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems={isCompactHeader ? 'stretch' : 'center'}
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
                <Box
                    display="flex"
                    flexDirection="column"
                    flex={1}
                    minWidth={0}
                    sx={{ textAlign: isCompactHeader ? 'center' : 'left' }}
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
                        Каталог матеріалів
                    </Typography>
                </Box>

                <Box
                    display="flex"
                    flexDirection={isCompactHeader ? 'column' : 'row'}
                    flexWrap={isCompactHeader ? 'wrap' : 'nowrap'}
                    alignItems={isCompactHeader ? 'stretch' : 'center'}
                    justifyContent={isCompactHeader ? 'stretch' : 'flex-end'}
                    gap={{ xs: 2, sm: 1.5, md: 2 }}
                    width={isCompactHeader ? '100%' : 'auto'}
                    minWidth={{ xs: 'auto', sm: 'fit-content' }}
                >
                    <Button
                        onClick={() => setIsCreateMaterialModalOpen(true)}
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{
                            minWidth: { xs: '100%', sm: '170px', md: '200px' },
                            height: { xs: '48px', sm: '40px' },
                            fontWeight: 600,
                            borderRadius: 2,
                            boxShadow: 2,
                            '&:hover': { boxShadow: 4, transform: 'translateY(-1px)' },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        Новий матеріал
                    </Button>
                </Box>
            </Box>

            {/* Data table */}
            <Box width="100%" display="flex" justifyContent="flex-end">
                <TablePagination
                    count={total}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPageOptions={[]}
                    page={page}
                    rowsPerPage={10}
                    style={{ border: 0 }}
                />
            </Box>
            <TableContainer
                style={{
                    minWidth: '350px',
                    overflow: 'auto',
                    boxSizing: 'content-box',
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                style={{ backgroundColor: '#b7cfd2', borderTopLeftRadius: 10 }}
                                width="80px"
                            >
                                ID
                            </TableCell>
                            <TableCell style={{ backgroundColor: '#b7cfd2' }} width="600px">
                                Назва
                            </TableCell>
                            <TableCell
                                style={{
                                    backgroundColor: '#b7cfd2',
                                    textAlign: 'right',
                                }}
                            >
                                Вартість (грн за г)
                            </TableCell>
                            <TableCell
                                style={{
                                    backgroundColor: '#b7cfd2',
                                    borderTopRightRadius: 10,
                                }}
                            ></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entries?.map((material) => (
                            <TableRow key={material.id}>
                                <TableCell>
                                    <Typography variant="body2">{material.id}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{material.name}</Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2">
                                        {toFixedNumber(material.price, 2)}
                                    </Typography>
                                </TableCell>
                                <TableCell
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <IconButton
                                        onClick={() => setMaterialIdToEdit(material.id)}
                                        size="small"
                                        style={{ padding: 0 }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                count={total}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPageOptions={[]}
                page={page}
                rowsPerPage={10}
                style={{
                    border: 0,
                    overflow: 'visible',
                }}
            />

            <CreateMaterialComponent
                handleClose={() => setIsCreateMaterialModalOpen(false)}
                isOpen={isCreateMaterialModalOpen}
                onCreate={fetchMaterials}
            />

            {materialIdToEdit && (
                <EditMaterialComponent
                    handleClose={() => setMaterialIdToEdit(null)}
                    isOpen={!!materialIdToEdit}
                    materialId={materialIdToEdit}
                    onUpdate={fetchMaterials}
                />
            )}
        </Paper>
    );
};

export default MaterialsPage;
