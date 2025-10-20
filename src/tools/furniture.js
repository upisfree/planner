// менеджер мебели и объектов
import { RenderLayer } from 'pixi.js';
import pointScreenToWorld from '../utils/screen-to-world.js';

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

    this.enable();
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

    const worldPoint = pointScreenToWorld(event.global, this.viewport);

    // обновляем спрайт таскаемой мебели
    this.dragTarget.position.copyFrom(worldPoint);
  }
}

export default FurnitureTool;
