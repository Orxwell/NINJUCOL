// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import { publicJoinUsEJS } from '#utils/templates.util.mjs';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const routerJOIN_US = Router();


// ~~~~~~~~~~~ROUTER-REPOSITORY~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
routerJOIN_US.get('/join_us',
  middleware.queryParams({}),
  async (req, res) => {
    try {
      return res.render(publicJoinUsEJS, {
        title: `JoinUs | NINJUCOL`,

        server_url: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-JOIN_US~~~~~~~~~~~

export default routerJOIN_US;
