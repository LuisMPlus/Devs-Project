'use client';

import React from 'react';
import { Play, Pause, RotateCcw, StepForward, Clock } from 'lucide-react';
import { SimulationMode } from '../types/physics.types';

interface PlaybackToolbarProps {
  currentTime: number;
  mode: SimulationMode;
  speedMultiplier: number;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export const PlaybackToolbar: React.FC<PlaybackToolbarProps> = ({
  currentTime,
  mode,
  speedMultiplier,
  onPlay,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
}) => {
  const speeds = [0.25, 0.5, 1, 2, 4];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0c154c]/90 border border-[#1d4ed8]/40 rounded-xl backdrop-blur-md text-[#eff6ff] shadow-lg">
      {/* Playback Controls */}
      <div className="flex items-center space-x-3">
        {mode === 'RUNNING' ? (
          <button
            onClick={onPause}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#f97316] hover:bg-[#f97316]/80 text-[#0c154c] font-bold rounded-lg transition-all shadow-md active:scale-95"
            title="Pausar Simulación"
          >
            <Pause size={18} className="fill-current" />
            <span>Pausar</span>
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#02ffff] hover:bg-[#02ffff]/80 text-[#0c154c] font-bold rounded-lg transition-all shadow-md shadow-[#02ffff]/20 active:scale-95"
            title="Iniciar Simulación"
          >
            <Play size={18} className="fill-current" />
            <span>Simular</span>
          </button>
        )}

        <button
          onClick={onStep}
          disabled={mode === 'RUNNING'}
          className="p-2.5 bg-[#1d4ed8]/30 hover:bg-[#1d4ed8]/60 disabled:opacity-40 disabled:hover:bg-[#1d4ed8]/30 text-[#eff6ff] rounded-lg transition-all border border-[#1d4ed8]/50"
          title="Avanzar Paso (+0.016s)"
        >
          <StepForward size={18} />
        </button>

        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 rounded-lg transition-all border border-gray-700/60"
          title="Reiniciar a Estado Inicial"
        >
          <RotateCcw size={16} />
          <span className="text-sm font-medium">Reiniciar</span>
        </button>
      </div>

      {/* Timer Readout */}
      <div className="flex items-center space-x-2 px-4 py-2 bg-[#0c154c] border border-[#42d7c7]/30 rounded-lg font-mono text-[#02ffff] text-lg font-bold shadow-inner">
        <Clock size={18} className="text-[#42d7c7]" />
        <span>t = {currentTime.toFixed(2)}s</span>
      </div>

      {/* Speed Selector & Status Badge */}
      <div className="flex items-center space-x-4">
        {/* Speed multipliers */}
        <div className="flex items-center space-x-1 bg-black/30 p-1 rounded-lg border border-[#1d4ed8]/30">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                speedMultiplier === s
                  ? 'bg-[#1d4ed8] text-[#eff6ff] shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Mode Badge */}
        <div
          className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
            mode === 'RUNNING'
              ? 'bg-[#02ffff]/10 border-[#02ffff] text-[#02ffff]'
              : mode === 'PAUSED'
              ? 'bg-amber-500/10 border-amber-400 text-amber-300'
              : 'bg-indigo-500/10 border-indigo-400 text-indigo-300'
          }`}
        >
          {mode === 'RUNNING' ? 'Ejecutando' : mode === 'PAUSED' ? 'Pausado' : 'Edición'}
        </div>
      </div>
    </div>
  );
};
