'use client';

import { deleteSolicitante } from '@/actions/solicitantes';
import { useState } from 'react';

export default function DeleteButton({ cedula }: { cedula: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar este solicitante?')) return;

        setIsDeleting(true);
        const result = await deleteSolicitante(cedula);

        if (!result.success) {
            alert(`Error: ${result.error}`);
        }
        setIsDeleting(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </button>
    );
}
