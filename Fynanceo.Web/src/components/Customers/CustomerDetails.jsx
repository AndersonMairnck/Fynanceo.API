// src/components/Customers/CustomerDetails.jsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Grid,
    Chip,
    Divider
} from '@mui/material';
import CustomerAddress from './CustomerAddress';

const CustomerDetails = ({ open, onClose, customer }) => {
    if (!customer) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h6">{customer.name}</Typography>
                        <Chip
                            label={customer.isActive ? 'Ativo' : 'Inativo'}
                            color={customer.isActive ? 'success' : 'error'}
                            size="small"
                            sx={{ mt: 1 }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Email
                        </Typography>
                        <Typography>{customer.email || 'Não informado'}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Telefone
                        </Typography>
                        <Typography>{customer.phone || 'Não informado'}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Endereço
                        </Typography>
                        <CustomerAddress customer={customer} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Data de Cadastro
                        </Typography>
                        <Typography>
                            {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                        </Typography>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerDetails;