import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  className = "",
}) => {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 ${className}`}>
      <div className="text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0">{actions}</div>
      )}
    </div>
  );
};
