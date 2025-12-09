import React from 'react';
import { AlertCircle } from 'lucide-react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helperText, showCharCount = false, maxLength, value, className = '', ...props },
    ref,
  ) => {
    const currentLength = value ? String(value).length : 0;

    return (
      <div className='w-full'>
        {label && (
          <label className='block text-sm font-medium text-foreground mb-2'>
            {label}
            {props.required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}

        <div className='relative'>
          <textarea
            ref={ref}
            value={value}
            maxLength={maxLength}
            className={`
                            block w-full px-3 py-2 border rounded-lg
                            focus:ring-2 focus:ring-primary/30 focus:border-primary
                            transition-colors resize-y bg-input text-foreground
                            ${error ? 'border-red-500 focus:ring-red-500' : 'border-border'}
                            ${props.disabled ? 'opacity-50 cursor-not-allowed bg-muted' : ''}
                            ${className}
                        `}
            {...props}
          />
        </div>

        <div className='flex items-start justify-between mt-1'>
          <div className='flex-1'>
            {error && (
              <div className='flex items-start gap-1 text-sm text-red-600'>
                <AlertCircle className='w-4 h-4 mt-0.5 flex-shrink-0' />
                <span>{error}</span>
              </div>
            )}

            {helperText && !error && <p className='text-sm text-muted-foreground'>{helperText}</p>}
          </div>

          {showCharCount && maxLength && (
            <span className='text-xs text-muted-foreground ml-2'>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
