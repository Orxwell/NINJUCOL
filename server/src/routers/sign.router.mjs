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
    const { auth_token } = req.cookies;

    if (auth_token) return res.redirect('/dashboard');

    const { error } = req.query;

    return res.render(publicSignInEJS, {
      title: `SingIn | NINJUCOL`,

      error: error,

      server_url: env.SERVER_URL,
    }, (error, html) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);

      return res.send(html);
    });
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
    const data = req.body;

    const formatted_firstname = data.firstname
      .charAt(0)
      .toUpperCase() + firstname.slice(1);

    const formatted_lastname = data.lastname
      .charAt(0)
      .toUpperCase() + lastname.slice(1);
        
    await service.account.create({
      firstname: formatted_firstname,
      lastname : formatted_lastname,
      birthdate: data.birthdate,
      phone    : data.phone,
      email    : data.email,
      password : data.password,

      roles: { isAdmin: false, },
      status: 'PENDING',
    }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
        
      return info;
    });

    if (res.headersSent) return;

    return res.sendStatus(200);
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
    const data = req.body;

    await service.account.auth({
      email   : data.email,
      password: data.password,
    }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      if (info.status === 'DENIED') return res.redirect('/sign_in?' +
        `error=${encodeURIComponent(info.message)}`);
        
      return info;
    });

    if (res.headersSent) return;

    const found_token = await service.token.findByEmail({ email: data.email, }, async (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) return await service.token.generate({ email: data.email, }, async (error, info) => {
        if (error) return res.redirect('/error_at_post?' +
          `error=${encodeURIComponent(error)}`);

        await service.token.save({
          token     : info.token,
          email     : info.email,
          expiration: info.expiration,
        }, (error, info) => {
          if (error) return res.redirect('/error_at_post?' +
            `error=${encodeURIComponent(error)}`);
                
          return info;
        });
          
        return info;
      });
        
      return info;
    });

    if (res.headersSent) return;

    const { firstname, lastname } = await service.account.findByEmail({ email: data.email }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
        
      return info;
    });

    if (res.headersSent) return;

    await service.mailer.send({
      to: email,
      subject: 'Has accedido correctamente. | NINJUCOL',
      text: 'Correo automatizado.',
      ejs_path: mailSignInEJS,
      ejs_args: {
        firstname: firstname,
        lastname : lastname,
      }
    }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
        
      return info;
    });

    res.cookie('auth_token', found_token.token, {
      httpOnly: true,
      secure  : true,
      sameSite: 'strict',
      expires : found_token.expiration,
    });

    return res.redirect('/dashboard');
  }
);

routerSIGN.post('/sign_out',
  middleware.query({}),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Usted a sido redireccionado porque no cuenta con un token válido.')}`);
    
    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);

      if (!info) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.redirect('/sign_in');
  }
);
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-LOGIN~~~~~~~~~~~

export default routerSIGN;
