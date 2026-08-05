import { PhysicsSimulatorDef } from '../../types/simulator.types';
import { PhysicalObject, PhysicsVector } from '../../types/physics.types';

export interface GalileanConfig {
  vFrame: number; // Speed of the moving frame/cart (m/s)
  vBallY0: number; // Vertical launch speed relative to cart (m/s)
  gravity: number; // Gravity (m/s^2)
}

export interface GalileanState {
  xFixed: number; // X in stationary frame S
  xMoving: number; // X relative to moving frame S'
  y: number; // Y position (same in both frames)
  isGrounded: boolean;
}

export const galileanSimulator: PhysicsSimulatorDef<GalileanConfig, GalileanState> = {
  id: 'galilean',
  topicId: 'kinematics',
  title: 'Transformada de Galileo (Relatividad Galileana)',
  description: 'Comparación del movimiento de una partícula desde un sistema de referencia fijo S y un sistema móvil S\'.',

  parameterSchemas: [
    {
      id: 'vFrame',
      label: 'Velocidad del Carro (V_S\')',
      unit: 'm/s',
      controlType: 'slider',
      defaultValue: 10,
      min: 0,
      max: 30,
      step: 1,
    },
    {
      id: 'vBallY0',
      label: 'Velocidad Vertical de Lanzamiento (v\'_y)',
      unit: 'm/s',
      controlType: 'slider',
      defaultValue: 15,
      min: 0,
      max: 30,
      step: 1,
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

  getInitialState: () => ({
    xFixed: 0,
    xMoving: 0,
    y: 2,
    isGrounded: false,
  }),

  updateState: (t, _dt, _currentState, config) => {
    const g = config.gravity;
    let y = 2 + config.vBallY0 * t - 0.5 * g * t * t;
    let isGrounded = false;

    if (y <= 0) {
      y = 0;
      isGrounded = true;
    }

    const xMoving = 0; // Relative to cart, ball moves vertically
    const xCart = config.vFrame * t;
    const xFixed = xCart + xMoving;

    return {
      xFixed,
      xMoving,
      y,
      isGrounded,
    };
  },

  getRenderableObjects: (state, config) => {
    const cartX = state.xFixed;
    return [
      {
        id: 'moving-cart',
        name: 'Carro (Sistema S\')',
        shape: 'cart',
        position: { x: cartX, y: 0 },
        size: { x: 4, y: 1.5 },
        color: '#1d4ed8',
      },
      {
        id: 'ball-object',
        name: 'Objeto Lanzado',
        shape: 'sphere',
        position: { x: state.xFixed, y: state.y },
        size: { x: 1, y: 1 },
        color: '#02ffff',
      },
    ];
  },

  getVectors: (state, config) => [
    {
      id: 'v-frame',
      origin: { x: state.xFixed, y: 0.75 },
      components: { x: config.vFrame, y: 0 },
      label: `V_cart = ${config.vFrame} m/s`,
      color: '#42d7c7',
      type: 'velocity',
    },
  ],

  getMetrics: (state, config) => [
    { label: 'Posición X en Sistema Fijo (S)', value: state.xFixed.toFixed(2), unit: 'm', highlight: true },
    { label: 'Posición X en Sistema Móvil (S\')', value: state.xMoving.toFixed(2), unit: 'm', highlight: true },
    { label: 'Altura (Y)', value: state.y.toFixed(2), unit: 'm' },
    { label: 'Velocidad Carro (V)', value: config.vFrame.toFixed(1), unit: 'm/s' },
  ],

  getTrajectoryPoint: (state) => ({ x: state.xFixed, y: state.y }),
};
