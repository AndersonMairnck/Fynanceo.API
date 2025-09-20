import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ProductList from './components/Products/ProductList';
import ProductForm from './components/Products/ProductForm';
import ProductView from './components/Products/ProductView';
import OrderList from './components/Orders/OrderList';
import OrderForm from './components/Orders/OrderForm';
import PDV from './components/PDV/PDV';
import PdvDashboard from './components/PDV/PdvDashboard';
import './App.css';

import Customers from './components/Customers/Customers';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Categories from './components/Categories/Categories';


const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <div className="App">
                        <Routes>
                            <Route path="/login" element={
                                <div className="login-container">
                                    <Login />
                                </div>
                            } />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/products" element={<ProductList />} />
                            <Route path="/products/new" element={<ProductForm />} />
                            <Route path="/products/edit/:id" element={<div>Editar Produto (em breve)</div>} />
                            <Route path="/products/view/:id" element={<div>Visualizar Produto (em breve)</div>} />
                            <Route path="/products/view/:id" element={<ProductView />} />
                            <Route path="/orders" element={<OrderList />} />
                            <Route path="/orders/new" element={<OrderForm />} />
                            <Route path="/customers" element={
                                <ErrorBoundary>
                                    <Customers />
                                </ErrorBoundary>
                            } />
                            <Route path="/categories" element={<Categories />} />
                          
                            <Route path="/deliveries" element={<div>Entregas (em breve)</div>} />
                            <Route path="/reports" element={<div>Relatórios (em breve)</div>} />
                            <Route path="/pdv" element={<PDV />} />
                            <Route path="/pdv-dashboard" element={<PdvDashboard />} />
                            <Route path="/categorias" element={
                                  <ErrorBoundary> <Categories />  </ErrorBoundary>} />
                            


                            <Route path="/" element={<Navigate to="/dashboard" />} />
                        </Routes>
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;