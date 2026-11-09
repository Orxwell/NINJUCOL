// Templates for the Front-End
import template from '#utils/templates.util.mjs';

// Middlewares for the router
import middleware from '#middlewares/handler.middleware.mjs';

// External & Internal libraries
import importer from '#importers/handler.importer.mjs';


// ~~~~~~~~~~~ROUTER-ERRORS~~~~~~~~~~~
const routerERROR = {
  // >>-------- GET - BELOW --------<<
  GET: {
    '/error_at_get': {
      middlewares: {
        query: new middleware.query({
          scheme  : { error: 'string', },
          optional: { error: null,     },

          path: '/error_at_get',
        }),
      },
      handler: async (req, res) => {
        const { error } = req.query;
    
        return res.render(template.errorAtGetEJS, {
          title: `Info | NINJUCOL`,
    
          route: req.path,
    
          error: error,
    
          server_url: importer.env.SERVER_URL,
        }, (error, html) => {
          if (error) return res.sendStatus(503);
    
          return res.send(html);
        });
      },
    },
    '/error_at_post': {
      middlewares: {
        query: new middleware.query({
          scheme  : { error: 'string', },
          optional: { error: null,     },

          path: '/error_at_post',
        }),
      },
      handler: async (req, res) => {
        const { error } = req.query;
    
        return res.render(template.errorAtPostEJS, {
          title: `Info | NINJUCOL`,
    
          route: req.path,
    
          error: error,
    
          server_url: importer.env.SERVER_URL,
        }, (error, html) => {
          if (error) return res.sendStatus(503);
    
          return res.send(html);
        });
      },
    },
    '/*splat': {
      middlewares: {},
      handler: async (req, res) => {
        try {
          return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent('No existe esta URL.')}`);
    
        } catch (_) { return res.sendStatus(503); }
      },
    },
  },
  // >>-------- GET - ABOVE --------<<

  // >>-------- POST - BELOW --------<<
  POST: {
    '/*splat': {
      middlewares: {},
      handler: async (req, res) => {
        try {
          return res.redirect('/error_at_post?' +
            `error=${encodeURIComponent('No existe esta URL.')}`);
    
        } catch (_) { return res.sendStatus(503); }
      },
    },
  },
  // >>-------- POST - ABOVE --------<<
};
// ~~~~~~~~~~~ROUTER-ERROR~~~~~~~~~~~


export default routerERROR;
