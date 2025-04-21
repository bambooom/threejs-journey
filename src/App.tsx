import { Suspense, useMemo, useRef, useEffect } from 'react';
import routes from '~react-pages';
import { useRoutes } from 'react-router-dom';
import './App.css';
import { enhanceRoutes } from './wrappers/RouteWrapper';
import { threeManager } from './utils/ThreeManager';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      threeManager.initRenderer(canvasRef.current);
    }
  }, []);

  // 使用useMemo缓存增强后的路由，避免每次渲染都重新处理
  const enhancedRoutes = useMemo(() => enhanceRoutes(routes), [routes]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <Suspense fallback={<p>Loading...</p>}>
        {useRoutes(enhancedRoutes)}
      </Suspense>
    </>
  );
}

export default App;
