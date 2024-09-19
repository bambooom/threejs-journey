import * as THREE from "three";
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import EventEmitter from "./EventEmitter";
import { Source } from "../sources";

// handles asset loading in one place
export default class Resources extends EventEmitter {
  sources: Source[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	items: any;
	toLoad: number;
	loaded: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loaders?: any;

  constructor(sources: Source[]) {
    super();

    // Options
    this.sources = sources;

    // Setup
    this.items = {}; // loaded resources {name, file}
    this.toLoad = this.sources.length; // number of resources to load
    this.loaded = 0; // the number of loaded resources

    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.loaders = {
      gltfLoader: new GLTFLoader(),
      textuerLoader: new THREE.TextureLoader(),
      cubeTextureLoader: new THREE.CubeTextureLoader(),
    };
  }

  startLoading() {
    for (const source of this.sources) {
      switch (source.type) {
        case 'gltfModel':
          this.loaders.gltfLoader.load(source.path, (file: GLTF) => {
            this.sourceLoaded(source, file);
          });
          break;
        case 'texture':
          this.loaders.textuerLoader.load(source.path, (file: THREE.Texture) => {
            this.sourceLoaded(source, file);
          });
          break;
        case 'cubeTexture':
          this.loaders.cubeTextureLoader.load(source.path, (file: THREE.CubeTexture) => {
            this.sourceLoaded(source, file);
          });
          break;
      }
    }
  }

  sourceLoaded(source: Source, file: GLTF | THREE.Texture | THREE.CubeTexture) {
    this.items[source.name] = file;
    this.loaded++;

    if (this.loaded === this.toLoad) {
      this.trigger('ready');
    }
  }
}
