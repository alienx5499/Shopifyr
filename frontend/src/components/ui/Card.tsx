import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    onClick
}) => {
    return (
        <div
            className={`card ${hover ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
