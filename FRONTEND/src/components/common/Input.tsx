import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1 w-full text-left">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-semibold uppercase tracking-wider text-slate-300">
            {label} {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none">{leftIcon}</div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-slate-950 border rounded-lg text-sm sm:text-[15px] font-medium text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightIcon ? 'pr-10' : 'pr-3.5'} py-2 sm:py-2.5 ${
              error
                ? 'border-rose-500/60 focus:ring-rose-500/50'
                : 'border-slate-800 focus:border-indigo-500/80 focus:ring-indigo-500/30'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-slate-400">{rightIcon}</div>
          )}
        </div>
        {error ? (
          <span className="text-xs text-rose-400 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-slate-500">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
