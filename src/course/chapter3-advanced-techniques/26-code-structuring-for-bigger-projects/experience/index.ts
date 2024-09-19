import * as THREE from 'three'

import Sizes from "./utils/Sizes"
import Time from "./utils/Time"
import Camera from './Camera';
import Renderer from './Renderer';
import World from './world/World.js';
import Resources from './utils/Resources';
import sources from './sources';
import Debug from './utils/Debug';

declare global {
	interface Window {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		experience: any;
	}
}

let instance: Experience;

export default class Experience {
  debug?: Debug;
	canvas?: HTMLElement;
	sizes?: Sizes;
	time?: Time;
	scene?: THREE.Scene;
	resources?: Resources;
	camera?: Camera;
	renderer?: Renderer;
	world?: World;

  /**
   * Constructor for Experience class.
   * @param {HTMLCanvasElement} canvas - The canvas element to render to.
   */
  constructor(canvas: HTMLElement | null = null) {
    // Global access from window
    // window.experience = this // can expose this to window, but not very good idea
    // window.experience = instance // if using singleton, need to ref instance if testing in window

    if (instance) {
      return instance; // return already existing instance
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    instance = this; // Singleton, only instanciate once

    /**
		 * Global reference to the experience, not recommended, but useful when debugging
		 */
		window.experience = this;

    // Options
    this.canvas = canvas!;

    // Setup
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    // Sizes resize event
    this.sizes.on('resize', () => {
      // arrow function to avoid loose context this
      this.resize();
    });
    // Time tick event
    this.time.on('tick', () => {
      this.update();
    });
  }

  resize() {
    this.camera!.resize();
    this.renderer!.resize();
  }

  update() {
    this.camera!.update();
    this.world!.update();
    this.renderer!.update();
  }

  // complex project may need a destroy method for each class
  destroy() {
    this.sizes!.off('resize');
    this.time!.off('tick');

    // Traverse the whole scene
    this.scene!.traverse((child) => {
      // Test if it's a mesh
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        // Loop through the material properties
        for (const key in child.material) {
          const value = child.material[key];

          // Test if there is a dispose function
          if (value && typeof value.dispose === 'function') {
            value.dispose();
          }
        }
      }
    });

    this.camera!.controls?.dispose();
    this.renderer!.instance?.dispose();

    if (this.debug?.active) this.debug.ui!.destroy();
  }
}
