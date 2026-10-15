// Framework for the Back-End
import { Router } from 'express';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const routerFORMS = Router();


// ~~~~~~~~~~~ROUTER-HOME~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
routerFORMS.get('/form/donation',
  middleware.bodyParams({
    scheme: {},
  }),
  async (req, res) => {
    try {
      return res.render(publicHomeEJS, {
        title: `Home | NINJUCOL`,

        server_url: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-HOME~~~~~~~~~~~

export default routerFORMS;
