// index.tsx - Exporta todos os tipos do diretório Types

export * from './UserTypes';
export * from './ProductTypes';
export * from './OrderTypes';
// Adicione outros exports de tipos conforme necessário

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    // ...
}