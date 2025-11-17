import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
                                              children,
                                              className = '',
                                              padding = 'md',
                                              hover = false,
                                          }) => {
    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const hoverStyles = hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';

    return (
        <div
            className={`bg-white rounded-lg shadow-md ${paddingStyles[padding]} ${hoverStyles} ${className}`}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
    return <div className={`mb-4 ${className}`}>{children}</div>;
};

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
    return <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>{children}</h3>;
};

interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
                                                                    children,
                                                                    className = '',
                                                                }) => {
    return <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>;
};

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
    return <div className={className}>{children}</div>;
};

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
    return <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>{children}</div>;
};