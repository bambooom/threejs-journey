import { FC, useEffect, useRef } from 'react';
import { threeManager } from '../utils/ThreeManager';

const SharedCanvas: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // const renderer = threeManager.initRenderer(canvasRef.current);

    const handleResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      threeManager.handleResize(width, height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ display: 'block' }}
    />
  );
};

export default SharedCanvas;
