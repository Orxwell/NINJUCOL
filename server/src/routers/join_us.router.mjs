// Templates for the Front-End
import template from '#utils/templates.util.mjs';

// Middlewares for the router
import middleware from '#middlewares/handler.middleware.mjs';

// Importers for the router
import importer from '#importers/handler.importer.mjs';


// ~~~~~~~~~~~ROUTER-REPOSITORY~~~~~~~~~~~
const routerJOIN_US = {
  // >>-------- GET - BELOW --------<<
  GET: {
    '/join_us': {
      middlewares: {
        query: new middleware.query({
          path: '/join_us',
        }),
      },
      handler: async (req, res) => {
        return res.render(template.publicJoinUsEJS, {
          title: `JoinUs | NINJUCOL`,
    
          server_url: importer.env.SERVER_URL,
        }, (error, html) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent('RENDER_ERROR./join_us')}`);
            
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
// ~~~~~~~~~~~ROUTER-JOIN_US~~~~~~~~~~~


export default routerJOIN_US;
