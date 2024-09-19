import * as THREE from "three";
import Experience from "../index";
import Environment from "./Environment";
import Floor from "./Floor";
import Fox from "./Fox";
import Resources from "../utils/Resources";

export default class World {
  experience: Experience;
	scene: THREE.Scene;
	resources: Resources;
	environment?: Environment;
	floor?: Floor;
  fox?: Fox;

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene!;
    this.resources = this.experience.resources!;

    this.resources.on('ready', () => {
      // when resources are loaded and ready
      // Setup
      this.floor = new Floor();
      this.fox = new Fox();
      this.environment = new Environment();
    });
  }

  update() {
    if (this.fox) {
      this.fox.update();
    }
  }
}
