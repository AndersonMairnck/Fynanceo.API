import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

const Header = ({ handleDrawerToggle }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { md: `calc(100% - 240px)` },
                ml: { md: '240px' },
                zIndex: theme.zIndex.drawer + 1
            }}
        >
            <Toolbar>
                {isMobile && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                <Typography variant="h6" noWrap component="div">
                    Dashboard
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Typography variant="body2">
                    {new Date().toLocaleDateString('pt-BR')}
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default Header;