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
    Receipt as ReceiptIcon,
    Person as PersonIcon,
    Search as SearchIcon
} from '@mui/icons-material';

import api, { productsAPI, ordersAPI } from '../../services/api';
import Layout from '../Layout/Layout';

const PDV = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('dinheiro');
    const [isDelivery, setIsDelivery] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        loadProducts();
        loadCustomers();
    }, []);

    // Carrega produtos ativos e ordena (estoque zero no final)
    const loadProducts = async () => {
        try {
            const response = await productsAPI.getAll();
            const activeProducts = response.data.filter(p => p.isActive);

            // Ordena: produtos com estoque primeiro, depois os sem estoque
            const sortedProducts = activeProducts.sort((a, b) => {
                if (a.stockQuantity > 0 && b.stockQuantity <= 0) return -1;
                if (a.stockQuantity <= 0 && b.stockQuantity > 0) return 1;
                return 0;
            });

            setProducts(sortedProducts);
            filterProducts(sortedProducts, searchTerm);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    };

    // Carrega clientes
    const loadCustomers = async () => {
        try {
            const response = await api.get('/customers');
            if (response.data && response.data.length > 0) {
                setCustomers(response.data);
            } else {
                // fallback se não vier nada
                setCustomers([
                    { id: 1, name: 'Cliente Padrão', phone: '(11) 99999-9999' },
                    { id: 2, name: 'Maria Silva', phone: '(11) 98888-8888' },
                    { id: 3, name: 'João Santos', phone: '(11) 97777-7777' }
                ]);
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            // fallback se a API falhar
            setCustomers([
                { id: 1, name: 'Cliente Padrão', phone: '(11) 99999-9999' },
                { id: 2, name: 'Maria Silva', phone: '(11) 98888-8888' },
                { id: 3, name: 'João Santos', phone: '(11) 97777-7777' }
            ]);
        }
    };

    // Filtra e ordena os produtos
    const filterProducts = (productsList, term) => {
        const filtered = productsList.filter(product =>
            product.name.toLowerCase().includes(term.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(term.toLowerCase()))
        );

        // Mantém a ordenação: com estoque primeiro
        const sortedFiltered = filtered.sort((a, b) => {
            if (a.stockQuantity > 0 && b.stockQuantity <= 0) return -1;
            if (a.stockQuantity <= 0 && b.stockQuantity > 0) return 1;
            return 0;
        });

        setFilteredProducts(sortedFiltered);
    };

    // Atualiza o filtro quando searchTerm muda
    useEffect(() => {
        filterProducts(products, searchTerm);
    }, [searchTerm, products]);

    const addToCart = (product) => {
        // Verifica se o produto tem estoque disponível
        if (product.stockQuantity <= 0) {
            alert(`❌ ${product.name} está fora de estoque!`);
            return;
        }

        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            // Verifica se a quantidade atual + 1 excede o estoque
            if (existingItem.quantity + 1 > product.stockQuantity) {
                alert(`❌ Quantidade máxima de ${product.name} atingida (estoque: ${product.stockQuantity})`);
                return;
            }

            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1, unitPrice: product.price }]);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            alert("❌ A quantidade deve ser maior que zero!");
            return;
        }

        // Encontra o produto original para verificar o estoque
        const product = products.find(p => p.id === productId);
        if (product && newQuantity > product.stockQuantity) {
            alert(`❌ Quantidade máxima de ${product.name} é ${product.stockQuantity}`);
            return;
        }

        setCart(cart.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Adicione produtos ao carrinho primeiro!');
            return;
        }

        // 🚨 Validação extra: impedir produtos com quantidade <= 0
        const invalidItems = cart.filter(item => item.quantity <= 0);
        if (invalidItems.length > 0) {
            alert(`Os seguintes produtos estão com quantidade inválida: ${invalidItems.map(i => i.name).join(", ")}`);
            return;
        }

        if (isDelivery && !deliveryAddress && !selectedCustomer?.address) {
            alert('Informe o endereço de entrega!');
            return;
        }

        setLoading(true);
        try {
            const baseOrderData = {
                customerId: selectedCustomer?.id || null,
                paymentMethod: paymentMethod,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                }))
            };

            let response;

            if (isDelivery) {
                const orderWithDelivery = {
                    ...baseOrderData,
                    deliveryInfo: {
                        deliveryPerson: "Entregador Padrão",
                        deliveryAddress: deliveryAddress || selectedCustomer?.address || "Endereço não informado",
                        customerPhone: selectedCustomer?.phone || "",
                        estimatedDeliveryTime: new Date(Date.now() + 45 * 60000),
                        notes: deliveryNotes
                    }
                };
                response = await ordersAPI.createWithDelivery(orderWithDelivery);
            } else {
                response = await ordersAPI.create(baseOrderData);
            }

            if (response.status >= 200 && response.status < 300) {
                alert('✅ Venda realizada com sucesso!');
                setCart([]);
                setSelectedCustomer(null);
                setIsDelivery(false);
                setDeliveryAddress('');
                setDeliveryNotes('');

                // ✅ ATUALIZA A LISTA DE PRODUTOS APÓS A VENDA
                await loadProducts();
            }
        } catch (error) {
            console.error('Erro ao finalizar venda:', error);
            if (error.response) {
                alert(`Erro ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                alert('Erro: servidor não respondeu. Verifique se a API está rodando.');
            } else {
                alert('Erro ao configurar requisição: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Box sx={{ p: 2 }}>
                <Typography variant="h4" gutterBottom>🧾 Ponto de Venda (PDV)</Typography>
                <Grid container spacing={2}>
                    {/* Coluna Produtos */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, height: '80vh', overflow: 'auto' }}>
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
                                            onClick={() => product.stockQuantity > 0 && addToCart(product)}
                                        >
                                            <Typography
                                                variant="body2"
                                                fontWeight="bold"
                                                noWrap
                                                color={product.stockQuantity > 0 ? 'text.primary' : 'text.secondary'}
                                            >
                                                {product.name}
                                            </Typography>
                                            <Typography variant="caption">R$ {product.price.toFixed(2)}</Typography>
                                            <Typography
                                                variant="caption"
                                                color={product.stockQuantity > 0 ? 'text.secondary' : 'error'}
                                                noWrap
                                                sx={{ display: 'block', mt: 0.5 }}
                                            >
                                                {product.stockQuantity > 0 ?
                                                    `Estoque: ${product.stockQuantity}` :
                                                    'ESGOTADO'}
                                            </Typography>
                                            {product.stockQuantity > 0 && (
                                                <Typography variant="caption" color="success.main">
                                                    ✔ Disponível
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Coluna Carrinho */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom>🛒 Carrinho de Vendas</Typography>

                            {/* Cliente */}
                            <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">{selectedCustomer ? selectedCustomer.name : 'Cliente não selecionado'}</Typography>
                                    <IconButton size="small" onClick={() => setOpenCustomerDialog(true)}><PersonIcon /></IconButton>
                                </Box>
                            </Box>

                            {/* Itens */}
                            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                                {cart.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>Nenhum produto no carrinho</Typography>
                                ) : (
                                    <List dense>
                                        {cart.map(item => (
                                            <ListItem key={item.id} divider>
                                                <ListItemText primary={item.name} secondary={`R$ ${item.unitPrice.toFixed(2)} × ${item.quantity}`} />
                                                <ListItemSecondaryAction>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}><RemoveIcon fontSize="small" /></IconButton>
                                                        <Typography variant="body2">{item.quantity}</Typography>
                                                        <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}><AddIcon fontSize="small" /></IconButton>
                                                        <IconButton size="small" color="error" onClick={() => removeFromCart(item.id)}><DeleteIcon fontSize="small" /></IconButton>
                                                    </Box>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Box>

                            {/* Total, pagamento e entrega */}
                            <Box sx={{ mt: 'auto' }}>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="h6">Total: R$ {getCartTotal().toFixed(2)}</Typography>

                                {/* Forma de pagamento */}
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

                                {/* Entrega */}
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
                                    {loading ? 'Processando...' : 'Finalizar Venda'}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Dialog de seleção de cliente */}
                <Dialog open={openCustomerDialog} onClose={() => setOpenCustomerDialog(false)}>
                    <DialogTitle>Selecionar Cliente</DialogTitle>
                    <DialogContent>
                        <List>
                            <ListItem
                                button
                                onClick={() => {
                                    setSelectedCustomer(null);
                                    setOpenCustomerDialog(false);
                                }}
                            >
                                <ListItemText primary="Cliente Padrão" />
                            </ListItem>

                            {customers.map((customer) => (
                                <ListItem
                                    key={customer.id}
                                    button
                                    onClick={() => {
                                        setSelectedCustomer(customer);
                                        setOpenCustomerDialog(false);
                                    }}
                                >
                                    <ListItemText
                                        primary={customer.name}
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {customer.phone || 'Telefone não informado'}
                                                </Typography>
                                                <br />
                                                <Typography component="span" variant="caption" color="text.secondary">
                                                    {customer.address || 'Endereço não informado'}
                                                </Typography>
                                            </>
                                        }
                                    />
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