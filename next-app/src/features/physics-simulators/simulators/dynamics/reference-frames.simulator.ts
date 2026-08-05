import { PhysicsSimulatorDef } from '../../types/simulator.types';
import { PhysicalObject, PhysicsVector } from '../../types/physics.types';

export interface ReferenceFramesConfig {
  cartAccel: number; // Horizontal acceleration of cart (m/s^2)
  bobMass: number; // Pendulum bob mass (kg)
  stringLength: number; // Pendulum string length (m)
  gravity: number; // Gravity (m/s^2)
}

export interface ReferenceFramesState {
  cartX: number;
  cartV: number;
  tiltAngleRad: number;
  fictitiousForce: number;
  tension: number;
}

export const referenceFramesSimulator: PhysicsSimulatorDef<ReferenceFramesConfig, ReferenceFramesState> = {
  id: 'reference-frames',
  topicId: 'dynamics',
  title: 'Sistema de Referencia Inercial y No Inercial',
  description: 'Análisis de fuerzas ficticias (inerciales) dentro de un vagón acelerado y la inclinación resultante de un péndulo.',

  parameterSchemas: [
    {
      id: 'cartAccel',
      label: 'Aceleración del Carro (a_carro)',
      unit: 'm/s²',
      controlType: 'slider',
      defaultValue: 4,
      min: 0,
      max: 15,
      step: 0.5,
    },
    {
      id: 'bobMass',
      label: 'Masa del Péndulo (m)',
      unit: 'kg',
      controlType: 'slider',
      defaultValue: 2,
      min: 0.5,
      max: 10,
      step: 0.5,
    },
    {
      id: 'stringLength',
      label: 'Longitud de la Cuerda (L)',
      unit: 'm',
      controlType: 'slider',
      defaultValue: 5,
      min: 2,
      max: 10,
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
    const tilt = Math.atan2(config.cartAccel, config.gravity);
    const fInertial = config.bobMass * config.cartAccel;
    const tension = config.bobMass * Math.hypot(config.gravity, config.cartAccel);

    return {
      cartX: 0,
      cartV: 0,
      tiltAngleRad: tilt,
      fictitiousForce: fInertial,
      tension,
    };
  },

  updateState: (t, _dt, _currentState, config) => {
    const cartX = 0.5 * config.cartAccel * t * t;
    const cartV = config.cartAccel * t;
    const tilt = Math.atan2(config.cartAccel, config.gravity);
    const fInertial = config.bobMass * config.cartAccel;
    const tension = config.bobMass * Math.hypot(config.gravity, config.cartAccel);

    return {
      cartX,
      cartV,
      tiltAngleRad: tilt,
      fictitiousForce: fInertial,
      tension,
    };
  },

  getRenderableObjects: (state, config) => {
    const pivotX = state.cartX;
    const pivotY = 5;
    const bobX = pivotX - config.stringLength * Math.sin(state.tiltAngleRad);
    const bobY = pivotY - config.stringLength * Math.cos(state.tiltAngleRad);

    return [
      {
        id: 'accelerating-cart',
        name: 'Vagón Acelerado',
        shape: 'cart',
        position: { x: state.cartX, y: 0 },
        size: { x: 8, y: 7 },
        color: '#1d4ed8',
      },
      {
        id: 'pendulum-string',
        name: 'Cuerda del Péndulo',
        shape: 'rope',
        position: { x: (pivotX + bobX) / 2, y: (pivotY + bobY) / 2 },
        size: { x: 0.1, y: config.stringLength },
        color: '#eff6ff',
        rotation: -state.tiltAngleRad,
      },
      {
        id: 'pendulum-bob',
        name: 'Masa del Péndulo',
        shape: 'sphere',
        position: { x: bobX, y: bobY },
        size: { x: 1.5, y: 1.5 },
        color: '#02ffff',
        mass: config.bobMass,
      },
    ];
  },

  getVectors: (state, config) => {
    const pivotX = state.cartX;
    const pivotY = 5;
    const bobX = pivotX - config.stringLength * Math.sin(state.tiltAngleRad);
    const bobY = pivotY - config.stringLength * Math.cos(state.tiltAngleRad);

    return [
      {
        id: 'fictitious-force',
        origin: { x: bobX, y: bobY },
        components: { x: -state.fictitiousForce * 0.2, y: 0 },
        label: `F_inercial = -${state.fictitiousForce.toFixed(1)} N`,
        color: '#ef4444',
        type: 'force',
      },
      {
        id: 'gravity-force',
        origin: { x: bobX, y: bobY },
        components: { x: 0, y: -config.bobMass * config.gravity * 0.2 },
        label: `P = ${(config.bobMass * config.gravity).toFixed(1)} N`,
        color: '#f97316',
        type: 'force',
      },
      {
        id: 'tension-force',
        origin: { x: bobX, y: bobY },
        components: {
          x: state.tension * Math.sin(state.tiltAngleRad) * 0.2,
          y: state.tension * Math.cos(state.tiltAngleRad) * 0.2,
        },
        label: `T = ${state.tension.toFixed(1)} N`,
        color: '#02ffff',
        type: 'tension',
      },
    ];
  },

  getMetrics: (state, config) => [
    { label: 'Ángulo de Inclinación (θ)', value: `${((state.tiltAngleRad * 180) / Math.PI).toFixed(1)}°`, highlight: true },
    { label: 'Fuerza Ficticia (F_inercial)', value: `${state.fictitiousForce.toFixed(2)} N`, highlight: true },
    { label: 'Tensión en la Cuerda (T)', value: `${state.tension.toFixed(2)} N` },
    { label: 'Aceleración del Carro', value: `${config.cartAccel.toFixed(1)} m/s²` },
    { label: 'Velocidad del Carro', value: `${state.cartV.toFixed(2)} m/s` },
  ],

  getTrajectoryPoint: (state) => ({ x: state.cartX, y: 0 }),
};
