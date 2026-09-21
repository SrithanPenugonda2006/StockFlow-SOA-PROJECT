import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-left ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div>
            {title && <h3 className="text-base font-bold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
