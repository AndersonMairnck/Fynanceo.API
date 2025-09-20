import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; // ← Importar o hook useAuth

export const usePDV = () => {
    const { token } = useAuth(); // ← Usar o hook useAuth
    const [cart, setCart] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
    const [deliveryType, setDeliveryType] = useState('ConsumoLocal');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [activeTab, setActiveTab] = useState(0);

    // Opções de tipo de entrega
    const deliveryTypeOptions = [
        { value: 'ConsumoLocal', label: 'Consumo no Local', icon: '🏢' },
        { value: 'Retirada', label: 'Retirada no Balcão', icon: '📦' },
        { value: 'Delivery', label: 'Delivery/Entrega', icon: '🚚' }
    ];

    // Função para fazer requisições autenticadas
    const fetchWithAuth = useCallback(async (url, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            console.error('Não autorizado - token pode ter expirado');
            throw new Error('Não autorizado');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
    }, [token]);

    // Carregar produtos
    const loadProducts = useCallback(async () => {
        try {
            const response = await fetchWithAuth('/api/products');
            const data = await response.json();
            setProducts(data);
            setFilteredProducts(data);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    }, [fetchWithAuth]);

    // Carregar clientes
    const loadCustomers = useCallback(async () => {
        try {
            const response = await fetchWithAuth('/api/customers');
            const data = await response.json();
              console.log('Dados dos clientes recebidos:', data);
            setCustomers(data);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    }, [fetchWithAuth]);

    // Filtrar produtos
    useEffect(() => {
        if (searchTerm) {
            const filtered = products.filter(product =>
                product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [searchTerm, products]);

    // Adicionar ao carrinho
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.productId === product.id);

        if (existingItem) {
            updateQuantity(product.id, existingItem.quantity + 1);
        } else {
            setCart(prev => [...prev, {
                productId: product.id,
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                totalPrice: product.price
            }]);
        }
    };

    // Atualizar quantidade
    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(prev => prev.map(item =>
            item.productId === productId
                ? {
                    ...item,
                    quantity,
                    totalPrice: item.price * quantity
                }
                : item
        ));
    };

    // Remover do carrinho
    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    // Calcular total do carrinho
    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Limpar carrinho
    const clearCart = () => {
        setCart([]);
        setSelectedCustomer(null);
        setPaymentMethod('Dinheiro');
        setDeliveryType('ConsumoLocal');
        setDeliveryAddress('');
        setDeliveryNotes('');
    };

    // Finalizar venda
   const handleCheckout = async () => {
    setLoading(true);
    try {
        const deliveryFee = deliveryType === 'Delivery' ? 5 : 0;
        const subtotal = getCartTotal();
        const totalAmount = subtotal + deliveryFee;

        let endpoint, requestBody;

        if (deliveryType === 'Delivery') {
            // Formato para o endpoint /api/deliveries
            endpoint = '/api/deliveries';
            requestBody = {
                customerId: selectedCustomer?.id || null,
                paymentMethod: paymentMethod,
                items: cart.map(item => ({
                    productId: item.productId || item.id,
                    quantity: item.quantity,
                    unitPrice: item.price
                })),
                deliveryInfo: {
                   deliveryType: deliveryType,
    deliveryAddress: deliveryAddress,
    customerPhone: selectedCustomer?.phone || '',
    customerName: selectedCustomer?.name || '',
    deliveryFee: deliveryFee,
    notes: deliveryNotes,
   estimatedDeliveryTime: null,
   deliveryPerson: "Entregador Padrão",
                }
            };
        } else {
            // Formato para o endpoint /api/orders/create
            endpoint = '/api/orders/create';
            requestBody = {
                customerId: selectedCustomer?.id || null,
                paymentMethod: paymentMethod,
                deliveryType: deliveryType,
                items: cart.map(item => ({
                    productId: item.productId || item.id,
                    quantity: item.quantity,
                    unitPrice: item.price
                }))
            };
        }

        console.log('📤 Enviando para', endpoint, ':', JSON.stringify(requestBody, null, 2));

        const response = await fetchWithAuth(endpoint, {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const result = await response.json();
            alert('Pedido criado com sucesso!');
            clearCart();
            return result;
        } else {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(errorText || 'Falha ao criar pedido');
        }
    } catch (error) {
        console.error('❌ Erro detalhado:', error);
        alert(`Erro ao finalizar pedido: ${error.message}`);
        throw error;
    } finally {
        setLoading(false);
    }
};
    // Carregar dados iniciais
    useEffect(() => {
        if (token) {
            loadProducts();
            loadCustomers();
        }
    }, [loadProducts, loadCustomers, token]);

    return {
        // State
        cart,
        customers,
        selectedCustomer,
        paymentMethod,
        deliveryType,
        deliveryTypeOptions,
        deliveryAddress,
        deliveryNotes,
        searchTerm,
        openCustomerDialog,
        loading,
        products,
        filteredProducts,
        activeTab,

        // Actions
        setSelectedCustomer,
        setPaymentMethod,
        setDeliveryType,
        setDeliveryAddress,
        setDeliveryNotes,
        setSearchTerm,
        setOpenCustomerDialog,
        setActiveTab,
        addToCart,
        updateQuantity,
        removeFromCart,
        getCartTotal,
        handleCheckout,
        loadProducts,
        clearCart
    };
};