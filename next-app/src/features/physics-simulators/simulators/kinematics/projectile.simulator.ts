import { PhysicsSimulatorDef } from '../../types/simulator.types';
import { PhysicalObject, PhysicsVector } from '../../types/physics.types';

export interface ProjectileConfig {
  x0: number;
  y0: number;
  v0: number; // Initial speed magnitude (m/s)
  angleDeg: number; // Launch angle in degrees (0 - 90)
  gravity: number; // Gravity (m/s^2)
}

export interface ProjectileState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  maxHeightReached: number;
  totalRange: number;
}

export const projectileSimulator: PhysicsSimulatorDef<ProjectileConfig, ProjectileState> = {
  id: 'projectile',
  topicId: 'kinematics',
  title: 'Tiro Oblicuo (Proyectil)',
  description: 'Movimiento parabólico en 2 dimensiones bajo la influencia de la gravedad constante.',

  parameterSchemas: [
    {
      id: 'x0',
      label: 'Posición Inicial X (x₀)',
      unit: 'm',
      controlType: 'slider',
      defaultValue: 0,
      min: 0,
      max: 50,
      step: 1,
    },
    {
      id: 'y0',
      label: 'Altura Inicial Y (y₀)',
      unit: 'm',
      controlType: 'slider',
      defaultValue: 0,
      min: 0,
      max: 30,
      step: 1,
    },
    {
      id: 'v0',
      label: 'Velocidad Inicial (v₀)',
      unit: 'm/s',
      controlType: 'slider',
      defaultValue: 25,
      min: 5,
      max: 60,
      step: 1,
    },
    {
      id: 'angleDeg',
      label: 'Ángulo de Lanzamiento (θ)',
      unit: '°',
      controlType: 'slider',
      defaultValue: 45,
      min: 5,
      max: 85,
      step: 1,
    },
    {
      id: 'gravity',
      label: 'Gravedad (g)',
      unit: 'm/s²',
      controlType: 'slider',
      defaultValue: 9.8,
      min: 1,
      max: 25,
      step: 0.1,
    },
  ],

  getInitialState: (config) => {
    const rad = (config.angleDeg * Math.PI) / 180;
    const v0x = config.v0 * Math.cos(rad);
    const v0y = config.v0 * Math.sin(rad);
    const hMax = config.y0 + (v0y * v0y) / (2 * config.gravity);
    const tFlight = (v0y + Math.sqrt(v0y * v0y + 2 * config.gravity * config.y0)) / config.gravity;
    const range = config.x0 + v0x * tFlight;

    return {
      x: config.x0,
      y: config.y0,
      vx: v0x,
      vy: v0y,
      isGrounded: false,
      maxHeightReached: hMax,
      totalRange: range,
    };
  },

  updateState: (t, _dt, _currentState, config) => {
    const rad = (config.angleDeg * Math.PI) / 180;
    const v0x = config.v0 * Math.cos(rad);
    const v0y = config.v0 * Math.sin(rad);
    const g = config.gravity;

    let y = config.y0 + v0y * t - 0.5 * g * t * t;
    let x = config.x0 + v0x * t;
    let vy = v0y - g * t;
    let isGrounded = false;

    if (y <= 0) {
      y = 0;
      isGrounded = true;
      vy = 0;
      // Stop moving forward once landed
      const tFlight = (v0y + Math.sqrt(v0y * v0y + 2 * g * config.y0)) / g;
      x = config.x0 + v0x * tFlight;
    }

    const hMax = config.y0 + (v0y * v0y) / (2 * g);
    const tFlight = (v0y + Math.sqrt(v0y * v0y + 2 * g * config.y0)) / g;
    const range = config.x0 + v0x * tFlight;

    return {
      x,
      y,
      vx: isGrounded ? 0 : v0x,
      vy,
      isGrounded,
      maxHeightReached: hMax,
      totalRange: range,
    };
  },

  getRenderableObjects: (state, config) => {
    const objects: PhysicalObject[] = [
      {
        id: 'cannon-base',
        name: 'Cañón / Cañón Base',
        shape: 'box',
        position: { x: config.x0, y: config.y0 },
        size: { x: 2, y: 1.5 },
        color: '#1d4ed8',
        rotation: (config.angleDeg * Math.PI) / 180,
      },
      {
        id: 'projectile-ball',
        name: 'Proyectil',
        shape: 'sphere',
        position: { x: state.x, y: state.y },
        size: { x: 1.2, y: 1.2 },
        color: '#02ffff',
        velocity: { x: state.vx, y: state.vy },
        acceleration: { x: 0, y: -config.gravity },
        isDraggable: true,
      },
    ];
    return objects;
  },

  getVectors: (state, config) => {
    if (state.isGrounded) return [];
    return [
      {
        id: 'v-vector',
        origin: { x: state.x, y: state.y },
        components: { x: state.vx * 0.5, y: state.vy * 0.5 },
        label: `v = ${Math.hypot(state.vx, state.vy).toFixed(1)} m/s`,
        color: '#02ffff',
        type: 'velocity',
      },
      {
        id: 'g-vector',
        origin: { x: state.x, y: state.y },
        components: { x: 0, y: -config.gravity * 0.8 },
        label: `g = ${config.gravity.toFixed(1)} m/s²`,
        color: '#ef4444',
        type: 'acceleration',
      },
    ];
  },

  getMetrics: (state, config) => [
    { label: 'Posición X', value: state.x.toFixed(2), unit: 'm', highlight: true },
    { label: 'Altura Y', value: state.y.toFixed(2), unit: 'm', highlight: true },
    { label: 'Velocidad Total (v)', value: Math.hypot(state.vx, state.vy).toFixed(2), unit: 'm/s' },
    { label: 'Altura Máxima (H)', value: state.maxHeightReached.toFixed(2), unit: 'm' },
    { label: 'Alcance Total (R)', value: state.totalRange.toFixed(2), unit: 'm' },
    { label: 'Ángulo (θ)', value: `${config.angleDeg}°` },
  ],

  getTrajectoryPoint: (state) => ({ x: state.x, y: state.y }),

  handleObjectDrag: (_objectId, newPos) => ({
    updatedConfig: {
      x0: Math.max(0, Math.round(newPos.x)),
      y0: Math.max(0, Math.round(newPos.y)),
    },
  }),
};
