import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'sky' | 'amber' | 'emerald' | 'rose' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'sky',
}) => {
  const colorMap = {
    sky: 'from-sky-500/20 to-blue-600/10 text-sky-400 border-sky-500/30',
    amber: 'from-amber-500/20 to-orange-600/10 text-amber-400 border-amber-500/30',
    emerald: 'from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-500/30',
    rose: 'from-rose-500/20 to-red-600/10 text-rose-400 border-rose-500/30',
    purple: 'from-purple-500/20 to-indigo-600/10 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="glass-card rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorMap[color]} blur-2xl opacity-40 pointer-events-none`} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-xl bg-slate-900/80 border ${colorMap[color].split(' ')[2]} ${colorMap[color].split(' ')[1]}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Live Metric</span>
          <span className="font-semibold text-sky-400">{trend}</span>
        </div>
      )}
    </div>
  );
};
