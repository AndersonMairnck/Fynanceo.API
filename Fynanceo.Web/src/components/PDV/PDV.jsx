import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    TextField,
    IconButton,
    Divider,
    Alert,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
    ShoppingCart as CartIcon,
    Receipt as ReceiptIcon,
    Person as PersonIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { productsAPI, ordersAPI } from '../../services/api';
import Layout from '../Layout/Layout';

const PDV = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('dinheiro');
    const [isDelivery, setIsDelivery] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProducts();
        loadCustomers();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await productsAPI.getAll();
            setProducts(response.data.filter(p => p.isActive));
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    };

    const loadCustomers = async () => {
        // Simulando clientes - você pode implementar a API real depois
        setCustomers([
            { id: 1, name: 'Cliente Padrão', phone: '(11) 99999-9999' },
            { id: 2, name: 'Maria Silva', phone: '(11) 98888-8888' },
            { id: 3, name: 'João Santos', phone: '(11) 97777-7777' }
        ]);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                ...product,
                quantity: 1,
                unitPrice: product.price
            }]);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(cart.map(item =>
            item.id === productId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
    };

    const getChange = () => {
        if (paymentMethod === 'dinheiro') {
            const paid = document.getElementById('paidAmount')?.value || 0;
            return Math.max(0, paid - getCartTotal());
        }
        return 0;
    };
   
    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Adicione produtos ao carrinho primeiro!');
            return;
        }

        // Validação de estoque
        for (const item of cart) {
            if (item.quantity > item.stockQuantity) {
                alert(`Estoque insuficiente para ${item.name}. Disponível: ${item.stockQuantity}`);
                return;
            }
        }

        setLoading(true);
        try {
            // Dados BASE - sempre enviar
            const orderData = {
                paymentMethod: paymentMethod,
                isDelivery: isDelivery,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                }))
            };

            // Adiciona customerId apenas se selecionado
            if (selectedCustomer) {
                orderData.customerId = selectedCustomer.id;
            }

            // 🔥 IMPORTANTE: Só adiciona deliveryInfo se for entrega
            if (isDelivery) {
                const deliveryAddress = prompt('Endereço de entrega:');
                if (!deliveryAddress) {
                    alert('Endereço de entrega é obrigatório!');
                    setLoading(false);
                    return;
                }

                const customerPhone = selectedCustomer?.phone || prompt('Telefone para contato:');
                if (!customerPhone) {
                    alert('Telefone para contato é obrigatório!');
                    setLoading(false);
                    return;
                }

                orderData.deliveryInfo = {
                    deliveryPerson: prompt('Nome do entregador:') || 'Entregador',
                    deliveryAddress: deliveryAddress,
                    customerPhone: customerPhone
                };
            }

            console.log('📤 Dados enviados:', orderData);

            const response = await ordersAPI.create(orderData);

            alert(`✅ Venda realizada com sucesso!\nNº do Pedido: ${response.data.orderNumber}\nTotal: R$ ${response.data.totalAmount?.toFixed(2) || getCartTotal().toFixed(2)}`);

            // Limpa o carrinho
            setCart([]);
            setSelectedCustomer(null);
            setIsDelivery(false);
            setPaymentMethod('dinheiro');

        } catch (error) {
            console.error('❌ Erro detalhado:', error.response?.data);

            let errorMessage = 'Erro ao finalizar venda';

            // Tratamento melhorado de erro
            if (error.response?.status === 400) {
                if (error.response.data?.errors) {
                    const validationErrors = Object.values(error.response.data.errors).flat();
                    errorMessage = `Erros de validação:\n${validationErrors.join('\n')}`;
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                } else {
                    errorMessage = 'Dados inválidos enviados para o servidor.';
                }
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    
    };

    return (
        <Layout>
            <Box sx={{ p: 2 }}>
                <Typography variant="h4" gutterBottom>
                    🧾 Ponto de Venda (PDV)
                </Typography>

                <Grid container spacing={2}>
                    {/* Coluna da Esquerda - Produtos */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, height: '80vh', overflow: 'auto' }}>
                            {/* Barra de Pesquisa */}
                            <TextField
                                fullWidth
                                placeholder="Pesquisar produtos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                                sx={{ mb: 2 }}
                            />

                            {/* Lista de Produtos */}
                            <Grid container spacing={1}>
                                {filteredProducts.map((product) => (
                                    <Grid item xs={6} sm={4} md={3} key={product.id}>
                                        <Paper
                                            sx={{
                                                p: 1,
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: 'primary.light', color: 'white' }
                                            }}
                                            onClick={() => addToCart(product)}
                                        >
                                            <Typography variant="body2" fontWeight="bold" noWrap>
                                                {product.name}
                                            </Typography>
                                            <Typography variant="caption" display="block">
                                                R$ {product.price.toFixed(2)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap>
                                                Estoque: {product.stockQuantity}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Coluna da Direita - Carrinho */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom>
                                🛒 Carrinho de Vendas
                            </Typography>

                            {/* Informações do Cliente */}
                            <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">
                                        {selectedCustomer ? selectedCustomer.name : 'Cliente não selecionado'}
                                    </Typography>
                                    <IconButton size="small" onClick={() => setOpenCustomerDialog(true)}>
                                        <PersonIcon />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Itens do Carrinho */}
                            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                                {cart.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                                        Nenhum produto no carrinho
                                    </Typography>
                                ) : (
                                    <List dense>
                                        {cart.map((item) => (
                                            <ListItem key={item.id} divider>
                                                <ListItemText
                                                    primary={item.name}
                                                    secondary={`R$ ${item.unitPrice.toFixed(2)} × ${item.quantity}`}
                                                />
                                                <ListItemSecondaryAction>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            <RemoveIcon fontSize="small" />
                                                        </IconButton>
                                                        <Typography variant="body2">{item.quantity}</Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <AddIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => removeFromCart(item.id)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Box>

                            {/* Total e Formas de Pagamento */}
                            <Box sx={{ mt: 'auto' }}>
                                <Divider sx={{ mb: 2 }} />

                                <Typography variant="h6" gutterBottom>
                                    Total: R$ {getCartTotal().toFixed(2)}
                                </Typography>

                                {/* Forma de Pagamento */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" gutterBottom>Forma de Pagamento:</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {['dinheiro', 'cartao', 'pix'].map((method) => (
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

                                {/* Entrega */}
                                <Box sx={{ mb: 2 }}>
                                    <Chip
                                        label={isDelivery ? 'Com entrega' : 'Retirada no local'}
                                        color={isDelivery ? 'primary' : 'default'}
                                        onClick={() => setIsDelivery(!isDelivery)}
                                        variant={isDelivery ? 'filled' : 'outlined'}
                                    />
                                </Box>

                                {/* Botão Finalizar */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    startIcon={<ReceiptIcon />}
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0 || loading}
                                >
                                    {loading ? 'Processando...' : 'Finalizar Venda'}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Dialog de Seleção de Cliente */}
                <Dialog open={openCustomerDialog} onClose={() => setOpenCustomerDialog(false)}>
                    <DialogTitle>Selecionar Cliente</DialogTitle>
                    <DialogContent>
                        <List>
                            <ListItem button onClick={() => { setSelectedCustomer(null); setOpenCustomerDialog(false); }}>
                                <ListItemText primary="Cliente Padrão" />
                            </ListItem>
                            {customers.map((customer) => (
                                <ListItem
                                    key={customer.id}
                                    button
                                    onClick={() => { setSelectedCustomer(customer); setOpenCustomerDialog(false); }}
                                >
                                    <ListItemText primary={customer.name} secondary={customer.phone} />
                                </ListItem>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCustomerDialog(false)}>Fechar</Button>
                    </DialogActions>
                </Dialog>
               
            </Box>
        </Layout>
    );
};

export default PDV;