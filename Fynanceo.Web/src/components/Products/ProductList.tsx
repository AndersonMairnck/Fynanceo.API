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
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Inventory as InventoryIcon
} from '@mui/icons-material';
import { productsAPI } from '../../services/api';
import Layout from '../Layout/Layout';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getAll();
            setProducts(response.data);
        } catch (error) {
            setError('Erro ao carregar produtos');
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Tem certeza que deseja desativar este produto?')) {
            return;
        }

        try {
            await productsAPI.deactivate(productId, 'Desativado pelo usuário');
            loadProducts(); // Recarrega a lista
        } catch (error) {
            setError('Erro ao desativar produto');
        }
    };

    const getStatusChip = (isActive) => (
        <Chip
            label={isActive ? 'Ativo' : 'Inativo'}
            color={isActive ? 'success' : 'error'}
            size="small"
        />
    );

    const formatPrice = (price) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

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
                        <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="h4">Produtos</Typography>
                            <Typography variant="body1" color="textSecondary">
                                Gerencie seu catálogo de produtos
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/products/new')} // Mude de href para onClick
                    >
                        Novo Produto
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Tabela de Produtos */}
                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Descrição</TableCell>
                                    <TableCell align="right">Preço</TableCell>
                                    <TableCell align="center">Estoque</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <Typography fontWeight="medium">
                                                {product.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 200 }}>
                                                {product.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography fontWeight="medium">
                                                {formatPrice(product.price)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={product.stockQuantity}
                                                color={product.stockQuantity > product.minStockLevel ? 'success' : 'warning'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {getStatusChip(product.isActive)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Tooltip title="Ver detalhes">
                                                    <IconButton
                                                        size="small"
                                                        color="info"
                                                        onClick={() => navigate(`/products/view/${product.id}`)}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => navigate(`/products/edit/${product.id}`)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Desativar">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDelete(product.id)}
                                                        disabled={!product.isActive}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {products.length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <InventoryIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                            <Typography variant="h6" color="textSecondary">
                                Nenhum produto encontrado
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                Comece adicionando seu primeiro produto ao catálogo
                            </Typography>
                            <Button variant="contained" startIcon={<AddIcon />} href="/products/new">
                                Adicionar Primeiro Produto
                            </Button>
                        </Box>
                    )}
                </Paper>

                {/* Estatísticas */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Paper sx={{ p: 2, minWidth: 200 }}>
                        <Typography variant="h6" color="primary">
                            {products.length}
                        </Typography>
                        <Typography variant="body2">Total de Produtos</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, minWidth: 200 }}>
                        <Typography variant="h6" color="success.main">
                            {products.filter(p => p.isActive).length}
                        </Typography>
                        <Typography variant="body2">Produtos Ativos</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, minWidth: 200 }}>
                        <Typography variant="h6" color="warning.main">
                            {products.filter(p => p.stockQuantity <= p.minStockLevel).length}
                        </Typography>
                        <Typography variant="body2">Estoque Baixo</Typography>
                    </Paper>
                </Box>
            </Box>
        </Layout>
    );
};

export default ProductList;