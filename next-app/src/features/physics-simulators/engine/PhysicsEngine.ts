import { PhysicsSimulatorDef } from '../types/simulator.types';
import { SimulationMode } from '../types/physics.types';

export interface PhysicsEngineListener<TState> {
  onTick: (t: number, state: TState) => void;
  onModeChange: (mode: SimulationMode) => void;
}

export class PhysicsEngine<TConfig = Record<string, any>, TState = Record<string, any>> {
  private simulator: PhysicsSimulatorDef<TConfig, TState>;
  private config: TConfig;
  private state: TState;
  
  private currentTime: number = 0;
  private mode: SimulationMode = 'EDIT';
  private speedMultiplier: number = 1.0;
  private fixedDeltaTime: number = 0.016; // 16ms approx 60fps

  private animationFrameId: number | null = null;
  private lastRealTime: number | null = null;
  private listeners: Set<PhysicsEngineListener<TState>> = new Set();

  constructor(simulator: PhysicsSimulatorDef<TConfig, TState>, initialConfig: TConfig) {
    this.simulator = simulator;
    this.config = initialConfig;
    this.state = simulator.getInitialState(initialConfig);
  }

  public subscribe(listener: PhysicsEngineListener<TState>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public setConfig(newConfig: TConfig): void {
    this.config = newConfig;
    if (this.mode === 'EDIT') {
      this.reset();
    }
  }

  public getConfig(): TConfig {
    return this.config;
  }

  public getState(): TState {
    return this.state;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getMode(): SimulationMode {
    return this.mode;
  }

  public getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }

  public setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = Math.max(0.1, Math.min(10.0, multiplier));
  }

  public play(): void {
    if (this.mode === 'RUNNING') return;
    this.mode = 'RUNNING';
    this.lastRealTime = performance.now();
    this.notifyModeChange();
    this.startLoop();
  }

  public pause(): void {
    if (this.mode !== 'RUNNING') return;
    this.mode = 'PAUSED';
    this.stopLoop();
    this.notifyModeChange();
  }

  public stepForward(): void {
    if (this.mode === 'RUNNING') {
      this.pause();
    }
    const dt = this.fixedDeltaTime;
    this.currentTime += dt;
    this.state = this.simulator.updateState(this.currentTime, dt, this.state, this.config);
    this.notifyTick();
  }

  public reset(): void {
    this.stopLoop();
    this.mode = 'EDIT';
    this.currentTime = 0;
    this.state = this.simulator.getInitialState(this.config);
    this.notifyModeChange();
    this.notifyTick();
  }

  public destroy(): void {
    this.stopLoop();
    this.listeners.clear();
  }

  private startLoop(): void {
    if (this.animationFrameId !== null) return;
    const loop = (now: number) => {
      if (this.mode !== 'RUNNING') return;

      if (this.lastRealTime !== null) {
        const elapsedRealSeconds = (now - this.lastRealTime) / 1000;
        // Clamp to prevent spiral of death if tab is backgrounded
        const clampedElapsed = Math.min(0.1, elapsedRealSeconds);
        const simDelta = clampedElapsed * this.speedMultiplier;

        this.currentTime += simDelta;
        this.state = this.simulator.updateState(this.currentTime, simDelta, this.state, this.config);
        this.notifyTick();
      }

      this.lastRealTime = now;
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private stopLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.lastRealTime = null;
  }

  private notifyTick(): void {
    this.listeners.forEach((listener) => listener.onTick(this.currentTime, this.state));
  }

  private notifyModeChange(): void {
    this.listeners.forEach((listener) => listener.onModeChange(this.mode));
  }
}
