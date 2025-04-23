import * as THREE from 'three';

interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SceneData {
  id: string;
  scene: THREE.Scene;
  camera: THREE.Camera;
  animate: () => void;
  viewport: Viewport;
}

class ThreeManager {
  private static instance: ThreeManager;
  private renderer: THREE.WebGLRenderer | null = null;
  private scenes: Map<string, SceneData> = new Map();
  private isAnimating = false;
  private canvas: HTMLCanvasElement | null = null;

  private constructor() {
    this.animate = this.animate.bind(this);
  }

  static getInstance(): ThreeManager {
    if (!ThreeManager.instance) {
      ThreeManager.instance = new ThreeManager();
    }
    return ThreeManager.instance;
  }

  initRenderer(canvas: HTMLCanvasElement) {
    if (!this.renderer) {
      this.canvas = canvas;
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.autoClear = false;

      window.addEventListener('resize', this.handleResize.bind(this));
      this.startAnimation();
    }
    return this.renderer;
  }

  private handleResize() {
    if (!this.renderer || !this.canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scenes.forEach(({ camera, viewport }) => {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = viewport.width / viewport.height;
        camera.updateProjectionMatrix();
      }
    });
  }

  addScene(
    id: string,
    scene: THREE.Scene,
    camera: THREE.Camera,
    animate: () => void,
    viewport: Viewport
  ) {
    if (!viewport || typeof viewport.x !== 'number' || typeof viewport.y !== 'number' ||
        typeof viewport.width !== 'number' || typeof viewport.height !== 'number') {
      console.error('Invalid viewport provided for scene:', id);
      return;
    }

    this.scenes.set(id, { id, scene, camera, animate, viewport });
    if (!this.isAnimating) {
      this.startAnimation();
    }
  }

  removeScene(id: string) {
    this.scenes.delete(id);
    if (this.scenes.size === 0) {
      this.stopAnimation();
    }
  }

  private startAnimation() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }

  private stopAnimation() {
    this.isAnimating = false;
  }

  updateSceneViewport(sceneId: string, viewport: Viewport) {
    const sceneData = this.scenes.get(sceneId);
    if (sceneData) {
      sceneData.viewport = viewport;
    }
  }

  private animate() {
    if (!this.isAnimating || !this.renderer) return;

    requestAnimationFrame(this.animate);

    // 清除整个画布
    this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    this.renderer.clear();

    // 将Map转换为数组并按z-index排序
    const sortedScenes = Array.from(this.scenes.entries()).sort(([idA], [idB]) => {
      const zIndexA = idA.startsWith('lessonIcon') ? 2 : 1;
      const zIndexB = idB.startsWith('lessonIcon') ? 2 : 1;
      return zIndexA - zIndexB;
    });

    // 渲染每个场景到其指定的视口
    sortedScenes.forEach(([, sceneData]) => {
      const { scene, camera, animate, viewport } = sceneData;
      if (!viewport) return;

      animate();

      // 设置视口并渲染
      this.renderer!.setViewport(
        viewport.x,
        window.innerHeight - (viewport.y - window.scrollY) - viewport.height,
        viewport.width,
        viewport.height
      );
      this.renderer!.setScissor(
        viewport.x,
        window.innerHeight - (viewport.y - window.scrollY) - viewport.height,
        viewport.width,
        viewport.height
      );
      this.renderer!.setScissorTest(true);
      this.renderer!.render(scene, camera);
    });
  }
}

export const threeManager = ThreeManager.getInstance();
