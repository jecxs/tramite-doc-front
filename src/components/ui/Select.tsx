import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder = 'Seleccione una opción',
      onChange,
      className = '',
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className='w-full'>
        {label && (
          <label className='block text-sm font-medium text-foreground mb-2'>
            {label}
            {props.required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}

        <div className='relative'>
          <select
            ref={ref}
            onChange={handleChange}
            className={`
                            block w-full px-3 py-2 pr-10 border rounded-lg
                            focus:ring-2 focus:ring-primary/30 focus:border-primary
                            transition-colors appearance-none bg-input text-foreground
                            ${error ? 'border-red-500 focus:ring-red-500' : 'border-border'}
                            ${props.disabled ? 'opacity-50 cursor-not-allowed bg-muted' : ''}
                            ${className}
                        `}
            {...props}
          >
            <option value=''>{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
            <ChevronDown className='w-5 h-5 text-muted-foreground' />
          </div>
        </div>

        {error && (
          <div className='mt-1 flex items-start gap-1 text-sm text-red-500'>
            <AlertCircle className='w-4 h-4 mt-0.5 flex-shrink-0' />
            <span>{error}</span>
          </div>
        )}

        {helperText && !error && <p className='mt-1 text-sm text-muted-foreground'>{helperText}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
