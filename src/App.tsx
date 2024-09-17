import { Suspense } from 'react';
import routes from '~react-pages';
import { useRoutes } from 'react-router-dom';
// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg'; // under public folder
import './App.css';

function App() {
  return <Suspense fallback={<p>Loading...</p>}>{useRoutes(routes)}</Suspense>;
}

// function App() {
//   // const [count, setCount] = useState(0);

//   return (
//     <>
//       {/* <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/landing" element={<Landing />} />
//           <Route path="/about" element={<About />} />
//       </Routes> */}
//       <div>
//         <a href="https://vitejs.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   );
// }

export default App;
