import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Alert
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import Layout from '../Layout/Layout';

const OrderForm = () => {
    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Button
                        startIcon={<BackIcon />}
                        href="/orders"
                        variant="outlined"
                    >
                        Voltar
                    </Button>
                    <ShoppingCartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Typography variant="h4">Novo Pedido</Typography>
                </Box>

                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <ShoppingCartIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Módulo em Desenvolvimento
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        O sistema de criação de pedidos está sendo desenvolvido e estará disponível em breve.
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Esta funcionalidade permitirá criar novos pedidos, adicionar produtos, calcular totais e gerenciar entregas.
                    </Alert>
                    <Button variant="contained" href="/orders">
                        Voltar para Lista de Pedidos
                    </Button>
                </Paper>
            </Box>
        </Layout>
    );
};

export default OrderForm;