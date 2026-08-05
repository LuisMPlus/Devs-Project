import { PhysicsSimulatorDef } from '../../types/simulator.types';
import { PhysicalObject, PhysicsVector } from '../../types/physics.types';

export interface RopeTensionConfig {
  m1: number; // Mass 1 (kg) - back block
  m2: number; // Mass 2 (kg) - front block
  appliedForce: number; // Force F pulling front block (N)
}

export interface RopeTensionState {
  x1: number;
  x2: number;
  v: number;
  a: number;
  tension: number;
}

export const ropeTensionSimulator: PhysicsSimulatorDef<RopeTensionConfig, RopeTensionState> = {
  id: 'rope-tension',
  topicId: 'dynamics',
  title: 'Tensión de Cuerdas',
  description: 'Dos masas unidas por una cuerda inextensible jaladas por una fuerza horizontal F en una superficie horizontal.',

  parameterSchemas: [
    {
      id: 'm1',
      label: 'Masa 1 (m₁ - Trasera)',
      unit: 'kg',
      controlType: 'slider',
      defaultValue: 10,
      min: 1,
      max: 50,
      step: 1,
    },
    {
      id: 'm2',
      label: 'Masa 2 (m₂ - Delantera)',
      unit: 'kg',
      controlType: 'slider',
      defaultValue: 15,
      min: 1,
      max: 50,
      step: 1,
    },
    {
      id: 'appliedForce',
      label: 'Fuerza de Tracción (F)',
      unit: 'N',
      controlType: 'slider',
      defaultValue: 100,
      min: 0,
      max: 300,
      step: 10,
    },
  ],

  getInitialState: (config) => {
    const totalMass = config.m1 + config.m2;
    const a = config.appliedForce / totalMass;
    const tension = config.m1 * a;
    return {
      x1: 0,
      x2: 10, // 10m distance including string length
      v: 0,
      a,
      tension,
    };
  },

  updateState: (t, _dt, _currentState, config) => {
    const totalMass = config.m1 + config.m2;
    const a = config.appliedForce / totalMass;
    const tension = config.m1 * a;
    const v = a * t;
    const x1 = 0.5 * a * t * t;
    const x2 = x1 + 10;

    return {
      x1,
      x2,
      v,
      a,
      tension,
    };
  },

  getRenderableObjects: (state, config) => [
    {
      id: 'block-m1',
      name: 'Masa m₁',
      shape: 'box',
      position: { x: state.x1, y: 0 },
      size: { x: 3, y: 2.5 },
      color: '#1d4ed8',
      mass: config.m1,
    },
    {
      id: 'connecting-rope',
      name: 'Cuerda de Conexión',
      shape: 'rope',
      position: { x: state.x1 + 1.5, y: 1.25 },
      size: { x: 7, y: 0.2 },
      color: '#eff6ff',
    },
    {
      id: 'block-m2',
      name: 'Masa m₂',
      shape: 'box',
      position: { x: state.x2, y: 0 },
      size: { x: 3.5, y: 2.8 },
      color: '#02ffff',
      mass: config.m2,
    },
  ],

  getVectors: (state, config) => [
    {
      id: 'pulling-force',
      origin: { x: state.x2 + 1.75, y: 1.4 },
      components: { x: config.appliedForce * 0.08, y: 0 },
      label: `F = ${config.appliedForce.toFixed(0)} N`,
      color: '#f97316',
      type: 'force',
    },
    {
      id: 'tension-on-m1',
      origin: { x: state.x1 + 1.5, y: 1.25 },
      components: { x: state.tension * 0.08, y: 0 },
      label: `T = ${state.tension.toFixed(1)} N`,
      color: '#42d7c7',
      type: 'tension',
    },
    {
      id: 'tension-on-m2',
      origin: { x: state.x2 - 1.75, y: 1.4 },
      components: { x: -state.tension * 0.08, y: 0 },
      label: `T = -${state.tension.toFixed(1)} N`,
      color: '#42d7c7',
      type: 'tension',
    },
  ],

  getMetrics: (state, config) => [
    { label: 'Tensión de la Cuerda (T)', value: state.tension.toFixed(2), unit: 'N', highlight: true },
    { label: 'Aceleración (a)', value: state.a.toFixed(2), unit: 'm/s²', highlight: true },
    { label: 'Velocidad (v)', value: state.v.toFixed(2), unit: 'm/s' },
    { label: 'Fuerza Total Aplicada', value: config.appliedForce.toFixed(0), unit: 'N' },
  ],

  getTrajectoryPoint: (state) => ({ x: state.x2, y: 0 }),
};
