// src/components/Customers/CustomerAddress.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';

const CustomerAddress = ({ customer }) => {
    const hasAddress = customer.rua || customer.numero || customer.complemento ||
        customer.bairro || customer.cidade || customer.estado || customer.cep;

    if (!hasAddress) {
        return <Typography color="textSecondary">Endereço não informado</Typography>;
    }

    const addressParts = [
        customer.rua && customer.numero ? `${customer.rua}, ${customer.numero}` : customer.rua,
        customer.complemento,
        customer.bairro,
        customer.cidade && customer.estado ? `${customer.cidade} - ${customer.estado}` : customer.cidade || customer.estado,
        customer.cep
    ].filter(part => part);

    return (
        <Box>
            {addressParts.map((part, index) => (
                <Typography key={index} variant="body2">
                    {part}
                </Typography>
            ))}
        </Box>
    );
};

export default CustomerAddress;