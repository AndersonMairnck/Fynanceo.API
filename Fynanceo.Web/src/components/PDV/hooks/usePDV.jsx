import { useState, useEffect, useCallback } from 'react';
import api, { productsAPI, ordersAPI } from '../../../services/api';

export const usePDV = () => {
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
    const [activeTab, setActiveTab] = useState(0);

    // Carrega produtos ativos e ordena (estoque zero no final)
    const loadProducts = useCallback(async () => {
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
    }, [searchTerm]);

    // Carrega clientes
    const loadCustomers = useCallback(async () => {
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
    }, []);

    // Filtra e ordena os produtos
    const filterProducts = useCallback((productsList, term) => {
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
    }, []);

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
            // Muda para a aba do carrinho ao adicionar um produto
            //setActiveTab(1);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
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

    const clearCart = () => {
        setCart([]);
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

    // Atualiza o filtro quando searchTerm muda
    useEffect(() => {
        filterProducts(products, searchTerm);
    }, [searchTerm, products, filterProducts]);

    // Efeito para carregar dados iniciais
    useEffect(() => {
        loadProducts();
        loadCustomers();
    }, [loadProducts, loadCustomers]);

    return {
        // State
        products,
        cart,
        customers,
        selectedCustomer,
        paymentMethod,
        isDelivery,
        deliveryAddress,
        deliveryNotes,
        searchTerm,
        openCustomerDialog,
        loading,
        filteredProducts,
        activeTab,

        // Actions
        setSelectedCustomer,
        setPaymentMethod,
        setIsDelivery,
        setDeliveryAddress,
        setDeliveryNotes,
        setSearchTerm,
        setOpenCustomerDialog,
        setActiveTab,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart, // Função adicionada
        getCartTotal,
        handleCheckout,
        loadProducts
    };
};