import React from 'react';
import { LucideIcon, ShieldAlert } from 'lucide-react';
import { Card } from '../common/Card';

interface AdminServiceNoticeProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
}

export const AdminServiceNotice: React.FC<AdminServiceNoticeProps> = ({
  title,
  description,
  icon: Icon = ShieldAlert,
  actionText = 'Service Status: Not Configured',
}) => {
  return (
    <Card className="p-8 text-center max-w-2xl mx-auto my-8 border-slate-800 bg-slate-900/60 shadow-xl rounded-2xl">
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-lg mx-auto">
        {description}
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-slate-300">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>{actionText}</span>
      </div>
    </Card>
  );
};
