'use client';

import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { CoordinateTransformer } from '../engine/CoordinateTransformer';
import { PhysicalObject, PhysicsVector, SimulationMode, TrajectoryPoint, Vector2D } from '../types/physics.types';

export interface CanvasRendererRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

interface CanvasRendererProps {
  objects: PhysicalObject[];
  vectors: PhysicsVector[];
  mode: SimulationMode;
  showGrid?: boolean;
  showVectors?: boolean;
  showTrajectory?: boolean;
  trajectoryPoints?: TrajectoryPoint[];
  onObjectDrag?: (objectId: string, newWorldPos: Vector2D) => void;
  defaultWorldBounds?: { minX: number; maxX: number; minY: number; maxY: number };
}

export const CanvasRenderer = forwardRef<CanvasRendererRef, CanvasRendererProps>(({
  objects,
  vectors,
  mode,
  showGrid = true,
  showVectors = true,
  showTrajectory = true,
  trajectoryPoints = [],
  onObjectDrag,
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transformerRef = useRef<CoordinateTransformer>(new CoordinateTransformer(800, 600, 30));

  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [currentScale, setCurrentScale] = useState<number>(30);

  const dragStateRef = useRef<{
    type: 'PAN' | 'OBJECT' | null;
    lastScreen: Vector2D;
    objectId?: string;
  }>({
    type: null,
    lastScreen: { x: 0, y: 0 },
  });

  // Global mouseup event listener to ensure dragging stops even outside canvas bounds
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragStateRef.current.type !== null) {
        dragStateRef.current = { type: null, lastScreen: { x: 0, y: 0 } };
        setIsPanning(false);
        setDraggedObjectId(null);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Expose imperative zoom handlers
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      transformerRef.current.zoomCenter(1.25);
      setCurrentScale(transformerRef.current.getScale());
    },
    zoomOut: () => {
      transformerRef.current.zoomCenter(0.8);
      setCurrentScale(transformerRef.current.getScale());
    },
    resetZoom: () => {
      transformerRef.current.setScale(30);
      transformerRef.current.setOrigin({ x: 0, y: 0 });
      setCurrentScale(30);
    },
  }));

  // Resize canvas according to container dimensions
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      transformerRef.current.updateDimensions(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drawing loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const transformer = transformerRef.current;

    // Clear canvas background (theme dark #0c154c)
    ctx.fillStyle = '#0c154c';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Grid & Cartesian Axes
    if (showGrid) {
      drawGridAndAxes(ctx, width, height, transformer);
    }

    // 2. Draw Trajectory Path
    if (showTrajectory && trajectoryPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(2, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      trajectoryPoints.forEach((pt, idx) => {
        const screen = transformer.worldToScreen({ x: pt.x, y: pt.y });
        if (idx === 0) {
          ctx.moveTo(screen.x, screen.y);
        } else {
          ctx.lineTo(screen.x, screen.y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash
    }

    // 3. Draw Physical Objects
    objects.forEach((obj) => {
      drawObject(ctx, obj, transformer, Boolean(mode === 'EDIT' && obj.isDraggable));
    });

    // 4. Draw Physics Vectors
    if (showVectors) {
      vectors.forEach((vec) => {
        drawVector(ctx, vec, transformer);
      });
    }
  }, [objects, vectors, mode, showGrid, showVectors, showTrajectory, trajectoryPoints, currentScale]);

  useEffect(() => {
    render();
  }, [render]);

  // Wheel event: ONLY Zoom when Ctrl key is pressed
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!e.ctrlKey) return; // Do not zoom unless Ctrl key is held
    e.preventDefault();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseScreen = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    transformerRef.current.zoomAtScreenPos(mouseScreen, zoomFactor);
    setCurrentScale(transformerRef.current.getScale());
  };

  // Mouse Handlers for Drag-and-Drop & Panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseScreen = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const mouseWorld = transformerRef.current.screenToWorld(mouseScreen);

    // Right click (button 2) or Middle click (button 1) -> Pan coordinate system
    if (e.button === 1 || e.button === 2) {
      e.preventDefault();
      dragStateRef.current = { type: 'PAN', lastScreen: mouseScreen };
      setIsPanning(true);
      return;
    }

    // Left click (button 0): Find clicked object in EDIT mode
    if (e.button === 0) {
      if (mode === 'EDIT' && onObjectDrag) {
        const clickedObj = objects.find((obj) => {
          if (!obj.isDraggable) return false;
          const dx = Math.abs(mouseWorld.x - obj.position.x);
          const dy = Math.abs(mouseWorld.y - obj.position.y);
          const radiusX = obj.size.x / 2;
          const radiusY = obj.size.y / 2;
          return dx <= radiusX * 1.5 && dy <= radiusY * 1.5;
        });

        if (clickedObj) {
          dragStateRef.current = {
            type: 'OBJECT',
            lastScreen: mouseScreen,
            objectId: clickedObj.id,
          };
          setDraggedObjectId(clickedObj.id);
          return;
        }
      }

      // Left click on background -> Pan coordinate system
      dragStateRef.current = { type: 'PAN', lastScreen: mouseScreen };
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || !dragState.type || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseScreen = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    // Panning canvas background
    if (dragState.type === 'PAN') {
      const dxScreen = mouseScreen.x - dragState.lastScreen.x;
      const dyScreen = mouseScreen.y - dragState.lastScreen.y;

      const scale = transformerRef.current.getScale();
      const currentOrigin = transformerRef.current.getOrigin();

      transformerRef.current.setOrigin({
        x: currentOrigin.x - dxScreen / scale,
        y: currentOrigin.y + dyScreen / scale,
      });

      dragState.lastScreen = mouseScreen;
      setCurrentScale(scale);
      return;
    }

    // Dragging physical object
    if (dragState.type === 'OBJECT' && dragState.objectId && mode === 'EDIT' && onObjectDrag) {
      const mouseWorld = transformerRef.current.screenToWorld(mouseScreen);
      onObjectDrag(dragState.objectId, mouseWorld);
      dragState.lastScreen = mouseScreen;
    }
  };

  const handleMouseUp = () => {
    dragStateRef.current = { type: null, lastScreen: { x: 0, y: 0 } };
    setIsPanning(false);
    setDraggedObjectId(null);
  };


  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[450px] bg-[#0c154c] rounded-xl overflow-hidden shadow-2xl border border-[#1d4ed8]/40 select-none">
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        className={`w-full h-full block ${
          isPanning
            ? 'cursor-grabbing'
            : mode === 'EDIT'
            ? 'cursor-grab'
            : 'cursor-crosshair'
        }`}
      />

      {/* Scale Badge Overlay */}
      <div className="absolute bottom-3 left-3 bg-black/60 border border-[#1d4ed8]/40 px-2.5 py-1 rounded-md text-[11px] font-mono text-[#02ffff] pointer-events-none backdrop-blur-sm shadow">
        🔍 Escala: {Math.round(currentScale)} px/m
      </div>
    </div>
  );
});

CanvasRenderer.displayName = 'CanvasRenderer';

// Helper Drawing Functions
function drawGridAndAxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  transformer: CoordinateTransformer
) {
  const originScreen = transformer.worldToScreen({ x: 0, y: 0 });
  const scale = transformer.getScale();
  const stepMeters = scale < 15 ? 10 : scale < 35 ? 5 : scale > 150 ? 0.2 : scale > 80 ? 0.5 : 1;

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(29, 78, 216, 0.25)';
  ctx.fillStyle = 'rgba(239, 246, 255, 0.4)';
  ctx.font = '10px Montserrat, sans-serif';

  // Grid lines
  const minWorld = transformer.screenToWorld({ x: 0, y: height });
  const maxWorld = transformer.screenToWorld({ x: width, y: 0 });

  const startX = Math.floor(minWorld.x / stepMeters) * stepMeters;
  const endX = Math.ceil(maxWorld.x / stepMeters) * stepMeters;

  for (let x = startX; x <= endX; x += stepMeters) {
    const screenX = transformer.worldToScreen({ x, y: 0 }).x;
    ctx.beginPath();
    ctx.moveTo(screenX, 0);
    ctx.lineTo(screenX, height);
    ctx.stroke();

    if (Math.abs(screenX - originScreen.x) > 20) {
      const labelVal = Number.isInteger(x) ? `${x}m` : `${x.toFixed(1)}m`;
      ctx.fillText(labelVal, screenX + 2, Math.max(15, Math.min(height - 10, originScreen.y + 14)));
    }
  }

  const startY = Math.floor(minWorld.y / stepMeters) * stepMeters;
  const endY = Math.ceil(maxWorld.y / stepMeters) * stepMeters;

  for (let y = startY; y <= endY; y += stepMeters) {
    const screenY = transformer.worldToScreen({ x: 0, y }).y;
    ctx.beginPath();
    ctx.moveTo(0, screenY);
    ctx.lineTo(width, screenY);
    ctx.stroke();

    if (Math.abs(screenY - originScreen.y) > 20) {
      const labelVal = Number.isInteger(y) ? `${y}m` : `${y.toFixed(1)}m`;
      ctx.fillText(labelVal, Math.max(5, Math.min(width - 40, originScreen.x + 4)), screenY - 2);
    }
  }

  // Main Axes (X & Y)
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(66, 215, 199, 0.6)';

  // X Axis
  ctx.beginPath();
  ctx.moveTo(0, originScreen.y);
  ctx.lineTo(width, originScreen.y);
  ctx.stroke();

  // Y Axis
  ctx.beginPath();
  ctx.moveTo(originScreen.x, 0);
  ctx.lineTo(originScreen.x, height);
  ctx.stroke();

  // Origin point badge
  ctx.fillStyle = '#02ffff';
  ctx.font = 'bold 11px Montserrat, sans-serif';
  ctx.fillText('(0,0)', originScreen.x + 5, originScreen.y - 5);
}

function drawObject(
  ctx: CanvasRenderingContext2D,
  obj: PhysicalObject,
  transformer: CoordinateTransformer,
  isEditable: boolean
) {
  const centerScreen = transformer.worldToScreen(obj.position);
  const widthPx = transformer.worldToScreenDist(obj.size.x);
  const heightPx = transformer.worldToScreenDist(obj.size.y);

  ctx.save();
  ctx.translate(centerScreen.x, centerScreen.y);
  if (obj.rotation) {
    ctx.rotate(-obj.rotation);
  }

  ctx.fillStyle = obj.color || '#02ffff';
  ctx.strokeStyle = isEditable ? '#02ffff' : 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = isEditable ? 2 : 1;

  switch (obj.shape) {
    case 'box':
      ctx.fillRect(-widthPx / 2, -heightPx / 2, widthPx, heightPx);
      ctx.strokeRect(-widthPx / 2, -heightPx / 2, widthPx, heightPx);
      break;

    case 'sphere':
      ctx.beginPath();
      ctx.arc(0, 0, widthPx / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;

    case 'inclined_plane':
      ctx.beginPath();
      ctx.moveTo(-widthPx / 2, heightPx / 2);
      ctx.lineTo(widthPx / 2, heightPx / 2);
      ctx.lineTo(widthPx / 2, -heightPx / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'pulley':
      ctx.beginPath();
      ctx.arc(0, 0, widthPx / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'rope':
      ctx.strokeStyle = obj.color || '#eff6ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-widthPx / 2, 0);
      ctx.lineTo(widthPx / 2, 0);
      ctx.stroke();
      break;

    case 'cart':
      ctx.fillRect(-widthPx / 2, -heightPx / 2, widthPx, heightPx);
      ctx.strokeRect(-widthPx / 2, -heightPx / 2, widthPx, heightPx);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-widthPx / 3, heightPx / 2, heightPx / 5, 0, Math.PI * 2);
      ctx.arc(widthPx / 3, heightPx / 2, heightPx / 5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'point':
    default:
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
}

function drawVector(
  ctx: CanvasRenderingContext2D,
  vec: PhysicsVector,
  transformer: CoordinateTransformer
) {
  const originScreen = transformer.worldToScreen(vec.origin);

  const targetWorld = {
    x: vec.origin.x + vec.components.x,
    y: vec.origin.y + vec.components.y,
  };
  const targetScreen = transformer.worldToScreen(targetWorld);

  const dx = targetScreen.x - originScreen.x;
  const dy = targetScreen.y - originScreen.y;
  const length = Math.hypot(dx, dy);

  if (length < 2) return;

  ctx.save();
  ctx.strokeStyle = vec.color || '#02ffff';
  ctx.fillStyle = vec.color || '#02ffff';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(originScreen.x, originScreen.y);
  ctx.lineTo(targetScreen.x, targetScreen.y);
  ctx.stroke();

  const angle = Math.atan2(dy, dx);
  const headLen = 10;
  ctx.beginPath();
  ctx.moveTo(targetScreen.x, targetScreen.y);
  ctx.lineTo(
    targetScreen.x - headLen * Math.cos(angle - Math.PI / 6),
    targetScreen.y - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    targetScreen.x - headLen * Math.cos(angle + Math.PI / 6),
    targetScreen.y - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  if (vec.label) {
    ctx.font = '11px Montserrat, sans-serif';
    ctx.fillStyle = 'rgba(12, 21, 76, 0.85)';
    ctx.strokeStyle = vec.color;
    ctx.lineWidth = 1;

    const labelX = targetScreen.x + 8;
    const labelY = targetScreen.y - 8;
    const textWidth = ctx.measureText(vec.label).width;

    ctx.fillRect(labelX - 4, labelY - 12, textWidth + 8, 16);
    ctx.strokeRect(labelX - 4, labelY - 12, textWidth + 8, 16);

    ctx.fillStyle = '#eff6ff';
    ctx.fillText(vec.label, labelX, labelY);
  }

  ctx.restore();
}
