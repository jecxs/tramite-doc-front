import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className='w-full'>
        {label && (
          <label className='block text-sm font-medium text-foreground mb-2'>
            {label}
            {props.required && <span className='text-red-400 ml-1'>*</span>}
          </label>
        )}

        <div className='relative'>
          {icon && (
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              block w-full px-3 py-2.5 border rounded-lg
              transition-all duration-200
              bg-input text-foreground
              ${icon ? 'pl-10' : ''}
              ${error
              ? 'border-red-500 focus:ring-1 focus:ring-red-500/30 focus:border-red-500'
              : 'border-border focus:border-primary focus:ring-1 focus:ring-primary/30'}
              ${props.disabled ? 'opacity-50 cursor-not-allowed bg-muted' : ''}
              ${className}
            `}
            {...props}
          />
        </div>

        {error && (
          <div className='mt-2 flex items-start gap-1.5 text-sm text-red-500'>
            <AlertCircle className='w-4 h-4 mt-0.5 flex-shrink-0' />
            <span>{error}</span>
          </div>
        )}

        {helperText && !error && <p className='mt-2 text-sm text-muted-foreground'>{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
