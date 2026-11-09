// Importers for the middleware
import { errorHTTP } from '#utils/functions.util.mjs';

// External & Internal libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';

import BaseMiddleware from './base.middleware.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class RouteMiddleware extends BaseMiddleware {
  constructor ({
    scheme={},
    mode='reply',
    path='*',
  }={}) {
    super({
      name: 'RouteMiddleware',
      mode: mode,
      path: path,
    });

    // Middleware's configuration____________
    this.accepted_types = ['string', 'number', 'boolean'];

    this.scheme = scheme;
  }

  async onInit() {}
  
  async onInitializing () {
    // Checking: scheme
    if (Object.prototype.toString.call(this.scheme) !== '[object Object]') throw new TypeError(`[${this.name}] from ${filename}: 'scheme' must be a valid plain object.`);

    for (const [key, value] of Object.entries(this.scheme)) {
      if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`[${this.name}] from ${filename}:'scheme.${key}' must be a non-empty string.`);
        
      const given_types = value
        .split('|')
        .map(type => type.trim().toLowerCase())
        .filter(Boolean);
        
      for (const type of given_types) {
        if (!this.accepted_types.includes(type)) throw new TypeError(`[${this.name}] from ${filename}: 'scheme.${key}' must be [${this.accepted_types
          .map(key => `'${key}'`)
          .join(', ')}].`
        );
      }
    };

    // Pre-calculating internal-keys
    this.internal_keys = Object.keys(this.scheme);

    // Checking: mode
    if (!this.modes.includes(this.mode)) throw new Error(`[${this.name}] from ${filename}: 'mode' must be one of [${this.modes
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
  
      middleware: 'route',
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

    // Getting the request-params: { a: 'etc' }
    const request_route = req.params ?? {};

    const request_keys    = Object.keys(request_route);
    const missing_keys    = this.internal_keys.filter(key => !request_keys.includes(key));
    const undeclared_keys = request_keys.filter(key => !this.internal_keys.includes(key));
  
    if (missing_keys.length > 0) return errorHTTP({
      header: header,
      body: {
        status : 400,
        id     : 'ERR-1',
        message: `[${this.name}] missing required routes [${missing_keys
          .map(key => `'${key}'`)
          .join(', ')}].`,
      },
    });

    if (undeclared_keys.length > 0) return errorHTTP({
      header: header,
      body: {
        status : 400,
        id     : 'ERR-2',
        message: `[${this.name}] undeclared routes [${undeclared_keys
          .map(key => `'${key}'`)
          .join(', ')}].`,
      },
    });

    if (!this.internal_keys.every((param, i) => param === request_keys[i])) {
      const expected_params = this.internal_keys.join('/');
      const actual_params   = request_keys.join('/');

      return errorHTTP({
        header: header,
        body: {
          status : 400,
          id     : 'ERR-3',
          message: `[${this.name}] expected routes in order ${expected_params} but got ${actual_params}.`,
        },
      });
    }

    for (const key of request_keys) {
      const valid_types = this.scheme[key]
        .split('|')
        .map(type => type.trim().toLowerCase())
        .filter(Boolean);
      
      const casted_type = this.castingType({ cast: request_route[key] });
      
      if (!valid_types.includes(casted_type)) return errorHTTP({
        header: header,
        body: {
          status : 400,
          id     : 'ERR-4',
          message: `[${this.name}] expected types [${valid_types
            .map(type => `'${type}'`)
            .join(', ')}] for route ':${key}' but got '${casted_type}'.`,
        },
      });
    }

    // If all checks pass, we continue
    return next();
  }

  castingType ({ cast='' }={}) {
    if (typeof cast !== 'string') return undefined;
  
    const processed = cast.trim().toLowerCase();
  
    if (processed === '') return undefined;
  
    if (['true', 'false'].includes(processed)) return 'boolean';
  
    if (
      /^-?(0|[1-9]\d*)(\.\d+)?$/.test(processed) &&
      !Number.isNaN(Number(processed))
    ) return 'number';
  
    return 'string';
  }
}
