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

        examples: [
          {
            label: 'middleware',
            childrens: [{
              label: 'Description...',
            }],
          },
          {
            label: 'middleware stop',
            childrens: [{
              label: 'Description...',
            }],
          },
          {
            label: 'middleware router=* stop',
            childrens: [{
              label: 'Description...',
            }],
          },
          {
            label: 'middleware router=* middleware=audit stop',
            childrens: [{
              label: 'Description...',
            }],
          },
          {
            label: 'middleware router=HOME stop',
            childrens: [{
              label: 'Description...',
            }],
          },
          {
            label: 'middleware router=[HOME, SIGN] stop',
            childrens: [{
              label: 'Description...',
            }],
          },
        ],

        handler: new manager.middleware(app_config),
      },
      
      help: {
        description: 'Display available commands and their descriptions, an examples.',

        examples: [
          {
            label: 'help',
            childrens: [{
              label: '{no-args}',
            }],
          },
        ],

        handler: (...args) => this.help(...args),
      },
      shutdown: {
        description: 'Gracefully shutdown the server.',

        examples: [
          {
            label: 'shutdown',
            childrens: [{
              label: '{no-args}',
            }],
          },
        ],

        handler: (...args) => this.shutdown(...args),
      },
    };

    this.interface = null;
    this.busy      = false;
    this.closing   = false;

    // Internal logic...
    this.help_promise     = null;
    //this.reset_promise    = null;
    this.shutdown_promise = null;
  }

  #buildTree (nodes, prefix='') {
    const space = ' '.repeat(15);

    const lines = [];
  
    nodes.forEach((node, index) => {
      const is_last = index === nodes.length - 1;
  
      const branch = is_last
        ? '└─'
        : '├─';

      const continuation = is_last
        ? '   '
        : '│  ';
  
      const label = typeof node === 'string'
        ? node
        : node.label;
  
      lines.push(`${space}${prefix}${branch} ${label}`);
  
      if (
        typeof node === 'object' &&
        node !== null &&
        Array.isArray(node.childrens)
      ) {
        lines.push(
          ...this.#buildTree(
            node.childrens,
            prefix+continuation,
          )
        );
      }

      if (is_last) lines.push(`${space}${prefix}`);
    });
  
    return lines;
  }

  help () {
    if (this.help_promise) return this.help_promise;
  
    this.help_promise = (async () => {
      const definition = Object.entries(this.commands)
        .map(([name, concept]) => ({
          label: `${name.toUpperCase()}: ${concept.description}`,
          childrens: concept.examples,
        }));
  
      const tree = this.#buildTree(definition);

      for (let i=1; i<definition.length; i++) tree.pop();
  
      console.info(`[CLI] Commands:\n${tree.join('\n')}`);
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
