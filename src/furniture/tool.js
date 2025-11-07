// менеджер мебели и объектов
import { Point, RenderLayer } from 'pixi.js';
import pointScreenToWorld from '../utils/screen-to-world.js';
import { FURNITURE_POSITION_STEP } from '../config.js';
import SAT from 'sat';

const _lastMousePoint = new Point(0, 0);

class FurnitureTool {
  furnitures = [];

  dragTarget = null;

  constructor(planner) {
    this.planner = planner;
    this.viewport = planner.viewport;

    const { stage } = planner.app;

    this.layer = new RenderLayer();
    stage.addChild(this.layer);

    stage.addEventListener('pointermove', this.onMouseMove.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));

    this.enable();
  }

  removeFurniture(furniture) {
    const index = this.furnitures.indexOf(furniture);

    if (index > -1) {
      this.furnitures.splice(index, 1);
    }
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  setDragTarget(target) {
    if (this.isEnabled) {
      this.dragTarget = target;
    }
  }

  removeDragTarget() {
    this.dragTarget = null;
  }

  onMouseMove(event) {
    if (this.isEnabled && this.dragTarget) {
      this.updateDragging(event);
    }
  }

  updateDragging(event) {
    if (!this.dragTarget) {
      return;
    }

    const mousePoint = pointScreenToWorld(event.global, this.viewport);

    const distance = Math.hypot(
      mousePoint.x - _lastMousePoint.x,
      mousePoint.y - _lastMousePoint.y
    );

    if (distance < FURNITURE_POSITION_STEP) {
      return;
    }

    // обновляем спрайт таскаемой мебели
    this.dragTarget.position.copyFrom(mousePoint);
    _lastMousePoint.copyFrom(mousePoint);

    this.validate();
  }

  onKeyUp(event) {
    const code = event.code;

    if (code === 'Backspace' && this.dragTarget) {
      this.dragTarget.dispose();
    }
  }

  validate() {
    this.furnitures.forEach(furniture => {
      furniture.updateCollisionPolygon();

      furniture.disableInvalidFilter();
    });

    const isCollisionWithFurniture = this.furnitures.some(f1 => {
      return this.furnitures.some(f2 => {
        if (f1 === f2) {
          return false;
        }

        const isColliding = SAT.testPolygonPolygon(f1.collisionPolygon, f2.collisionPolygon, new SAT.Response());

        if (isColliding) {
          f1.enableInvalidFilter();
          f2.enableInvalidFilter();
        }

        return isColliding;
      });
    });

    const isCollisionWithWall = this.furnitures.some(fur => {
      return this.planner.wallTool.wallsPolygons.some(wall => {
        const isColliding = SAT.testPolygonPolygon(fur.collisionPolygon, wall, new SAT.Response());

        if (isColliding) {
          fur.enableInvalidFilter();
        }

        return isColliding;
      });
    });
  }
}

export default FurnitureTool;
