export interface Vector2D {
  x: number;
  y: number;
}

export type VectorType = 'velocity' | 'acceleration' | 'force' | 'tension';

export interface PhysicsVector {
  id: string;
  origin: Vector2D;
  components: Vector2D;
  label: string;
  color: string;
  type: VectorType;
}

export type ObjectShape = 
  | 'box' 
  | 'sphere' 
  | 'inclined_plane' 
  | 'pulley' 
  | 'rope' 
  | 'point' 
  | 'cart';

export interface PhysicalObject {
  id: string;
  name: string;
  shape: ObjectShape;
  position: Vector2D; // in meters (world space)
  size: Vector2D; // width, height (or diameter, radius) in meters
  color: string;
  rotation?: number; // angle in radians or degrees
  mass?: number; // in kg
  velocity?: Vector2D; // in m/s
  acceleration?: Vector2D; // in m/s^2
  isDraggable?: boolean;
  extraData?: Record<string, any>;
}

export type SimulationMode = 'EDIT' | 'RUNNING' | 'PAUSED';

export type ParameterControlType = 'slider' | 'number' | 'select' | 'boolean';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface ParameterSchema {
  id: string;
  label: string;
  description?: string;
  unit?: string;
  controlType: ParameterControlType;
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: SelectOption[];
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  time: number;
}

export interface SimulationMetrics {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}
