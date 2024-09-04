import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Experience from "./Experience";

export default class Camera {
  constructor(experience) {
    // camera need to have access to canvas, sizes,
    // so need to access Experience class
    // one solution is global access from window if it's added to window, but not a good practice
    // this.experience = window.experience

    // second solution is passing experience to constructor as parameter
    // this.experience = experience;
    // and this.camera = new Camera(this) when creatingg

    // third solution is using singleton
    this.experience = new Experience(); // get singleton instance
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    this.setInstance();
    this.setOrbitControls();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.instance.position.set(6, 4, 8);
    this.scene.add(this.instance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}
