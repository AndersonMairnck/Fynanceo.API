import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Button,
    Chip,
    Divider,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { productsAPI } from '../../services/api';
import Layout from '../Layout/Layout';

const ProductView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getById(id);
            setProduct(response.data);
        } catch (error) {
            setError('Produto não encontrado');
        } finally {
            setLoading(false);
        }
    };

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

    if (error || !product) {
        return (
            <Layout>
                <Box sx={{ p: 3 }}>
                    <Alert severity="error">{error || 'Produto não encontrado'}</Alert>
                    <Button sx={{ mt: 2 }} startIcon={<BackIcon />} onClick={() => navigate('/products')}>
                        Voltar para lista
                    </Button>
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Button
                        startIcon={<BackIcon />}
                        onClick={() => navigate('/products')}
                        variant="outlined"
                    >
                        Voltar
                    </Button>
                    <Typography variant="h4">Detalhes do Produto</Typography>
                    <Button
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/products/edit/${id}`)}
                        variant="contained"
                        sx={{ ml: 'auto' }}
                    >
                        Editar
                    </Button>
                </Box>

                <Paper sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>Informações Básicas</Typography>
                            <Typography><strong>Nome:</strong> {product.name}</Typography>
                            <Typography><strong>Descrição:</strong> {product.description}</Typography>
                            <Typography><strong>Categoria:</strong> {product.categoryName || 'Não definida'}</Typography>

                            <Box sx={{ mt: 2 }}>
                                <Chip
                                    label={product.isActive ? 'Ativo' : 'Inativo'}
                                    color={product.isActive ? 'success' : 'error'}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>Preços e Estoque</Typography>
                            <Typography><strong>Preço de Venda:</strong> {formatPrice(product.price)}</Typography>
                            <Typography><strong>Preço de Custo:</strong> {formatPrice(product.costPrice)}</Typography>
                            <Typography><strong>Estoque Atual:</strong> {product.stockQuantity} unidades</Typography>
                            <Typography><strong>Estoque Mínimo:</strong> {product.minStockLevel} unidades</Typography>

                            <Box sx={{ mt: 2 }}>
                                <Chip
                                    label={product.stockQuantity > product.minStockLevel ? 'Estoque OK' : 'Estoque Baixo'}
                                    color={product.stockQuantity > product.minStockLevel ? 'success' : 'warning'}
                                    variant="outlined"
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>Estatísticas</Typography>
                    <Typography variant="body2" color="textSecondary">
                        Produto criado em: {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                    </Typography>
                </Paper>
            </Box>
        </Layout>
    );
};

export default ProductView;