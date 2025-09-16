import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Button,
    Typography
} from '@mui/material';

const CustomerDialog = ({ open, onClose, customers, setSelectedCustomer }) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Selecionar Cliente</DialogTitle>
        <DialogContent>
            <List>
                <ListItem
                    button
                    onClick={() => {
                        setSelectedCustomer(null);
                        onClose();
                    }}
                >
                    <ListItemText primary="Cliente Padrão" />
                </ListItem>

                {customers.map((customer) => (
                    <ListItem
                        key={customer.id}
                        button
                        onClick={() => {
                            setSelectedCustomer(customer);
                            onClose();
                        }}
                    >
                        <ListItemText
                            primary={customer.name}
                            secondary={
                                <>
                                    <Typography component="span" variant="body2" color="text.primary">
                                        {customer.phone || 'Telefone não informado'}
                                    </Typography>
                                    <br />
                                    <Typography component="span" variant="caption" color="text.secondary">
                                        {customer.address || 'Endereço não informado'}
                                    </Typography>
                                </>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </DialogContent>

        <DialogActions>
            <Button onClick={onClose}>Fechar</Button>
        </DialogActions>
    </Dialog>
);

export default CustomerDialog;