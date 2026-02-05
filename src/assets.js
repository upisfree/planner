import { Assets as PixiAssets } from 'pixi.js';
import { GLTFLoader } from 'three/addons';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { furnitureList } from './furniture/list.js';

export const ASSETS_PATH = './assets';

class Assets {
  files2D = {
    rotateIcon: `${ ASSETS_PATH }/icons/rotate.png`,
    deleteIcon: `${ ASSETS_PATH }/icons/delete.png`,
  };

  textures2D = { };

  modelPath = `${ ASSETS_PATH }/models/objects_uastc.glb`;
  model = null;

  constructor(planner) {
    this.planner = planner;

    Object.keys(furnitureList).forEach(key => {
      this.files2D[key] = furnitureList[key].textureUrl;
    });

    this.ktx2Loader = new KTX2Loader();
    this.ktx2Loader.setTranscoderPath('./lib/basis/');
    this.ktx2Loader.detectSupport(planner.renderer);
    this.ktx2Loader.setWorkerLimit(4);

    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setKTX2Loader(this.ktx2Loader);
    this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  }

  async load() {
    const promises = [];

    Object.keys(this.files2D).forEach(key => {
      const promise = PixiAssets.load(this.files2D[key]);

      promise.then((texture) => {
        this.textures2D[key] = texture;
      });

      promises.push(promise);
    });

    promises.push(
      this.loadModel()
    );

    return Promise.all(promises);
  }

  async loadModel() {
    const gltf = await this.gltfLoader.loadAsync(this.modelPath);
    this.model = gltf.scene;
  }
}

export default Assets;
