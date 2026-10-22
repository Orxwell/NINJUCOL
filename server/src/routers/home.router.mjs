// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import { publicHomeEJS } from '#utils/templates.util.mjs';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const routerHOME = Router();


// ~~~~~~~~~~~ROUTER-HOME~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
routerHOME.get('/',
  middleware.query({}),
  async (req, res) => {
    return res.render(publicHomeEJS, {
      title: `Home | NINJUCOL`,

      server_url: env.SERVER_URL,
    }, (error, html) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent('RENDER_ERROR./')}`);

      return res.send(html);
    });
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-HOME~~~~~~~~~~~

export default routerHOME;
