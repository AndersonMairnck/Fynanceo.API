// src/components/Customers/Customers.jsx
import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Alert,
    Box,
    CircularProgress,
    Tabs,
    Tab,
    TextField // ADICIONE ESTA IMPORTACAO
} from '@mui/material';
import { Edit, Delete, Add, People as CustomersIcon, PointOfSale as PDVIcon } from '@mui/icons-material';
import { useCustomers } from '../../hooks/useCustomers';
import CustomerForm from './CustomerForm';
import ConfirmationDialog from '../common/ConfirmationDialog';
import Layout from '../Layout/Layout';

const Customers = () => {
    const { customers, loading, error, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState(''); // ESTADO PARA BUSCA
const [customers, setCustomers] = useState<Customer[]>([]);
    // Função para filtrar clientes
    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.estado?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedCustomer(null);
        setFormOpen(true);
        setActionError('');
    };

    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        setFormOpen(true);
        setActionError('');
    };

    const handleDelete = (customer) => {
        setSelectedCustomer(customer);
        setDeleteDialogOpen(true);
        setActionError('');
    };

    // useEffect para atalhos de teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Novo cliente quando pressionar F2
            if (e.key === 'F2') {
                e.preventDefault();
                handleCreate();
            }

            // Foca na busca quando pressionar Ctrl+F
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.querySelector('input[placeholder="Buscar clientes..."]');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select(); // Seleciona o texto existente
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleCreate]);

    const handleSubmit = async (customerData) => {
        setActionLoading(true);
        setActionError('');

        try {
            if (selectedCustomer) {
                await updateCustomer(selectedCustomer.id, customerData);
            } else {
                await createCustomer(customerData);
            }
            setFormOpen(false);
        } catch (err) {
            setActionError(err.message);
            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        setActionLoading(true);
        setActionError('');

        try {
            await deleteCustomer(selectedCustomer.id);
            setDeleteDialogOpen(false);
        } catch (err) {
            setActionError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setActionError('');
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setActionError('');
    };

    if (loading && customers.length === 0) {
        return (
            <Layout>
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress />
                    </Box>
                </Container>
            </Layout>
        );
    }
    interface Customer {
  id: number;
  name: string; }

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab
                            icon={<CustomersIcon />}
                            iconPosition="start"
                            label="Clientes"
                        />
                        <Tab
                            icon={<PDVIcon />}
                            iconPosition="start"
                            label="PDV"
                            component="a"
                            href="/pdv"
                            onClick={(e) => {
                                e.preventDefault();
                                window.location.href = '/pdv';
                            }}
                        />
                    </Tabs>
                </Box>

                {/* BARRA DE BUSCA - ADICIONE ESTE BLOCO */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
                    <TextField
                        placeholder="Buscar clientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{ flex: 1, maxWidth: 400 }}
                        InputProps={{
                            sx: { height: 40 }
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleCreate}
                    >
                        Novo Cliente (F2)
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* CONTADOR DE RESULTADOS - ADICIONE ESTE BLOCO */}
                {searchTerm && (
                    <Box mb={2}>
                        <Typography variant="body2" color="textSecondary">
                            {filteredCustomers.length} cliente(s) encontrado(s) para "{searchTerm}"
                        </Typography>
                    </Box>
                )}

                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Telefone</TableCell>
                                    <TableCell>Cidade</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* USE filteredCustomers EM VEZ DE customers */}
                                {filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>{customer.name}</TableCell>
                                        <TableCell>{customer.email || '-'}</TableCell>
                                        <TableCell>{customer.phone || '-'}</TableCell>
                                        <TableCell>{customer.cidade || '-'}</TableCell>
                                        <TableCell>{customer.estado || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={customer.isActive ? 'Ativo' : 'Inativo'}
                                                color={customer.isActive ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                onClick={() => handleEdit(customer)}
                                                color="primary"
                                                size="small"
                                                title="Editar cliente"
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDelete(customer)}
                                                color="error"
                                                size="small"
                                                title="Excluir cliente"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* MENSAGEM DE NENHUM RESULTADO - ATUALIZE ESTE BLOCO */}
                {filteredCustomers.length === 0 && !loading && (
                    <Box textAlign="center" mt={4}>
                        <Typography variant="h6" color="textSecondary">
                            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                        </Typography>
                        {searchTerm && (
                            <Button
                                variant="outlined"
                                onClick={() => setSearchTerm('')}
                                sx={{ mt: 1, mr: 1 }}
                            >
                                Limpar busca
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={handleCreate}
                            sx={{ mt: 1 }}
                        >
                            Cadastrar Novo Cliente
                        </Button>
                    </Box>
                )}

                <CustomerForm
                    open={formOpen}
                    onClose={handleCloseForm}
                    customer={selectedCustomer}
                    onSubmit={handleSubmit}
                    loading={actionLoading}
                    error={actionError}
                />

                <ConfirmationDialog
                    open={deleteDialogOpen}
                    onClose={handleCloseDeleteDialog}
                    onConfirm={handleConfirmDelete}
                    title="Confirmar Exclusão"
                    message={`Tem certeza que deseja excluir o cliente "${selectedCustomer?.name}"?`}
                    loading={actionLoading}
                    error={actionError}
                />
            </Container>
        </Layout>
    );
};

export default Customers;