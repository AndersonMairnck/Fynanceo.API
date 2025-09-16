import React from 'react';
import {
    Paper,
    Box,
    Typography,
    IconButton,
    Chip,
    Divider,
    TextField,
    Button,
    List
} from '@mui/material';
import { Person as PersonIcon, Receipt as ReceiptIcon, Inventory as ProductsIcon } from '@mui/icons-material';
import CartItem from './CartItem';

const CartTab = ({
    cart,
    selectedCustomer,
    setOpenCustomerDialog,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    paymentMethod,
    setPaymentMethod,
    isDelivery,
    setIsDelivery,
    deliveryAddress,
    setDeliveryAddress,
    deliveryNotes,
    setDeliveryNotes,
    handleCheckout,
    loading,
    setActiveTab,
    getTotalItems,
    getTotalProducts
}) => {
    // Cálculo local como fallback
    const totalItems = getTotalItems ? getTotalItems() : cart.reduce((total, item) => total + item.quantity, 0);
    const totalProducts = getTotalProducts ? getTotalProducts() : cart.length;

    return (
        <Paper sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">🛒 Carrinho de Vendas</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        label={`${totalProducts} produtos`}
                        color="primary"
                        variant="outlined"
                        size="small"
                    />
                    <Chip
                        label={`${totalItems} itens`}
                        color="secondary"
                        variant="outlined"
                        size="small"
                    />
                </Box>
            </Box>

            {/* Resto do código igual */}
            <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{selectedCustomer ? selectedCustomer.name : 'Cliente não selecionado'}</Typography>
                    <IconButton size="small" onClick={() => setOpenCustomerDialog(true)}><PersonIcon /></IconButton>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                {cart.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            Nenhum produto no carrinho
                        </Typography>
                        <Button
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={() => setActiveTab(0)}
                            startIcon={<ProductsIcon />}
                        >
                            Ver Produtos
                        </Button>
                    </Box>
                ) : (
                    <List dense>
                        {cart.map(item => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeFromCart}
                            />
                        ))}
                    </List>
                )}
            </Box>

            <Box sx={{ mt: 'auto' }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6">Total: R$ {getCartTotal().toFixed(2)}</Typography>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>Forma de Pagamento:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {['dinheiro', 'cartao', 'pix'].map(method => (
                            <Chip
                                key={method}
                                label={method === 'dinheiro' ? 'Dinheiro' : method === 'cartao' ? 'Cartão' : 'PIX'}
                                color={paymentMethod === method ? 'primary' : 'default'}
                                onClick={() => setPaymentMethod(method)}
                                variant={paymentMethod === method ? 'filled' : 'outlined'}
                            />
                        ))}
                    </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Chip
                        label={isDelivery ? 'Com entrega' : 'Retirada no local'}
                        color={isDelivery ? 'primary' : 'default'}
                        onClick={() => setIsDelivery(!isDelivery)}
                        variant={isDelivery ? 'filled' : 'outlined'}
                    />
                    {isDelivery && (
                        <TextField
                            fullWidth
                            placeholder="Endereço de entrega"
                            value={deliveryAddress || selectedCustomer?.address || ''}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            sx={{ mt: 1 }}
                        />
                    )}
                    {isDelivery && (
                        <TextField
                            fullWidth
                            placeholder="Observações da entrega (opcional)"
                            value={deliveryNotes}
                            onChange={(e) => setDeliveryNotes(e.target.value)}
                            sx={{ mt: 1 }}
                        />
                    )}
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<ReceiptIcon />}
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || loading}
                >
                    {loading ? 'Processando...' : 'Finalizar Venda (F2)'}
                </Button>
            </Box>
        </Paper>
    );
};

export default CartTab;