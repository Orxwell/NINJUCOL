// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import { publicAboutUsEJS } from '#utils/templates.util.mjs';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const routerABOUT_US = Router();


// ~~~~~~~~~~~ROUTER-ABOUT_US~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
routerABOUT_US.get('/about_us',
  middleware.queryParams({}),
  async (req, res) => {
    try {
      return res.render(publicAboutUsEJS, {
        title: `AboutUs | NINJUCOL`,

        server_url: env.SERVER_URL,
      });
      
    } catch (error) {
      return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error.message)}`
      );
    }
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-ABOUT_US~~~~~~~~~~~

export default routerABOUT_US;
