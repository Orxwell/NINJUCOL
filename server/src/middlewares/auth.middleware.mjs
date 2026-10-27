// Services for the middleware
import service from '#services/handler.service.mjs';

// Importers for the middleware
import { errorHTTP } from '#utils/functions.util.mjs';

// External & Internal libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default function handlingAuth ({
  mode='reply',
}={}) {
  // ------------ Middleware's configuration ------------
  // Checking: mode
  const modes = ['reply', 'attach', 'next']
  if (!modes.includes(mode)) throw new Error(`Internal-Server-Error, from ${filename}: 'mode' must be one of [${modes
    .map(option => `'${option}'`)
    .join(', ')}].`,
  );

  // ------------ Middleware's callback ------------
  return async (req, res, next) => {
    const header = {
      req: req,
      res: res,

      next: next,
      mode: mode,

      middleware: 'auth',
    };

    // Getting the request-cookies: { a: 'etc' }
    const { auth_token } = req.cookies;

    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    return await service.token.findByToken({
      token: auth_token
    }, (error, token_obj) => {
      if (error) return errorHTTP({
        header: header,
        body: {
          status : 503,
          id     : 'ERR-1',
          message: `Internal-Server-Error: ${error}`,
        },
      });
      
      if (Object.keys(token_obj).length === 0) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      
      res.cookie('auth_token', token_obj.token, {
        httpOnly: true,
        secure  : true,
        sameSite: 'strict',
        expires : token_obj.expiration,
      });

      res.token_obj = token_obj;
      
      // If all checks pass, we continue
      return next();
    });
  };
};
