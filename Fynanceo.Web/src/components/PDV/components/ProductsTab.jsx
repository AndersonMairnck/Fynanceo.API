import React from 'react';
import {
    Paper,
    TextField,
    Grid,
    IconButton
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import ProductItem from './ProductItem'; // ← Import correto

const ProductsTab = ({ searchTerm, setSearchTerm, filteredProducts, addToCart, loadProducts }) => (
    <Paper sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
        <TextField
            fullWidth
            placeholder="Pesquisar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: (
                    <IconButton
                        size="small"
                        onClick={loadProducts}
                        title="Recarregar produtos"
                    >
                        🔄
                    </IconButton>
                )
            }}
            sx={{ mb: 2 }}
        />
        <Grid container spacing={1}>
            {filteredProducts.map(product => (
                <Grid item xs={6} sm={4} md={3} key={product.id}>
                    <ProductItem product={product} onAddToCart={addToCart} />
                </Grid>
            ))}
        </Grid>
    </Paper>
);

export default ProductsTab;