import React from 'react';
import {
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Box,
    IconButton,
    Typography
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon } from '@mui/icons-material';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
    <ListItem divider>
        <ListItemText
            primary={item.name}
            secondary={`R$ ${item.unitPrice.toFixed(2)} × ${item.quantity}`}
        />
        <ListItemSecondaryAction>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                    <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2">{item.quantity}</Typography>
                <IconButton size="small" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                    <AddIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => onRemove(item.id)}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Box>
        </ListItemSecondaryAction>
    </ListItem>
);

export default CartItem;