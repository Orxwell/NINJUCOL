// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import {
  mailSignInEJS,

  publicSignInEJS
} from '#utils/templates.util.mjs';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// Services for the route
import service from '#services/handler.service.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const routerSIGN = Router();


// ~~~~~~~~~~~ROUTER-LOGIN~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
//* sign_up

routerSIGN.get('/sign_in',
  middleware.queryParams({
    scheme  : { error: 'string', },
    optional: { error: null,     },
  }),
  async (req, res) => {
    const { error } = req.query;

    try {
      return res.render(publicSignInEJS, {
        title: `Login | NINJUCOL`,

        error: error,

        server_url: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);

//* sign_out
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
routerSIGN.post('/sign_up',
  middleware.queryParams({}),
  middleware.bodyParams({
    scheme: {
      firstname: 'string',
      lastname : 'string',
      birthdate: 'string',
      phone    : 'string',
      email    : 'string',
      password : 'string',
    },
  }),
  async (req, res) => {
    const { firstname, lastname, birthdate, phone, email, password } = req.body;

    try {
      const formatted_firstname = firstname
        .charAt(0)
        .toUpperCase() + firstname.slice(1);

      const formatted_lastname = lastname
        .charAt(0)
        .toUpperCase() + lastname.slice(1);
        
      await service.account.create({
        firstname: formatted_firstname,
        lastname : formatted_lastname,
        birthdate: birthdate,
        phone    : phone,
        email    : email,
        password : password,

        roles: {},
        status: 'PENDING',
      });

    } catch (err) {
      if (err.code === 'ERR-3') {
        return res.redirect('/error_at_post?' +
          `error=${encodeURIComponent('Account already exist.')}`
        );
      }
      
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(err.message)}`
      );
    }

    try {
      return res.sendStatus(200);

    } catch (_) { return res.sendStatus(503); }
  }
);

routerSIGN.post('/sign_in',
  middleware.queryParams({}),
  middleware.bodyParams({
    scheme: {
      email   : 'string',
      password: 'string',
    },
  }),
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const auth = await service.account.auth({
        email   : email,
        password: password,
      });

      if (auth.status === 'DENIED') {
        return res.redirect('/sign_in?' +
          `error=${encodeURIComponent('Invalid password.')}`
        );
      }

    } catch (err) {
      if (err.code === 'ERR-2') {
        return res.redirect('/sign_in?' +
          `error=${encodeURIComponent('Invalid email.')}`);
      }
      
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(err.message)}`
      );
    }

    try {
      const found_token = await service.token.findByEmail({ email: email, });

      let token_body;
      if (found_token) { token_body = found_token; }
      else {
        token_body = await service.token.generate({ email: email, });

        await service.token.save(token_body);
      }

      await service.mailer.send({
        to: email,
        subject: 'Prueba 0',
        text: 'Esto es una prueba para verificar funcionamiento.',
        ejs_path: mailSignInEJS,
        ejs_args: {

        }
      });

      res.cookie('auth_token', token_body.token, {
        httpOnly: true,
        secure  : true,
        sameSite: 'strict',
        expires : token_body.expiration,
      });

      return res.redirect('/dashboard');

    } catch (err) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(err.message)}`
      );
    }
  }
);

routerSIGN.post('/sign_out',
  middleware.queryParams({}),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Usted a sido redireccionado porque no cuenta con un token válido.')}`);

    try {
      const token_body = await service.token.findByToken({ token: auth_token });
      
      if (!token_body) {
        return res.redirect('/sign_in?' +
          `error=${encodeURIComponent('Sesión expirada.')}`);
      }

      await service.token.delete({ token: token_body.token });

      return res.redirect('/sign_in');

    } catch (err) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(err.message)}`
      );
    }
  }
);
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-LOGIN~~~~~~~~~~~

export default routerSIGN;
