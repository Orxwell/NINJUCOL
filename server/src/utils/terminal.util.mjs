import { format } from 'node:util';

const colors = {
  log  : '\x1b[0m',
  error: '\x1b[31m',
  info : '\x1b[35m',
  warn : '\x1b[33m',
  debug: '\x1b[35m',
};

let customized      = false;
let activeInterface = null;

export function setTerminalInterface(rl) {
  activeInterface = rl;
}

export function personalizedTerminal() {
  if (customized) return;

  customized = true;

  for (const [method, color] of Object.entries(colors)) {
    if (typeof console[method] !== 'function') continue;

    const original = console[method].bind(console);

    console[method] = (...args) => {
      const message = format(...args);
      const temp = method === 'log'
        ? '\n'
        : '';
      const prefix = `${color}${temp} [${method.toUpperCase()}] \x1b[0m`;

      if (activeInterface && process.stdout.isTTY) {
        // Elimina visualmente la línea del prompt.
        process.stdout.write('\r\x1b[2K');
      }

      original(`${prefix} ${message}`);

      if (activeInterface && process.stdout.isTTY) {
        // Redibuja el prompt después del log.
        activeInterface.prompt(true);
      }
    };
  }
}
