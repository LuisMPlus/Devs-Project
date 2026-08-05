'use client';

import React from 'react';
import { Sliders } from 'lucide-react';
import { ParameterSchema } from '../types/physics.types';

interface PropertyPanelProps {
  schemas: ParameterSchema[];
  config: Record<string, any>;
  onConfigChange: (key: string, value: any) => void;
  disabled?: boolean;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  schemas,
  config,
  onConfigChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#0c154c]/90 border border-[#1d4ed8]/40 rounded-xl p-5 backdrop-blur-md text-[#eff6ff] shadow-xl space-y-5 overflow-y-auto">
      <div className="flex items-center space-x-2 border-b border-[#1d4ed8]/40 pb-3">
        <Sliders className="text-[#02ffff]" size={20} />
        <h3 className="font-bold text-lg text-[#02ffff] tracking-wide">Parámetros</h3>
      </div>

      <div className="space-y-4">
        {schemas.map((schema) => {
          const currentValue = config[schema.id] ?? schema.defaultValue;

          return (
            <div key={schema.id} className="space-y-1.5 bg-black/20 p-3 rounded-lg border border-[#1d4ed8]/20">
              <div className="flex justify-between items-center text-sm font-medium">
                <label htmlFor={schema.id} className="text-gray-200">
                  {schema.label}
                </label>
                <span className="font-mono text-[#42d7c7] font-semibold">
                  {typeof currentValue === 'number' ? currentValue : String(currentValue)}
                  {schema.unit ? ` ${schema.unit}` : ''}
                </span>
              </div>

              {schema.controlType === 'slider' && (
                <div className="flex items-center space-x-3">
                  <input
                    id={schema.id}
                    type="range"
                    min={schema.min ?? 0}
                    max={schema.max ?? 100}
                    step={schema.step ?? 1}
                    value={currentValue}
                    disabled={disabled}
                    onChange={(e) => onConfigChange(schema.id, parseFloat(e.target.value))}
                    className="w-full accent-[#02ffff] bg-gray-700 h-2 rounded-lg cursor-pointer disabled:opacity-50"
                  />
                </div>
              )}

              {schema.controlType === 'number' && (
                <input
                  id={schema.id}
                  type="number"
                  min={schema.min}
                  max={schema.max}
                  step={schema.step ?? 1}
                  value={currentValue}
                  disabled={disabled}
                  onChange={(e) => onConfigChange(schema.id, parseFloat(e.target.value))}
                  className="w-full bg-[#0c154c] border border-[#1d4ed8]/50 rounded-lg px-3 py-1.5 text-sm font-mono text-[#eff6ff] focus:outline-none focus:border-[#02ffff] disabled:opacity-50"
                />
              )}

              {schema.controlType === 'select' && schema.options && (
                <select
                  id={schema.id}
                  value={currentValue}
                  disabled={disabled}
                  onChange={(e) => onConfigChange(schema.id, e.target.value)}
                  className="w-full bg-[#0c154c] border border-[#1d4ed8]/50 rounded-lg px-3 py-1.5 text-sm font-sans text-[#eff6ff] focus:outline-none focus:border-[#02ffff] disabled:opacity-50 cursor-pointer"
                >
                  {schema.options.map((opt) => (
                    <option key={String(opt.value)} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {schema.controlType === 'boolean' && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    id={schema.id}
                    type="checkbox"
                    checked={Boolean(currentValue)}
                    disabled={disabled}
                    onChange={(e) => onConfigChange(schema.id, e.target.checked)}
                    className="w-4 h-4 accent-[#02ffff] rounded cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-xs text-gray-400">Activar opción</span>
                </div>
              )}

              {schema.description && (
                <p className="text-xs text-gray-400 italic pt-0.5">{schema.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
