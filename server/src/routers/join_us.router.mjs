// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import { publicJoinUsEJS } from '#utils/templates.util.mjs';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// Importers for the endpoints
import importer from '#importers/handler.importer.mjs';


const routerJOIN_US = Router();


// ~~~~~~~~~~~ROUTER-REPOSITORY~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
routerJOIN_US.get('/join_us',
  middleware.query({}),
  async (req, res) => {
    return res.render(publicJoinUsEJS, {
      title: `JoinUs | NINJUCOL`,

      server_url: importer.env.SERVER_URL,
    }, (error, html) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent('RENDER_ERROR./join_us')}`);
        
      return res.send(html);
    });
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-JOIN_US~~~~~~~~~~~

export default routerJOIN_US;
