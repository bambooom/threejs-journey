import * as THREE from "three";
import GUI from 'lil-gui'
import Experience from "../index";
import Debug from "../utils/Debug";
import Resources from "../utils/Resources";
import Time from "../utils/Time";

export default class Fox {
  experience: Experience;
	scene: THREE.Scene;
	resources: Resources;
	model?: THREE.Group;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	resource: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	animation: any = {};
	time?: Time;
	debug?: Debug;
  debugFolder?: GUI;

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene!;
    this.resources = this.experience.resources!;
    this.resource = this.resources.items.foxModel;
    this.time = this.experience.time;
    this.debug = this.experience.debug

    // Debug
    if (this.debug!.active) {
      this.debugFolder = this.debug!.ui!.addFolder('fox');
    }

    // Setup
    this.setModel();
    this.setAnimation();
  }

  setModel() {
    this.model = this.resource.scene;

    this.model!.scale.set(0.025, 0.025, 0.025);
    this.scene.add(this.model!);

    // enabke shadow
    this.model!.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });
  }

  setAnimation() {
    this.animation = {
      mixer: new THREE.AnimationMixer(this.model!),
    };
    this.animation.actions = {
      idle: this.animation.mixer.clipAction(this.resource.animations[0]),
      walking: this.animation.mixer.clipAction(this.resource.animations[1]),
      running: this.animation.mixer.clipAction(this.resource.animations[2]),
    };

    this.animation.actions.current = this.animation.actions.idle;
    this.animation.actions.current.play();

    this.animation.play = (name: string) => {
      const newAction = this.animation.actions[name];
      const oldAction = this.animation.actions.current;

      newAction.reset();
      newAction.play();
      newAction.crossFadeFrom(oldAction, 1); // needs to be called on the incoming action, with the previous action as the first parameter and the duration of the transition (in seconds) as the second parameter

      this.animation.actions.current = newAction;
    };

    // Debug
    if (this.debug!.active) {
      const debugObject = {
        playIdle: () => {
          this.animation.play('idle');
        },
        playWalking: () => {
          this.animation.play('walking');
        },
        playRunning: () => {
          this.animation.play('running');
        },
      };
      this.debugFolder!.add(debugObject, 'playIdle');
      this.debugFolder!.add(debugObject, 'playWalking');
      this.debugFolder!.add(debugObject, 'playRunning');
    }
  }

  update() {
    this.animation.mixer.update(this.time!.delta * 0.001);
  }
}
