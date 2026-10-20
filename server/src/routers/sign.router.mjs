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
  middleware.query({
    scheme  : { error: 'string', },
    optional: { error: null,     },
  }),
  async (req, res) => {
    const { error } = req.query;

    try {
      return res.render(publicSignInEJS, {
        title: `SingIn | NINJUCOL`,

        error: error,

        server_url: env.SERVER_URL,
      });

    } catch (error) {
      return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
    }
  }
);

//* sign_out
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
routerSIGN.post('/sign_up',
  middleware.query({}),
  middleware.body({
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

        roles: { isAdmin: false, },
        status: 'PENDING',
      }, (error) => { throw error; });

      return res.sendStatus(200);

    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
    }
  }
);

routerSIGN.post('/sign_in',
  middleware.query({}),
  middleware.body({
    scheme: {
      email   : 'string',
      password: 'string',
    },
  }),
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const { message, status } = await service.account.auth({
        email   : email,
        password: password,
      }, (error) => { throw error; });

      if (status === 'DENIED') {
        return res.redirect('/sign_in?' +
          `error=${encodeURIComponent(message)}`);
      }

      let token_body = await service.token.findByEmail({ email: email, }, (error) => { throw error; });

      if (!token_body) {
        token_body = await service.token.generate({ email: email, }, (error) => { throw error; });

        await service.token.save({
          token     : token_body.token,
          email     : token_body.email,
          expiration: token_body.expiration,
        }, (error) => { throw error; });

        const { firstname, lastname } = await service.account.findByEmail({ email: email }, (error) => { throw error; });

        await service.mailer.send({
          to: email,
          subject: 'Has accedido correctamente. | NINJUCOL',
          text: 'Correo automatizado.',
          ejs_path: mailSignInEJS,
          ejs_args: {
            firstname: firstname,
            lastname : lastname,
          }
        }, (error) => { throw error; });
      }

      res.cookie('auth_token', token_body.token, {
        httpOnly: true,
        secure  : true,
        sameSite: 'strict',
        expires : token_body.expiration,
      });

      return res.redirect('/dashboard');

    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
    }
  }
);

routerSIGN.post('/sign_out',
  middleware.query({}),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Usted a sido redireccionado porque no cuenta con un token válido.')}`);

    try {
      const token_body = await service.token.findByToken({ token: auth_token }, (error) => { throw error; });
      
      if (!token_body) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      await service.token.deleteByToken({ token: token_body.token }, (error) => { throw error; });

      return res.redirect('/sign_in');

    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
    }
  }
);
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-LOGIN~~~~~~~~~~~

export default routerSIGN;
