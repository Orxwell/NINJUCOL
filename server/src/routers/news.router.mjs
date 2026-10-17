// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import {
  publicNewsEJS,
  publicNewEJS,
} from '#utils/templates.util.mjs';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// Services for the route
import service from '#services/handler.service.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const routerNEWS = Router();


// ~~~~~~~~~~~ROUTER-NEWS~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
routerNEWS.get('/news',
  middleware.queryParams({
    scheme  : { error: 'string',  },
    optional: { error: undefined, },
  }),
  async (req, res) => {
    try {
      const found_news = await service.news.findAll((error) => { throw error; });
      
      return res.render(publicNewsEJS, {
        title: `News | NINJUCOL`,

        news: found_news,

        server_url: env.SERVER_URL,
      });

    } catch (error) {
      return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error.message)}`
      );
    }
  }
);

routerNEWS.get('/news/new',
  middleware.queryParams({
    scheme: { uuid: 'string', },
  }),
  async (req, res) => {
    const { uuid } = req.query;

    try {
      const found_new = await service.news.findByUUID({ uuid: uuid }, (error) => { throw error; });

      if (!found_new) return res.redirect('/news' +
        `error=${encodeURIComponent('No existe la noticia solicitada.')}`);

      return res.render(publicNewEJS, {
        title: `New | NINJUCOL`,

        new: found_new,

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
// ~~~~~~~~~~~ROUTER-NEWS~~~~~~~~~~~

export default routerNEWS;
