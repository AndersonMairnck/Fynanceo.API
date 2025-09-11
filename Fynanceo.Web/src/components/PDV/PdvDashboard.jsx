import React from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    Card,
    CardContent
} from '@mui/material';
import {
    PointOfSale as PosIcon,
    Receipt as ReceiptIcon,
    People as PeopleIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import Layout from '../Layout/Layout';

const PdvDashboard = () => {
    const quickActions = [
        {
            title: 'Abrir PDV',
            description: 'Iniciar nova venda',
            icon: <PosIcon sx={{ fontSize: 40 }} />,
            color: '#1976d2',
            path: '/pdv'
        },
        {
            title: 'Ver Vendas',
            description: 'Histórico de vendas',
            icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
            color: '#2e7d32',
            path: '/orders'
        },
        {
            title: 'Clientes',
            description: 'Gerenciar clientes',
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            color: '#9c27b0',
            path: '/customers'
        },
        {
            title: 'Relatórios',
            description: 'Relatórios de vendas',
            icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
            color: '#ed6c02',
            path: '/reports'
        }
    ];

    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    🏪 PDV - Ponto de Venda
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    Sistema de caixa para gerenciamento de vendas
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {quickActions.map((action, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 3
                                    }
                                }}
                                onClick={() => window.location.href = action.path}
                            >
                                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                    <Box sx={{ color: action.color, mb: 2 }}>
                                        {action.icon}
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                        {action.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {action.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Estatísticas Rápidas */}
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                📊 Estatísticas do Dia
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="h4" color="primary">
                                        12
                                    </Typography>
                                    <Typography variant="body2">Vendas Hoje</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h4" color="success.main">
                                        R$ 1.245,00
                                    </Typography>
                                    <Typography variant="body2">Total Vendido</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                ⚡ Ações Rápidas
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button variant="contained" href="/pdv" startIcon={<PosIcon />}>
                                    Nova Venda
                                </Button>
                                <Button variant="outlined" href="/orders" startIcon={<ReceiptIcon />}>
                                    Ver Todas Vendas
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
};

export default PdvDashboard;