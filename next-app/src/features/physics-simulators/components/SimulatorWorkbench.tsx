'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { getSimulatorById } from '../simulators';
import { PhysicsSimulatorDef } from '../types/simulator.types';
import { PhysicsEngine } from '../engine/PhysicsEngine';
import { SimulationMode, TrajectoryPoint, Vector2D } from '../types/physics.types';
import { CanvasRenderer, CanvasRendererRef } from './CanvasRenderer';
import { PlaybackToolbar } from './PlaybackToolbar';
import { PropertyPanel } from './PropertyPanel';
import { ToolbarOverlay } from './ToolbarOverlay';
import { MetricsDisplay } from './MetricsDisplay';

interface SimulatorWorkbenchProps {
  simulatorId: string;
}

export const SimulatorWorkbench: React.FC<SimulatorWorkbenchProps> = ({ simulatorId }) => {
  const simulator = getSimulatorById(simulatorId);

  if (!simulator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0c154c] text-[#eff6ff] p-6 space-y-4">
        <h2 className="text-2xl font-bold text-[#ef4444]">Simulador no encontrado</h2>
        <p className="text-gray-300">El simulador solicitado no existe en la base de datos.</p>
        <Link href="/simulators" className="px-4 py-2 bg-[#1d4ed8] text-white rounded-lg">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  return <SimulatorWorkbenchContent simulator={simulator} />;
};

const SimulatorWorkbenchContent: React.FC<{ simulator: PhysicsSimulatorDef<any, any> }> = ({ simulator }) => {
  const canvasRef = useRef<CanvasRendererRef | null>(null);

  // Config state initialized with default values from parameter schemas
  const [config, setConfig] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    simulator.parameterSchemas.forEach((schema) => {
      initial[schema.id] = schema.defaultValue;
    });
    return initial;
  });


  const engineRef = useRef<PhysicsEngine<any, any> | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [mode, setMode] = useState<SimulationMode>('EDIT');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [simState, setSimState] = useState<any>(() => simulator.getInitialState(config));

  // Trajectory points array
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);


  // View toggles
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showTrajectory, setShowTrajectory] = useState<boolean>(true);
  const [showMetrics, setShowMetrics] = useState<boolean>(true);

  // Initialize engine
  useEffect(() => {
    const engine = new PhysicsEngine(simulator, config);
    engineRef.current = engine;

    const unsubscribe = engine.subscribe({
      onTick: (t, state) => {
        setCurrentTime(t);
        setSimState(state);

        // Record trajectory
        if (simulator.getTrajectoryPoint) {
          const pt = simulator.getTrajectoryPoint(state);
          if (pt) {
            setTrajectory((prev) => {
              // Avoid duplicate points if static
              if (prev.length > 0) {
                const last = prev[prev.length - 1];
                if (Math.abs(last.x - pt.x) < 0.001 && Math.abs(last.y - pt.y) < 0.001) {
                  return prev;
                }
              }
              // Keep max 500 points
              const next = [...prev, { x: pt.x, y: pt.y, time: t }];
              return next.length > 500 ? next.slice(next.length - 500) : next;
            });
          }
        }
      },
      onModeChange: (newMode) => {
        setMode(newMode);
        if (newMode === 'EDIT') {
          setTrajectory([]);
        }
      },
    });

    return () => {
      unsubscribe();
      engine.destroy();
      engineRef.current = null;
    };
  }, [simulator]);

  // Handle Parameter Config Change
  const handleConfigChange = useCallback((key: string, value: any) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      if (engineRef.current) {
        engineRef.current.setConfig(next);
      }
      return next;
    });
  }, []);

  // Handle Playback Controls
  const handlePlay = useCallback(() => engineRef.current?.play(), []);
  const handlePause = useCallback(() => engineRef.current?.pause(), []);
  const handleStep = useCallback(() => engineRef.current?.stepForward(), []);
  const handleReset = useCallback(() => {
    engineRef.current?.reset();
    setTrajectory([]);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setSpeedMultiplier(speed);
    engineRef.current?.setSpeedMultiplier(speed);
  }, []);

  // Handle Object Dragging in EDIT mode
  const handleObjectDrag = useCallback(
    (objectId: string, newWorldPos: Vector2D) => {
      if (simulator.handleObjectDrag && engineRef.current) {
        const { updatedConfig, updatedState } = simulator.handleObjectDrag(
          objectId,
          newWorldPos,
          config,
          simState
        );
        if (updatedConfig) {
          const nextConfig = { ...config, ...updatedConfig };
          setConfig(nextConfig);
          engineRef.current.setConfig(nextConfig);
        }
        if (updatedState) {
          setSimState((prev: any) => ({ ...prev, ...updatedState }));
        }
      }
    },
    [simulator, config, simState]
  );

  // Compute objects, vectors, and metrics for active render tick
  const objects = simulator.getRenderableObjects(simState, config);
  const vectors = simulator.getVectors(simState, config);
  const rawMetrics = simulator.getMetrics(simState, config);

  // Replace default time metric with live currentTime
  const metrics = rawMetrics.map((m) =>
    m.label.toLowerCase().includes('tiempo') ? { ...m, value: currentTime.toFixed(2) } : m
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0c154c] text-[#eff6ff] font-sans p-4 md:p-6 space-y-6">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1d4ed8]/40 pb-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/simulators"
            className="flex items-center space-x-2 px-3 py-2 bg-[#1d4ed8]/30 hover:bg-[#1d4ed8]/60 text-[#02ffff] border border-[#1d4ed8]/50 rounded-lg transition-all"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-semibold">Volver al Catálogo</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#02ffff] tracking-wide">{simulator.title}</h1>
            <p className="text-xs text-gray-300 max-w-2xl">{simulator.description}</p>
          </div>
        </div>

        <ToolbarOverlay
          showVectors={showVectors}
          showGrid={showGrid}
          showTrajectory={showTrajectory}
          showMetrics={showMetrics}
          onToggleVectors={() => setShowVectors((v) => !v)}
          onToggleGrid={() => setShowGrid((g) => !g)}
          onToggleTrajectory={() => setShowTrajectory((t) => !t)}
          onToggleMetrics={() => setShowMetrics((m) => !m)}
          onZoomIn={() => canvasRef.current?.zoomIn()}
          onZoomOut={() => canvasRef.current?.zoomOut()}
          onResetZoom={() => canvasRef.current?.resetZoom()}
        />
      </header>

      {/* Main Grid Workbench */}
      <main className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow">
        {/* Left/Center 3 columns: Canvas & Playback Controls */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          {/* Interactive 2D Canvas */}
          <div className="flex-grow relative min-h-[500px]">
            <CanvasRenderer
              ref={canvasRef}
              objects={objects}
              vectors={vectors}
              mode={mode}
              showGrid={showGrid}
              showVectors={showVectors}
              showTrajectory={showTrajectory}
              trajectoryPoints={trajectory}
              onObjectDrag={handleObjectDrag}
              defaultWorldBounds={simulator.defaultWorldBounds}
            />

            {/* Instruction tooltip in EDIT mode */}
            {mode === 'EDIT' && (
              <div className="absolute top-4 left-4 bg-black/70 border border-[#02ffff]/40 px-3 py-1.5 rounded-lg text-xs text-[#02ffff] pointer-events-none backdrop-blur-sm shadow">
                💡 Clic derecho: Mover plano | Clic izquierdo: Arrastrar objeto/plano | Ctrl + Rueda: Zoom
              </div>
            )}


          </div>

          {/* Playback Control Toolbar */}
          <PlaybackToolbar
            currentTime={currentTime}
            mode={mode}
            speedMultiplier={speedMultiplier}
            onPlay={handlePlay}
            onPause={handlePause}
            onStep={handleStep}
            onReset={handleReset}
            onSpeedChange={handleSpeedChange}
          />
        </div>

        {/* Right 1 column: Property Panel & Real-time Metrics */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <PropertyPanel
            schemas={simulator.parameterSchemas}
            config={config}
            onConfigChange={handleConfigChange}
            disabled={mode === 'RUNNING'}
          />

          {showMetrics && <MetricsDisplay metrics={metrics} />}
        </div>
      </main>
    </div>
  );
};
