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

  if (['true', 'false'].includes(processed)) return 'boolean';

  if (
    /^-?(0|[1-9]\d*)(\.\d+)?$/.test(processed) &&
    !Number.isNaN(Number(processed))
  ) return 'number';

  return 'string';
}

export default function handlingRouteParams ({
  scheme={},
  mode='reply'
}={}) {
  // ------------ Middleware's configuration ------------
  // Checking: scheme
  if (Object.prototype.toString.call(scheme) !== '[object Object]')
    throw new TypeError(`Internal-Server-Error, from ${filename}: 'scheme' must be a valid plain object.`);

  const accepted_types = ['string', 'number', 'boolean'];
  for (const [key, value] of Object.entries(scheme)) {
    if (typeof value !== 'string' || value.trim() === '')
      throw new TypeError(`Internal-Server-Error, from ${filename}:'scheme.${key}' must be a non-empty string.`);
      
    const given_types = value
      .split('|')
      .map(type => type.trim().toLowerCase())
      .filter(Boolean);
      
    for (const type of given_types) {
      if (!accepted_types.includes(type))
        throw new TypeError(`Internal-Server-Error, from ${filename}: 'scheme.${key}' must be [${accepted_types
          .map(key => `'${key}'`)
          .join(', ')}].`
        );
    }
  };

  // Pre-calculating internal-keys
  const internal_keys = Object.keys(scheme);

  // Checking: mode
  const modes = ['reply', 'attach', 'next']
  if (!modes.includes(mode))
    throw new Error(`Internal-Server-Error, from ${filename}: 'mode' must be one of [${modes
      .map(option => `'${option}'`)
      .join(', ')}].`,
    );

  return (req, res, next) => {
    const header = {
      req: req,
      res: res,

      next: next,
      mode: mode,
      
      middleware: 'routeParams',
    };

    // Getting the request-params: { a: 'etc' }
    const request_route = req.params ?? {};

    const request_keys    = Object.keys(request_route);
    const missing_keys    = internal_keys.filter(key => !request_keys.includes(key));
    const undeclared_keys = request_keys.filter(key => !internal_keys.includes(key));
  
    if (missing_keys.length > 0) return errorHTTP({
      header: header,
      body: {
        status : 400,
        id     : 'ERR-1',
        message: `Bad-Request: missing required routes [${missing_keys
          .map(key => `'${key}'`)
          .join(', ')}].`,
      },
    });

    if (undeclared_keys.length > 0) return errorHTTP({
      header: header,
      body: {
        status : 400,
        id     : 'ERR-2',
        message: `Bad-Request: undeclared routes [${undeclared_keys
          .map(key => `'${key}'`)
          .join(', ')}].`,
      },
    });

    if (!internal_keys.every((param, i) => param === request_keys[i])) {
      const expected_params = internal_keys.join('/');
      const actual_params   = request_keys.join('/') ;

      return errorHTTP({
        header: header,
        body: {
          status : 400,
          id     : 'ERR-3',
          message: `Bad-Request: expected routes in order ${expected_params} but got ${actual_params}.`,
        },
      });
    }

    for (const key of request_keys) {
      const valid_types = scheme[key]
        .split('|')
        .map(type => type.trim().toLowerCase())
        .filter(Boolean);
      
      const casted_type = castingType({ cast: request_route[key] });
      
      if (!valid_types.includes(casted_type)) return errorHTTP({
        header: header,
        body: {
          status : 400,
          id     : 'ERR-4',
          message: `Bad-Request: expected types [${valid_types
            .map(type => `'${type}'`)
            .join(', ')}] for route ':${key}' but got '${casted_type}'.`,
        },
      });
    }

    // If all checks pass, we continue
    next();
  };
};
