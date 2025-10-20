import { Graphics, Point, RenderLayer } from 'pixi.js';
import pointScreenToWorld from '../utils/screen-to-world.js';

// инструмент создания стен
class WallTool {
  isEnabled = false;

  points = [];
  pointsSprites = new Map(); // Map<Point, PointSprite>
  spritesPoints = new Map(); // Map<PointSprite, Point>
  wallPoints = new Map(); // Map<WallSprite, [Point, Point]>

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

    this.disable();
  }

  enable() {
    this.isEnabled = true;

    this.cursorSprite.visible = true;
    this.cursorWall.visible = true;
  }

  disable() {
    this.isEnabled = false;

    this.cursorSprite.visible = false;
    this.cursorWall.visible = false;
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

    this.viewport.addChild(wall);
    this.wallsLayer.attach(wall);

    // TODO: включать стены в события после прекращения рисования стен!
    wall.eventMode = 'none';

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

    // включаем клик по точке
    pointSprite.eventMode = 'static';
    pointSprite.cursor = 'pointer';
    pointSprite.on('pointerdown', this.onPointMouseDown.bind(this));
    pointSprite.on('pointerup', this.onPointMouseUp.bind(this));

    this.pointsSprites.set(point, pointSprite);
    this.spritesPoints.set(pointSprite, point);

  }

  updateWallDrawing(event) {
    const lastPoint = this.points.at(-1);
    const worldPoint = pointScreenToWorld(event.global, this.viewport);

    // обновляем фейковую точку-курсор
    this.cursorSprite.position.copyFrom(worldPoint);

    // еще нет первой точки
    if (!lastPoint) {
      return;
    }

    // обновляем фейковую стену-курсор
    this.cursorWall
      // тут может лагать. если будет, то можно заебаться ебаться с поворотом и скейлом стены
      .clear()
      .moveTo(lastPoint.x, lastPoint.y)
      .lineTo(worldPoint.x, worldPoint.y)
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
    const point = this.spritesPoints.get(this.pointDragTarget).copyFrom(worldPoint);

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
  }

  endDraw(point) {
    this.addWall(
      this.points.at(-1),
      point
    );

    this.disable();
  }

  onClick(event) {
    if (!this.isEnabled) {
      return;
    }

    // там внутри пикси переиспользуется какой-то объект, поэтому копируем
    this.addPoint(event.world.clone());
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
    this.planner.enableCameraDragging();

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
}

export default WallTool;
