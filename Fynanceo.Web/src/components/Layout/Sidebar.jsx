import React, { useState } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    Typography,
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Inventory as ProductsIcon,
    ShoppingCart as OrdersIcon,
    LocalShipping as DeliveriesIcon,
    Group as CustomersIcon,
    Category as CategoriesIcon,
    BarChart as ReportsIcon,
    Settings as SettingsIcon,
    ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';

const drawerWidth = 240;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Produtos', icon: <ProductsIcon />, path: '/products' },
    { text: 'Pedidos', icon: <OrdersIcon />, path: '/orders' },
    { text: 'Entregas', icon: <DeliveriesIcon />, path: '/deliveries' },
    { text: 'Clientes', icon: <CustomersIcon />, path: '/customers' },
    { text: 'Categorias', icon: <CategoriesIcon />, path: '/categories' },
    { text: 'Relatórios', icon: <ReportsIcon />, path: '/reports' },
    { text: 'PDV (Caixa)', icon: <PointOfSaleIcon />, path: '/pdv' },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            handleDrawerToggle();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const drawer = (
        <Box sx={{ overflow: 'auto' }}>
            {/* Header */}
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                    Fynanceo ERP
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {user?.role}
                </Typography>
            </Box>

            <Divider />

            {/* Menu Items */}
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => handleNavigation(item.path)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />

            {/* Footer Menu */}
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                        <ListItemIcon>
                            <LogoutIcon color="error" />
                        </ListItemIcon>
                        <ListItemText primary="Sair" primaryTypographyProps={{ color: 'error' }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawer}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawer}
            </Drawer>
        </Box>
    );
};

export default Sidebar;