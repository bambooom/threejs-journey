import * as THREE from 'three';

export interface Lesson {
  id: string;
  title: string;
  path: string;
}

export interface Chapter {
  id: string;
  title: string;
  path: string;
  lessons: Lesson[];
}

export interface IconScene {
  id: string;
  scene: THREE.Scene;
  camera: THREE.Camera;
  animate: () => void;
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface IconCanvasContextType {
  addScene: (scene: IconScene) => void;
  removeScene: (id: string) => void;
  updateSceneViewport: (id: string, viewport: IconScene['viewport']) => void;
}
