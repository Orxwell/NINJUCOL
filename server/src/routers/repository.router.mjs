// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import { publicRepositoryEJS } from '#utils/templates.util.mjs';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// Services for the route
import service from '#services/handler.service.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const routerREPOSITORY = Router();


// ~~~~~~~~~~~ROUTER-REPOSITORY~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
routerHOME.get('/repository',
  middleware.queryParams({}),
  async (req, res) => {
    try {
      const found_repository = await service.repository.findAll();

      return res.render(publicRepositoryEJS, {
        title: `Repository | NINJUCOL`,

        repository: found_repository,

        server_url: env.SERVER_URL,
      });
    } catch (_) { return res.sendStatus(503); }
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-REPOSITORY~~~~~~~~~~~

export default routerREPOSITORY;
