import { PhysicsSimulatorDef, TopicInfo } from '../types/simulator.types';
import { mruSimulator } from './kinematics/mru.simulator';
import { mruvSimulator } from './kinematics/mruv.simulator';
import { projectileSimulator } from './kinematics/projectile.simulator';
import { galileanSimulator } from './kinematics/galilean.simulator';
import { mcuSimulator } from './kinematics/mcu.simulator';
import { mcuvSimulator } from './kinematics/mcuv.simulator';

import { blockPairsSimulator } from './dynamics/block-pairs.simulator';
import { inclinedPlaneSimulator } from './dynamics/inclined-plane.simulator';
import { ropeTensionSimulator } from './dynamics/rope-tension.simulator';
import { atwoodMachineSimulator } from './dynamics/atwood-machine.simulator';
import { referenceFramesSimulator } from './dynamics/reference-frames.simulator';

export const TOPICS: TopicInfo[] = [
  {
    id: 'kinematics',
    title: 'Cinemática',
    description: 'Estudio de la geometría del movimiento sin atender a las causas que lo producen.',
    badgeColor: '#02ffff',
  },
  {
    id: 'dynamics',
    title: 'Dinámica',
    description: 'Estudio del movimiento considerando las fuerzas y masas que lo generan (Leyes de Newton).',
    badgeColor: '#1d4ed8',
  },
];

export const SIMULATORS: PhysicsSimulatorDef<any, any>[] = [
  // Kinematics
  mruSimulator,
  mruvSimulator,
  projectileSimulator,
  galileanSimulator,
  mcuSimulator,
  mcuvSimulator,
  // Dynamics
  blockPairsSimulator,
  inclinedPlaneSimulator,
  ropeTensionSimulator,
  atwoodMachineSimulator,
  referenceFramesSimulator,
];

export function getSimulatorsByTopic(topicId: string): PhysicsSimulatorDef<any, any>[] {
  return SIMULATORS.filter((sim) => sim.topicId === topicId);
}

export function getSimulatorById(id: string): PhysicsSimulatorDef<any, any> | undefined {
  return SIMULATORS.find((sim) => sim.id === id);
}
