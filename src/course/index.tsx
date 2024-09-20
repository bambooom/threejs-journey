import { type FC } from 'react';
import { Link } from 'react-router-dom';

const Page: FC = () => {
  return (
    <div className='index-page'>
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
      <div>Chapter 2: Classic Techniques</div>
      <ul>
        <li>
          <Link to="/chapter2-classic-techniques/14-lights">14 Lights</Link>
        </li>
        <li>
          <Link to="/chapter2-classic-techniques/15-shadows">15 Shadows</Link>
        </li>
        <li>
          <Link to="/chapter2-classic-techniques/16-haunted-house">
            16 Haunted House
          </Link>
        </li>
        <li>
          <Link to="/chapter2-classic-techniques/17-particles">
            17 Particles
          </Link>
        </li>
        <li>
          <Link to="/chapter2-classic-techniques/18-galaxy-generator">
            18 Galaxy Generator
          </Link>
        </li>
        <li>
          <Link to="/chapter2-classic-techniques/19-scroll-based-animation">
            19 Scroll Based Animation
          </Link>
        </li>
      </ul>
      <div>Chapter 3: Advanced Techniques</div>
      <ul>
        <li>
          <Link to="/chapter3-advanced-techniques/20-physics">20 Physics</Link>
        </li>
        <li>
          <Link to="/chapter3-advanced-techniques/21-imported-models">21 Imported Models</Link>
        </li>
        <li>
          <Link to="/chapter3-advanced-techniques/22-raycaster-and-mouse-events">21 Raycaster and Mouse Events</Link>
        </li>
        <li>
          <Link to="/chapter3-advanced-techniques/23-custom-models-with-blender">23 Custom Models with Blender</Link>
        </li>
        <li>
          <Link to="/chapter3-advanced-techniques/24-environment-map">24 Environment Map</Link>
        </li>
        <li>
          <Link to="/chapter3-advanced-techniques/25-realistic-render">25 Realistic Render</Link>
        </li>
        <li>
          <Link to="/chapter3-advanced-techniques/26-code-structuring-for-bigger-projects">26 Code Structuring for Bigger Projects</Link>
        </li>
      </ul>
    </div>
  );
};

export default Page
