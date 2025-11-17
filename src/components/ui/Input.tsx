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
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            block w-full px-3 py-2 border rounded-lg
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            transition-colors
                            ${icon ? 'pl-10' : ''}
                            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
                            ${props.disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                            ${className}
                        `}
                        {...props}
                    />
                </div>

                {error && (
                    <div className="mt-1 flex items-start gap-1 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;