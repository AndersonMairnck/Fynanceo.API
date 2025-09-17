// src/components/common/ConfirmationDialog.jsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert
} from '@mui/material';

const ConfirmationDialog = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    loading,
    error
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <p>{message}</p>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? 'Excluindo...' : 'Excluir'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;