import EventEmitter from "./EventEmitter";

export default class Time extends EventEmitter {
  start: number;
	current: number;
	elapsed: number;
	delta: number;
  constructor() {
    super();

    // Setup
    this.start = Date.now()
    this.current = this.start
    this.elapsed = 0
    this.delta = 16 // 60fps, arround 16.6ms

    /**
		 * why do we need to use requestAnimationFrame here?
		 *
		 * to wait for the next frame before starting the clock i.e. tick method
		 */
    // wait for 1 frame, since the first frame delta is 0
    window.requestAnimationFrame(() => {
      this.tick();
    });
  }

  tick() {
    const currentTime = Date.now()
    this.delta = currentTime - this.current
    this.current = currentTime
    this.elapsed = this.current - this.start

    this.trigger('tick')

    window.requestAnimationFrame(() => {
      this.tick();
    })
  }
}
