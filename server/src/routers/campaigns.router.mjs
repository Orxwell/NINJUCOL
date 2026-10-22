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
  middleware.query({}),
  async (req, res) => {
    const found_campaigns = await service.campaign.findAll((error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.render(publicCampaignsEJS, {
      title: `Campaigns | NINJUCOL`,

      campaigns: found_campaigns,

      server_url: env.SERVER_URL,
    }, (error, html) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent('RENDER_ERROR./campaigns')}`);
        
      return res.send(html);
    });
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-CAMPAIGNS~~~~~~~~~~~

export default routerCAMPAIGNS;
