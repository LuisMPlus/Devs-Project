import { PhysicsSimulatorDef } from '../../types/simulator.types';
import { PhysicalObject, PhysicsVector, SimulationMetrics, Vector2D } from '../../types/physics.types';

export interface MRUConfig {
  x0: number; // Initial position (m)
  velocity: number; // Velocity (m/s)
  boxColor: string;
}

export interface MRUState {
  x: number;
  v: number;
  a: number;
}

export const mruSimulator: PhysicsSimulatorDef<MRUConfig, MRUState> = {
  id: 'mru',
  topicId: 'kinematics',
  title: 'Movimiento Rectilíneo Uniforme (MRU)',
  description: 'Simulación de un móvil moviéndose a velocidad constante en una trayectoria rectilínea sin aceleración.',
  
  defaultWorldBounds: { minX: -10, maxX: 100, minY: -5, maxY: 10 },

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
      id: 'velocity',
      label: 'Velocidad (v)',
      unit: 'm/s',
      controlType: 'slider',
      defaultValue: 10,
      min: -30,
      max: 50,
      step: 1,
    },
    {
      id: 'boxColor',
      label: 'Color del Móvil',
      controlType: 'select',
      defaultValue: '#02ffff',
      options: [
        { label: 'Cian Neón (#02ffff)', value: '#02ffff' },
        { label: 'Azul Eléctrico (#1d4ed8)', value: '#1d4ed8' },
        { label: 'Turquesa (#42d7c7)', value: '#42d7c7' },
        { label: 'Amarillo Sol (#facc15)', value: '#facc15' },
      ],
    },
  ],

  getInitialState: (config) => ({
    x: config.x0,
    v: config.velocity,
    a: 0,
  }),

  updateState: (t, _dt, _currentState, config) => {
    const x = config.x0 + config.velocity * t;
    return {
      x,
      v: config.velocity,
      a: 0,
    };
  },

  getRenderableObjects: (state, config) => {
    const mobileObject: PhysicalObject = {
      id: 'mru-cart',
      name: 'Móvil',
      shape: 'box',
      position: { x: state.x, y: 0 },
      size: { x: 3, y: 1.8 },
      color: config.boxColor || '#02ffff',
      velocity: { x: state.v, y: 0 },
      acceleration: { x: 0, y: 0 },
      isDraggable: true,
    };
    return [mobileObject];
  },

  getVectors: (state) => {
    const vectors: PhysicsVector[] = [];
    if (Math.abs(state.v) > 0.01) {
      vectors.push({
        id: 'v-vector',
        origin: { x: state.x, y: 1.2 },
        components: { x: state.v, y: 0 },
        label: `v = ${state.v.toFixed(1)} m/s`,
        color: '#02ffff',
        type: 'velocity',
      });
    }
    return vectors;
  },

  getMetrics: (state, config) => [
    { label: 'Tiempo (t)', value: '0.00', unit: 's' },
    { label: 'Posición (x)', value: state.x.toFixed(2), unit: 'm', highlight: true },
    { label: 'Velocidad (v)', value: state.v.toFixed(2), unit: 'm/s' },
    { label: 'Aceleración (a)', value: '0.00', unit: 'm/s²' },
    { label: 'Posición Inicial (x₀)', value: config.x0.toFixed(1), unit: 'm' },
  ],

  getTrajectoryPoint: (state) => ({ x: state.x, y: 0 }),

  handleObjectDrag: (_objectId, newPos, config) => ({
    updatedConfig: {
      x0: Math.round(newPos.x),
    },
  }),
};
