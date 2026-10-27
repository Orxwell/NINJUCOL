// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import {
  mailSignInEJS,

  publicSignInEJS
} from '#utils/templates.util.mjs';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// Services for the endpoints
import service from '#services/handler.service.mjs';

// Importers for the endpoints
import importer from '#importers/handler.importer.mjs';


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

    if (auth_token) {
      return await service.token.findByToken({
        token: auth_token
      }, (error, token_obj) => {
        if (error) return res.redirect('/error_at_get?' +
          `error=${encodeURIComponent(error)}`);
  
        if (Object.keys(token_obj).length === 0) {
          res.clearCookie('auth_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          });
          
          return res.redirect('/sign_in?' +
          `error=${encodeURIComponent('Sesión expirada.')}`);
        }
        
        return res.redirect('/dashboard');
      });
    }

    const { error } = req.query;

    return res.render(publicSignInEJS, {
      title: `SingIn | NINJUCOL`,

      error: error,

      server_url: importer.env.SERVER_URL,
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
        
    return await service.account.create({
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
        
        return res.sendStatus(200);
    });
  }
);

routerSIGN.post('/sign_in',
  middleware.query({
    scheme  : { error: 'string', },
    optional: { error: null,     },
  }),
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
    }, async (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      if (info.status === 'DENIED') return res.redirect('/sign_in?' +
        `error=${encodeURIComponent(info.message)}`);
    });

    if (res.headersSent) return;

    const token_obj = await service.token.findByEmail({
      email: data.email
    }, async (error, token_obj) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
        
      if (Object.keys(token_obj).length === 0) return await service.token.generate({
        email: data.email
      }, async (error, token_obj) => {
        if (error) return res.redirect('/error_at_post?' +
          `error=${encodeURIComponent(error)}`);
  
        await service.token.save({
          token     : token_obj.token,
          email     : token_obj.email,
          expiration: token_obj.expiration,
        }, (error, info) => {
          if (error) return res.redirect('/error_at_post?' +
            `error=${encodeURIComponent(error)}`);
        });

        return token_obj;
      });

      return token_obj;
    });

    if (res.headersSent) return;
  
    await service.account.findByEmail({
      email: data.email
    }, async (error, record) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      if (Object.keys(record).length !== 0) await service.token.findByEmail({
        email: record.email
      }, async (error, token_obj) => {
        if (error) return res.redirect('/error_at_post?' +
          `error=${encodeURIComponent(error)}`);

        if (typeof token_obj.token === 'string') await service.mailer.send({
          to: data.email,
          subject: 'Has accedido correctamente. | NINJUCOL',
          text: 'Correo automatizado.',
          ejs_path: mailSignInEJS,
          ejs_args: {
            firstname: record.firstname,
            lastname : record.lastname,
          }
        }, (error, info) => {
          if (error) return res.redirect('/error_at_post?' +
            `error=${encodeURIComponent(error)}`);
        });
      });
    });

    if (res.headersSent) return;
  
    res.cookie('auth_token', token_obj.token, {
      httpOnly: true,
      secure  : true,
      sameSite: 'strict',
      expires : token_obj.expiration,
    });

    return res.redirect('/dashboard');
  }
);

routerSIGN.post('/sign_out',
  middleware.auth({}),
  middleware.query({}),
  async (req, res) => {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    
    return res.redirect('/sign_in');
  }
);
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-LOGIN~~~~~~~~~~~

export default routerSIGN;
