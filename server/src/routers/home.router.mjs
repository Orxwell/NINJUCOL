// Templates for the Front-End
import template from '#utils/templates.util.mjs';

// Middlewares for the router
import middleware from '#middlewares/handler.middleware.mjs';

// Importers for the router
import importer from '#importers/handler.importer.mjs';


// ~~~~~~~~~~~ROUTER-HOME~~~~~~~~~~~
const routerHOME = {
  // >>-------- GET - BELOW --------<<
  GET: {
    '/': {
      middlewares: {
        query: new middleware.query({
          path: '/',
        }),
      },
      handler: async (req, res) => {
        return res.render(template.publicHomeEJS, {
          title: `Home | NINJUCOL`,
    
          server_url: importer.env.SERVER_URL,
        }, (error, html) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent('RENDER_ERROR./')}`);
    
          return res.send(html);
        });
      },
    },
  },
  // >>-------- GET - ABOVE --------<<

  // >>-------- POST - BELOW --------<<
  POST: {},
  // >>-------- POST - ABOVE --------<<
};
// ~~~~~~~~~~~ROUTER-HOME~~~~~~~~~~~


export default routerHOME;
