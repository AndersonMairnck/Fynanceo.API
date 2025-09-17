import React, { useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Badge
} from '@mui/material';
import { ShoppingCart as CartIcon, Inventory as ProductsIcon } from '@mui/icons-material';

import Layout from '../Layout/Layout';
import { usePDV } from '../../hooks/usePDV'; // Import correto
import ProductsTab from './components/ProductsTab'; // Import correto
import CartTab from './components/CartTab'; // Import correto
import CustomerDialog from './components/CustomerDialog'; // Import correto

const PDV = () => {
    const {
        // State
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
        getCartTotal,
        handleCheckout,
        loadProducts,
        clearCart // Adicione esta função ao hook
    } = usePDV();

    // Adiciona event listeners para atalhos de teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Foca na busca quando pressionar Ctrl+F
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.querySelector('input[placeholder="Pesquisar produtos..."]');
                if (searchInput) searchInput.focus();
            }

            // Finaliza venda quando pressionar F2
            if (e.key === 'F2') {
                e.preventDefault();
                handleCheckout();
            }

            // Abre diálogo de cliente quando pressionar F3
            if (e.key === 'F3') {
                e.preventDefault();
                setOpenCustomerDialog(true);
            }

            // Limpa carrinho quando pressionar F4
            if (e.key === 'F4') {
                e.preventDefault();
                clearCart();
            }

            // Alterna entre abas com Ctrl+1 e Ctrl+2
            if (e.ctrlKey && e.key === '1') {
                e.preventDefault();
                setActiveTab(0);
            }

            if (e.ctrlKey && e.key === '2') {
                e.preventDefault();
                setActiveTab(1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setActiveTab, setOpenCustomerDialog, handleCheckout, clearCart]);

    return (
        <Layout>
            <Box sx={{ p: 2 }}>
                <Typography variant="h4" gutterBottom>🧾 Ponto de Venda (PDV)</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Atalhos: Ctrl+F (Buscar) | F2 (Finalizar venda) | F3 (Selecionar cliente) | F4 (Limpar carrinho) | Ctrl+1 (Produtos) | Ctrl+2 (Carrinho)
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab icon={<ProductsIcon />} iconPosition="start" label="Produtos" />
                        <Tab
                            icon={
                                <Badge badgeContent={cart.length} color="primary" max={99}>
                                    <CartIcon />
                                </Badge>
                            }
                            iconPosition="start"
                            label="Carrinho"
                        />
                    </Tabs>
                </Box>

                {/* Conteúdo da aba de Produtos */}
                {activeTab === 0 && (
                    <ProductsTab
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filteredProducts={filteredProducts}
                        addToCart={addToCart}
                        loadProducts={loadProducts}
                    />
                )}

                {/* Conteúdo da aba de Carrinho */}
                {activeTab === 1 && (
                    <CartTab
                        cart={cart}
                        selectedCustomer={selectedCustomer}
                        setOpenCustomerDialog={setOpenCustomerDialog}
                        updateQuantity={updateQuantity}
                        removeFromCart={removeFromCart}
                        getCartTotal={getCartTotal}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        isDelivery={isDelivery}
                        setIsDelivery={setIsDelivery}
                        deliveryAddress={deliveryAddress}
                        setDeliveryAddress={setDeliveryAddress}
                        deliveryNotes={deliveryNotes}
                        setDeliveryNotes={setDeliveryNotes}
                        handleCheckout={handleCheckout}
                        loading={loading}
                        setActiveTab={setActiveTab}
                    />
                )}

                {/* Dialog de seleção de cliente */}
                <CustomerDialog
                    open={openCustomerDialog}
                    onClose={() => setOpenCustomerDialog(false)}
                    customers={customers}
                    setSelectedCustomer={setSelectedCustomer}
                />
            </Box>
        </Layout>
    );
};

export default PDV;