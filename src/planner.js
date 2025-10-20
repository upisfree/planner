import { Application, Sprite, TilingSprite } from 'pixi.js';
import { initDevtools } from '@pixi/devtools';
import { Viewport } from 'pixi-viewport';
import Assets from './assets.js';
import WallTool from './tools/wall.js';
import FurnitureTool from './tools/furniture.js';
import Furniture from './furniture/furniture.js';
import { furnitureList } from './furniture/list.js';

const BACKGROUND_COLOR = '#e5e6e8';

class Planner {
  div2d = null;
  div2dBounds = null;

  app = null;
  viewport = null;

  worldSize = 5000;

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
    window.addEventListener('keypress', (event) => {
      const key = event.code;

      if (key === 'Digit1') {
        this.wallTool.disable();
        this.furnitureTool.enable();
      }

      if (key === 'Digit2') {
        this.wallTool.enable();
        this.furnitureTool.disable();
      }
    });
  }

  async onLoad() {
    await this.init2D();

    // init tools
    this.wallTool = new WallTool(this);
    this.furnitureTool = new FurnitureTool(this);

    // TODO: tmp
    const fur = new Furniture(this, 'fitting-room');
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


    // test bunny
    for (let i = 0; i < 25; i++) {
      const bunny = new Sprite(this.assets.textures.bunny);

      bunny.x = (i % 5) * 40;
      bunny.y = Math.floor(i / 5) * 40;
      this.viewport.addChild(bunny);
    }

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

  // TODO?: https://pixijs.com/8.x/guides/components/scene-objects/graphics/graphics-pixel-line
  initGrid() {
    const grid = new TilingSprite({
      texture: this.assets.textures.grid,
      width: this.worldSize * 2,
      height: this.worldSize * 2,
      tileScale: 0.5,
      roundPixels: true,
      applyAnchorToTexture: true
    });

    grid.x = -this.worldSize;
    grid.y = -this.worldSize;
    grid.alpha = 0.15;

    this.viewport.addChild(grid);
  }
}

export default Planner;
