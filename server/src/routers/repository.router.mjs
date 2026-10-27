// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import { publicRepositoryEJS } from '#utils/templates.util.mjs';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// Services for the endpoints
import service from '#services/handler.service.mjs';

// Importers for the endpoints
import importer from '#importers/handler.importer.mjs';


const routerREPOSITORY = Router();


// ~~~~~~~~~~~ROUTER-REPOSITORY~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
routerREPOSITORY.get('/repository',
  middleware.query({}),
  async (req, res) => {
    return await service.repository.findAll((error, records) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      return res.render(publicRepositoryEJS, {
        title: `Repository | NINJUCOL`,
    
        repository: records,
    
        server_url: importer.env.SERVER_URL,
      }, (error, html) => {
        if (error) return res.redirect('/error_at_get?' +
          `error=${encodeURIComponent('RENDER_ERROR./repository')}`);
            
        return res.send(html);
      });
    });
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-REPOSITORY~~~~~~~~~~~

export default routerREPOSITORY;
