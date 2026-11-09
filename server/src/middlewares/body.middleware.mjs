// Importers for the middleware
import { errorHTTP } from '#utils/functions.util.mjs';

// External & Internal libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';

import BaseMiddleware from './base.middleware.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class BodyMiddleware extends BaseMiddleware {
  constructor ({
    scheme={},
    mode='reply',
    path='*',
  }={}) {
    super({
      name: 'BodyMiddleware',
      mode: mode,
      path: path,
    });

    // Middleware's configuration____________
    this.scheme = scheme;
  }

  async onInit() {}

  async onInitializing () {
    // Checking: scheme
    if (Object.prototype.toString.call(this.scheme) !== '[object Object]') throw new TypeError(`[${this.name}], from ${filename}: 'scheme' must be a valid plain object.`);

    // Checking: mode
    if (!this.modes.includes(this.mode)) throw new Error(`[${this.name}], from ${filename}: 'mode' must be one of [${this.modes
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

      middleware: 'body',
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

    // Getting the request-body: { a: 'etc' }
    const request_body = req.body ?? {};

    // Validating the JSON: req.body
    if (Object.prototype.toString.call(request_body) !== '[object Object]') return errorHTTP({
      header: header,
      body: {
        status : 400,
        id     : 'ERR-1',
        message: `[${this.name}] 'req.body' must be a valid plain object.`,
      },
    });
    
    function recursiveDSLValidator ({ value, rule, path }={}) {
      function validatingArray ({ value, rule, path, casted_value }={}) {
        if (!Array.isArray(value)) return errorHTTP({
          header: header,
          body: {
            status : 400,
            id     : 'ERR-4',
            message: `[${this.name}] expected types ['array'] for '${path}' but got '${casted_value}'.`,
          },
        });
    
        if (value.length !== rule.length) return errorHTTP({
          header: header,
          body: {
            status : 400,
            id     : 'ERR-5',
            message: `[${this.name}] expected array.length=${rule.length} for '${path}' but got ${value.length}.`,
          },
        });
    
        for (let i=0; i<rule.length; i++) {
          recursiveDSLValidator({
            value: value[i],
            rule : rule[i],
            path : `${path}[${i}]`,
          });
        }
    
        return;
      }
    
      function validatingObject ({ value, rule, path, casted_value }={}) {
        if (Object.prototype.toString.call(value) !== '[object Object]') return errorHTTP({
          header: header,
          body: {
            status : 400,
            id     : 'ERR-4',
            message: `[${this.name}] expected types ['object'] for '${path}' but got '${casted_value}'.`,
          },
        });

        const rule_keys = Object.keys(rule);

        const undeclared_keys = Object.keys(value)
          .filter(key => !rule_keys.includes(key));
            
        if (undeclared_keys.length > 0) return errorHTTP({
          header: header,
          body: {
            status : 400,
            id     : 'ERR-3',
            message: `[${this.name}] undeclared key '${path}.${undeclared_keys[0]}'`,
          },
        });
    
        for (const [internal_key, internal_rule] of Object.entries(rule)) {
          if (!Object.prototype.hasOwnProperty.call(value, internal_key)) return errorHTTP({
            header: header,
            body: {
              status : 400,
              id     : 'ERR-2',
              message: `[${this.name}] missing required key '${path}.${internal_key}'.`,
            },
          });
    
          recursiveDSLValidator({
            value: value[internal_key],
            rule : internal_rule,
            path : `${path}.${internal_key}`,
          });
        }
    
        return;
      }

      const casted_type = this.validatingType({ cast: value });
      
      const is_simple_rule = typeof rule === 'string'
          || (
          Array.isArray(rule) &&
          rule.length === 0
        ) || (
          Object.prototype.toString.call(rule) === '[object Object]' &&
          Object.keys(rule).length === 0
        );
    
      if (is_simple_rule) {
        const cache_rule = typeof rule !== 'string'
          ? this.validatingType({ cast: rule })
          : rule;
    
        const valid_types = cache_rule
          .split('|')
          .map(type => type.trim().toLowerCase())
          .filter(Boolean);
    
        // Verifying type of the request-value, rule options like an explicit or a wrapper: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null'
        if (!valid_types.includes(casted_type)) return errorHTTP({
          header: header,
          body: {
            status : 400,
            id     : 'ERR-4',
            message: `[${this.name}] expected types [${valid_types
              .map(type => `'${type}'`)
              .join(', ')}] for body-key ${path} but got '${casted_type}'.`,
          },
        });
    
        return;
      }
    
      if (Array.isArray(rule)) return validatingArray({
        value       : value,
        rule        : rule,
        path        : path,
        casted_value: casted_type,
      });
    
      if (Object.prototype.toString.call(rule) === '[object Object]') return validatingObject({
        value       : value,
        rule        : rule,
        path        : path,
        casted_value: casted_type,
      });
    
      return errorHTTP({
        header: header,
        body: {
          status : 500,
          id     : 'ERR-0',
          message: `[${this.name}] invalid rule at '${path}'.`,
        },
      });
    }

    // Calling the recursive-DSL-validator
    recursiveDSLValidator({
      value: request_body,
      rule : this.scheme,
      path : 'req.body',
    });

    // If all checks pass, we continue
    return next();
  }

  validatingType ({ cast }={}) {
    if (cast === null) return 'null';
  
    if (typeof cast === 'string') return 'string';
  
    if (typeof cast === 'number' && Number.isFinite(cast)) return 'number';
  
    if (typeof cast === 'boolean') return 'boolean';
  
    if (Array.isArray(cast)) return 'array';
  
    if (Object.prototype.toString.call(cast) === '[object Object]') return 'object';
  
    return false;
  }
}
