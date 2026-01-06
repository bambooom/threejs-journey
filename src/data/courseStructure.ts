interface Lesson {
  id: string;
  title: string;
  path: string;
}

interface Chapter {
  id: string;
  title: string;
  path: string;
  lessons: Lesson[];
}

export const courseStructure: Chapter[] = [
  {
    id: 'chapter1',
    title: 'Chapter 1: Basics',
    path: '/chapter1-basics',
    lessons: [
      {
        id: '03',
        title: 'First Three.js Project',
        path: '/03-first-threejs-project',
      },
      { id: '04', title: 'Transform Objects', path: '/04-transform-objects' },
      { id: '05', title: 'Animations', path: '/05-animations' },
      { id: '06', title: 'Cameras', path: '/06-cameras' },
      {
        id: '07',
        title: 'Fullscreen and Resizing',
        path: '/07-fullscreen-and-resizing',
      },
      { id: '08', title: 'Geometries', path: '/08-geometries' },
      { id: '09', title: 'Debug UI', path: '/09-debug-ui' },
      { id: '10', title: 'Textures', path: '/10-textures' },
      { id: '11', title: 'Materials', path: '/11-materials' },
      { id: '12', title: '3D Text', path: '/12-3d-text' },
      { id: '13', title: 'Go Live', path: '/13-go-live' },
    ],
  },
  {
    id: 'chapter2',
    title: 'Chapter 2: Classic Techniques',
    path: '/chapter2-classic-techniques',
    lessons: [
      { id: '14', title: 'Lights', path: '/14-lights' },
      { id: '15', title: 'Shadows', path: '/15-shadows' },
      { id: '16', title: 'Haunted House', path: '/16-haunted-house' },
      { id: '17', title: 'Particles', path: '/17-particles' },
      { id: '18', title: 'Galaxy Generator', path: '/18-galaxy-generator' },
      {
        id: '19',
        title: 'Scroll Based Animation',
        path: '/19-scroll-based-animation',
      },
    ],
  },
  {
    id: 'chapter3',
    title: 'Chapter 3: Advanced Techniques',
    path: '/chapter3-advanced-techniques',
    lessons: [
      { id: '20', title: 'Physics', path: '/20-physics' },
      { id: '21', title: 'Imported Models', path: '/21-imported-models' },
      {
        id: '22',
        title: 'Raycaster and Mouse Events',
        path: '/22-raycaster-and-mouse-events',
      },
      {
        id: '23',
        title: 'Custom Models with Blender',
        path: '/23-custom-models-with-blender',
      },
      { id: '24', title: 'Environment Map', path: '/24-environment-map' },
      { id: '25', title: 'Realistic Render', path: '/25-realistic-render' },
      {
        id: '26',
        title: 'Code Structuring for Bigger Projects',
        path: '/26-code-structuring-for-bigger-projects',
      },
    ],
  },
  {
    id: 'chapter4',
    title: 'Chapter 4: Shaders',
    path: '/chapter4-shaders',
    lessons: [
      { id: '27', title: 'Custom Shaders', path: '/27-custom-shaders' },
      { id: '28', title: 'Shader Patterns', path: '/28-shader-patterns' },
      { id: '29', title: 'Raging Sea', path: '/29-raging-sea' },
      { id: '30', title: 'Animated Galaxy', path: '/30-animated-galaxy' },
      { id: '31', title: 'Modified Materials', path: '/31-modified-materials' },
      { id: '32', title: 'Coffee Smoke', path: '/32-coffee-smoke' },
      { id: '33', title: 'Hologram', path: '/33-hologram' },
      { id: '34', title: 'Fireworks', path: '/34-fireworks' },
      { id: '35', title: 'Lights Shading', path: '/35-lights-shading' },
      { id: '36', title: 'Raging Sea Shading', path: '/36-raging-sea-shading' },
      { id: '37', title: 'Halftone Shading', path: '/37-halftone-shading' },
      { id: '38', title: 'Earth', path: '/38-earth' },
      {
        id: '39',
        title: 'Particles Cursor Animation',
        path: '/39-particles-cursor-animation',
      },
      {
        id: '40',
        title: 'Particles Morphing',
        path: '/40-particles-morphing',
      },
      {
        id: '41',
        title: 'GPGPU Flow Field Particles',
        path: '/41-gpgpu-flow-field-particles',
      },
      {
        id: '42',
        title: 'Wobbly Sphere',
        path: '/42-wobbly-sphere-shader',
      },
    ],
  },
];

export type { Lesson, Chapter };
