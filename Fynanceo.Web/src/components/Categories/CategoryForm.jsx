// src/components/Categories/CategoryForm.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Alert
} from '@mui/material';

const CategoryForm = ({ open, onClose, category, onSubmit, loading, error }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                description: category.description || ''
            });
        } else {
            setFormData({
                name: '',
                description: ''
            });
        }
        setFormError('');
    }, [category, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setFormError('Nome é obrigatório');
            return false;
        }

        if (formData.name.length > 100) {
            setFormError('Nome deve ter no máximo 100 caracteres');
            return false;
        }

        if (formData.description && formData.description.length > 500) {
            setFormError('Descrição deve ter no máximo 500 caracteres');
            return false;
        }

        setFormError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            // Error is handled by parent component
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {category ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {(error || formError) && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error || formError}
                        </Alert>
                    )}

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nome *"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                                inputProps={{ maxLength: 100 }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descrição"
                                name="description"
                                multiline
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="Descrição opcional da categoria"
                                inputProps={{ maxLength: 500 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Salvando...' : (category ? 'Atualizar' : 'Criar')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CategoryForm;