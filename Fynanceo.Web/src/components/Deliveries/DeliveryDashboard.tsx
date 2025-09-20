import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Tabs,
    Tab
} from '@mui/material';
import {
    TwoWheeler as BikeIcon,
    CheckCircle as DeliveredIcon,
    Schedule as PendingIcon,
    DirectionsBike as InTransitIcon
} from '@mui/icons-material';
import Layout from '../Layout/Layout';

const DeliveryDashboard = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [deliveryPerson, setDeliveryPerson] = useState('');

    const statusConfig = {
        Pendente: { color: 'warning', icon: <PendingIcon /> },
        EmPreparo: { color: 'info', icon: <PendingIcon /> },
        EmRota: { color: 'primary', icon: <InTransitIcon /> },
        Entregue: { color: 'success', icon: <DeliveredIcon /> },
        Cancelado: { color: 'error', icon: <PendingIcon /> }
    };

    useEffect(() => {
        fetchDeliveries();
    }, [activeTab]);

    const fetchDeliveries = async () => {
        try {
            let url = '/api/deliveries';
            if (activeTab === 1) url = '/api/deliveries/active';

            const response = await fetch(url);
            const data = await response.json();
            setDeliveries(data);
        } catch (error) {
            console.error('Erro ao buscar entregas:', error);
        }
    };

    const updateStatus = async (deliveryId, newStatus) => {
        try {
            await fetch(`/api/deliveries/${deliveryId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchDeliveries();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const assignDeliveryPerson = async () => {
        try {
            await fetch(`/api/deliveries/${selectedDelivery.id}/assign`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deliveryPerson })
            });
            setAssignDialogOpen(false);
            setDeliveryPerson('');
            fetchDeliveries();
        } catch (error) {
            console.error('Erro ao atribuir entregador:', error);
        }
    };

    const openAssignDialog = (delivery) => {
        setSelectedDelivery(delivery);
        setDeliveryPerson(delivery.deliveryPerson || '');
        setAssignDialogOpen(true);
    };

    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    🚚 Dashboard de Entregas
                </Typography>

                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                    <Tab label="Todas as Entregas" />
                    <Tab label="Entregas Ativas" />
                </Tabs>

                <Grid container spacing={3}>
                    {deliveries.map((delivery) => (
                        <Grid item xs={12} md={6} lg={4} key={delivery.id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                        <Typography variant="h6" component="div">
                                            #{delivery.orderNumber}
                                        </Typography>
                                        <Chip
                                            icon={statusConfig[delivery.status]?.icon}
                                            label={delivery.status}
                                            color={statusConfig[delivery.status]?.color || 'default'}
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        👤 {delivery.customerName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        📞 {delivery.customerPhone}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        📍 {delivery.deliveryAddress}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        💰 Total: R$ {delivery.orderAmount.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        🚚 Taxa: R$ {delivery.deliveryFee.toFixed(2)}
                                    </Typography>

                                    {delivery.deliveryPerson && (
                                        <Typography variant="body2" color="primary" gutterBottom>
                                            🏍️ Entregador: {delivery.deliveryPerson}
                                        </Typography>
                                    )}

                                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {!delivery.deliveryPerson && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<BikeIcon />}
                                                onClick={() => openAssignDialog(delivery)}
                                            >
                                                Atribuir
                                            </Button>
                                        )}

                                        {delivery.status === 'Pendente' && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => updateStatus(delivery.id, 'EmPreparo')}
                                            >
                                                Iniciar Preparo
                                            </Button>
                                        )}

                                        {delivery.status === 'EmPreparo' && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                onClick={() => updateStatus(delivery.id, 'EmRota')}
                                            >
                                                Saiu para Entrega
                                            </Button>
                                        )}

                                        {delivery.status === 'EmRota' && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                onClick={() => updateStatus(delivery.id, 'Entregue')}
                                            >
                                                Marcar como Entregue
                                            </Button>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
                    <DialogTitle>Atribuir Entregador</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Nome do Entregador"
                            fullWidth
                            variant="outlined"
                            value={deliveryPerson}
                            onChange={(e) => setDeliveryPerson(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAssignDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={assignDeliveryPerson} variant="contained">
                            Atribuir
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default DeliveryDashboard;