import React from 'react';

/**
 * Reusable form field component with consistent styling and error handling
 */
const FormField = ({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  error,
  hasError,
  children,
  className = '',
  ...props
}) => {
  const baseInputClasses = `
    appearance-none relative block w-full px-3 py-3 border 
    placeholder-gray-500 text-gray-900 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
    focus:z-10 sm:text-sm transition-colors
  `;

  const errorClasses = hasError ? 'border-red-300' : 'border-gray-300';
  const inputClasses = `${baseInputClasses} ${errorClasses} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children ? (
        // Custom input component (like select or textarea)
        React.cloneElement(children, {
          id: name,
          name,
          className: inputClasses,
          ...props
        })
      ) : (
        // Standard input
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className={inputClasses}
          {...props}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Specialized components for different input types
 */

export const TextAreaField = ({ rows = 4, ...props }) => (
  <FormField {...props}>
    <textarea rows={rows} className="resize-none" />
  </FormField>
);

export const SelectField = ({ options = [], placeholder = 'Select an option', ...props }) => (
  <FormField {...props}>
    <select>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </FormField>
);

export const PasswordField = ({ showPassword, onTogglePassword, ...props }) => (
  <div className="relative">
    <FormField
      type={showPassword ? 'text' : 'password'}
      className="pr-10"
      {...props}
    />
    {onTogglePassword && (
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
        onClick={onTogglePassword}
      >
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {showPassword ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          )}
        </svg>
      </button>
    )}
  </div>
);

export const CheckboxField = ({ label, ...props }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
      {...props}
    />
    <label htmlFor={props.name} className="ml-2 block text-sm text-gray-700">
      {label}
    </label>
  </div>
);

export default FormField;