import { ColorMatrixFilter, Sprite } from 'pixi.js';
import pointScreenToWorld from '../utils/screen-to-world.js';
import { furnitureList } from './list.js';
import SAT from 'sat';

class Furniture extends Sprite {
  rotationStartingPoint = null;

  collisionPolygon = null;

  invalidFilter = null;

  constructor(planner, type) {
    super(planner.assets.textures[type]);

    this.planner = planner;
    this.type = type;

    this.anchor.set(0.5);

    // указываем реальные размеры мебели
    this.setSize(
      furnitureList[type].width,
      furnitureList[type].height
    );

    const { viewport } = planner;
    const tool = planner.furnitureTool;
    this.tool = tool;

    tool.layer.attach(this);
    viewport.addChild(this);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerenter', this.onMouseEnter.bind(this));
    this.on('pointerleave', this.onMouseLeave.bind(this));
    this.on('pointerdown', this.onMouseDown.bind(this));
    this.on('pointerup', this.onMouseUp.bind(this));
    // window.addEventListener('pointerup', this.onWindowMouseUp.bind(this));
    // window.addEventListener('pointermove', this.onWindowMouseMove.bind(this));

    planner.furnitureTool.furnitures.push(this);

    this.initIcons();
    this.initCollisionPolygon();

    // invalid filter
    this.invalidFilter = new ColorMatrixFilter();
    this.invalidFilter.tint(0xff0000);
  }

  dispose() {
    const { viewport } = planner;

    this.tool.layer.detach(this);
    viewport.removeChild(this);
    this.tool.removeFurniture(this);

    if (this.tool.dragTarget === this) {
      this.tool.removeDragTarget();
    }
  }

  initCollisionPolygon() {
    // init collision math
    const box = new SAT.Box(
      new SAT.Vector(0, 0),
      // TODO: здесь будут учитываться ограничения у каждого типа мебели. например, если в области 1 метра от мебели нельзя ничего ставить,
      //       тут будут использованы width & height safe zone внутри furnitureList
      furnitureList[this.type].width,
      furnitureList[this.type].height
    );

    this.collisionPolygon = box.toPolygon();
  }

  initIcons() {
    // rotate
    const rotate = new Sprite(this.planner.assets.textures.rotateIcon);
    rotate.anchor.set(0.5);
    rotate.scale.set(0.5);
    rotate.position.set(this.width * 3, this.height * -3);
    this.addChild(rotate);

    rotate.visible = false;
    rotate.eventMode = 'static';
    rotate.cursor = 'pointer';
    rotate.on('pointerdown', this.onRotateDown.bind(this));
    rotate.on('pointerup', this.onRotateUp.bind(this));
    rotate.on('pointerupoutside', this.onRotateUp.bind(this));
    rotate.on('globalpointermove', this.onRotateMove.bind(this));

    this.rotateIcon = rotate;

    // delete
    const deleteIcon = new Sprite(this.planner.assets.textures.deleteIcon);
    deleteIcon.anchor.set(0.5);
    deleteIcon.scale.set(0.5);
    deleteIcon.position.set(this.width * 3 + 150, this.height * -3);
    this.addChild(deleteIcon);

    deleteIcon.visible = false;
    deleteIcon.eventMode = 'static';
    deleteIcon.cursor = 'pointer';
    deleteIcon.on('pointerup', this.onDeleteUp.bind(this));

    this.deleteIcon = deleteIcon;
  }

  updateCollisionPolygon() {
    this.collisionPolygon.pos.x = this.position.x;
    this.collisionPolygon.pos.y = this.position.y;
    this.collisionPolygon.setAngle(this.rotation);
  }

  enableInvalidFilter() {
    this.filters = [this.invalidFilter];
  }

  disableInvalidFilter() {
    this.filters = null;
  }

  onRotateDown() {
    this.rotationStartingPoint = pointScreenToWorld(this.position, this.planner.viewport);
  }

  onRotateUp() {
    this.rotationStartingPoint = null;

    this.onMouseUp();
  }

  onRotateMove(event) {
    if (!this.rotationStartingPoint) {
      return;
    }

    const rotationEndPoint = pointScreenToWorld(event.global, this.planner.viewport);
    const angle = Math.atan2(
      this.rotationStartingPoint.y - rotationEndPoint.y,
      this.rotationStartingPoint.x - rotationEndPoint.x
    );

    // TODO: пофиксить все баги с поворотом

    // неправильные коорды у rotationEndPoint
    // мб просто использовать экранные коорды и не ебать себе мозги

    this.rotation = angle - Math.PI / 1.15;
    // this.rotation = angle - Math.PI / 1.15;

    this.tool.validate();
  }

  onDeleteUp() {
    this.dispose();

    this.tool.validate();
  }

  onMouseDown(event, setDragTarget = false) {
    this.planner.disableCameraDragging();

    // нужно, чтобы не драгать при клике на иконку
    if (setDragTarget || event.target === this) {
      this.tool.setDragTarget(this);
    }
  }

  onMouseUp() {
    this.tool.removeDragTarget();
    this.planner.enableCameraDragging();

    this.rotationStartingPoint = null;

    this.rotateIcon.visible = false;
    this.deleteIcon.visible = false;
  }

  onMouseEnter() {
    this.rotateIcon.visible = true;
    this.deleteIcon.visible = true;
  }

  onMouseLeave() {
    if (this.rotationStartingPoint) {
      return;
    }

    this.rotateIcon.visible = false;
    this.deleteIcon.visible = false;
  }

  toJSON() {
    return {
      type: this.type,
      rotation: this.rotation,
      position: { x: this.position.x, y: this.position.y }
    };
  }
}

export default Furniture;
