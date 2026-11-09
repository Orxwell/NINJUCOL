import manager from '#managers/handler.manager.mjs';

import { setTerminalInterface } from '#utils/terminal.util.mjs';

import { createInterface } from 'node:readline';

export default class CLI {
  constructor({
    server,
    app_config={},
  }={}) {
    this.server = server;

    this.commands = {
      middleware: {
        description: 'Manage middlewares of the server.',

        examples: ['middleware {no-args}'],

        handler: new manager.middleware(app_config),
      },
      
      help: {
        description: 'Display available commands and their descriptions, an examples.',

        examples: ['help {no-args}'],

        handler: (...args) => this.help(...args),
      },
      shutdown: {
        description: 'Gracefully shutdown the server.',

        examples: ['shutdown {no-args}'],

        handler: (...args) => this.shutdown(...args),
      },
    };

    this.interface = null;
    this.busy      = false;
    this.closing   = false;

    // Internal logic...
    this.help_promise     = null;
    this.shutdown_promise = null;
  }

  help () {
    if (this.help_promise) return this.help_promise;

    this.help_promise = (async () => {
      console.info('[CLI] Commands:');

      let depth = 0;

      const command_names = Object.keys(this.commands);
      for (let i=0; i<command_names.length; i++) {
        const name    = command_names[i];
        const concept = this.commands[name];

        const i_last = i === command_names.findIndex(name);

        const i_prefix = i_last
          ? '└'
          : '├'

        console.info(`  ${i_prefix} ${name.toUpperCase()}: ${concept.description}`);

        for (let j=0; j<concept.examples.length; j++) {
          const j_last = j === concept.examples.findIndex(name);

          const j_prefix = j_last
            ? '└'
            : '├'

          const i_sufix = i_last
            ? ''
            : '│';

          console.info(`  ${i_sufix} ${j_prefix} ${concept.examples[j]}`);
        }
      }
    })();
  
    return this.help_promise;
  }

  shutdown () {
    if (this.shutdown_promise) return this.shutdown_promise;
  
    this.shutdown_promise = (async () => {
      // Stop receiving new HTTP connections
      await this.server.close(error => {
        if (error) throw error;
      });

      this.server.closeIdleConnections();
      
      // Close connection to the DB
  
      console.info('[Server] Shutdown completed.');
  
      return process.exit(0);
    })();
  
    return this.shutdown_promise;
  }

  async execute (raw_input='') {
    const input = raw_input.trim();

    if (!input) return;

    // Separate command and its arguments
    const [command, ...args] = input.split(/\s+/);

    const concept = this.commands[command];

    // Check if the command exists
    if (!concept) throw new Error(`[CLI] unknown command '${command}'.`);

    const { handler } = concept;

    // If the handler is a function
    if (typeof handler === 'function') return await handler(args);

    const action = args.at(-1);
    args.pop();

    // Check if the action exists
    if (!handler.actions.includes(action)) throw new Error(`[CLI] unknown action '${action}' for the command '${command}'.`);

    const obj_args = {};
    args.map(arg => arg.split('='))
      .forEach(mapped_arg => {
        obj_args[mapped_arg[0]] = mapped_arg[1];
      });

    // Execute manager method
    return await handler[action](obj_args);
  }

  // ------------CLI-Initialization------------

  start () {
    if (this.interface) return;

    this.closing = false;

    this.interface = createInterface({
      input : process.stdin,
      output: process.stdout,

      prompt: '\x1b[31m server => \x1b[36m'
    });

    setTerminalInterface(this.interface);

    this.interface.on('line', async (line) => {
      if (
        this.busy ||
        this.closing
      ) return;

      this.busy = true;

      try { await this.execute(line); }
      catch (error) { console.error('[CLI] Command:', error); }
      finally {
        this.busy = false;

        if (!this.closing) this.interface?.prompt();
      }
    });

    this.interface.prompt();
  }

  close () {
    this.closing = true;

    setTerminalInterface(null);

    this.interface?.close();
    this.interface = null;
  }
}
