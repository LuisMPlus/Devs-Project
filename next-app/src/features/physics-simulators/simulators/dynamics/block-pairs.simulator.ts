import { PhysicsSimulatorDef } from '../../types/simulator.types';
import { PhysicalObject, PhysicsVector } from '../../types/physics.types';

export interface BlockPairsConfig {
  m1: number; // Mass 1 (kg)
  m2: number; // Mass 2 (kg)
  appliedForce: number; // Applied Force F (N)
}

export interface BlockPairsState {
  x1: number;
  x2: number;
  v: number;
  a: number;
  fContact: number;
}

export const blockPairsSimulator: PhysicsSimulatorDef<BlockPairsConfig, BlockPairsState> = {
  id: 'block-pairs',
  topicId: 'dynamics',
  title: 'Pares de Bloques (Acción y Reacción)',
  description: 'Dos bloques en contacto empujados por una fuerza horizontal F. Ilustración de la 3ª Ley de Newton (Acción y Reacción).',

  parameterSchemas: [
    {
      id: 'm1',
      label: 'Masa del Bloque 1 (m₁)',
      unit: 'kg',
      controlType: 'slider',
      defaultValue: 10,
      min: 1,
      max: 50,
      step: 1,
    },
    {
      id: 'm2',
      label: 'Masa del Bloque 2 (m₂)',
      unit: 'kg',
      controlType: 'slider',
      defaultValue: 5,
      min: 1,
      max: 50,
      step: 1,
    },
    {
      id: 'appliedForce',
      label: 'Fuerza Aplicada (F)',
      unit: 'N',
      controlType: 'slider',
      defaultValue: 60,
      min: 0,
      max: 200,
      step: 5,
    },
  ],

  getInitialState: (config) => {
    const totalMass = config.m1 + config.m2;
    const a = config.appliedForce / totalMass;
    const fContact = (config.m2 * config.appliedForce) / totalMass;
    return {
      x1: 0,
      x2: 4, // width of block 1
      v: 0,
      a,
      fContact,
    };
  },

  updateState: (t, _dt, _currentState, config) => {
    const totalMass = config.m1 + config.m2;
    const a = config.appliedForce / totalMass;
    const fContact = (config.m2 * config.appliedForce) / totalMass;
    const v = a * t;
    const x1 = 0.5 * a * t * t;
    const x2 = x1 + 4; // adjacent to block 1

    return {
      x1,
      x2,
      v,
      a,
      fContact,
    };
  },

  getRenderableObjects: (state, config) => {
    const w1 = 4;
    const h1 = 3;
    const w2 = 3;
    const h2 = 2.5;

    return [
      {
        id: 'block-1',
        name: 'Bloque 1 (m₁)',
        shape: 'box',
        position: { x: state.x1, y: 0 },
        size: { x: w1, y: h1 },
        color: '#1d4ed8',
        mass: config.m1,
      },
      {
        id: 'block-2',
        name: 'Bloque 2 (m₂)',
        shape: 'box',
        position: { x: state.x1 + w1 / 2 + w2 / 2, y: 0 },
        size: { x: w2, y: h2 },
        color: '#02ffff',
        mass: config.m2,
      },
    ];
  },

  getVectors: (state, config) => {
    const w1 = 4;
    const contactX = state.x1 + w1 / 2;

    return [
      {
        id: 'applied-force',
        origin: { x: state.x1 - 2, y: 1.5 },
        components: { x: config.appliedForce * 0.1, y: 0 },
        label: `F = ${config.appliedForce.toFixed(0)} N`,
        color: '#f97316',
        type: 'force',
      },
      {
        id: 'action-force',
        origin: { x: contactX, y: 1.5 },
        components: { x: state.fContact * 0.1, y: 0 },
        label: `F₁₂ = ${state.fContact.toFixed(1)} N`,
        color: '#42d7c7',
        type: 'force',
      },
      {
        id: 'reaction-force',
        origin: { x: contactX, y: 0.8 },
        components: { x: -state.fContact * 0.1, y: 0 },
        label: `F₂₁ = -${state.fContact.toFixed(1)} N`,
        color: '#ef4444',
        type: 'force',
      },
    ];
  },

  getMetrics: (state, config) => [
    { label: 'Aceleración del Sistema (a)', value: state.a.toFixed(2), unit: 'm/s²', highlight: true },
    { label: 'Fuerza de Contacto (F₁₂ = F₂₁)', value: state.fContact.toFixed(2), unit: 'N', highlight: true },
    { label: 'Velocidad (v)', value: state.v.toFixed(2), unit: 'm/s' },
    { label: 'Masa Total (m₁ + m₂)', value: (config.m1 + config.m2).toFixed(1), unit: 'kg' },
  ],

  getTrajectoryPoint: (state) => ({ x: state.x1, y: 0 }),
};
