
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Grid,
    Alert,
    Chip,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    Stack,
    useTheme,
    useMediaQuery,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    InputAdornment
} from '@mui/material';
import {
    Person as PersonIcon,
    LocalShipping as DeliveryIcon,
    Store as StoreIcon,
    Restaurant as RestaurantIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
    ArrowBack as BackIcon,
    ShoppingCart as CartIcon,
    Payment as PaymentIcon,
    Receipt as ReceiptIcon,
    Search as SearchIcon
} from '@mui/icons-material';

const CartTab = ({
    cart,
    selectedCustomer,
    setSelectedCustomer,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    paymentMethod,
    setPaymentMethod,
    deliveryType,
    setDeliveryType,
    deliveryAddress,
    setDeliveryAddress,
    deliveryNotes,
    setDeliveryNotes,
    handleCheckout,
    loading,
    setActiveTab,
    customers = [] // Valor padrão para evitar undefined
}) => {
     console.log('Clientes recebidos no CartTab:', customers); // ← Adicionar esta linha
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const deliveryOptions = [
        {
            value: 'ConsumoLocal',
            label: 'Consumo no Local',
            icon: <RestaurantIcon />,
            description: 'Cliente consome no estabelecimento',
            requiresAddress: false
        },
        {
            value: 'Retirada',
            label: 'Retirada no Balcão',
            icon: <StoreIcon />,
            description: 'Cliente retira no balcão',
            requiresAddress: false
        },
        {
            value: 'Delivery',
            label: 'Delivery/Entrega',
            icon: <DeliveryIcon />,
            description: 'Entregar no endereço do cliente',
            requiresAddress: true
        }
    ];

    const paymentMethods = [
        'Dinheiro',
        'Cartão de Crédito',
        'Cartão de Débito',
        'PIX',
        'Transferência'
    ];

    const selectedDeliveryOption = deliveryOptions.find(opt => opt.value === deliveryType);
    const deliveryFee = deliveryType === 'Delivery' ? 5 : 0;
    const totalAmount = getCartTotal() + deliveryFee;

    // Filtrar clientes com base no termo de busca (com verificação de segurança)
    const filteredCustomers = (customers || []).filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Função para lidar com a seleção de um cliente
    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);

        if (customer.bairro && deliveryType === 'Delivery') {
    setDeliveryAddress(customer.bairro);
}
        
        setOpenCustomerDialog(false);
        setSearchTerm('');
    };

    // Validar se pode finalizar pedido
    const canCheckout = cart.length > 0 &&
        !loading &&
        (deliveryType !== 'Delivery' || deliveryAddress.trim());

    useEffect(() => {
        if (deliveryType === 'Delivery' && selectedCustomer?.bairro) {
            setDeliveryAddress(selectedCustomer.bairro);
        }
    }, [deliveryType, selectedCustomer]);
    return (
        <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)', minHeight: '100vh', p: isMobile ? 1 : 2 }}>
            {/* ... (restante do código permanece igual) ... */}
	        <Box sx={{ maxWidth: 1400, margin: '0 auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <IconButton
                        onClick={() => setActiveTab(0)}
                        size="medium"
                        sx={{ 
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            color: 'white',
                            boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .2)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2 30%, #03A9F4 90%)'
                            }
                        }}
                    >
                        <BackIcon />
                    </IconButton>
                    <Typography variant="h4" fontWeight="700" sx={{ 
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        🛒 Carrinho de Compras
                    </Typography>
                    {cart.length > 0 && (
                        <Chip
                            label={`${cart.length} item${cart.length !== 1 ? 's' : ''}`}
                            color="primary"
                            size="medium"
                            sx={{ 
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                height: 32
                            }}
                        />
                    )}
                </Box>

                {cart.length === 0 ? (
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 6, 
                            textAlign: 'center', 
                            borderRadius: 4,
                            background: 'white',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                        }}
                    >
                        <CartIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                        <Typography variant="h5" color="textSecondary" gutterBottom fontWeight="500">
                            Seu carrinho está vazio
                        </Typography>
                        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                            Adicione produtos para continuar
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setActiveTab(0)}
                            startIcon={<BackIcon />}
                            sx={{
                                py: 1.5,
                                px: 3,
                                borderRadius: 3,
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .2)'
                            }}
                        >
                            Voltar para Produtos
                        </Button>
                    </Paper>
                ) : (
                    <>
                        <Grid container spacing={3}>
                            {/* Coluna principal com informações do pedido */}
                            <Grid item xs={12} lg={8}>
                                <Paper 
                                    elevation={2} 
                                    sx={{ 
                                        p: 3, 
                                        borderRadius: 3,
                                        background: 'white',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                        mb: 3
                                    }}
                                >
                                    <Typography variant="h5" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        Informações do Pedido
                                    </Typography>
                                    
                                    <Grid container spacing={3}>
                                        {/* Seção do Cliente */}
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                                                    Cliente
                                                </Typography>
                                                {selectedCustomer ? (
                                                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {selectedCustomer.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                            📞 {selectedCustomer.phone}
                                                        </Typography>
                                                        {selectedCustomer.email && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                ✉️ {selectedCustomer.email}
                                                            </Typography>
                                                        )}
                                                        {selectedCustomer.address && (
                                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                                🏠 {selectedCustomer.address}
                                                            </Typography>
                                                        )}
                                                   {selectedCustomer?.bairro && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                         🏠 {selectedCustomer.bairro}
    </Typography>
)}
                                                        <Button
                                                            size="small"
                                                            onClick={() => setOpenCustomerDialog(true)}
                                                            sx={{ mt: 1 }}
                                                        >
                                                            Alterar Cliente
                                                        </Button>
                                                    </Box>
                                                ) : (
                                                    <Button
                                                        variant="outlined"
                                                        fullWidth
                                                        size="medium"
                                                        onClick={() => setOpenCustomerDialog(true)}
                                                        startIcon={<PersonIcon />}
                                                        sx={{ py: 1.5 }}
                                                    >
                                                        Selecionar Cliente
                                                    </Button>
                                                )}
                                            </Box>
                                        </Grid>

                                        {/* Seção de Pagamento */}
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                                                    💳 Forma de Pagamento
                                                </Typography>
                                                <FormControl fullWidth size="medium">
                                                    <InputLabel>Método de Pagamento</InputLabel>
                                                    <Select
                                                        value={paymentMethod}
                                                        label="Método de Pagamento"
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                    >
                                                        {paymentMethods.map((method) => (
                                                            <MenuItem key={method} value={method}>
                                                                {method}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ my: 3 }} />

                                    {/* Seção de Tipo de Entrega */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                            <DeliveryIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            Tipo de Entrega
                                        </Typography>

                                        <FormControl fullWidth size="medium" sx={{ mb: 2 }}>
                                            <InputLabel>Tipo de Entrega</InputLabel>
                                            <Select
                                                value={deliveryType}
                                                label="Tipo de Entrega"
                                                onChange={(e) => setDeliveryType(e.target.value)}
                                            >
                                                {deliveryOptions.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {option.icon}
                                                            <Box>
                                                                <Typography variant="body2">
                                                                    {option.label}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {option.description}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {/* Campos condicionais para Delivery */}
                                        {deliveryType === 'Delivery' && (
                                            <Box>
                                                <TextField
                                                    fullWidth
                                                    size="medium"
                                                    label="Endereço de Entrega *"
                                                    value={deliveryAddress}
                                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                                    multiline
                                                    rows={2}
                                                    sx={{ mb: 2 }}
                                                    error={!deliveryAddress.trim()}
                                                    helperText={!deliveryAddress.trim() ? "Endereço é obrigatório para delivery" : ""}
                                                    placeholder={selectedCustomer?.address ? "Endereço carregado do cliente" : "Digite o endereço de entrega"}
                                                    placeholder={selectedCustomer?.bairro ? "Endereço carregado do cliente" : "Digite o endereço de entrega"}
                                                />
                                                <TextField
                                                    fullWidth
                                                    size="medium"
                                                    label="Observações da Entrega"
                                                    value={deliveryNotes}
                                                    onChange={(e) => setDeliveryNotes(e.target.value)}
                                                    multiline
                                                    rows={2}
                                                    placeholder="Ex: Apartamento, ponto de referência, etc."
                                                />
                                            </Box>
                                        )}

                                        {/* Mensagens informativas */}
                                        {deliveryType === 'Retirada' && (
                                            <Alert severity="info" sx={{ mt: 2 }} icon={<StoreIcon />}>
                                                <Typography variant="body2">
                                                    Cliente retirará o pedido no balcão
                                                </Typography>
                                            </Alert>
                                        )}

                                        {deliveryType === 'ConsumoLocal' && (
                                            <Alert severity="info" sx={{ mt: 2 }} icon={<RestaurantIcon />}>
                                                <Typography variant="body2">
                                                    Cliente consumirá no estabelecimento
                                                </Typography>
                                            </Alert>
                                        )}
                                    </Box>
                                </Paper>

                                {/* Itens do Carrinho - ABAIXO DAS INFORMAÇÕES */}
                                <Paper 
                                    elevation={2} 
                                    sx={{ 
                                        p: 3, 
                                        borderRadius: 3,
                                        background: 'white',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                                    }}
                                >
                                    <Typography variant="h5" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        Produtos no Carrinho
                                    </Typography>

                                    {cart.map((item, index) => (
                                        <Card 
                                            key={item.id || index}
                                            elevation={0}
                                            sx={{ 
                                                mb: 2,
                                                borderRadius: 3,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                background: index % 2 === 0 ? 'rgba(33, 150, 243, 0.03)' : 'transparent',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Grid container spacing={2} alignItems="center">
                                                    {/* Informações do produto */}
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="subtitle1" fontWeight="600">
                                                            {item.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secundary">
                                                            R$ {item.price.toFixed(2)} cada
                                                        </Typography>
                                                    </Grid>

                                                    {/* Controles de quantidade */}
                                                    <Grid item xs={12} sm={3}>
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: { xs: 'flex-start', sm: 'center' },
                                                            gap: 1 
                                                        }}>
                                                            <Tooltip title="Diminuir quantidade">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                    sx={{
                                                                        backgroundColor: 'primary.light',
                                                                        color: 'white',
                                                                        '&:hover': {
                                                                            backgroundColor: 'primary.main',
                                                                        }
                                                                    }}
                                                                >
                                                                    <RemoveIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>

                                                            <Chip
                                                                label={item.quantity}
                                                                variant="outlined"
                                                                sx={{ 
                                                                    minWidth: 40, 
                                                                    fontWeight: 'bold',
                                                                    fontSize: '1rem',
                                                                    borderColor: 'primary.main',
                                                                    color: 'primary.main'
                                                                }}
                                                            />

                                                            <Tooltip title="Aumentar quantidade">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    sx={{
                                                                        backgroundColor: 'primary.light',
                                                                        color: 'white',
                                                                        '&:hover': {
                                                                            backgroundColor: 'primary.main',
                                                                        }
                                                                    }}
                                                                >
                                                                    <AddIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </Grid>

                                                    {/* Preço total do item */}
                                                    <Grid item xs={6} sm={2}>
                                                        <Typography variant="subtitle1" fontWeight="bold" align="right" color="primary.main">
                                                            R$ {(item.price * item.quantity).toFixed(2)}
                                                        </Typography>
                                                    </Grid>

                                                    {/* Botão remover */}
                                                    <Grid item xs={6} sm={1}>
                                                        <Box display="flex" justifyContent="flex-end">
                                                            <Tooltip title="Remover item">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => removeFromCart(item.id)}
                                                                    sx={{
                                                                        color: 'error.main',
                                                                        backgroundColor: 'error.light',
                                                                        '&:hover': {
                                                                            backgroundColor: 'error.main',
                                                                            color: 'white'
                                                                        }
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {/* Resumo simplificado dentro da seção de itens */}
                                    <Box sx={{ 
                                        p: 3, 
                                        mt: 3, 
                                        backgroundColor: 'primary.light', 
                                        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 203, 243, 0.1) 100%)',
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: 'primary.light'
                                    }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body1" fontWeight="500">
                                                Subtotal ({cart.length} itens):
                                            </Typography>
                                            <Typography variant="body1" fontWeight="500">
                                                R$ {getCartTotal().toFixed(2)}
                                            </Typography>
                                        </Box>
                                        {deliveryType === 'Delivery' && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2">Taxa de entrega:</Typography>
                                                <Typography variant="body2">R$ 5.00</Typography>
                                            </Box>
                                        )}
                                        <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.1)' }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h6" fontWeight="700">Total:</Typography>
                                            <Typography variant="h6" fontWeight="700" color="primary.main">
                                                R$ {totalAmount.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Resumo do Pedido - NO CANTO SUPERIOR DIREITO */}
                            <Grid item xs={12} lg={4}>
                                <Paper 
                                    elevation={3} 
                                    sx={{ 
                                        p: 3, 
                                        position: 'sticky', 
                                        top: 20, 
                                        borderRadius: 3,
                                        background: 'white',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <PaymentIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
                                        <Typography variant="h5" fontWeight="600">
                                            Resumo do Pedido
                                        </Typography>
                                    </Box>

                                    <Stack spacing={2} sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body1">Subtotal:</Typography>
                                            <Typography variant="body1">R$ {getCartTotal().toFixed(2)}</Typography>
                                        </Box>

                                        {deliveryType === 'Delivery' && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body1">Taxa de Entrega:</Typography>
                                                <Typography variant="body1">R$ 5.00</Typography>
                                            </Box>
                                        )}

                                        <Divider sx={{ my: 1, borderColor: 'rgba(0,0,0,0.1)' }} />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h6" fontWeight="700">Total:</Typography>
                                            <Typography variant="h6" fontWeight="700" color="primary.main">
                                                R$ {totalAmount.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* Botão Finalizar */}
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        onClick={handleCheckout}
                                        disabled={!canCheckout}
                                        sx={{
                                            py: 2,
                                            borderRadius: 3,
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            mb: 2,
                                            background: canCheckout 
                                                ? 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)'
                                                : 'grey.400',
                                            boxShadow: canCheckout 
                                                ? '0 4px 8px 2px rgba(76, 175, 80, .2)' 
                                                : 'none',
                                            '&:hover': canCheckout ? {
                                                background: 'linear-gradient(45deg, #388E3C 30%, #689F38 90%)',
                                                boxShadow: '0 6px 12px 3px rgba(76, 175, 80, .3)'
                                            } : {}
                                        }}
                                    >
                                        {loading ? (
                                            <>⏳ Processando...</>
                                        ) : (
                                            <>✅ Finalizar Pedido</>
                                        )}
                                    </Button>

                                    {deliveryType === 'Delivery' && !deliveryAddress.trim() && (
                                        <Alert 
                                            severity="warning" 
                                            sx={{ 
                                                mt: 1, 
                                                mb: 2, 
                                                borderRadius: 2,
                                                backgroundColor: '#FFF8E1'
                                            }}
                                        >
                                            Preencha o endereço de entrega para continuar
                                        </Alert>
                                    )}

                                    <Box sx={{ 
                                        p: 2, 
                                        mt: 2, 
                                        backgroundColor: 'grey.50', 
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Método de entrega:</strong> {selectedDeliveryOption?.label}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            <strong>Pagamento:</strong> {paymentMethod}
                                        </Typography>
                                        {selectedCustomer && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                <strong>Cliente:</strong> {selectedCustomer.name}
                                            </Typography>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Diálogo de Seleção de Cliente */}
                        <Dialog 
                            open={openCustomerDialog} 
                            onClose={() => {
                                setOpenCustomerDialog(false);
                                setSearchTerm('');
                            }}
                            maxWidth="md"
                            fullWidth
                        >
                            <DialogTitle>
                                <Typography variant="h6" fontWeight="600">
                                    Selecionar Cliente
                                </Typography>
                            </DialogTitle>
                            <DialogContent>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Buscar cliente por nome, telefone ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    sx={{ mb: 2, mt: 1 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                
                                {filteredCustomers.length > 0 ? (
                                    <List>
                                        {filteredCustomers.map((customer) => (
                                            <ListItem
                                                key={customer.id}
                                                button
                                                onClick={() => handleCustomerSelect(customer)}
                                                sx={{
                                                    borderRadius: 2,
                                                    mb: 1,
                                                    '&:hover': {
                                                        backgroundColor: 'primary.light',
                                                        color: 'white'
                                                    }
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                        <PersonIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={customer.name}
                                                    secondary={
                                                        <Box>
                                                            <Typography variant="body2" component="span">
                                                                📞 {customer.phone}
                                                            </Typography>
                                                            <br />
                                                            <Typography variant="body2" component="span">
                                                                ✉️ {customer.email}
                                                            </Typography>
                                                            <br />
                                                            {customer.address && (
                                                                <Typography variant="body2" component="span">
                                                                    🏠 {customer.address}
                                                                </Typography>
                                                            )}
                                                         {/*  //* E no ListItemText do diálogo /*/}
{customer.bairro && (
    <Typography variant="body2" component="span">
        🏠 {customer.bairro}
    </Typography>
)}
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                        <Typography variant="body1" color="text.secondary">
                                            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                                        </Typography>
                                    </Box>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button 
                                    onClick={() => {
                                        setOpenCustomerDialog(false);
                                        setSearchTerm('');
                                    }}
                                >
                                    Fechar
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )}
            </Box>							  
										 
											
								 
					   
				  
				  
        </Box>
    );
};

export default CartTab;