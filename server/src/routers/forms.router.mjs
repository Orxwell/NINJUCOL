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
      return res.sendStatus(100);
      
    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error.message)}`
      );
    }
  }
);
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-HOME~~~~~~~~~~~

export default routerFORMS;
