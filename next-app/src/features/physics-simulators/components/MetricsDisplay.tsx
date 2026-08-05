'use client';

import React from 'react';
import { Gauge } from 'lucide-react';
import { SimulationMetrics } from '../types/physics.types';

interface MetricsDisplayProps {
  metrics: SimulationMetrics[];
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics }) => {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="bg-[#0c154c]/90 border border-[#1d4ed8]/40 rounded-xl p-4 backdrop-blur-md text-[#eff6ff] shadow-xl space-y-3">
      <div className="flex items-center space-x-2 border-b border-[#1d4ed8]/30 pb-2">
        <Gauge size={18} className="text-[#42d7c7]" />
        <h4 className="font-bold text-sm text-[#42d7c7] uppercase tracking-wider">Telemetría en Tiempo Real</h4>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-lg border flex flex-col justify-between ${
              m.highlight
                ? 'bg-[#1d4ed8]/25 border-[#02ffff]/40 text-[#02ffff]'
                : 'bg-black/25 border-[#1d4ed8]/20 text-[#eff6ff]'
            }`}
          >
            <span className="text-xs text-gray-300 font-medium truncate">{m.label}</span>
            <span className="font-mono text-base font-bold mt-1">
              {m.value}
              {m.unit ? <span className="text-xs font-normal text-gray-400 ml-1">{m.unit}</span> : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
