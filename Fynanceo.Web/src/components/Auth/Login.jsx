import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const { login, loading, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        clearError();

        // Validação básica
        if (!email.trim() || !password.trim()) {
            setLocalError('Por favor, preencha todos os campos');
            return;
        }

        try {
            await login(email, password);
            navigate('/dashboard'); // ou para a página inicial
        } catch (error) {
            console.error('Erro no login:', error);
            setLocalError(error.message);
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <Paper elevation={8} sx={{ p: 4, width: 400 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Login
                </Typography>

                {(error || localError) && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error || localError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        required
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        label="Senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        required
                        disabled={loading}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Entrar'}
                    </Button>
                </form>

                <Typography variant="body2" color="text.secondary" align="center">
                    💡 Dica: Verifique se o servidor está rodando na porta 5000
                </Typography>
            </Paper>
        </Box>
    );
};

export default Login;