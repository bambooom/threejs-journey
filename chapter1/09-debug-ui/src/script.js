import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import GUI from 'lil-gui';

/**
 * Debug
 */
const gui = new GUI({
  width: 300,
  title: 'Nice Debug UI', // just the default folder
  closeFolders: false
}) // initialize  GUI
// gui.close()

// gui.hide() // default to not showing it

window.addEventListener('keydown', (event) => {
  if (event.key === 'h') {
    gui.show(gui._hidden) // toggle the debug UI
  }
})

// gui.add(...), parameters: the object, the property of that object
// can only tweak object and its properties

const debugObject = {}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
debugObject.color = '#a778d8';
const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
const material = new THREE.MeshBasicMaterial({ color: debugObject.color, wireframe: true });
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// add folders for debug object
const cubeTweaks = gui.addFolder('Awesome cube')
// cubeTweaks.close() // 默认关闭

// tweak mesh.position.y
// gui.add(mesh.position, 'y') // by default it's an input
// gui.add(mesh.position, 'y', -3, 3, 0.01) // now it's a range slider, min, max, step
cubeTweaks.add(mesh.position, 'y').min(-3).max(3).step(0.01).name('elevation'); // make it more clear, name it with a label
cubeTweaks.add(mesh, 'visible'); // it will be a checkbox
cubeTweaks.add(material, 'wireframe'); // also a checkbox

// handling color, Color class, should use `addColor`
// gui.addColor(material, 'color').onChange((value) => {
//   // material.color equals to value, Color class
//   console.log(value.getHexString()) // 这里的 hex code 才是真正的 color hex code
// })
cubeTweaks.addColor(debugObject, 'color').onChange(() => {
  material.color.set(debugObject.color);
});

// add a button to spin
debugObject.spin = () => {
  // spin animation
  gsap.to(mesh.rotation, {
    duration: 1,
    y: mesh.rotation.y + Math.PI * 2 // add a full circle
  })
}
cubeTweaks.add(debugObject, 'spin');

// change segments, but widthSegments only being used once when initiated, won't be able to change it
// we need to destroy old geometry and build a new one
debugObject.subdivision = 2
// onFinishChange only be triggered when we stop tweaking, 减少太多rerender
cubeTweaks.add(debugObject, 'subdivision').min(1).max(20).step(1).onFinishChange(() => {
  // build new geometry

  // 如果不先 dispose old geometry，则它可能还存在在 GPU memory 里的某处，所以可能会造成 memory leak
  // 所以需要手动 destroy old geometry
  mesh.geometry.dispose()
  mesh.geometry = new THREE.BoxGeometry(
    1, 1, 1,
    debugObject.subdivision, debugObject.subdivision, debugObject.subdivision
  )
})


/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () =>
{
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
