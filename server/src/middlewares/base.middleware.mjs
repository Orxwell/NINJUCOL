export default class BaseMiddleware {
  constructor({ name='', mode='', path='' }={}) {
    // Middleware's configuration____________
    this.modes = ['reply', 'attach', 'next'];

    this.name = name;
    this.mode = mode;
    this.path = path;

    // Internal logic_________
    this.initialized = false;
    this.running     = false;

    this.init_promise  = null;
    this.start_promise = null;
    this.stop_promise  = null;
  }

  // -------------- SHARED --------------

  async init () {
    if (this.initialized) throw new Error(`[${this.name}] Initialized more than once.`);

    if (this.init_promise) return this.init_promise;

    // Middleware logic...
    await this.onInit();

    // Init the middleware
    const init_process = this.initializing();

    const tracked = init_process.finally(() => {
      if (this.init_promise === tracked) this.init_promise = null;
    });

    this.init_promise = tracked;

    return tracked;
  }

  async initializing () {
    try {
      // Middleware logic...
      await this.onInitializing();

      this.initialized = true;

      console.info(`[${this.name}] middleware is initialized.`);

      // By default, init() starts the middleware
      await this.start();

    } catch (error) {
      // Handling starting errors
      console.error(`[${this.name}] Init:`, error);

      throw error;
    }
  }

  // -------------- CLI --------------

  async start () {
    if (this.stop_promise) return Promise.reject(
      new Error(`[${this.name}] middleware is stopping.`)
    );

    if (this.start_promise) return this.start_promise;

    if (this.running) return Promise.resolve('DONE');
    
    if (!this.initialized) return Promise.reject(
      new Error(`[${this.name}] middleware is not initialized.`)
    );

    // Middleware logic...
    await this.onStart();

    // Start the middleware
    const start_process = this.starting();

    const tracked = start_process.finally(() => {
      if (this.start_promise === tracked) this.start_promise = null;
    });

    this.start_promise = tracked;

    return tracked;
  }

  async starting () {
    try {
      // Middleware logic...
      await this.onStarting();

      this.running = true;

      console.info(`[${this.name}] middleware is running on path=${this.path}.`);

      return 'DONE';

    } catch (error) {
      // Handling starting errors
      console.error(`[${this.name}] Starting:`, error);

      throw error;
    }
  }

  async stop () {
    if (this.stop_promise) return this.stop_promise;

    if (!this.running) return Promise.resolve('DONE');

    this.running = false;

    // Middleware logic...
    await this.onStop();

    // Stop the middleware
    const stop_process = this.stopping();

    const tracked = stop_process.finally(() => {
      if (this.stop_promise === tracked) this.stop_promise = null;
    });

    this.stop_promise = tracked;

    return tracked;
  }

  async stopping () {
    try {
      // Middleware logic...
      await this.onStopping();

      console.info(`[${this.name}] middleware is not running.`);

      return 'DONE';

    } catch (error) {
      // Timers remain stopped. Caller must handle failure.
      console.error(`[${this.name}] Stopping:`, error);

      throw error;
    }
  }

  // -------------- HOOKS --------------

  async onInit() {}
  async onInitializing() {}

  async onStart() {}
  async onStarting() {}

  async onStop() {}
  async onStopping() {}
}
