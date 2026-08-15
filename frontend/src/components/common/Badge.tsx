import React from 'react';

interface BadgeProps {
  variant?: 'severity' | 'status' | 'category' | 'role';
  value: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'status', value, className = '' }) => {
  let colorStyle = 'bg-slate-800 text-slate-300 border-slate-700';

  const valUpper = value ? value.toUpperCase() : '';

  if (variant === 'severity') {
    switch (value) {
      case 'Critical':
        colorStyle = 'bg-red-950/80 text-red-400 border-red-800/60 pulse-critical';
        break;
      case 'High':
        colorStyle = 'bg-amber-950/80 text-amber-400 border-amber-800/60';
        break;
      case 'Medium':
        colorStyle = 'bg-yellow-950/80 text-yellow-400 border-yellow-800/60';
        break;
      case 'Low':
        colorStyle = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
        break;
    }
  } else if (variant === 'status') {
    if (['ACTIVE', 'VERIFIED', 'OPEN', 'AVAILABLE', 'COMPLETED'].includes(valUpper)) {
      colorStyle = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40';
    } else if (['PENDING', 'ASSIGNED', 'IN PROGRESS', 'LOW'].includes(valUpper)) {
      colorStyle = 'bg-amber-950/60 text-amber-400 border-amber-800/40';
    } else if (['REJECTED', 'CLOSED', 'FULL', 'OUT_OF_STOCK'].includes(valUpper)) {
      colorStyle = 'bg-rose-950/60 text-rose-400 border-rose-800/40';
    }
  } else if (variant === 'role') {
    if (value === 'ADMIN') colorStyle = 'bg-purple-950/70 text-purple-300 border-purple-800/50';
    else if (value === 'RESPONDER') colorStyle = 'bg-cyan-950/70 text-cyan-300 border-cyan-800/50';
    else colorStyle = 'bg-blue-950/70 text-blue-300 border-blue-800/50';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {value}
    </span>
  );
};
