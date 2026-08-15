import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading emergency network...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
        <ShieldAlert className="w-7 h-7 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-300 animate-pulse">{message}</p>
    </div>
  );
};
