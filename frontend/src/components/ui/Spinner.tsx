import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    className = ''
}) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    return (
        <div className={`spinner ${sizes[size]} ${className}`} />
    );
};

export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-text-light">{message}</p>
            </div>
        </div>
    );
};
