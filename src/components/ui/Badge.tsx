// src/components/ui/Badge.tsx
import React from 'react';
import { PROCEDURE_STATE_COLORS, PROCEDURE_STATE_LABELS, ProcedureState } from '@/lib/constants';

interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    children: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
                                                variant = 'default',
                                                children,
                                                className = '',
                                            }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
};

interface ProcedureStateBadgeProps {
    estado: string;
    className?: string;
}

export const ProcedureStateBadge: React.FC<ProcedureStateBadgeProps> = ({
                                                                            estado,
                                                                            className = '',
                                                                        }) => {

    const isValidState = estado && Object.keys(PROCEDURE_STATE_LABELS).includes(estado);

    if (!isValidState) {
        console.warn(`Estado inválido recibido: "${estado}"`);
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
                {estado || 'Desconocido'}
            </span>
        );
    }

    const colorClass = PROCEDURE_STATE_COLORS[estado as ProcedureState];
    const label = PROCEDURE_STATE_LABELS[estado as ProcedureState];

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
        >
            {label}
        </span>
    );
};