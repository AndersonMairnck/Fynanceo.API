import React from 'react';

export interface Category {
    id: string;
    name: string;
    description?: string;
    isActive: boolean; // 🔹 garantir que existe em todos os lugares
}

