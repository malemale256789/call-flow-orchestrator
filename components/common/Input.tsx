
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  as?: 'input' | 'textarea' | 'select';
  containerClassName?: string;
  helpText?: string; // Added helpText prop
}

const Input: React.FC<InputProps> = ({ label, name, error, as = 'input', containerClassName, className, children, helpText, ...props }) => {
  const id = name || props.id;
  const commonInputClasses = "block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-colors duration-150 ease-in-out";
  const inputClasses = error
    ? `${commonInputClasses} border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50`
    : `${commonInputClasses} border-secondary-300 focus:ring-primary-500 focus:border-primary-500 bg-white hover:border-secondary-400`;

  const renderInput = () => {
    if (as === 'textarea') {
      return <textarea id={id} name={name} className={`${inputClasses} ${className || ''} min-h-[80px]`} {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>} />;
    }
    if (as === 'select') {
      return <select id={id} name={name} className={`${inputClasses} ${className || ''}`} {...props as React.SelectHTMLAttributes<HTMLSelectElement>}>{children}</select>;
    }
    return <input id={id} name={name} className={`${inputClasses} ${className || ''}`} {...props as React.InputHTMLAttributes<HTMLInputElement>} />;
  };
  
  return (
    <div className={`mb-4 ${containerClassName || ''}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      {renderInput()}
      {helpText && <p className="mt-1 text-xs text-secondary-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
