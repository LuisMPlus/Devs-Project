import { Vector2D } from '../types/physics.types';

export class CoordinateTransformer {
  private canvasWidth: number;
  private canvasHeight: number;
  private scalePxPerMeter: number;
  private originWorld: Vector2D; // In meters

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    scalePxPerMeter: number = 30,
    originWorld: Vector2D = { x: 0, y: 0 }
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.scalePxPerMeter = scalePxPerMeter;
    this.originWorld = originWorld;
  }

  public updateDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  public setScale(scalePxPerMeter: number): void {
    this.scalePxPerMeter = Math.max(5, Math.min(500, scalePxPerMeter));
  }

  public getScale(): number {
    return this.scalePxPerMeter;
  }

  public setOrigin(originWorld: Vector2D): void {
    this.originWorld = originWorld;
  }

  public getOrigin(): Vector2D {
    return { ...this.originWorld };
  }

  public zoomAtScreenPos(screenPos: Vector2D, zoomFactor: number): void {
    const worldUnderCursor = this.screenToWorld(screenPos);
    const newScale = Math.max(5, Math.min(500, this.scalePxPerMeter * zoomFactor));
    this.scalePxPerMeter = newScale;

    const screenCenterX = this.canvasWidth / 2;
    const screenCenterY = this.canvasHeight / 2;

    this.originWorld = {
      x: worldUnderCursor.x - (screenPos.x - screenCenterX) / newScale,
      y: worldUnderCursor.y + (screenPos.y - screenCenterY) / newScale,
    };
  }

  public zoomCenter(zoomFactor: number): void {
    const centerScreen = { x: this.canvasWidth / 2, y: this.canvasHeight / 2 };
    this.zoomAtScreenPos(centerScreen, zoomFactor);
  }

  // World (m) -> Screen (px)
  public worldToScreen(worldPos: Vector2D): Vector2D {
    const screenCenterX = this.canvasWidth / 2;
    const screenCenterY = this.canvasHeight / 2;

    const screenX = screenCenterX + (worldPos.x - this.originWorld.x) * this.scalePxPerMeter;
    const screenY = screenCenterY - (worldPos.y - this.originWorld.y) * this.scalePxPerMeter;

    return { x: screenX, y: screenY };
  }

  // Screen (px) -> World (m)
  public screenToWorld(screenPos: Vector2D): Vector2D {
    const screenCenterX = this.canvasWidth / 2;
    const screenCenterY = this.canvasHeight / 2;

    const worldX = this.originWorld.x + (screenPos.x - screenCenterX) / this.scalePxPerMeter;
    const worldY = this.originWorld.y - (screenPos.y - screenCenterY) / this.scalePxPerMeter;

    return { x: worldX, y: worldY };
  }

  // Dimension World (m) -> Screen (px)
  public worldToScreenDist(distMeters: number): number {
    return distMeters * this.scalePxPerMeter;
  }

  // Dimension Screen (px) -> World (m)
  public screenToWorldDist(distPixels: number): number {
    return distPixels / this.scalePxPerMeter;
  }
}
