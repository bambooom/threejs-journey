import { Suspense, useMemo } from 'react';
import routes from '~react-pages';
import { useRoutes } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import './App.css';
import { enhanceRoutes } from './wrappers/RouteWrapper';

function App() {
  const enhancedRoutes = useMemo(() => enhanceRoutes(routes), [routes]);

  return (
    <>
      <Suspense fallback={<p>Loading...</p>}>
        {useRoutes(enhancedRoutes)}
      </Suspense>
      <Analytics />
    </>
  );
}

export default App;
