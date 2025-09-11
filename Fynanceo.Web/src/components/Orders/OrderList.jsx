import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
    MenuItem,
    Select,
    FormControl
} from '@mui/material';
import {
    Add as AddIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Receipt as ReceiptIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { ordersAPI } from '../../services/api';
import Layout from '../Layout/Layout';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getAll();
            setOrders(response.data);
        } catch (error) {
            setError('Erro ao carregar pedidos');
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateStatus(orderId, { status: newStatus });
            loadOrders(); // Recarrega a lista
        } catch (error) {
            setError('Erro ao atualizar status');
        }
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            'Aberto': { color: 'primary', label: 'Aberto' },
            'EmPreparo': { color: 'warning', label: 'Em Preparo' },
            'Pronto': { color: 'info', label: 'Pronto' },
            'SaiuParaEntrega': { color: 'secondary', label: 'Saiu para Entrega' },
            'Entregue': { color: 'success', label: 'Entregue' },
            'Cancelado': { color: 'error', label: 'Cancelado' }
        };

        const config = statusConfig[status] || { color: 'default', label: status };
        return (
            <Chip label={config.label} color={config.color} size="small" />
        );
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(order => order.status === statusFilter);

    if (loading) {
        return (
            <Layout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ShoppingCartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="h4">Pedidos</Typography>
                            <Typography variant="body1" color="textSecondary">
                                Gerencie os pedidos e vendas
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => window.location.href = '/orders/new'}
                    >
                        Novo Pedido
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Filtros */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body1">Filtrar por status:</Typography>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">Todos</MenuItem>
                                <MenuItem value="Aberto">Abertos</MenuItem>
                                <MenuItem value="EmPreparo">Em Preparo</MenuItem>
                                <MenuItem value="Pronto">Prontos</MenuItem>
                                <MenuItem value="SaiuParaEntrega">Saiu para Entrega</MenuItem>
                                <MenuItem value="Entregue">Entregues</MenuItem>
                                <MenuItem value="Cancelado">Cancelados</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Paper>

                {/* Tabela de Pedidos */}
                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nº Pedido</TableCell>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>Data</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Pagamento</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell>
                                            <Typography fontWeight="medium">
                                                {order.orderNumber}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {order.customerName || 'Cliente não identificado'}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(order.createdAt)}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography fontWeight="medium">
                                                {formatPrice(order.totalAmount)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            {getStatusChip(order.status)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={order.paymentMethod || 'Não informado'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Tooltip title="Ver detalhes">
                                                    <IconButton size="small" color="info">
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar pedido">
                                                    <IconButton size="small" color="primary">
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Imprimir recibo">
                                                    <IconButton size="small" color="secondary">
                                                        <ReceiptIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {filteredOrders.length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <ShoppingCartIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                            <Typography variant="h6" color="textSecondary">
                                Nenhum pedido encontrado
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                {statusFilter !== 'all' ? `Nenhum pedido com status "${statusFilter}"` : 'Comece criando seu primeiro pedido'}
                            </Typography>
                            <Button variant="contained" startIcon={<AddIcon />} href="/orders/new">
                                Criar Primeiro Pedido
                            </Button>
                        </Box>
                    )}
                </Paper>

                {/* Estatísticas */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Paper sx={{ p: 2, minWidth: 200 }}>
                        <Typography variant="h6" color="primary">
                            {orders.length}
                        </Typography>
                        <Typography variant="body2">Total de Pedidos</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, minWidth: 200 }}>
                        <Typography variant="h6" color="warning.main">
                            {orders.filter(o => o.status === 'Aberto').length}
                        </Typography>
                        <Typography variant="body2">Pedidos Abertos</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, minWidth: 200 }}>
                        <Typography variant="h6" color="success.main">
                            {orders.filter(o => o.status === 'Entregue').length}
                        </Typography>
                        <Typography variant="body2">Pedidos Entregues</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, minWidth: 200 }}>
                        <Typography variant="h6" color="error.main">
                            {orders.filter(o => o.status === 'Cancelado').length}
                        </Typography>
                        <Typography variant="body2">Pedidos Cancelados</Typography>
                    </Paper>
                </Box>
            </Box>
        </Layout>
    );
};

export default OrderList;