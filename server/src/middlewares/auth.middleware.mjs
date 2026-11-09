// Services for the middleware
import service from '#services/handler.service.mjs';

// Importers for the middleware
import { errorHTTP } from '#utils/functions.util.mjs';

// External & Internal libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';

import BaseMiddleware from './base.middleware.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class AuthMiddleware extends BaseMiddleware {
  constructor ({
    mode='reply',
    path='*',
  }={}) {
    super({
      name: 'AuthMiddleware',
      mode: mode,
      path: path,
    });
  }

  async onInit() {}

  async onInitializing () {
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

      middleware: 'auth',
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
    ) return errorHTTP({
      header: header,
      body: {
        status : 500,
        id     : 'ERR-1',
        message: `[${this.name}] middleware is not available.`,
      },
    });
  
    // Getting the request-cookies: { a: 'etc' }
    const { auth_token } = req.cookies;

    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
  
    if (!auth_token) return res.redirect('/sign/in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    return await service.token.findByToken({
      token: auth_token
    }, (error, auth_token) => {
      if (error) return errorHTTP({
        header: header,
        body: {
          status : 503,
          id     : 'ERR-1',
          message: `[${this.name}] ${error}`,
        },
      });
      
      if (Object.keys(auth_token).length === 0) return res.redirect('/sign/in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      
      res.cookie('auth_token', auth_token.token, {
        httpOnly: true,
        secure  : true,
        sameSite: 'strict',
        expires : auth_token.expiration,
      });

      res.auth_token = auth_token;
      
      // If all checks pass, we continue
      return next();
    });
  }
}

