import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Button
} from '@mui/material';
import {
    ShoppingCart as OrdersIcon,
    Inventory as ProductsIcon,
    LocalShipping as DeliveriesIcon,
    Group as CustomersIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

import Layout from '../Layout/Layout';
import { productsAPI, ordersAPI } from '../../services/api'; // ← Adicione ordersAPI

const StatCard = ({ title, value, icon, color }) => (
    <Card>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography color="textSecondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div">
                        {value}
                    </Typography>
                </Box>
                <Box sx={{ color, fontSize: 40 }}>
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        pendingDeliveries: 0,
        totalCustomers: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Carregar estatísticas de produtos
            const productsResponse = await productsAPI.getAll();

            // Carregar estatísticas de pedidos
            const ordersResponse = await ordersAPI.getAll();
            const ordersData = ordersResponse.data;

            setStats({
                totalProducts: productsResponse.data.length,
                totalOrders: ordersData.length,
                pendingDeliveries: ordersData.filter(order =>
                    ['Aberto', 'EmPreparo', 'SaiuParaEntrega'].includes(order.status)
                ).length,
                totalCustomers: customers.length // Adicione esta variável se existir
            });
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    };

    return (
        <Layout>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Dashboard
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Bem-vindo de volta, {user?.name}! Aqui está o resumo do seu negócio.
                    </Typography>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total de Produtos"
                            value={stats.totalProducts}
                            icon={<ProductsIcon />}
                            color="#1976d2"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Pedidos Hoje"
                            value={stats.totalOrders}
                            icon={<OrdersIcon />}
                            color="#2e7d32"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Entregas Pendentes"
                            value={stats.pendingDeliveries}
                            icon={<DeliveriesIcon />}
                            color="#ed6c02"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Clientes"
                            value={stats.totalCustomers}
                            icon={<CustomersIcon />}
                            color="#9c27b0"
                        />
                    </Grid>
                </Grid>

                {/* Quick Actions */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Ações Rápidas
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button variant="contained" href="/products">
                                    Gerenciar Produtos
                                </Button>
                                <Button variant="outlined" href="/orders">
                                    Ver Pedidos
                                </Button>
                                <Button variant="outlined" href="/customers">
                                    Gerenciar Clientes
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Informações do Sistema
                            </Typography>
                            <Typography variant="body2">
                                <strong>Usuário:</strong> {user?.name}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Email:</strong> {user?.email}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Perfil:</strong> {user?.role}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Último acesso:</strong> {new Date().toLocaleString('pt-BR')}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Layout>
    );
};

export default Dashboard;