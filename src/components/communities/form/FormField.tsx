import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  as?: 'input' | 'textarea' | 'select';
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  register,
  error,
  required,
  as = 'input',
  children,
  className = '',
  ...props
}) => {
  const baseClassName = `w-full px-4 py-2 rounded-lg border ${
    error ? 'border-red-500' : 'border-gray-200'
  } focus:outline-none focus:ring-2 focus:ring-red-600 ${className}`;

  const renderField = () => {
    switch (as) {
      case 'textarea':
        return (
          <textarea
            {...register(name)}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className={baseClassName}
          />
        );
      case 'select':
        return (
          <select
            {...register(name)}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
            className={baseClassName}
          >
            {children}
          </select>
        );
      default:
        return (
          <input
            {...register(name)}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            className={baseClassName}
          />
        );
    }
  };

  return (
    <div>
      <label className="block text-sm mb-2" style={{ color: '#666' }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {renderField()}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};