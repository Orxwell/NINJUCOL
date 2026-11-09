// Services for the middleware
import service from '#services/handler.service.mjs';

// Utils for the middleware
import { errorHTTP } from '#utils/functions.util.mjs';

// External & Internal libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';

import BaseMiddleware from './base.middleware.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class RatelimitMiddleware extends BaseMiddleware {
  constructor ({
    group='default',
    contract='short_term',
    mode='reply',
    path: path,
  }={}) {
    super({
      name: 'RatelimitMiddleware',
      mode: mode,
      path: path,
    });

    // Middleware's configuration____________
    this.group    = group;
    this.contract = contract;
  }

  async onInit() {}
  
  async onInitializing () {
    // Checking: group
    if (
      typeof this.group !== 'string' ||
      this.group.trim() === ''
    ) throw new Error(`[Server] from ${filename}: 'group' must be non-empty string.`);

    if (!contractor.ratelimit.existGroup(this.group)) throw new Error(`[Server] from ${filename}: 'group' doesn't exist.`,);

    // Checking: contract
    if (
      typeof this.contract !== 'string' ||
      this.contract.trim() === ''
    ) throw new Error(`[Server] from ${filename}: 'contract' must be non-empty string.`);

    if (!contractor.ratelimit.existContract(this.contract)) throw new Error(`[Server] from ${filename}: 'contract' doesn't exist.`,);

    const groups         = contractor.ratelimit.groups;
    const found_contract = groups[this.group][this.contract];
    
    // Checking: mode
    if (!this.modes.includes(this.mode)) throw new Error(`[Server] from ${filename}: 'mode' must be one of [${this.modes
      .map(option => `'${option}'`)
      .join(', ')}].`,
    );
  }

  // -------------- CLI --------------

  async onStart () {}
  
  async onStarting () {}
  
  async onStop () {}
  
  async onStopping () {}

  // -------------- MIDDLEWARE --------------

  middleware = async (req, res, next) => {
    const header = {
      req: req,
      res: res,
  
      next: next,
      mode: this.mode,
  
      middleware: 'ratelimit',
    };

    if (!this.initialized) return errorHTTP({
      header: header,
      body: {
        status : 503,
        id     : 'ERR-0',
        message: `[${this.name}] middleware is not initialized.`,
      },
    });

    if (
      !this.running ||
      this.stop_promise
    ) return next();

    // Getting the IPv4:
    const ip  = req.ip;

    // Mapped contracts
    switch (this.contract) {
      // ____________ SHORT-TERM-MODALITY ____________
      case 'short_term':
        service.ratelimit.shortTerm({
          ip: ip,

          group   : this.group,
          contract: this.found_contract,
        }, (error, info) => {
          if (error?.code === 'ERR-2') {
            res.set('Retry-After', error.retry_after_s);

            return errorHTTP({
              header: header,
              body: {
                status : error.status,
                id     : error.code,
                message: error.message,
              },
            });
          }
        });
        break;

      // ____________ LONG-TERM-MODALITY ____________
      case 'long_term':
        await service.ratelimit.longTerm({
          ip: ip,

          group   : this.group,
          contract: this.found_contract,
        }, (error, info) => {
          if (error?.code === 'ERR-2') {
            res.set('Retry-After', error.retry_after_s);

            return errorHTTP({
              header: header,
              body: {
                status : error.status,
                id     : error.code,
                message: error.message,
              },
            });
          }
        });
        break;
    }

    // If all checks pass, we continue
    return next();
  }
}
