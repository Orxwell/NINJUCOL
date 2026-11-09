// Importers for the middleware
import { errorHTTP } from '#utils/functions.util.mjs';

// External & Internal libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';

import BaseMiddleware from './base.middleware.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class QueryMiddleware extends BaseMiddleware {
  constructor ({
    scheme={},
    optional={},
    mode='reply',
    path='*',
  }={}) {
    super({
      name: 'QueryMiddleware',
      mode: mode,
      path: path,
    });

    // Middleware's configuration____________
    this.accepted_types = ['string', 'number', 'boolean'];

    this.scheme   = scheme;
    this.optional = optional;
  }

  async onInit() {}
  
  async onInitializing () {
    // Checking: scheme
    if (Object.prototype.toString.call(this.scheme) !== '[object Object]') throw new Error(`[${this.name}] from ${filename}: 'scheme' must be a valid plain object.`);

    for (const [key, value] of Object.entries(this.scheme)) {
      if (typeof value !== 'string' || value.trim() === '') throw new Error(`[${this.name}] from ${filename}: 'scheme.${key}' must be a non-empty string.`);

      const given_types = value
        .split('|')
        .map(type => type.trim().toLowerCase())
        .filter(Boolean);
        
      for (const type of given_types) {
        if (!this.accepted_types.includes(type)) throw new Error(`[${this.name}] from ${filename}: 'scheme.${key}' must be one of [${this.accepted_types
          .map(key => `'${key}'`)
          .join(', ')}].`
        );
      }
    }

    // Pre-calculating internal-keys
    this.internal_keys = Object.keys(this.scheme);

    // Checking: optional
    if (Object.prototype.toString.call(this.optional) !== '[object Object]') throw new Error(`[${this.name}] from ${filename}: 'optional' must be a valid plain object.`);

    for (const key of Object.keys(this.optional)) {
      if (!this.internal_keys.includes(key)) throw new Error(`[${this.name}] from ${filename}: 'optional.${key}' must also be declared in 'scheme'.`);
    }

    // Pre-calculating required-keys
    this.required_keys = this.internal_keys.filter(key => !Object.prototype.hasOwnProperty.call(this.optional, key));

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
    // ExpressV5-LocalPatch, req.query is now mutable.
    Object.defineProperty(req, 'query', {
      value: req.query ? { ...req.query } : {}, 
      writable: true,
      configurable: true
    });

    const header = {
      req: req,
      res: res,
  
      next: next,
      mode: this.mode,
  
      middleware: 'query',
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

    // Getting the request-queries: { a: 'etc' }
    const request_query = req.query;
  
    const request_keys    = Object.keys(request_query);
    const missing_keys    = this.required_keys.filter(key => !request_keys.includes(key));
    const undeclared_keys = request_keys.filter(key => !this.internal_keys.includes(key));
  
    if (missing_keys.length > 0) return errorHTTP({
      header: header,
      body: {
        status : 400,
        id     : 'ERR-1',
        message: `Bad-Request: missing required keys [${missing_keys
          .map(key => `'${key}'`)
          .join(', ')}].`,
      },
    });
    
    if (undeclared_keys.length > 0) return errorHTTP({
      header: header,
      body: {
        status : 400,
        id     : 'ERR-2',
        message: `Bad-Request: undeclared keys [${undeclared_keys
          .map(key => `'${key}'`)
          .join(', ')}].`,
      },
    });

    for (const [key, default_value] of Object.entries(this.optional)) {
      if (!request_keys.includes(key))
        { request_query[key] = default_value; }
    }
  
    for (const key of Object.keys(request_query)) {
      const valid_types = this.scheme[key]
        .split('|')
        .map(type => type.trim().toLowerCase())
        .filter(Boolean);
      
      const value = request_query[key];

      if (typeof value === 'string') {
        const casted_type = this.castingType({ cast: value, });
    
        if (!valid_types.includes(casted_type)) return errorHTTP({
          header: header,
          body: {
            status : 400,
            id     : 'ERR-3',
            message: `Bad-Request: expected types [${valid_types
              .map(type => `'${type}'`)
              .join(', ')}] for query-key '${key}' but got '${casted_type}'.`,
          },
        });
      }

      req.query[key] = request_query[key];
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
