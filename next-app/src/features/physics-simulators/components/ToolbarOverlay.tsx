'use client';

import React from 'react';
import { Eye, EyeOff, Grid, Navigation, Activity, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ToolbarOverlayProps {
  showVectors: boolean;
  showGrid: boolean;
  showTrajectory: boolean;
  showMetrics: boolean;
  onToggleVectors: () => void;
  onToggleGrid: () => void;
  onToggleTrajectory: () => void;
  onToggleMetrics: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}

export const ToolbarOverlay: React.FC<ToolbarOverlayProps> = ({
  showVectors,
  showGrid,
  showTrajectory,
  showMetrics,
  onToggleVectors,
  onToggleGrid,
  onToggleTrajectory,
  onToggleMetrics,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-[#0c154c]/85 border border-[#1d4ed8]/40 p-2 rounded-xl backdrop-blur-md shadow-lg">
      {/* Zoom Controls */}
      {(onZoomIn || onZoomOut || onResetZoom) && (
        <div className="flex items-center space-x-1 bg-black/30 p-1 rounded-lg border border-[#1d4ed8]/30">
          {onZoomIn && (
            <button
              onClick={onZoomIn}
              className="p-1.5 text-gray-300 hover:text-[#02ffff] hover:bg-[#1d4ed8]/40 rounded-md transition-all"
              title="Acercar Zoom (+)"
            >
              <ZoomIn size={15} />
            </button>
          )}
          {onZoomOut && (
            <button
              onClick={onZoomOut}
              className="p-1.5 text-gray-300 hover:text-[#02ffff] hover:bg-[#1d4ed8]/40 rounded-md transition-all"
              title="Alejar Zoom (-)"
            >
              <ZoomOut size={15} />
            </button>
          )}
          {onResetZoom && (
            <button
              onClick={onResetZoom}
              className="p-1.5 text-gray-300 hover:text-[#42d7c7] hover:bg-[#1d4ed8]/40 rounded-md transition-all"
              title="Restablecer Escala y Origen (100%)"
            >
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      )}

      {/* Layer Toggles */}
      <button
        onClick={onToggleVectors}
        className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          showVectors
            ? 'bg-[#02ffff]/20 text-[#02ffff] border border-[#02ffff]/50'
            : 'text-gray-400 hover:text-white bg-black/20'
        }`}
        title="Mostrar / Ocultar Vectores de Velocidad, Aceleración y Fuerzas"
      >
        <Navigation size={14} className={showVectors ? 'rotate-45' : ''} />
        <span>Vectores</span>
      </button>

      <button
        onClick={onToggleGrid}
        className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          showGrid
            ? 'bg-[#1d4ed8]/40 text-[#eff6ff] border border-[#1d4ed8]'
            : 'text-gray-400 hover:text-white bg-black/20'
        }`}
        title="Mostrar / Ocultar Ejes y Cuadrícula Escalar"
      >
        <Grid size={14} />
        <span>Cuadrícula</span>
      </button>

      <button
        onClick={onToggleTrajectory}
        className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          showTrajectory
            ? 'bg-[#42d7c7]/20 text-[#42d7c7] border border-[#42d7c7]/50'
            : 'text-gray-400 hover:text-white bg-black/20'
        }`}
        title="Mostrar / Ocultar Trayectoria Recorrida"
      >
        {showTrajectory ? <Eye size={14} /> : <EyeOff size={14} />}
        <span>Trayectoria</span>
      </button>

      <button
        onClick={onToggleMetrics}
        className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          showMetrics
            ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50'
            : 'text-gray-400 hover:text-white bg-black/20'
        }`}
        title="Mostrar / Ocultar Panel de Métricas"
      >
        <Activity size={14} />
        <span>Métricas</span>
      </button>
    </div>
  );
};
