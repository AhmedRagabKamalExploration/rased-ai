import { BaseModule } from "@/modules/BaseModule";

export class TouchModule extends BaseModule {
  public readonly moduleName: string = "touch";

  private trajectory: {
    x: number;
    y: number;
    t: number;
    force: number;
    radius: number;
  }[] = [];
  private startPoint: any = null;

  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    this.addListener(document, "touchstart", this.handleTouchStart.bind(this), {
      capture: true,
    });
    this.addListener(document, "touchmove", this.handleTouchMove.bind(this), {
      capture: true,
    });
    this.addListener(document, "touchend", this.handleTouchEnd.bind(this), {
      capture: true,
    });
  }

  private handleTouchStart(event: Event): void {
    const touch = (event as TouchEvent).changedTouches[0];
    this.trajectory = [];
    this.startPoint = this.recordPoint(touch);
  }

  private handleTouchMove(event: Event): void {
    const touch = (event as TouchEvent).changedTouches[0];
    this.recordPoint(touch);
  }

  private handleTouchEnd(event: Event): void {
    const touch = (event as TouchEvent).changedTouches[0];
    const endPoint = this.recordPoint(touch);
    const target = event.target as HTMLElement;

    if (this.trajectory.length < 2) {
      // It's a tap, not a swipe
      this.eventManager.dispatch(this.moduleName, "tap", {
        target: { tag: target.tagName, id: target.id },
        point: this.startPoint,
      });
    } else {
      // It's a swipe, analyze it
      const analysis = this.analyzeTrajectory();
      this.eventManager.dispatch(this.moduleName, "swipe", {
        target: { tag: target.tagName, id: target.id },
        startPoint: this.startPoint,
        endPoint,
        ...analysis,
      });
    }
    this.trajectory = [];
  }

  private recordPoint(touch: Touch) {
    const point = {
      x: touch.clientX,
      y: touch.clientY,
      t: Date.now(),
      force: touch.force || 0,
      radius: touch.radiusX || 0,
    };
    this.trajectory.push(point);
    return point;
  }

  private analyzeTrajectory(): object {
    const firstPoint = this.trajectory[0];
    const lastPoint = this.trajectory[this.trajectory.length - 1];
    const duration = lastPoint.t - firstPoint.t;
    let pathLength = 0;

    for (let i = 1; i < this.trajectory.length; i++) {
      const p1 = this.trajectory[i - 1];
      const p2 = this.trajectory[i];
      pathLength += Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
      );
    }

    const directDistance = Math.sqrt(
      Math.pow(lastPoint.x - firstPoint.x, 2) +
        Math.pow(lastPoint.y - firstPoint.y, 2)
    );
    const straightness = pathLength > 0 ? directDistance / pathLength : 1;

    const secondLastPoint = this.trajectory[this.trajectory.length - 2];
    const dist = Math.sqrt(
      Math.pow(lastPoint.x - secondLastPoint.x, 2) +
        Math.pow(lastPoint.y - secondLastPoint.y, 2)
    );
    const time = lastPoint.t - secondLastPoint.t;
    const endSpeed = time > 0 ? dist / time : 0;

    return {
      metrics: {
        duration,
        pathLength: parseFloat(pathLength.toFixed(2)),
        straightness: parseFloat(straightness.toFixed(2)),
        endSpeed: parseFloat(endSpeed.toFixed(2)),
        pointCount: this.trajectory.length,
      },
    };
  }
}
