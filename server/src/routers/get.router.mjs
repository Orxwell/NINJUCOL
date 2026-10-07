// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import {
  errorAtGetEJS ,
  errorAtPostEJS,

  privateDashboardEJS,
  privateRegisterEJS,

  publicHomeEJS,
  publicAboutUsEJS,
  publicNewsEJS,
  publicNewEJS,
  publicRepositoryEJS,
  publicCampaignsEJS,
  publicJoinUsEJS,
  publicLoginEJS,
} from '#utils/templates.util.mjs';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// Services for the server
import AccountService from '#services/account.service.mjs';
import TokenService from '#services/token.service.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const routerGET = Router();

// Instantiating services -----------------¬
const accountService = new AccountService();
await accountService.init();

const tokenService = new TokenService();
await tokenService.init();
// _________________________________________

const web_title = 'NINJUCOL';

// ~~~~~~~~~~~~~~~~~~~~ROUTER-GET~~~~~~~~~~~~~~~~~~~~
// >>-------- Public Routes - BELOW --------<<
routerGET.get('/',
  async (req, res) => {
    try {
      return res.render(publicHomeEJS, {
        title: `Home | ${web_title}`,

        server_url: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);

routerGET.get('/about_us',
  async (req, res) => {
    try {
      return res.render(publicAboutUsEJS, {
        title: `${web_title} - Home`,

        server_url: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);

routerGET.get('/services',
  async (req, res) => {
    try {
      return res.render(publicServicesEJS, {
        title: `${web_title} - Home`,

        server_url: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);

routerGET.get('/login',
  middleware.queryParams({
    scheme  : { error: 'string|null',  },
    optional: { error: 'null',         },
  }),
  async (req, res) => {
    const { error } = req.query;

    try {
      return res.render(publicLoginEJS, {
        title: `${web_title} - Login`,

        error: error,

        server_url: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);
// >>-------- Public Routes - ABOVE --------<<


// >>-------- Private Routes - BELOW --------<<
routerGET.get('/dashboard',
  middleware.queryParams({}),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      return res.redirect('/login?' +
        `error=${encodeURIComponent('Usted a sido redireccionado porque no cuenta con un token válido.')}`);
    }

    try {
      const token_body = await tokenService.findByToken({ token: auth_token });
      
      if (!token_body) {
        return res.redirect('/login?' +
          `error=${encodeURIComponent('Sesión expirada.')}`);
      }

      const account = await accountService.findByEmail({ email: token_body.email, });

      return res.render(privateDashboardEJS, {
        title: `${web_title} - Dashboard`,

        account: account,

        server_url: env.SERVER_URL,
      });

    } catch (err) {
      return res.redirect('/error-at-post?' +
        `error=${encodeURIComponent(err.message)}`
      );
    }
  }
);

routerGET.get('/register',
  middleware.queryParams({
    scheme  : { error: 'string|null',  },
    optional: { error: 'null',         },
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      return res.redirect('/login?' +
        `error=${encodeURIComponent('Usted a sido redireccionado porque no cuenta con un token válido.')}`);
    }

    const { error } = req.query;

    try {
      return res.render(privateRegisterEJS, {
        title: `${web_title} - Register`,

        error: error,

        server_url: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);
// >>-------- Private Routes - ABOVE --------<<


// >>-------- Errors Routes - BELOW --------<<
routerGET.get('/error-at-post',
  middleware.queryParams({
    scheme  : { error: 'string|null', },
    optional: { error: 'null',        },
  }),
  async (req, res) => {
    const { error } = req.query;

    try {
      return res.render(errorAtPostEJS, {
        title: `${web_title} - Info`,

        route: req.path,

        error: error,

        server_url: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);

routerGET.get('/*splat',
  middleware.queryParams({
    scheme  : { error: 'string|null', },
    optional: { error: 'null',        },
  }),
  async (req, res) => {
    const { error } = req.query;

    try {
      return res.render(errorAtGetEJS, {
        title: `${web_title} - Info`,

        route: req.path,

        error: error,

        server_url: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);
// >>-------- Errors Routes - ABOVE --------<<
// ~~~~~~~~~~~~~~~~~~~~ROUTER-GET~~~~~~~~~~~~~~~~~~~~


// >>-------- Default Handler - BELOW --------<<
routerGET.use((error, req, res, next) => {
  return res.status(error.status ?? 500).json({
    id     : error.id     ,
    message: error.message,
  });
});
// >>-------- Default Handler - ABOVE --------<<


export default routerGET;
