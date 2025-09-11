import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    MenuItem,
    Grid,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';
import { productsAPI } from '../../services/api';
import Layout from '../Layout/Layout';

const ProductForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        costPrice: '',
        stockQuantity: '',
        minStockLevel: '5',
        categoryId: ''
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            // Simulando categorias - você precisará criar o endpoint de categories
            setCategories([
                { id: 1, name: 'Padaria' },
                { id: 2, name: 'Bebidas' },
                { id: 3, name: 'Lanches' },
                { id: 4, name: 'Pizzas' },
                { id: 5, name: 'Doces' }
            ]);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                costPrice: parseFloat(formData.costPrice),
                stockQuantity: parseInt(formData.stockQuantity),
                minStockLevel: parseInt(formData.minStockLevel),
                categoryId: parseInt(formData.categoryId)
            };

            await productsAPI.create(productData);
            setSuccess('Produto criado com sucesso!');

            // Limpa o formulário
            setFormData({
                name: '',
                description: '',
                price: '',
                costPrice: '',
                stockQuantity: '',
                minStockLevel: '5',
                categoryId: ''
            });

        } catch (error) {
            setError('Erro ao criar produto: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Button
                        startIcon={<BackIcon />}
                        href="/products"
                        variant="outlined"
                    >
                        Voltar
                    </Button>
                    <Typography variant="h4">Novo Produto</Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                {/* Formulário */}
                <Paper sx={{ p: 3 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nome do Produto"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required disabled={loading}>
                                    <InputLabel>Categoria</InputLabel>
                                    <Select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        label="Categoria"
                                        onChange={handleChange}
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Descrição"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={3}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Preço de Venda"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    inputProps={{ step: "0.01", min: "0" }}
                                    InputProps={{
                                        startAdornment: 'R$ '
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Preço de Custo"
                                    name="costPrice"
                                    type="number"
                                    value={formData.costPrice}
                                    onChange={handleChange}
                                    disabled={loading}
                                    inputProps={{ step: "0.01", min: "0" }}
                                    InputProps={{
                                        startAdornment: 'R$ '
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Estoque Inicial"
                                    name="stockQuantity"
                                    type="number"
                                    value={formData.stockQuantity}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    inputProps={{ min: "0" }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Estoque Mínimo"
                                    name="minStockLevel"
                                    type="number"
                                    value={formData.minStockLevel}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    inputProps={{ min: "1" }}
                                    helperText="Quantidade mínima antes de alertar"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        href="/products"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                        disabled={loading}
                                    >
                                        {loading ? 'Salvando...' : 'Salvar Produto'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </Layout>
    );
};

export default ProductForm;