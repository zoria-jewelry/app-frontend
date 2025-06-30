import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Button, DialogActions, DialogContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(10),
        paddingTop: 0,
    },
}));

export interface DialogComponentProps {
    handleClose: () => void;
    handleAction: () => void;
    isOpen: boolean;
    dialogText: string;
    actionButtonText: string;
    actionButtonVariant: 'primary' | 'secondary' | 'error';
}

const DialogComponent = (props: DialogComponentProps) => {
    return (
        <BootstrapDialog
            onClose={props.handleClose}
            aria-labelledby="customized-dialog-title"
            open={props.isOpen}
        >
            <IconButton
                aria-label="close"
                onClick={props.handleClose}
                size="large"
                sx={(theme) => ({
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: theme.palette.grey[500],
                })}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent>
                <Typography variant="body1">{props.dialogText}</Typography>
            </DialogContent>
            <DialogActions
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                }}
            >
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={props.handleClose}
                    style={{
                        flexGrow: 1,
                    }}
                >
                    Назад
                </Button>
                <Button
                    variant="contained"
                    color={props.actionButtonVariant}
                    onClick={props.handleAction}
                    style={{
                        flexGrow: 1,
                    }}
                >
                    {props.actionButtonText}
                </Button>
            </DialogActions>
        </BootstrapDialog>
    );
};

export default DialogComponent;
