// Templates for the Front-End
import template from '#utils/templates.util.mjs';

// Middlewares for the router
import middleware from '#middlewares/handler.middleware.mjs';

// Importers for the router
import importer from '#importers/handler.importer.mjs';


// ~~~~~~~~~~~ROUTER-ABOUT_US~~~~~~~~~~~
const routerABOUT_US = {
  // >>-------- GET - BELOW --------<<
  GET: {
    '/about_us': {
      middlewares: {
        query: new middleware.query({ path: '/about_us', }),
      },
      handler: async (req, res) => {
        return res.render(template.publicAboutUsEJS, {
          title: `AboutUs | NINJUCOL`,
    
          server_url: importer.env.SERVER_URL,
        }, (error, html) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent('RENDER_ERROR./about_us')}`);
          
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
// ~~~~~~~~~~~ROUTER-ABOUT_US~~~~~~~~~~~


export default routerABOUT_US;
