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
          <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label} {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-slate-950 border rounded-lg text-sm text-slate-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all duration-200 ${
            error
              ? 'border-rose-500/60 focus:ring-rose-500/50'
              : 'border-slate-800 focus:border-indigo-500/80 focus:ring-indigo-500/30'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <span className="text-xs text-rose-400 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-slate-500">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
