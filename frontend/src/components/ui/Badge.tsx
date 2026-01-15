import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'default';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    const variants = {
        primary: 'badge-primary',
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        default: 'bg-gray-100 text-gray-700'
    };

    return (
        <span className={`badge ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
