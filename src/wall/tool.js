import { Graphics, Point, Rectangle, RenderLayer } from 'pixi.js';
import pointScreenToWorld from '../utils/screen-to-world.js';
import WallMeterage from './meterage.js';
import { WALL_POSITION_STEP, WALL_ROTATION_STEP } from '../config.js';
import SAT from 'sat';

function snapToAngle(dx, dy) {
  const angle = Math.atan2(dy, dx);

  return Math.round(angle / WALL_ROTATION_STEP) * WALL_ROTATION_STEP;
}

function getSnappedEnd(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  const angle = snapToAngle(dx, dy);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steppedDist = Math.floor(dist / WALL_POSITION_STEP) * WALL_POSITION_STEP;

  const x = x1 + Math.cos(angle) * steppedDist;
  const y = y1 + Math.sin(angle) * steppedDist;

  return {
    x,
    y
  };
}

let _lastSnappedPoint = null;

// инструмент создания стен
class WallTool {
  isEnabled = false;

  points = [];
  pointsSprites = new Map(); // Map<Point, PointSprite>
  spritesPoints = new Map(); // Map<PointSprite, Point>
  wallPoints = new Map(); // Map<WallSprite, [Point, Point]>
  wallsPolygons = [];

  pointSprite = null;

  wallWidth = 7;

  wallsLayer = null;
  pointsLayer = null;

  cursorSprite = null;
  cursorWall = null;

  // текущая перетаскиваемая точка
  pointDragTarget = null;

  constructor(planner) {
    this.planner = planner;
    this.viewport = planner.viewport;

    const { stage } = planner.app;

    // чтобы всё рисовалось в правильном порядке
    this.wallsLayer = new RenderLayer();
    this.pointsLayer = new RenderLayer();

    stage.addChild(this.wallsLayer);
    stage.addChild(this.pointsLayer);

    this.initPointSprite();
    this.cursorWall = this.addWall(new Point(), new Point());
    // чтобы кликать по настоящей точке, а не по курсорной
    this.cursorWall.eventMode = 'none';

    this.viewport.addEventListener('clicked', this.onClick.bind(this));
    stage.addEventListener('pointermove', this.onMouseMove.bind(this));

    this.meterage = new WallMeterage(this);

    this.disable();
  }

  enable() {
    this.isEnabled = true;

    this.cursorSprite.visible = true;
    this.cursorWall.visible = true;
    this.meterage.enable();

    this.disableWallsEvents();
    this.disablePointsEvents();
  }

  disable() {
    this.isEnabled = false;

    this.cursorSprite.visible = false;
    this.cursorWall.visible = false;
    this.meterage.disable();

    _lastSnappedPoint = null;

    this.enableWallsEvents();
    this.enablePointsEvents();
  }

  initPointSprite() {
    this.pointSprite = new Graphics()
      .circle(0, 0, 8)
      .fill({ color: 0xffffff })
      .stroke({ color: 0x111111, alpha: 0.87, width: 1 });

    this.pointsLayer.attach(this.pointSprite);

    this.cursorSprite = this.pointSprite;
    this.cursorSprite.eventMode = 'none';
    this.viewport.addChild(this.cursorSprite);
    this.pointsLayer.attach(this.cursorSprite);
  }

  addWall(point1, point2) {
    const wall = new Graphics()
      .setStrokeStyle({
        width: this.wallWidth,
        color: 0x000000
      })
      .setFillStyle({
        color: 0x000000
      })
      .moveTo(point1.x, point1.y)
      .lineTo(point2.x, point2.y)
      .stroke();

    // события ховера по стене
    wall.on('pointerenter', this.onWallMouseEnter.bind(this, point1, point2));
    wall.on('pointerleave', this.onWallMouseLeave.bind(this, point1, point2));
    wall.cursor = 'pointer';

    this.viewport.addChild(wall);
    this.wallsLayer.attach(wall);

    this.wallPoints.set(wall, [point1, point2]);

    return wall;
  }

  addPoint(point) {
    this.points.push(point);

    // добавляем стену, если точек больше одной
    if (this.points.length >= 2) {
      this.addWall(
        this.points.at(-2),
        this.points.at(-1),
      );
    }

    // добавляем спрайт точки
    const pointSprite = this.pointSprite.clone();
    pointSprite.position.copyFrom(point);
    this.viewport.addChild(pointSprite);
    this.pointsLayer.attach(pointSprite);

    const hitAreaSize = 35;

    // включаем клик по точке
    pointSprite.eventMode = 'static';
    pointSprite.cursor = 'pointer';
    pointSprite.on('pointerdown', this.onPointMouseDown.bind(this));
    pointSprite.on('pointerupoutside', this.onPointMouseUp.bind(this));
    pointSprite.on('pointerup', this.onPointMouseUp.bind(this));
    pointSprite.on('pointerenter', this.onPointMouseEnter.bind(this));
    pointSprite.on('pointerleave', this.onPointMouseLeave.bind(this));
    // чтобы область клика была больше и не было случайного нажатия на стены
    pointSprite.hitArea = new Rectangle(-hitAreaSize / 2, -hitAreaSize / 2, hitAreaSize, hitAreaSize);

    this.pointsSprites.set(point, pointSprite);
    this.spritesPoints.set(pointSprite, point);
  }

  updateWallDrawing(event) {
    const lastPoint = this.points.at(-1);
    const mousePoint = pointScreenToWorld(event.global, this.viewport);

    // еще нет первой точки
    if (!lastPoint) {
      // обновляем фейковую точку-курсор
      this.cursorSprite.position.copyFrom(mousePoint);

      return;
    }

    this.meterage.enable();

    const end = getSnappedEnd(lastPoint.x, lastPoint.y, mousePoint.x, mousePoint.y);

    this.cursorSprite.position.copyFrom(end);
    _lastSnappedPoint = new Point().copyFrom(end);
    this.meterage.update(lastPoint, end);

    // обновляем фейковую стену-курсор
    this.cursorWall
      .clear()
      .moveTo(lastPoint.x, lastPoint.y)
      .lineTo(end.x, end.y)
      .stroke();
  }

  updatePointDragging(event) {
    if (!this.pointDragTarget) {
      return;
    }

    const worldPoint = pointScreenToWorld(event.global, this.viewport);

    // обновляем спрайт таскаемой точки
    this.pointDragTarget.position.copyFrom(worldPoint);
    // обновляем точку в массиве
    const point = this.spritesPoints.get(this.pointDragTarget);
    point.copyFrom(worldPoint);

    this.updateWallsFromPoints();
  }

  updateWallsFromPoints() {
    this.wallPoints.keys().forEach(wall => {
      this.viewport.removeChild(wall);
    });

    this.wallPoints.clear();

    for (let i = 0; i < this.points.length; i++) {
      const point1 = this.points[i];
      let point2 = this.points[i + 1];

      if (!point2) {
        point2 = this.points[0];
      }

      this.addWall(point1, point2);
    }

    this.updateWallsPolygons();
  }

  updateWallsPolygons() {
    this.wallsPolygons = [];

    this.wallPoints.values().forEach(points => {
      const point1 = points[0];
      const point2 = points[1];

      this.wallsPolygons.push(
        new SAT.Polygon(
          new SAT.Vector(),
          [
            new SAT.Vector(point1.x, point1.y),
            new SAT.Vector(point2.x, point2.y)
          ]
        )
      );
    });
  }

  endDraw(point) {
    this.addWall(
      this.points.at(-1),
      point
    );

    this.updateWallsFromPoints();

    this.disable();
  }

  enableWallsEvents() {
    this.wallPoints.keys().forEach(wall => {
      wall.eventMode = 'static';
      wall.cursor = 'pointer';
    });
  }

  disableWallsEvents() {
    this.wallPoints.keys().forEach(wall => {
      wall.eventMode = 'none';
    });
  }

  enablePointsEvents() {
    this.pointsSprites.keys().forEach(sprite => {
      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';
    });
  }

  disablePointsEvents() {
    this.pointsSprites.keys().forEach(sprite => {
      sprite.eventMode = 'none';
    });
  }

  onClick(event) {
    if (!this.isEnabled) {
      return;
    }

    let point = _lastSnappedPoint;

    // если еще не было первого клика
    if (!_lastSnappedPoint) {
      // там внутри пикси переиспользуется какой-то объект, поэтому копируем
      point = event.world.clone();
    }

    this.addPoint(point);
  }

  onMouseMove(event) {
    // тут таскание точки
    if (!this.isEnabled && this.pointDragTarget) {
      this.updatePointDragging(event);
    }

    // тут рисование новой стены
    if (this.isEnabled) {
      this.updateWallDrawing(event);
    }
  }

  onPointMouseDown(event) {
    // не даем таскать точки в режиме рисования
    if (this.isEnabled) {
      return;
    }

    // отключаем перемещение камеры, пока таскаем точку
    this.planner.disableCameraDragging();

    this.pointDragTarget = event.currentTarget;
  }

  onPointMouseUp(event) {
    const worldPoint = pointScreenToWorld(event.global, this.viewport);

    // если включен режим рисования, то при нажатии на другую точку заканчиваем рисование
    if (this.isEnabled) {
      this.endDraw(worldPoint);
    } else {
      if (this.pointDragTarget) {
        this.pointDragTarget = null;
        // включаем таскание обратно
        this.planner.enableCameraDragging();
      }
    }
  }

  // при ховере на точку отключаем события стен, чтобы они не мешали нам при перетаскивании точки
  onPointMouseEnter() {
    this.disableWallsEvents();
  }

  onPointMouseLeave() {
    this.enableWallsEvents();
  }

  onWallMouseEnter(point1, point2, event) {
    // фейковый ховер, который возникает при рисовании стены. не могу отловить причину этого фейкового ховера
    if (point1.x === 0 && point1.y === 0 && point2.x === 0 && point2.y === 0) {
      return;
    }

    this.meterage.enable();
    this.meterage.update(point1, point2);
  }

  onWallMouseLeave(event) {
    this.meterage.disable();
  }
}

export default WallTool;
