// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import { publicCampaignsEJS } from '#utils/templates.util.mjs';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// Services for the route
import service from '#services/handler.service.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const routerCAMPAIGNS = Router();


// ~~~~~~~~~~~ROUTER-CAMPAIGNS~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
routerCAMPAIGNS.get('/campaigns',
  middleware.queryParams({}),
  async (req, res) => {
    try {
      const found_campaigns = await service.campaigns.findAll((error) => { throw error; });

      return res.render(publicCampaignsEJS, {
        title: `Campaigns | NINJUCOL`,

        campaigns: found_campaigns,

        server_url: env.SERVER_URL,
      });

    } catch (error) {
      return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error.message)}`
      );
    }
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-CAMPAIGNS~~~~~~~~~~~

export default routerCAMPAIGNS;
