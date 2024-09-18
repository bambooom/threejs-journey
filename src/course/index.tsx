import { type FC } from 'react';
import { Link } from 'react-router-dom';

const Page: FC = () => {
  return (
    <>
      <div>Chapter 1: Basics</div>
      <ul>
        <li>
          <Link to="/chapter1-basics/03-first-threejs-project">
            03 First Three.js Project
          </Link>
        </li>
        <li>
          <Link to="/chapter1-basics/04-transform-objects">
            04 Transform Objects
          </Link>
        </li>
        <li>
          <Link to="/chapter1-basics/05-animations">05 Animations</Link>
        </li>
        <li>
          <Link to="/chapter1-basics/06-cameras">06 Cameras</Link>
        </li>
        <li>
          <Link to="/chapter1-basics/07-fullscreen-and-resizing">
            07 Fullscreen and Resizing
          </Link>
        </li>
        <li>
          <Link to="/chapter1-basics/08-geometries">08 Geometries</Link>
        </li>
        <li>
          <Link to="/chapter1-basics/09-debug-ui">09 Debug UI</Link>
        </li>
        <li>
          <Link to="/chapter1-basics/10-textures">10 Textures</Link>
        </li>
        <li>
          <Link to="/chapter1-basics/11-materials">11 Materials</Link>
        </li>
        <li>
          <Link to="/chapter1-basics/12-3d-text">12 3D Text</Link>
        </li>
        <li>
          <Link to="/chapter1-basics/13-go-live">13 Go Live</Link>
        </li>
      </ul>
    </>
  );
};

export default Page
