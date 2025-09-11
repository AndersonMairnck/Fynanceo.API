import React, { useState, useContext } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: ''
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        // Validação de email
        if (!credentials.email) {
            errors.email = 'Email é obrigatório';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
            errors.email = 'Email inválido';
            isValid = false;
        }

        // Validação de senha
        if (!credentials.password) {
            errors.password = 'Senha é obrigatória';
            isValid = false;
        } else if (credentials.password.length < 6) {
            errors.password = 'Senha deve ter pelo menos 6 caracteres';
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({
            ...credentials,
            [name]: value
        });

        // Limpa erro do campo quando usuário começa a digitar
        if (fieldErrors[name]) {
            setFieldErrors({
                ...fieldErrors,
                [name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Valida o formulário antes de enviar
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await login(credentials);
            navigate('/dashboard');
        } catch (err) {
            setError('Falha no login. Verifique suas credenciais.');
            console.error('Erro de login:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    // Credenciais pré-preenchidas para desenvolvimento
    const fillTestCredentials = () => {
        setCredentials({
            email: 'admin@fynanceo.com',
            password: 'admin123'
        });
        setFieldErrors({ email: '', password: '' });
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        Fynanceo ERP
                    </Typography>
                    <Typography component="h2" variant="h5" align="center" gutterBottom>
                        Login
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {/* Botão para preencher credenciais de teste (apenas desenvolvimento) */}
                    {process.env.NODE_ENV === 'development' && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Button
                                size="small"
                                onClick={fillTestCredentials}
                                sx={{ textTransform: 'none' }}
                            >
                                Usar credenciais de teste
                            </Button>
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={credentials.email}
                            onChange={handleChange}
                            error={!!fieldErrors.email}
                            helperText={fieldErrors.email}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Senha"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={credentials.password}
                            onChange={handleChange}
                            error={!!fieldErrors.password}
                            helperText={fieldErrors.password}
                            disabled={loading}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </Box>

                    {/* Informações de teste (apenas desenvolvimento) */}
                    {process.env.NODE_ENV === 'development' && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                <strong>Credenciais de teste:</strong><br />
                                Email: admin@fynanceo.com<br />
                                Senha: admin123
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;