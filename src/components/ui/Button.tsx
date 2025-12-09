import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:opacity-90 focus:ring-primary/50',
      secondary: 'bg-secondary text-secondary-foreground hover:opacity-90 focus:ring-secondary/50',
      danger:
        'bg-destructive text-destructive-foreground hover:opacity-90 focus:ring-destructive/50',
      ghost: 'bg-transparent hover:bg-muted text-foreground focus:ring-primary/30',
      outline:
        'border border-border bg-transparent hover:bg-muted text-foreground focus:ring-primary/30',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
