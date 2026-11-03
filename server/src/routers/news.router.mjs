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

// Importers for the endpoints
import importer from '#importers/handler.importer.mjs';


const routerNEWS = Router();


// ~~~~~~~~~~~ROUTER-NEWS~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
routerNEWS.get('/news',
  middleware.query({
    scheme  : { error: 'string',  },
    optional: { error: undefined, },
  }),
  async (req, res) => {
    return await service.new.findAll((error, records) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      return res.render(publicNewsEJS, {
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
  }
);

routerNEWS.get('/news/new',
  middleware.query({ scheme: { uuid: 'string', }, }),
  async (req, res) => {
    const { uuid } = req.query;

    // 1. Verificamos qué UUID exacto está llegando desde el enlace
    console.log("➡️ 1. UUID recibido por query string en el router:", uuid);

    return await service.new.findByUUID({ uuid: uuid }, (error, record) => {
      
      // 2. Verificamos si la consulta de MongoDB tiró algún error técnico
      if (error) {
        console.log("❌ 2. Error devuelto por la base de datos:", error);
        return res.redirect('/error_at_get?' + `error=${encodeURIComponent(error)}`);
      }
      
      // 3. Verificamos qué devolvió exactamente la base de datos
      console.log("📦 3. Registro (record) encontrado en la BD:", record);

      // Protegemos contra nulos o objetos vacíos
      if (!record || Object.keys(record).length === 0) {
        console.log("⚠️ 4. El registro está vacío o nulo. Redirigiendo...");
        return res.redirect('/news?' + `error=${encodeURIComponent('No existe la noticia solicitada.')}`);
      }
      
      return res.render(publicNewEJS, {
        title: `New | NINJUCOL`,
        record: record,
        server_url: importer.env.SERVER_URL,
      }, (error, html) => {
        if (error) {
          console.log("❌ 5. Error al renderizar la vista EJS:", error);
          return res.redirect('/error_at_get?' + `error=${encodeURIComponent('RENDER_ERROR./new')}`);
        }
        
        return res.send(html);
      });
    });
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-NEWS~~~~~~~~~~~

export default routerNEWS;
