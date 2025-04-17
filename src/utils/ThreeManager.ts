import * as THREE from 'three';

class ThreeManager {
  private static instance: ThreeManager;
  private renderer: THREE.WebGLRenderer | null = null;
  private scenes: Map<string, THREE.Scene> = new Map();
  private cameras: Map<string, THREE.PerspectiveCamera> = new Map();
  private animationCallbacks: Map<string, () => void> = new Map();
  private isAnimating = false;

  private constructor() {}

  static getInstance(): ThreeManager {
    if (!ThreeManager.instance) {
      ThreeManager.instance = new ThreeManager();
    }
    return ThreeManager.instance;
  }

  initRenderer(canvas: HTMLCanvasElement) {
    if (!this.renderer) {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      this.startAnimation();
    }
    return this.renderer;
  }

  addScene(id: string, scene: THREE.Scene, camera: THREE.PerspectiveCamera, animationCallback?: () => void) {
    this.scenes.set(id, scene);
    this.cameras.set(id, camera);
    if (animationCallback) {
      this.animationCallbacks.set(id, animationCallback);
    }
  }

  removeScene(id: string) {
    const scene = this.scenes.get(id);
    if (scene) {
      // 清理场景中的资源
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
    this.scenes.delete(id);
    this.cameras.delete(id);
    this.animationCallbacks.delete(id);
  }

  private startAnimation() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const animate = () => {
      if (!this.renderer || this.scenes.size === 0) {
        this.isAnimating = false;
        return;
      }

      // 执行每个场景的动画回调
      this.animationCallbacks.forEach((callback) => callback());

      // 渲染所有场景
      this.scenes.forEach((scene, id) => {
        const camera = this.cameras.get(id);
        if (camera && this.renderer) {
          this.renderer.render(scene, camera);
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  handleResize(width: number, height: number) {
    if (this.renderer) {
      this.renderer.setSize(width, height, false);
      this.cameras.forEach(camera => {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      });
    }
  }

  dispose() {
    this.scenes.clear();
    this.cameras.clear();
    this.animationCallbacks.clear();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.isAnimating = false;
  }
}

export const threeManager = ThreeManager.getInstance();