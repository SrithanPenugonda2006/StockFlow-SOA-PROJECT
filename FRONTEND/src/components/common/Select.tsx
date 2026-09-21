import React, { forwardRef } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-gray-700">
            {label} {props.required && <span className="text-gray-900">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-white border rounded-xl text-sm font-medium text-[#111111] px-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all duration-150 cursor-pointer ${
            error
              ? 'border-gray-400 focus:border-gray-900 focus:ring-gray-900/20'
              : 'border-[#D4D4D4] focus:border-[#111111] focus:ring-black/8'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-gray-900">
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <span className="text-xs text-gray-900 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-gray-500">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
