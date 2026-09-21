import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'emerald' | 'indigo' | 'amber' | 'rose';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = true,
}) => {
  const variantStyles: Record<string, string> = {
    success:  'bg-[#ECFDF3] text-[#15803D] border-[#BBF7D0]',
    emerald:  'bg-[#ECFDF3] text-[#15803D] border-[#BBF7D0]',
    warning:  'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]',
    amber:    'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    danger:   'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
    rose:     'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
    info:     'bg-[#F5F5F5] text-[#525252] border-[#E5E5E5]',
    neutral:  'bg-[#F5F5F5] text-[#525252] border-[#E5E5E5]',
    purple:   'bg-[#F5F5F5] text-[#525252] border-[#E5E5E5]',
    indigo:   'bg-[#F5F5F5] text-[#525252] border-[#E5E5E5]',
  };

  const dotColors: Record<string, string> = {
    success: 'bg-[#16A34A]',
    emerald: 'bg-[#16A34A]',
    warning: 'bg-[#EA580C]',
    amber:   'bg-[#D97706]',
    danger:  'bg-[#DC2626]',
    rose:    'bg-[#DC2626]',
    info:    'bg-[#737373]',
    neutral: 'bg-[#737373]',
    purple:  'bg-[#737373]',
    indigo:  'bg-[#737373]',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-bold tracking-wider uppercase',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  const selectedVariant = variantStyles[variant] ? variant : 'neutral';

  return (
    <span
      className={"inline-flex items-center gap-1.5 rounded-full border " + variantStyles[selectedVariant] + " " + sizes[size]}
    >
      {dot && <span className={"w-1.5 h-1.5 rounded-full " + dotColors[selectedVariant]} />}
      {children}
    </span>
  );
};
