// External & Internal Libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';

import { errorHTTP } from '#utils/functions.util.mjs';

const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);

function castingType ({ cast='' }={}) {
  if (typeof cast !== 'string') return undefined;

  const processed = cast.trim().toLowerCase();

  if (processed === '') return undefined;

  if (processed === 'null') return 'null';

  if (['true', 'false'].includes(processed)) return 'boolean';

  if (
    /^-?(0|[1-9]\d*)(\.\d+)?$/.test(processed) &&
    !Number.isNaN(Number(processed))
  ) return 'number';

  return 'string';
}

export default function handlingQueryParams ({
  scheme={},
  optional={},
  mode='reply'
}={}) {
  // ------------ Middleware's configuration ------------
  // Checking: scheme
  if (Object.prototype.toString.call(scheme) !== '[object Object]')
    throw new Error(`Internal-Server-Error, from ${filename}: 'scheme' must be a valid plain object.`);

  const accepted_types = ['string', 'number', 'boolean', 'null'];
  for (const [key, value] of Object.entries(scheme)) {
    if (typeof value !== 'string' || value.trim() === '')
      throw new Error(`Internal-Server-Error, from ${filename}: 'scheme.${key}' must be a non-empty string.`);

    const given_types = value
      .split('|')
      .map(type => type.trim().toLowerCase())
      .filter(Boolean);
    
    for (const type of given_types) {
      if (!accepted_types.includes(type))
        throw new Error(`Internal-Server-Error, from ${filename}: 'scheme.${key}' must be one of [${accepted_types
          .map(key => `'${key}'`)
          .join(', ')}].`
        );
    }
  }

  // Pre-calculating internal-keys
  const internal_keys = Object.keys(scheme);

  // Checking: optional
  if (Object.prototype.toString.call(optional) !== '[object Object]')
    throw new Error(`Internal-Server-Error, from ${filename}: 'optional' must be a valid plain object.`);

  for (const [key, value] of Object.entries(optional)) {
    if (!internal_keys.includes(key))
      throw new Error(`Internal-Server-Error, from ${filename}: 'optional.${key}' must also be declared in 'scheme'.`);

    if (typeof value !== 'string' || value.trim() === '')
      throw new Error(`Internal-Server-Error, from ${filename}: 'optional.${key}' must be a non-empty string.`);
  }

  // Pre-calculating required-keys
  const required_keys = internal_keys.filter(key => !Object.prototype.hasOwnProperty.call(optional, key));

  // Checking: mode
  const modes = ['reply', 'attach', 'next']
  if (!modes.includes(mode))
    throw new Error(`Internal-Server-Error, from ${filename}: 'mode' must be one of [${modes
      .map(option => `'${option}'`)
      .join(', ')}].`,
    );

  // ------------ Middleware's callback ------------
  return (req, res, next) => {
    // ~~ExpressV5-LocalPatch, req.query is now mutable.~~
    Object.defineProperty(req, 'query', {
      value: req.query ? { ...req.query } : {}, 
      writable: true,
      configurable: true
    });

    const header = {
      req: req,
      res: res,

      next: next,
      mode: mode,

      middleware: 'queryParams',
    };
  
    // Getting the request-queries: { a: 'etc' }
    const request_query = req.query;
  
    const request_keys    = Object.keys(request_query);
    const missing_keys    = required_keys.filter(key => !request_keys.includes(key));
    const undeclared_keys = request_keys.filter(key => !internal_keys.includes(key));
  
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

    for (const [key, default_value] of Object.entries(optional)) {
      if (!request_keys.includes(key))
        { request_query[key] = default_value; }
    }
  
    for (const key of Object.keys(request_query)) {
      const valid_types = scheme[key]
        .split('|')
        .map(type => type.trim().toLowerCase())
        .filter(Boolean);
      
      const casted_type = castingType({ cast: request_query[key] });
  
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

      req.query[key] = request_query[key];
    }

    // If all checks pass, we continue
    return next();
  };
};
