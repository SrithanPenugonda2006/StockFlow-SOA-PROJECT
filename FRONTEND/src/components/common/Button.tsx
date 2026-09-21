import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-[0.98] cursor-pointer';

  const variants = {
    primary:   'bg-[#111111] hover:bg-[#2A2A2A] active:bg-black text-white shadow-xs',
    secondary: 'bg-white hover:bg-[#F5F5F5] text-[#111111] border border-[#D4D4D4]',
    danger:    'bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white shadow-xs focus:ring-red-500/30',
    ghost:     'text-[#555555] hover:text-[#111111] hover:bg-[#F5F5F5]',
    outline:   'border border-[#D4D4D4] text-[#111111] hover:bg-[#F5F5F5]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};
