import { PhysicsSimulatorDef } from '../../types/simulator.types';
import { PhysicalObject, PhysicsVector, SimulationMetrics } from '../../types/physics.types';

export interface MRUVConfig {
  x0: number; // Initial position (m)
  v0: number; // Initial velocity (m/s)
  acceleration: number; // Acceleration (m/s^2)
  boxColor: string;
}

export interface MRUVState {
  x: number;
  v: number;
  a: number;
}

export const mruvSimulator: PhysicsSimulatorDef<MRUVConfig, MRUVState> = {
  id: 'mruv',
  topicId: 'kinematics',
  title: 'Movimiento Rectilíneo Uniformemente Variado (MRUV)',
  description: 'Simulación de un cuerpo en movimiento rectilíneo sometido a una aceleración constante.',

  parameterSchemas: [
    {
      id: 'x0',
      label: 'Posición Inicial (x₀)',
      unit: 'm',
      controlType: 'slider',
      defaultValue: 0,
      min: -20,
      max: 50,
      step: 1,
    },
    {
      id: 'v0',
      label: 'Velocidad Inicial (v₀)',
      unit: 'm/s',
      controlType: 'slider',
      defaultValue: 0,
      min: -20,
      max: 30,
      step: 1,
    },
    {
      id: 'acceleration',
      label: 'Aceleración (a)',
      unit: 'm/s²',
      controlType: 'slider',
      defaultValue: 2,
      min: -10,
      max: 15,
      step: 0.5,
    },
    {
      id: 'boxColor',
      label: 'Color del Móvil',
      controlType: 'select',
      defaultValue: '#42d7c7',
      options: [
        { label: 'Turquesa (#42d7c7)', value: '#42d7c7' },
        { label: 'Cian Neón (#02ffff)', value: '#02ffff' },
        { label: 'Azul (#1d4ed8)', value: '#1d4ed8' },
        { label: 'Naranja (#f97316)', value: '#f97316' },
      ],
    },
  ],

  getInitialState: (config) => ({
    x: config.x0,
    v: config.v0,
    a: config.acceleration,
  }),

  updateState: (t, _dt, _currentState, config) => {
    const x = config.x0 + config.v0 * t + 0.5 * config.acceleration * t * t;
    const v = config.v0 + config.acceleration * t;
    return {
      x,
      v,
      a: config.acceleration,
    };
  },

  getRenderableObjects: (state, config) => [
    {
      id: 'mruv-cart',
      name: 'Móvil MRUV',
      shape: 'box',
      position: { x: state.x, y: 0 },
      size: { x: 3, y: 1.8 },
      color: config.boxColor || '#42d7c7',
      velocity: { x: state.v, y: 0 },
      acceleration: { x: state.a, y: 0 },
      isDraggable: true,
    },
  ],

  getVectors: (state) => {
    const vectors: PhysicsVector[] = [];
    if (Math.abs(state.v) > 0.05) {
      vectors.push({
        id: 'v-vector',
        origin: { x: state.x, y: 1.2 },
        components: { x: state.v, y: 0 },
        label: `v = ${state.v.toFixed(1)} m/s`,
        color: '#02ffff',
        type: 'velocity',
      });
    }
    if (Math.abs(state.a) > 0.05) {
      vectors.push({
        id: 'a-vector',
        origin: { x: state.x, y: 2.2 },
        components: { x: state.a * 2, y: 0 }, // Scaled for display visibility
        label: `a = ${state.a.toFixed(1)} m/s²`,
        color: '#f97316',
        type: 'acceleration',
      });
    }
    return vectors;
  },

  getMetrics: (state, config) => [
    { label: 'Posición (x)', value: state.x.toFixed(2), unit: 'm', highlight: true },
    { label: 'Velocidad (v)', value: state.v.toFixed(2), unit: 'm/s', highlight: true },
    { label: 'Aceleración (a)', value: state.a.toFixed(2), unit: 'm/s²' },
    { label: 'Posición Inicial (x₀)', value: config.x0.toFixed(1), unit: 'm' },
    { label: 'Velocidad Inicial (v₀)', value: config.v0.toFixed(1), unit: 'm/s' },
  ],

  getTrajectoryPoint: (state) => ({ x: state.x, y: 0 }),

  handleObjectDrag: (_objectId, newPos) => ({
    updatedConfig: {
      x0: Math.round(newPos.x),
    },
  }),
};
