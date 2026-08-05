import {
  ParameterSchema,
  PhysicalObject,
  PhysicsVector,
  SimulationMetrics,
  TrajectoryPoint,
  Vector2D,
} from './physics.types';

export type TopicCategory = 'kinematics' | 'dynamics';

export interface TopicInfo {
  id: TopicCategory;
  title: string;
  description: string;
  badgeColor: string;
}

export interface PhysicsSimulatorDef<TConfig = Record<string, any>, TState = Record<string, any>> {
  id: string;
  topicId: TopicCategory;
  title: string;
  description: string;
  parameterSchemas: ParameterSchema[];
  
  // World view defaults
  defaultWorldBounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  
  // Simulator hooks & pure calculation functions
  getInitialState: (config: TConfig) => TState;
  updateState: (t: number, dt: number, currentState: TState, config: TConfig) => TState;
  getRenderableObjects: (state: TState, config: TConfig) => PhysicalObject[];
  getVectors: (state: TState, config: TConfig) => PhysicsVector[];
  getMetrics: (state: TState, config: TConfig) => SimulationMetrics[];
  getTrajectoryPoint?: (state: TState) => Vector2D | null;
  
  // Interactive object positioning hook in Edit mode
  handleObjectDrag?: (
    objectId: string,
    newPos: Vector2D,
    config: TConfig,
    state: TState
  ) => { updatedConfig: Partial<TConfig>; updatedState?: Partial<TState> };
}
