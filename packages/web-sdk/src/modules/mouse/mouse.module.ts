import { BaseModule } from "@/modules/BaseModule";

// Configuration for the module
const TRAJECTORY_MAX_POINTS = 100; // Max number of points for action analysis
const MOUSE_MOVE_DEBOUNCE_MS = 50; // Dispatch a mousemove summary at most every 50ms

export class MouseBehaviourModule extends BaseModule {
  public readonly moduleName = "mouse";
  private trajectory: { x: number; y: number; t: number }[] = [];
  private lastMoveDispatchTime: number = 0;
  private readonly mouseEvents = [
    "mousemove",
    "mousedown",
    "mouseup",
    "click",
    "dblclick",
    "contextmenu",
  ];

  public init(): void {
    console.log("[SDK] mouse: Initializing...");
    this.mouseEvents.forEach((eventType) => {
      this.addListener(document, eventType, this.handleMouseEvent.bind(this), {
        capture: true,
      });
    });
  }

  private handleMouseEvent(event: Event): void {
    const mouseEvent = event as MouseEvent;

    switch (mouseEvent.type) {
      case "mousedown":
        this.trajectory = [];
        this.recordPoint(mouseEvent.clientX, mouseEvent.clientY);
        break;

      case "mousemove":
        this.recordPoint(mouseEvent.clientX, mouseEvent.clientY);
        // --- NEW LOGIC: Dispatch debounced mousemove events ---
        const now = Date.now();
        if (now - this.lastMoveDispatchTime > MOUSE_MOVE_DEBOUNCE_MS) {
          this.lastMoveDispatchTime = now;
          this.eventManager.dispatch(this.moduleName, mouseEvent.type, {
            // This is a lightweight payload, no heavy analysis
            mouse: {
              screenX: mouseEvent.screenX,
              screenY: mouseEvent.screenY,
              clientX: mouseEvent.clientX,
              clientY: mouseEvent.clientY,
            },
            pointCount: this.trajectory.length,
          });
        }
        break;

      case "mouseup":
      case "click":
      case "dblclick":
      case "contextmenu":
        const target = mouseEvent.target as HTMLElement;
        const analysis = this.analyzeTrajectory(); // Heavy analysis for terminal events

        this.eventManager.dispatch(this.moduleName, mouseEvent.type, {
          target: {
            tag: target.tagName,
            id: target.id,
            text: target.textContent?.substring(0, 50),
          },
          mouse: {
            button: mouseEvent.button,
            screenX: mouseEvent.screenX,
            screenY: mouseEvent.screenY,
          },
          ...analysis,
        });

        this.trajectory = []; // Clear after action
        break;
    }
  }

  private recordPoint(x: number, y: number): void {
    const lastPoint = this.trajectory[this.trajectory.length - 1];
    if (lastPoint && lastPoint.x === x && lastPoint.y === y) {
      return;
    }

    this.trajectory.push({ x, y, t: Date.now() });

    if (this.trajectory.length > TRAJECTORY_MAX_POINTS) {
      this.trajectory.shift();
    }
  }

  private analyzeTrajectory(): object {
    if (this.trajectory.length < 3) {
      return {
        duration: 0,
        pathLength: 0,
        endSpeed: 0,
        straightness: 1,
        jerkiness: 0,
        incidenceAngle: 0,
      };
    }

    const firstPoint = this.trajectory[0];
    const lastPoint = this.trajectory[this.trajectory.length - 1];
    const duration = lastPoint.t - firstPoint.t;

    let pathLength = 0;
    let sumOfAngles = 0;

    for (let i = 1; i < this.trajectory.length; i++) {
      const p1 = this.trajectory[i - 1];
      const p2 = this.trajectory[i];
      pathLength += Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
      );

      if (i > 1) {
        const p0 = this.trajectory[i - 2];
        const angle1 = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        const angle2 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        sumOfAngles += Math.abs(angle2 - angle1);
      }
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

    const angleRad = Math.atan2(
      lastPoint.y - secondLastPoint.y,
      lastPoint.x - secondLastPoint.x
    );
    const incidenceAngle = Math.round((angleRad * 180) / Math.PI);

    return {
      duration,
      pathLength: parseFloat(pathLength.toFixed(2)),
      endSpeed: parseFloat(endSpeed.toFixed(2)),
      straightness: parseFloat(straightness.toFixed(2)),
      jerkiness: parseFloat(sumOfAngles.toFixed(2)),
      incidenceAngle: incidenceAngle,
      pointCount: this.trajectory.length,
    };
  }
}
