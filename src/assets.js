import { Assets as PixiAssets } from 'pixi.js';
import { furnitureList } from './furniture/list.js';

export const ASSETS_PATH = './assets';

class Assets {
  files = {
    grid: `${ ASSETS_PATH }/textures/grid.png`,
    bunny: `${ ASSETS_PATH }/textures/bunny.png`,

    rotateIcon: `${ ASSETS_PATH }/icons/rotate.png`,
    deleteIcon: `${ ASSETS_PATH }/icons/delete.png`,
  };

  textures = { };

  constructor(planner) {
    this.planner = planner;

    Object.keys(furnitureList).forEach(key => {
      this.files[key] = furnitureList[key].textureUrl;
    });
  }

  async load() {
    const promises = [];

    Object.keys(this.files).forEach(key => {
      const promise = PixiAssets.load(this.files[key]);

      promise.then((texture) => {
        this.textures[key] = texture;
      });

      promises.push(promise);
    });

    return Promise.all(promises);
  }
}

export default Assets;
