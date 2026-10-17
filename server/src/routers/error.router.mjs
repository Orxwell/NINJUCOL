// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import {
  errorAtGetEJS ,
  errorAtPostEJS,
} from '#utils/templates.util.mjs';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const routerERROR = Router();


// ~~~~~~~~~~~ROUTER-ERRORS~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
routerERROR.get('/error_at_get',
  middleware.queryParams({
    scheme  : { error: 'string', },
    optional: { error: null,     },
  }),
  async (req, res) => {
    const { error } = req.query;

    try {
      return res.render(errorAtGetEJS, {
        title: `Info | NINJUCOL`,

        route: req.path,

        error: error,

        server_url: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);

routerERROR.get('/error_at_post',
  middleware.queryParams({
    scheme  : { error: 'string', },
    optional: { error: null,     },
  }),
  async (req, res) => {
    const { error } = req.query;

    try {
      return res.render(errorAtPostEJS, {
        title: `Info | NINJUCOL`,

        route: req.path,

        error: error,

        server_url: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);

routerERROR.get('/*splat',
  async (req, res) => {
    try {
      return res.redirect('/error_at_get' +
        `error=${encodeURIComponent('No existe esta URL.')}`);

    } catch (_) { return res.sendStatus(503); }
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
routerERROR.post('/*splat',
  async (req, res) => {
    try {
      return res.redirect('/error_at_post' +
        `error=${encodeURIComponent('No existe esta URL.')}`);

    } catch (_) { return res.sendStatus(503); }
  }
);
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-ERROR~~~~~~~~~~~

export default routerERROR;
