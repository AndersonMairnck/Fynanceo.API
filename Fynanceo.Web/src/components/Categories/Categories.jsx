// src/components/Categories/Categories.jsx
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
    TextField
} from '@mui/material';
import { Edit, Delete, Add, Category as CategoryIcon, PointOfSale as PDVIcon } from '@mui/icons-material';
import { useCategories } from '../../hooks/useCategories';
import CategoryForm from './CategoryForm';
import ConfirmationDialog from '../common/ConfirmationDialog';
import Layout from '../Layout/Layout';

const Categories = () => {
    const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useCategories();
    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar categorias
    const filteredCategories = categories.filter(category =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedCategory(null);
        setFormOpen(true);
        setActionError('');
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setFormOpen(true);
        setActionError('');
    };

    const handleDelete = (category) => {
        setSelectedCategory(category);
        setDeleteDialogOpen(true);
        setActionError('');
    };

    // useEffect para atalhos de teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                handleCreate();
            }

            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.querySelector('input[placeholder="Buscar categorias..."]');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleCreate]);

    const handleSubmit = async (categoryData) => {
        setActionLoading(true);
        setActionError('');

        try {
            if (selectedCategory) {
                await updateCategory(selectedCategory.id, categoryData);
            } else {
                await createCategory(categoryData);
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
            await deleteCategory(selectedCategory.id);
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

    if (loading && categories.length === 0) {
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

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab
                            icon={<CategoryIcon />}
                            iconPosition="start"
                            label="Categorias"
                        />
                        {/* <Tab
                            icon={<PDVIcon />}
                            iconPosition="start"
                            label="PDV"
                            component="a"
                            href="/pdv"
                            onClick={(e) => {
                                e.preventDefault();
                                window.location.href = '/pdv';
                            }}
                        /> */}
                    </Tabs>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
                    <TextField
                        placeholder="Buscar categorias..."
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
                        Nova Categoria (F2)
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {searchTerm && (
                    <Box mb={2}>
                        <Typography variant="body2" color="textSecondary">
                            {filteredCategories.length} categoria(s) encontrada(s) para "{searchTerm}"
                        </Typography>
                    </Box>
                )}

                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Descrição</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredCategories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <Typography fontWeight="medium">
                                                {category.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">
                                                {category.description || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={category.isActive ? 'Ativa' : 'Inativa'}
                                                color={category.isActive ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                onClick={() => handleEdit(category)}
                                                color="primary"
                                                size="small"
                                                title="Editar categoria"
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDelete(category)}
                                                color="error"
                                                size="small"
                                                title="Excluir categoria"
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

                {filteredCategories.length === 0 && !loading && (
                    <Box textAlign="center" mt={4}>
                        <Typography variant="h6" color="textSecondary">
                            {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
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
                            Cadastrar Nova Categoria
                        </Button>
                    </Box>
                )}

                <CategoryForm
                    open={formOpen}
                    onClose={handleCloseForm}
                    category={selectedCategory}
                    onSubmit={handleSubmit}
                    loading={actionLoading}
                    error={actionError}
                />

                <ConfirmationDialog
                    open={deleteDialogOpen}
                    onClose={handleCloseDeleteDialog}
                    onConfirm={handleConfirmDelete}
                    title="Confirmar Exclusão"
                    message={`Tem certeza que deseja excluir a categoria "${selectedCategory?.name}"?`}
                    loading={actionLoading}
                    error={actionError}
                />
            </Container>
        </Layout>
    );
};

export default Categories;