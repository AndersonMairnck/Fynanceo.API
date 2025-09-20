import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    TextField,
    Card,
    CardContent,
    Typography,
    Button,
    CircularProgress,
    Chip,
    Alert,
    IconButton,
    Tooltip,
    InputAdornment,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    AddShoppingCart as CartIcon,
    Category as CategoryIcon,
    Inventory as InventoryIcon
} from '@mui/icons-material';

const ProductsTab = ({
    searchTerm,
    setSearchTerm,
    filteredProducts,
    addToCart,
    loadProducts,
    products,
    loading = false
}) => {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(localSearchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearchTerm, setSearchTerm]);

    // Get unique categories
    const categories = React.useMemo(() => {
        const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
        return ['all', ...uniqueCategories].sort();
    }, [products]);

    // Filter and sort products
    const processedProducts = React.useMemo(() => {
        let result = filteredProducts;

        // Filter by category
        if (selectedCategory !== 'all') {
            result = result.filter(product => product.category === selectedCategory);
        }

        // Sort products
        result = [...result].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'priceAsc':
                    return a.price - b.price;
                case 'priceDesc':
                    return b.price - a.price;
                case 'stock':
                    return b.stockQuantity - a.stockQuantity;
                default:
                    return 0;
            }
        });

        return result;
    }, [filteredProducts, selectedCategory, sortBy]);

    // Pagination
    const totalPages = Math.ceil(processedProducts.length / productsPerPage);
    const paginatedProducts = processedProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        // Feedback visual opcional: poderia adicionar uma animação aqui
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Carregando produtos...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header com controles */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Produtos
                </Typography>

                {/* Barra de pesquisa e filtros */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Pesquisar produtos por nome, categoria ou descrição..."
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ maxWidth: 400 }}
                    />

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Categoria</InputLabel>
                        <Select
                            value={selectedCategory}
                            label="Categoria"
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            {categories.map(category => (
                                <MenuItem key={category} value={category}>
                                    {category === 'all' ? 'Todas categorias' : category}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Ordenar por</InputLabel>
                        <Select
                            value={sortBy}
                            label="Ordenar por"
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <MenuItem value="name">Nome A-Z</MenuItem>
                            <MenuItem value="priceAsc">Preço: Menor</MenuItem>
                            <MenuItem value="priceDesc">Preço: Maior</MenuItem>
                            <MenuItem value="stock">Estoque</MenuItem>
                        </Select>
                    </FormControl>

                    <Tooltip title="Recarregar produtos">
                        <IconButton
                            onClick={loadProducts}
                            color="primary"
                            sx={{ border: 1, borderColor: 'divider' }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Informações de resultados */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Chip
                        label={`${processedProducts.length} produto${processedProducts.length !== 1 ? 's' : ''} encontrado${processedProducts.length !== 1 ? 's' : ''}`}
                        color="primary"
                        variant="outlined"
                    />
                    {selectedCategory !== 'all' && (
                        <Chip
                            label={`Categoria: ${selectedCategory}`}
                            onDelete={() => setSelectedCategory('all')}
                        />
                    )}
                    {localSearchTerm && (
                        <Chip
                            label={`Busca: "${localSearchTerm}"`}
                            onDelete={() => setLocalSearchTerm('')}
                            variant="outlined"
                        />
                    )}
                </Box>
            </Box>

            {/* Lista de produtos */}
            {paginatedProducts.length === 0 ? (
                <Alert
                    severity="info"
                    sx={{
                        textAlign: 'center',
                        py: 4,
                        '& .MuiAlert-message': { width: '100%' }
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Nenhum produto encontrado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {localSearchTerm || selectedCategory !== 'all'
                            ? 'Tente ajustar os filtros de pesquisa'
                            : 'Nenhum produto disponível no momento'
                        }
                    </Typography>
                    {(localSearchTerm || selectedCategory !== 'all') && (
                        <Button
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={() => {
                                setLocalSearchTerm('');
                                setSelectedCategory('all');
                            }}
                        >
                            Limpar filtros
                        </Button>
                    )}
                </Alert>
            ) : (
                <>
                    <Grid container spacing={2}>
                        {paginatedProducts.map((product) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                                <Card sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 3
                                    }
                                }}>
                                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                        {/* Nome do produto */}
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 'medium',
                                                minHeight: 64,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {product.name}
                                        </Typography>

                                        {/* Categoria */}
                                        {product.category && (
                                            <Chip
                                                label={product.category}
                                                size="small"
                                                icon={<CategoryIcon />}
                                                variant="outlined"
                                                sx={{ mb: 1 }}
                                            />
                                        )}

                                        {/* Preço */}
                                        <Typography
                                            variant="h5"
                                            color="primary"
                                            gutterBottom
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            R$ {product.price.toFixed(2)}
                                        </Typography>

                                        {/* Estoque */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <InventoryIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Estoque: {product.stockQuantity}
                                            </Typography>
                                        </Box>

                                        {/* Descrição (se disponível) */}
                                        {product.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {product.description}
                                            </Typography>
                                        )}

                                        {/* Botão Adicionar */}
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            startIcon={<CartIcon />}
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.stockQuantity <= 0}
                                            sx={{
                                                mt: 'auto',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {product.stockQuantity <= 0 ?
                                                'Sem Estoque' :
                                                `Adicionar ${product.stockQuantity < 10 ? `(${product.stockQuantity})` : ''}`
                                            }
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default ProductsTab;