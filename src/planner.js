import { Application, Graphics, Sprite, TilingSprite } from 'pixi.js';
import { initDevtools } from '@pixi/devtools';
import { Viewport } from 'pixi-viewport';
import Assets from './assets.js';
import WallTool from './tools/wall.js';
import FurnitureTool from './tools/furniture.js';
import Furniture from './furniture/furniture.js';
import { furnitureList } from './furniture/list.js';
import spawnFurnitureList from './furniture/spawn-list.js';

const BACKGROUND_COLOR = '#e5e6e8';

// сколько нужно pixi.js units чтобы получить один метр
export const METER = 100;

class Planner {
  div2d = null;
  div2dBounds = null;

  app = null;
  viewport = null;

  // 50 метров
  worldSize = 50 * METER;

  isDragging = false;

  wallTool = null;
  furnitureTool = null;

  constructor(div2d) {
    this.div2d = div2d;

    this.assets = new Assets(this);
    this.assets
      .load()
      .then(this.onLoad.bind(this));

    window.addEventListener('resize', this.resize.bind(this));
    this.disablePinchToZoomGestureInChrome();

    // tmp dev
    window.addEventListener('keyup', (event) => {
      const key = event.code;

      if (key === 'Escape') {
        this.enableFurnitureTool();
      }

      if (key === 'Digit1') {
        this.enableWallTool();
      }
    });
  }

  async onLoad() {
    await this.init2D();

    // init tools
    this.wallTool = new WallTool(this);
    this.furnitureTool = new FurnitureTool(this);

    // TODO: переделать это в реакте
    spawnFurnitureList(this);
  }

  async init2D() {
    this.app = new Application();

    await this.app.init({
      antialias: true,
      background: BACKGROUND_COLOR,
      resolution: window.devicePixelRatio,
      resizeTo: this.div2d
    });
    this.div2d.appendChild(this.app.canvas);

    await initDevtools({ app: this.app });

    // pixi's camera controls (movement, zoom)
    this.viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: this.worldSize,
      worldHeight: this.worldSize,
      events: this.app.renderer.events, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    });

    this.app.stage.addChild(this.viewport);

    // у этого плагина багованные опции, которые противоречат друг другу
    this.viewport
      .drag({
        pressDrag: true
      })
      .pinch()
      .wheel({
        // zoom speed
        percent: 5
      })
      // .decelerate()
      .clamp({
        left: -this.worldSize,
        right: this.worldSize,
        top: -this.worldSize,
        bottom: this.worldSize
      })
      .clampZoom({
        minScale: 0.5,
        maxScale: 2.5,
      });

    this.viewport.addEventListener('drag-start', this.onDragStart.bind(this));
    this.viewport.addEventListener('drag-end', this.onDragEnd.bind(this));

    // enable interactivity!
    this.app.stage.eventMode = 'static';

    // make sure the whole canvas area is interactive
    this.app.stage.hitArea = this.app.screen;

    this.app.ticker.add(this.update.bind(this));

    this.initGrid();
  }

  update(time) {

  }

  resize() {
    this.div2dBounds = this.div2d.getBoundingClientRect();

    this.viewport.resize(this.div2dBounds.width, this.div2dBounds.height, this.worldSize, this.worldSize);
  }

  onDragStart() {
    this.isDragging = true;
  }

  onDragEnd() {
    this.isDragging = false;
  }

  // это настолько грязный хак, что я просто в совершенном ахуе
  // но никакие другие методы не сработали
  // https://stackoverflow.com/a/61133028
  disablePinchToZoomGestureInChrome() {
    this.div2d.addEventListener('wheel', event => {
      const { ctrlKey } = event

      if (ctrlKey) {
        event.preventDefault();

        return;
      }
    }, { passive: false });
  }

  enableCameraDragging() {
    this.viewport.interactive = true;
  }

  disableCameraDragging() {
    this.viewport.interactive = false;
  }

  enableWallTool() {
    this.wallTool.enable();
    this.furnitureTool.disable();
  }

  enableFurnitureTool() {
    this.wallTool.disable();
    this.furnitureTool.enable();
  }

  initGrid() {
    const options = {
      color: 0x000000,
      alpha: 0.15,
      pixelLine: true
    };

    const grid = new Graphics();
    const size = this.worldSize;
    const count = size / METER;

    for (let i = 0; i < count * 2; i++) {
      const j = -size + i * METER;

      // vertical
      grid.moveTo(-size, j)
        .lineTo(size, j)
        .stroke(options);

      // horizontal
      grid.moveTo(j, -size)
        .lineTo(j, size)
        .stroke(options);
    }

    this.viewport.addChild(grid);
  }
}

export default Planner;
