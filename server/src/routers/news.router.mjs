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
  middleware.query({
    scheme  : { error: 'string',  },
    optional: { error: undefined, },
  }),
  async (req, res) => {
    const found_news = await service.new.findAll((error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.render(publicNewsEJS, {
      title: `News | NINJUCOL`,

      news: found_news,

      server_url: env.SERVER_URL,
    }, (error, html) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent('RENDER_ERROR./news')}`);
      
      return res.send(html);
    });
  }
);

routerNEWS.get('/news/new',
  middleware.query({ scheme: { uuid: 'string', }, }),
  async (req, res) => {
    const { uuid } = req.query;

    const found_new = await service.new.findByUUID({ uuid: uuid }, (error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) return res.redirect('/news' +
      `error=${encodeURIComponent('No existe la noticia solicitada.')}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.render(publicNewEJS, {
      title: `New | NINJUCOL`,

      new: found_new,

      server_url: env.SERVER_URL,
    }, (error, html) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent('RENDER_ERROR./new')}`);
      
      return res.send(html);
    });
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-NEWS~~~~~~~~~~~

export default routerNEWS;
