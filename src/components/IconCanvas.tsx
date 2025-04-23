import { FC, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { IconScene } from '../types';
import { IconCanvasProvider } from '../contexts/IconCanvasContext';

const IconCanvas: FC<{ children: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const scenesRef = useRef<Map<string, IconScene>>(new Map());
  const frameRef = useRef<number>(0);

  const contextValue = useMemo(() => ({
    addScene: (sceneData: IconScene) => {
      scenesRef.current.set(sceneData.id, sceneData);
    },
    removeScene: (id: string) => {
      scenesRef.current.delete(id);
    },
    updateSceneViewport: (id: string, viewport: IconScene['viewport']) => {
      const scene = scenesRef.current.get(id);
      if (scene) {
        scene.viewport = viewport;
      }
    }
  }), []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (!renderer) return;

      renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
      renderer.clear();

      const scrollY = window.scrollY;

      scenesRef.current.forEach((sceneData) => {
        const { scene, camera, animate: animateScene, viewport } = sceneData;

        animateScene();

        // need to viewport.y - scrollY to calculate the correct position of the icon
        const viewportY = window.innerHeight - (viewport.y - scrollY) - viewport.height;

        const isVisible =
          viewport.x < window.innerWidth &&
          viewportY < window.innerHeight &&
          viewport.x + viewport.width > 0 &&
          viewportY + viewport.height > 0;

        if (isVisible) {
          renderer.setViewport(viewport.x, viewportY, viewport.width, viewport.height);
          renderer.setScissor(viewport.x, viewportY, viewport.width, viewport.height);
          renderer.setScissorTest(true);
          renderer.render(scene, camera);
        }
      });
    };

    animate();

    const handleResize = () => {
      if (!renderer) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <IconCanvasProvider value={contextValue}>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-2"
      />
      {children}
    </IconCanvasProvider>
  );
};

export default IconCanvas;
