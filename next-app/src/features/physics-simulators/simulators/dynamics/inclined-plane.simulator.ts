import { PhysicsSimulatorDef } from '../../types/simulator.types';
import { PhysicalObject, PhysicsVector } from '../../types/physics.types';

export interface InclinedPlaneConfig {
  angleDeg: number; // Ramp incline angle (deg)
  mass: number; // Mass m (kg)
  frictionCoeff: number; // Friction coefficient mu
  gravity: number; // Gravity g (m/s^2)
}

export interface InclinedPlaneState {
  distAlongRamp: number; // Distance traveled down ramp (m)
  x: number; // World x
  y: number; // World y
  v: number;
  a: number;
  fParallel: number;
  fNormal: number;
  fFriction: number;
}

export const inclinedPlaneSimulator: PhysicsSimulatorDef<InclinedPlaneConfig, InclinedPlaneState> = {
  id: 'inclined-plane',
  topicId: 'dynamics',
  title: 'Movimiento sobre Plano Inclinado',
  description: 'Desplazamiento de un bloque sobre una rampa con ángulo configurable, fuerza normal, gravedad y rozamiento.',

  parameterSchemas: [
    {
      id: 'angleDeg',
      label: 'Ángulo de Inclinación (θ)',
      unit: '°',
      controlType: 'slider',
      defaultValue: 30,
      min: 5,
      max: 75,
      step: 1,
    },
    {
      id: 'mass',
      label: 'Masa del Bloque (m)',
      unit: 'kg',
      controlType: 'slider',
      defaultValue: 5,
      min: 1,
      max: 30,
      step: 1,
    },
    {
      id: 'frictionCoeff',
      label: 'Coeficiente de Rozamiento (μ)',
      controlType: 'slider',
      defaultValue: 0.15,
      min: 0,
      max: 0.8,
      step: 0.05,
    },
    {
      id: 'gravity',
      label: 'Gravedad (g)',
      unit: 'm/s²',
      controlType: 'slider',
      defaultValue: 9.8,
      min: 1,
      max: 20,
      step: 0.1,
    },
  ],

  getInitialState: (config) => {
    const rad = (config.angleDeg * Math.PI) / 180;
    const g = config.gravity;
    const m = config.mass;
    const fParallel = m * g * Math.sin(rad);
    const fNormal = m * g * Math.cos(rad);
    const fFrictionMax = config.frictionCoeff * fNormal;

    let a = 0;
    let fFriction = fParallel;
    if (fParallel > fFrictionMax) {
      fFriction = fFrictionMax;
      a = (fParallel - fFriction) / m;
    }

    const rampLength = 30;
    const startDist = 5;
    const startX = (rampLength - startDist) * Math.cos(rad);
    const startY = (rampLength - startDist) * Math.sin(rad);

    return {
      distAlongRamp: startDist,
      x: startX,
      y: startY,
      v: 0,
      a,
      fParallel,
      fNormal,
      fFriction,
    };
  },

  updateState: (t, _dt, _currentState, config) => {
    const rad = (config.angleDeg * Math.PI) / 180;
    const g = config.gravity;
    const m = config.mass;
    const fParallel = m * g * Math.sin(rad);
    const fNormal = m * g * Math.cos(rad);
    const fFrictionMax = config.frictionCoeff * fNormal;

    let a = 0;
    let fFriction = fParallel;
    if (fParallel > fFrictionMax) {
      fFriction = fFrictionMax;
      a = (fParallel - fFriction) / m;
    }

    const v = a * t;
    const distTraveled = 0.5 * a * t * t;
    const startDist = 5;
    const currentDistFromTop = startDist + distTraveled;

    const rampLength = 30;
    const dFromBottom = Math.max(0, rampLength - currentDistFromTop);

    const x = dFromBottom * Math.cos(rad);
    const y = dFromBottom * Math.sin(rad);

    return {
      distAlongRamp: currentDistFromTop,
      x,
      y,
      v: dFromBottom === 0 ? 0 : v,
      a: dFromBottom === 0 ? 0 : a,
      fParallel,
      fNormal,
      fFriction,
    };
  },

  getRenderableObjects: (state, config) => {
    const rad = (config.angleDeg * Math.PI) / 180;
    return [
      {
        id: 'ramp-base',
        name: 'Plano Inclinado',
        shape: 'inclined_plane',
        position: { x: 0, y: 0 },
        size: { x: 30, y: 30 * Math.tan(rad) },
        color: '#1d4ed8',
        rotation: rad,
      },
      {
        id: 'ramp-block',
        name: 'Bloque',
        shape: 'box',
        position: { x: state.x, y: state.y + 1 },
        size: { x: 2.5, y: 2 },
        color: '#02ffff',
        rotation: rad,
        isDraggable: true,
      },
    ];
  },

  getVectors: (state, config) => {
    const rad = (config.angleDeg * Math.PI) / 180;
    // Normal vector perpendicular to ramp
    const nx = -Math.sin(rad) * (state.fNormal * 0.1);
    const ny = Math.cos(rad) * (state.fNormal * 0.1);

    // Friction vector up the ramp
    const fx = Math.cos(rad) * (state.fFriction * 0.1);
    const fy = Math.sin(rad) * (state.fFriction * 0.1);

    // Gravity component down the ramp
    const px = -Math.cos(rad) * (state.fParallel * 0.1);
    const py = -Math.sin(rad) * (state.fParallel * 0.1);

    return [
      {
        id: 'normal-vector',
        origin: { x: state.x, y: state.y + 1 },
        components: { x: nx, y: ny },
        label: `N = ${state.fNormal.toFixed(1)} N`,
        color: '#02ffff',
        type: 'force',
      },
      {
        id: 'parallel-gravity',
        origin: { x: state.x, y: state.y + 1 },
        components: { x: px, y: py },
        label: `P_∥ = ${state.fParallel.toFixed(1)} N`,
        color: '#f97316',
        type: 'force',
      },
      {
        id: 'friction-vector',
        origin: { x: state.x, y: state.y + 1 },
        components: { x: fx, y: fy },
        label: `f_r = ${state.fFriction.toFixed(1)} N`,
        color: '#ef4444',
        type: 'force',
      },
    ];
  },

  getMetrics: (state, config) => [
    { label: 'Aceleración (a)', value: state.a.toFixed(2), unit: 'm/s²', highlight: true },
    { label: 'Fuerza Normal (N)', value: state.fNormal.toFixed(1), unit: 'N' },
    { label: 'Componente Tangencial (P_∥)', value: state.fParallel.toFixed(1), unit: 'N', highlight: true },
    { label: 'Fuerza de Rozamiento (f_r)', value: state.fFriction.toFixed(1), unit: 'N' },
    { label: 'Velocidad (v)', value: state.v.toFixed(2), unit: 'm/s' },
  ],

  getTrajectoryPoint: (state) => ({ x: state.x, y: state.y }),
};
