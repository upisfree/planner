import { Sprite } from 'pixi.js';

class Furniture extends Sprite {
  constructor(planner, type) {
    super(planner.assets.textures[type]);

    this.planner = planner;
    this.type = type;

    this.anchor.set(0.5);

    const { viewport } = planner;
    const tool = planner.furnitureTool;
    this.tool = tool;

    tool.layer.attach(this);
    viewport.addChild(this);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', this.onMouseDown.bind(this));
    this.on('pointerup', this.onMouseUp.bind(this));

    planner.furnitureTool.furnitures.push(this);

    console.log(this);
  }

  dispose() {
    // TODO: удаление из списка в tool
  }

  onMouseDown() {
    this.tool.setDragTarget(this);
    this.planner.disableCameraDragging();
  }

  onMouseUp() {
    this.tool.removeDragTarget();
    this.planner.enableCameraDragging();
  }
}

export default Furniture;
