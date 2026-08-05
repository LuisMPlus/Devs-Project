import { PhysicsSimulatorDef } from '../../types/simulator.types';
import { PhysicalObject, PhysicsVector } from '../../types/physics.types';

export interface MCUVConfig {
  radius: number; // Radius R (m)
  omega0: number; // Initial angular velocity (rad/s)
  alpha: number; // Angular acceleration (rad/s^2)
  initialAngleDeg: number;
}

export interface MCUVState {
  angleRad: number;
  omega: number;
  x: number;
  y: number;
  aTangential: number;
  aCentripetal: number;
  aTotal: number;
}

export const mcuvSimulator: PhysicsSimulatorDef<MCUVConfig, MCUVState> = {
  id: 'mcuv',
  topicId: 'kinematics',
  title: 'Movimiento Circular Uniformemente Variado (MCUV)',
  description: 'Movimiento en trayectoria circular con aceleración angular constante, mostrando componentes tangencial y centrípeta.',

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
      id: 'omega0',
      label: 'Velocidad Angular Inicial (ω₀)',
      unit: 'rad/s',
      controlType: 'slider',
      defaultValue: 0,
      min: -5,
      max: 10,
      step: 0.5,
    },
    {
      id: 'alpha',
      label: 'Aceleración Angular (α)',
      unit: 'rad/s²',
      controlType: 'slider',
      defaultValue: 1,
      min: -5,
      max: 5,
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
    const aTangential = config.alpha * config.radius;
    const aCentripetal = config.omega0 * config.omega0 * config.radius;
    const aTotal = Math.hypot(aTangential, aCentripetal);
    return {
      angleRad: theta0,
      omega: config.omega0,
      x: config.radius * Math.cos(theta0),
      y: config.radius * Math.sin(theta0),
      aTangential,
      aCentripetal,
      aTotal,
    };
  },

  updateState: (t, _dt, _currentState, config) => {
    const theta0 = (config.initialAngleDeg * Math.PI) / 180;
    const angleRad = theta0 + config.omega0 * t + 0.5 * config.alpha * t * t;
    const omega = config.omega0 + config.alpha * t;

    const x = config.radius * Math.cos(angleRad);
    const y = config.radius * Math.sin(angleRad);

    const aTangential = config.alpha * config.radius;
    const aCentripetal = omega * omega * config.radius;
    const aTotal = Math.hypot(aTangential, aCentripetal);

    return {
      angleRad,
      omega,
      x,
      y,
      aTangential,
      aCentripetal,
      aTotal,
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
      id: 'mcuv-particle',
      name: 'Partícula MCUV',
      shape: 'sphere',
      position: { x: state.x, y: state.y },
      size: { x: 1.5, y: 1.5 },
      color: '#42d7c7',
      isDraggable: true,
    },
  ],

  getVectors: (state, config) => {
    const vx = -state.omega * config.radius * Math.sin(state.angleRad);
    const vy = state.omega * config.radius * Math.cos(state.angleRad);

    // Tangential acceleration vector (perpendicular to radius)
    const atX = -config.alpha * config.radius * Math.sin(state.angleRad);
    const atY = config.alpha * config.radius * Math.cos(state.angleRad);

    // Centripetal acceleration vector (towards origin)
    const acX = -state.omega * state.omega * config.radius * Math.cos(state.angleRad);
    const acY = -state.omega * state.omega * config.radius * Math.sin(state.angleRad);

    return [
      {
        id: 'tangential-v',
        origin: { x: state.x, y: state.y },
        components: { x: vx * 0.4, y: vy * 0.4 },
        label: `v = ${(Math.abs(state.omega) * config.radius).toFixed(1)} m/s`,
        color: '#02ffff',
        type: 'velocity',
      },
      {
        id: 'tangential-a',
        origin: { x: state.x, y: state.y },
        components: { x: atX * 0.4, y: atY * 0.4 },
        label: `a_t = ${state.aTangential.toFixed(1)} m/s²`,
        color: '#42d7c7',
        type: 'acceleration',
      },
      {
        id: 'centripetal-a',
        origin: { x: state.x, y: state.y },
        components: { x: acX * 0.15, y: acY * 0.15 },
        label: `a_c = ${state.aCentripetal.toFixed(1)} m/s²`,
        color: '#f97316',
        type: 'acceleration',
      },
    ];
  },

  getMetrics: (state, config) => [
    { label: 'Ángulo (θ)', value: `${(((state.angleRad * 180) / Math.PI) % 360).toFixed(1)}°`, highlight: true },
    { label: 'Velocidad Angular (ω)', value: state.omega.toFixed(2), unit: 'rad/s', highlight: true },
    { label: 'Aceleración Angular (α)', value: config.alpha.toFixed(2), unit: 'rad/s²' },
    { label: 'Aceleración Tangencial (a_t)', value: state.aTangential.toFixed(2), unit: 'm/s²' },
    { label: 'Aceleración Centrípeta (a_c)', value: state.aCentripetal.toFixed(2), unit: 'm/s²' },
    { label: 'Aceleración Total (a_tot)', value: state.aTotal.toFixed(2), unit: 'm/s²' },
  ],

  getTrajectoryPoint: (state) => ({ x: state.x, y: state.y }),
};
