// Templates for the Front-End
import template from '#utils/templates.util.mjs';

// Services for the router
import service from '#services/handler.service.mjs';

// Middlewares for the router
import middleware from '#middlewares/handler.middleware.mjs';

// Importers for the router
import importer from '#importers/handler.importer.mjs';


// ~~~~~~~~~~~ROUTER-LOGIN~~~~~~~~~~~
const routerSIGN = {
  // >>-------- GET - BELOW --------<<
  GET: {
    '/sign/in': {
      middlewares: {
        query: new middleware.query({
          scheme  : { error: 'string', },
          optional: { error: null,     },

          path: '/sign/in',
        }),
      },
      handler: async (req, res) => {
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
              
              return res.redirect('/sign/in?' +
              `error=${encodeURIComponent('Sesión expirada.')}`);
            }
            
            return res.redirect('/dashboard');
          });
        }
    
        const { error } = req.query;
    
        return res.render(template.publicSignInEJS, {
          title: `SingIn | NINJUCOL`,
    
          error: error,
    
          server_url: importer.env.SERVER_URL,
        }, (error, html) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent(error)}`);
    
          return res.send(html);
        });
      },
    },
  },
  // >>-------- GET - ABOVE --------<<

  // >>-------- POST - BELOW --------<<
  POST: {
    '/sign/up': {
      middlewares: {
        query: new middleware.query({
          path: '/sign/up',
        }),
        body: new middleware.body({
          scheme: {
            firstname: 'string',
            lastname : 'string',
            birthdate: 'string',
            phone    : 'string',
            email    : 'string',
            password : 'string',
          },

          path: '/sign/up',
        }),
      },
      handler: async (req, res) => {
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
      },
    },
    '/sign/in': {
      middlewares: {
        query: new middleware.query({
          scheme  : { error: 'string', },
          optional: { error: null,     },

          path: '/sign/in',
        }),
        body: new middleware.body({
          scheme: {
            email   : 'string',
            password: 'string',
          },

          path: '/sign/in',
        }),
      },
      handler: async (req, res) => {
        const data = req.body;
    
        await service.account.auth({
          email   : data.email,
          password: data.password,
        }, async (error, info) => {
          if (error) return res.redirect('/error_at_post?' +
            `error=${encodeURIComponent(error)}`);
          
          if (info.status === 'DENIED') return res.redirect('/sign/in?' +
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
      },
    },
    '/sign/out': {
      middlewares: {
        auth : new middleware.auth({
          path: '/sign/out',
        }),
        query: new middleware.query({
          path: '/sign/out',
        }),
      },
      handler: async (req, res) => {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });
        
        return res.redirect('/sign/in');
      },
    },
  },
  // >>-------- POST - ABOVE --------<<
};
// ~~~~~~~~~~~ROUTER-LOGIN~~~~~~~~~~~


export default routerSIGN;
