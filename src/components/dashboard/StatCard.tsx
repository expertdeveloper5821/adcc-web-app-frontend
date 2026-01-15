import React from 'react';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, icon, trend, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className="p-6 rounded-2xl shadow-sm transition-all hover:shadow-md hover:scale-105 cursor-pointer text-left w-full"
      style={{ backgroundColor: '#ECC180' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-sm" style={{ color: '#C12D32' }}>
            <TrendingUp className="w-4 h-4" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="text-3xl mb-1" style={{ color: '#333' }}>{value}</div>
      <div className="text-sm" style={{ color: '#666' }}>{label}</div>
    </button>
  );
}
