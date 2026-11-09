// Templates for the Front-End
import template from '#utils/templates.util.mjs';

// Services for the router
import service from '#services/handler.service.mjs';

// Middlewares for the router
import middleware from '#middlewares/handler.middleware.mjs';

// Importers for the router
import importer from '#importers/handler.importer.mjs';


// ~~~~~~~~~~~ROUTER-CAMPAIGNS~~~~~~~~~~~
const routerCAMPAIGNS = {
  // >>-------- GET - BELOW --------<<
  GET: {
    '/campaigns': {
      middlewares: {
        query: new middleware.query({ path: '/campaigns', }),
      },
      handler: async (req, res) => {
        return await service.campaign.findAll((error, records) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent(error)}`);
          
          return res.render(template.publicCampaignsEJS, {
            title: `Campaigns | NINJUCOL`,
        
            records: records,
        
            server_url: importer.env.SERVER_URL,
          }, (error, html) => {
            if (error) return res.redirect('/error_at_get?' +
              `error=${encodeURIComponent('RENDER_ERROR./campaigns')}`);
                
            return res.send(html);
          });
        });
      },
    },
  },
  // >>-------- GET - ABOVE --------<<

  // >>-------- POST - BELOW --------<<
  POST: {},
  // >>-------- POST - ABOVE --------<<
};
// ~~~~~~~~~~~ROUTER-CAMPAIGNS~~~~~~~~~~~


export default routerCAMPAIGNS;
