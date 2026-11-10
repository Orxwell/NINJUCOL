// Templates for the Front-End
import template from '#utils/templates.util.mjs';

// Services for the router
import service from '#services/handler.service.mjs';

// Middlewares for the router
import middleware from '#middlewares/handler.middleware.mjs';

// Importers for the router
import importer from '#importers/handler.importer.mjs';


// ~~~~~~~~~~~ROUTER-NEWS~~~~~~~~~~~
const routerNEWS = {
  // >>-------- GET - BELOW --------<<
  GET: {
    '/news': {
      middlewares: {
        query: new middleware.query({
          scheme  : { error: 'string',  },
          optional: { error: undefined, },

          path: '/news',
        }),
      },
      handler: async (req, res) => {
        return await service.new.findAll((error, records) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent(error)}`);
          
          return res.render(template.publicNewsEJS, {
            title: `News | NINJUCOL`,
        
            records: records,
      
            error: error,
        
            server_url: importer.env.SERVER_URL,
          }, (error, html) => {
            if (error) return res.redirect('/error_at_get?' +
              `error=${encodeURIComponent('RENDER_ERROR./news')}`);
              
            return res.send(html);
          });
        });
      },
    },
    '/news/new': {
      middlewares: {
        query: new middleware.query({
          scheme: { uuid: 'string', },

          path: '/news/new',
        }),
      },
      handler: async (req, res) => {
        const { uuid } = req.query;
    
        return await service.new.findByUUID({ uuid: uuid }, (error, record) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent(error)}`);
          
          if (Object.keys(record).length === 0) return res.redirect('/news?'+
          `error=${encodeURIComponent('No existe la noticia solicitada.')}`);
          
          return res.render(template.publicNewEJS, {
            title: `New | NINJUCOL`,
      
            records: record,
            record: record,
            server_url: importer.env.SERVER_URL,
          }, (error, html) => {
            if (error) {
              console.error("🔥 ERROR DE EJS EN /news/new:", error);
              return res.redirect('/error_at_get?' +
                `error=${encodeURIComponent('RENDER_ERROR./new')}`);
            }
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
// ~~~~~~~~~~~ROUTER-NEWS~~~~~~~~~~~


export default routerNEWS;
