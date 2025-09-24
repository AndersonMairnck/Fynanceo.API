import React from 'react';
import { Paper, Typography } from '@mui/material';

const ProductItem = ({ product, onAddToCart }) => (
    <Paper
        sx={{
            p: 1,
            cursor: product.stockQuantity > 0 ? 'pointer' : 'not-allowed',
            '&:hover': product.stockQuantity > 0 ? {
                bgcolor: 'primary.light',
                color: 'white'
            } : {},
            opacity: product.stockQuantity > 0 ? 1 : 0.6,
            bgcolor: product.stockQuantity > 0 ? 'background.paper' : 'grey.100',
            border: product.stockQuantity > 0 ? 'none' : '1px solid',
            borderColor: 'error.light'
        }}
        onClick={() => product.stockQuantity > 0 && onAddToCart(product)}
    >
        <Typography variant="body2" fontWeight="bold" noWrap color={product.stockQuantity > 0 ? 'text.primary' : 'text.secondary'}>
            {product.name}
        </Typography>
        <Typography variant="caption">R$ {product.price.toFixed(2)}</Typography>
        <Typography
            variant="caption"
            color={product.stockQuantity > 0 ? 'text.secondary' : 'error'}
            noWrap
            sx={{ display: 'block', mt: 0.5 }}
        >
            {product.stockQuantity > 0 ? `Estoque: ${product.stockQuantity}` : 'ESGOTADO'}
        </Typography>
        {product.stockQuantity > 0 && (
            <Typography variant="caption" color="success.main">
                ✔ Disponível
            </Typography>
        )}
    </Paper>
);

export default ProductItem;