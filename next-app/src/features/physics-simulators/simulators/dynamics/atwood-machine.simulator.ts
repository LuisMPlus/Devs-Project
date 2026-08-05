import { PhysicsSimulatorDef } from '../../types/simulator.types';
import { PhysicalObject, PhysicsVector } from '../../types/physics.types';

export interface AtwoodMachineConfig {
  m1: number; // Left mass (kg)
  m2: number; // Right mass (kg)
  gravity: number; // Gravity (m/s^2)
}

export interface AtwoodMachineState {
  y1: number;
  y2: number;
  v: number;
  a: number;
  tension: number;
  isBlocked: boolean;
}

export const atwoodMachineSimulator: PhysicsSimulatorDef<AtwoodMachineConfig, AtwoodMachineState> = {
  id: 'atwood-machine',
  topicId: 'dynamics',
  title: 'Máquina de Atwood',
  description: 'Dos masas m₁ y m₂ suspendidas de una polea ideal. Análisis de aceleración del sistema y tensión de la cuerda.',

  parameterSchemas: [
    {
      id: 'm1',
      label: 'Masa Izquierda (m₁)',
      unit: 'kg',
      controlType: 'slider',
      defaultValue: 5,
      min: 1,
      max: 30,
      step: 0.5,
    },
    {
      id: 'm2',
      label: 'Masa Derecha (m₂)',
      unit: 'kg',
      controlType: 'slider',
      defaultValue: 8,
      min: 1,
      max: 30,
      step: 0.5,
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
    const g = config.gravity;
    const m1 = config.m1;
    const m2 = config.m2;
    const a = (g * (m2 - m1)) / (m1 + m2);
    const tension = (2 * m1 * m2 * g) / (m1 + m2);

    return {
      y1: 8,
      y2: 8,
      v: 0,
      a,
      tension,
      isBlocked: false,
    };
  },

  updateState: (t, _dt, _currentState, config) => {
    const g = config.gravity;
    const m1 = config.m1;
    const m2 = config.m2;
    const a = (g * (m2 - m1)) / (m1 + m2);
    const tension = (2 * m1 * m2 * g) / (m1 + m2);

    const initialY = 8;
    const deltaY = 0.5 * a * t * t;

    let y1 = initialY + deltaY;
    let y2 = initialY - deltaY;
    let v = a * t;
    let isBlocked = false;

    // Check bounds (pulley at y=16, ground at y=0)
    if (y1 <= 0 || y2 <= 0 || y1 >= 15 || y2 >= 15) {
      isBlocked = true;
      v = 0;
      if (y1 <= 0) { y1 = 0; y2 = 16; }
      if (y2 <= 0) { y2 = 0; y1 = 16; }
    }

    return {
      y1,
      y2,
      v: isBlocked ? 0 : v,
      a: isBlocked ? 0 : a,
      tension,
      isBlocked,
    };
  },

  getRenderableObjects: (state, config) => [
    {
      id: 'pulley-wheel',
      name: 'Polea Principal',
      shape: 'pulley',
      position: { x: 0, y: 16 },
      size: { x: 4, y: 4 },
      color: '#1d4ed8',
    },
    {
      id: 'left-rope',
      name: 'Cuerda Izquierda',
      shape: 'rope',
      position: { x: -2, y: (state.y1 + 16) / 2 },
      size: { x: 0.15, y: Math.abs(16 - state.y1) },
      color: '#eff6ff',
    },
    {
      id: 'right-rope',
      name: 'Cuerda Derecha',
      shape: 'rope',
      position: { x: 2, y: (state.y2 + 16) / 2 },
      size: { x: 0.15, y: Math.abs(16 - state.y2) },
      color: '#eff6ff',
    },
    {
      id: 'mass-m1',
      name: 'Masa m₁',
      shape: 'box',
      position: { x: -2, y: state.y1 },
      size: { x: 2.2, y: 2.2 },
      color: '#02ffff',
      mass: config.m1,
    },
    {
      id: 'mass-m2',
      name: 'Masa m₂',
      shape: 'box',
      position: { x: 2, y: state.y2 },
      size: { x: 2.6, y: 2.6 },
      color: '#42d7c7',
      mass: config.m2,
    },
  ],

  getVectors: (state, config) => [
    {
      id: 'tension-m1',
      origin: { x: -2, y: state.y1 + 1.1 },
      components: { x: 0, y: state.tension * 0.1 },
      label: `T = ${state.tension.toFixed(1)} N`,
      color: '#42d7c7',
      type: 'tension',
    },
    {
      id: 'weight-m1',
      origin: { x: -2, y: state.y1 - 1.1 },
      components: { x: 0, y: -config.m1 * config.gravity * 0.1 },
      label: `P₁ = ${(config.m1 * config.gravity).toFixed(1)} N`,
      color: '#ef4444',
      type: 'force',
    },
    {
      id: 'tension-m2',
      origin: { x: 2, y: state.y2 + 1.3 },
      components: { x: 0, y: state.tension * 0.1 },
      label: `T = ${state.tension.toFixed(1)} N`,
      color: '#42d7c7',
      type: 'tension',
    },
    {
      id: 'weight-m2',
      origin: { x: 2, y: state.y2 - 1.3 },
      components: { x: 0, y: -config.m2 * config.gravity * 0.1 },
      label: `P₂ = ${(config.m2 * config.gravity).toFixed(1)} N`,
      color: '#ef4444',
      type: 'force',
    },
  ],

  getMetrics: (state, config) => [
    { label: 'Aceleración del Sistema (a)', value: state.a.toFixed(2), unit: 'm/s²', highlight: true },
    { label: 'Tensión en la Cuerda (T)', value: state.tension.toFixed(2), unit: 'N', highlight: true },
    { label: 'Altura m₁', value: state.y1.toFixed(2), unit: 'm' },
    { label: 'Altura m₂', value: state.y2.toFixed(2), unit: 'm' },
    { label: 'Velocidad (v)', value: Math.abs(state.v).toFixed(2), unit: 'm/s' },
  ],
};
