import EventEmitter from './EventEmitter'

// width, height, pixel ratio

export default class Sizes extends EventEmitter {
  width: number;
	height: number;
	pixelRatio: number;
  constructor() {
    super()

    // setup
    this.width = window.innerWidth // currently use full viewport
    this.height = window.innerHeight
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Resize event
    window.addEventListener('resize', () => {
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.pixelRatio = Math.min(window.devicePixelRatio, 2)

      this.trigger('resize')
    })
  }
}
