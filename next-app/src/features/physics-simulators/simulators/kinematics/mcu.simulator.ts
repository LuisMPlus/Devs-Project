import { PhysicsSimulatorDef } from '../../types/simulator.types';
import { PhysicalObject, PhysicsVector } from '../../types/physics.types';

export interface MCUConfig {
  radius: number; // Radius R in meters
  omega: number; // Angular velocity (rad/s)
  initialAngleDeg: number;
}

export interface MCUState {
  angleRad: number;
  x: number;
  y: number;
  vLinear: number;
  aCentripetal: number;
}

export const mcuSimulator: PhysicsSimulatorDef<MCUConfig, MCUState> = {
  id: 'mcu',
  topicId: 'kinematics',
  title: 'Movimiento Circular Uniforme (MCU)',
  description: 'Movimiento en trayectoria circular con velocidad angular constante y aceleración centrípeta hacia el centro.',

  parameterSchemas: [
    {
      id: 'radius',
      label: 'Radio de la Trayectoria (R)',
      unit: 'm',
      controlType: 'slider',
      defaultValue: 10,
      min: 2,
      max: 25,
      step: 0.5,
    },
    {
      id: 'omega',
      label: 'Velocidad Angular (ω)',
      unit: 'rad/s',
      controlType: 'slider',
      defaultValue: 2,
      min: -10,
      max: 10,
      step: 0.2,
    },
    {
      id: 'initialAngleDeg',
      label: 'Ángulo Inicial (θ₀)',
      unit: '°',
      controlType: 'slider',
      defaultValue: 0,
      min: 0,
      max: 360,
      step: 5,
    },
  ],

  getInitialState: (config) => {
    const theta0 = (config.initialAngleDeg * Math.PI) / 180;
    const vLinear = Math.abs(config.omega) * config.radius;
    const aCentripetal = config.omega * config.omega * config.radius;
    return {
      angleRad: theta0,
      x: config.radius * Math.cos(theta0),
      y: config.radius * Math.sin(theta0),
      vLinear,
      aCentripetal,
    };
  },

  updateState: (t, _dt, _currentState, config) => {
    const theta0 = (config.initialAngleDeg * Math.PI) / 180;
    const angleRad = theta0 + config.omega * t;
    const x = config.radius * Math.cos(angleRad);
    const y = config.radius * Math.sin(angleRad);
    const vLinear = Math.abs(config.omega) * config.radius;
    const aCentripetal = config.omega * config.omega * config.radius;

    return {
      angleRad,
      x,
      y,
      vLinear,
      aCentripetal,
    };
  },

  getRenderableObjects: (state, config) => [
    {
      id: 'center-pivot',
      name: 'Centro Pivot',
      shape: 'point',
      position: { x: 0, y: 0 },
      size: { x: 0.8, y: 0.8 },
      color: '#ffffff',
    },
    {
      id: 'mcu-particle',
      name: 'Partícula MCU',
      shape: 'sphere',
      position: { x: state.x, y: state.y },
      size: { x: 1.5, y: 1.5 },
      color: '#02ffff',
      isDraggable: true,
    },
  ],

  getVectors: (state, config) => {
    const vx = -config.omega * config.radius * Math.sin(state.angleRad);
    const vy = config.omega * config.radius * Math.cos(state.angleRad);

    // Centripetal acceleration vector points towards origin (0,0)
    const ax = -config.omega * config.omega * config.radius * Math.cos(state.angleRad);
    const ay = -config.omega * config.omega * config.radius * Math.sin(state.angleRad);

    return [
      {
        id: 'tangential-v',
        origin: { x: state.x, y: state.y },
        components: { x: vx * 0.5, y: vy * 0.5 },
        label: `v = ${state.vLinear.toFixed(1)} m/s`,
        color: '#02ffff',
        type: 'velocity',
      },
      {
        id: 'centripetal-a',
        origin: { x: state.x, y: state.y },
        components: { x: ax * 0.2, y: ay * 0.2 },
        label: `a_c = ${state.aCentripetal.toFixed(1)} m/s²`,
        color: '#f97316',
        type: 'acceleration',
      },
    ];
  },

  getMetrics: (state, config) => [
    { label: 'Ángulo (θ)', value: `${(((state.angleRad * 180) / Math.PI) % 360).toFixed(1)}°`, highlight: true },
    { label: 'Velocidad Angular (ω)', value: config.omega.toFixed(2), unit: 'rad/s' },
    { label: 'Velocidad Lineal (v)', value: state.vLinear.toFixed(2), unit: 'm/s', highlight: true },
    { label: 'Aceleración Centrípeta (a_c)', value: state.aCentripetal.toFixed(2), unit: 'm/s²' },
    { label: 'Radio (R)', value: config.radius.toFixed(1), unit: 'm' },
  ],

  getTrajectoryPoint: (state) => ({ x: state.x, y: state.y }),

  handleObjectDrag: (_objectId, newPos) => {
    const newR = Math.hypot(newPos.x, newPos.y);
    const newAngleRad = Math.atan2(newPos.y, newPos.x);
    const newAngleDeg = Math.round((newAngleRad * 180) / Math.PI);
    return {
      updatedConfig: {
        radius: Math.max(2, Math.min(25, Math.round(newR))),
        initialAngleDeg: (newAngleDeg + 360) % 360,
      },
    };
  },
};
