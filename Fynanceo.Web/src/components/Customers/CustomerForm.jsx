// src/components/Customers/CustomerForm.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Alert,
    MenuItem,
    Typography
} from '@mui/material';

// Lista de estados brasileiros
const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const CustomerForm = ({ open, onClose, customer, onSubmit, loading, error }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        rua: '',           // Nome correto: rua
        numero: '',        // Nome correto: numero (precisa confirmar se é "numero" ou "number")
        complemento: '',   // Nome correto: complemento
        bairro: '',        // Nome correto: bairro
        cidade: '',        // Nome correto: cidade
        cep: '',           // Nome correto: cep
        estado: ''         // Nome correto: estado
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                rua: customer.rua || customer.street || '',
                numero: customer.numero || customer.number || '',
                complemento: customer.complemento || customer.complement || '',
                bairro: customer.bairro || customer.neighborhood || '',
                cidade: customer.cidade || customer.city || '',
                cep: customer.cep || customer.zipCode || '',
                estado: customer.estado || customer.state || ''
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                rua: '',
                numero: '',
                complemento: '',
                bairro: '',
                cidade: '',
                cep: '',
                estado: ''
            });
        }
        setFormError('');
    }, [customer, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatPhone = (phone) => {
        const numbers = phone.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2')
                .replace(/(-\d{4})\d+?$/, '$1');
        }
        return phone;
    };

    const formatCep = (cep) => {
        const numbers = cep.replace(/\D/g, '');
        if (numbers.length <= 8) {
            return numbers
                .replace(/(\d{5})(\d)/, '$1-$2')
                .replace(/(-\d{3})\d+?$/, '$1');
        }
        return cep;
    };

    const handlePhoneChange = (e) => {
        const formattedPhone = formatPhone(e.target.value);
        setFormData(prev => ({
            ...prev,
            phone: formattedPhone
        }));
    };

    const handleCepChange = (e) => {
        const formattedCep = formatCep(e.target.value);
        setFormData(prev => ({
            ...prev,
            cep: formattedCep
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setFormError('Nome é obrigatório');
            return false;
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            setFormError('Email inválido');
            return false;
        }

        if (formData.cep && !/^\d{5}-\d{3}$/.test(formData.cep)) {
            setFormError('CEP inválido');
            return false;
        }

        setFormError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            // Preparar dados no formato que a API espera
            const dataToSend = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                rua: formData.numero ? `${formData.rua}, ${formData.numero}` : formData.rua,
                
                complemento: formData.complemento,
                bairro: formData.bairro,
                cidade: formData.cidade,
                cep: formData.cep,
                estado: formData.estado
            };

            await onSubmit(dataToSend);
            onClose();
        } catch (err) {
            // Error is handled by parent component
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {customer ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {(error || formError) && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error || formError}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nome *"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Telefone"
                                name="phone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                disabled={loading}
                                placeholder="(11) 99999-9999"
                            />
                        </Grid>

                        {/* Seção de Endereço */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                                Endereço
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Rua"
                                name="rua"
                                value={formData.rua}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Número"
                                name="numero"
                                value={formData.numero}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Complemento"
                                name="complemento"
                                value={formData.complemento}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="Apto, Bloco, etc."
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Bairro"
                                name="bairro"
                                value={formData.bairro}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Cidade"
                                name="cidade"
                                value={formData.cidade}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="CEP"
                                name="cep"
                                value={formData.cep}
                                onChange={handleCepChange}
                                disabled={loading}
                                placeholder="00000-000"
                            />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField
                                select
                                fullWidth
                                label="Estado"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <MenuItem value="">
                                    <em>Selecione</em>
                                </MenuItem>
                                {estados.map((estado) => (
                                    <MenuItem key={estado} value={estado}>
                                        {estado}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Salvando...' : (customer ? 'Atualizar' : 'Criar')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CustomerForm;