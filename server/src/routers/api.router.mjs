// Framework for the Back-End
import { Router } from 'express';

// Templates for the API

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// Services for the API
import service from '#services/handler.service.mjs';

// Importers for the endpoints
import importer from '#importers/handler.importer.mjs';

// External & Internal libraries
import { lookup } from 'mime-types';
import { join }   from 'path'      ;
import {
  access   ,
  constants,
} from 'fs/promises';

import paths from '#utils/paths.util.mjs' ;

import {
  getFolders,
  getFiles  ,
} from '#utils/functions.util.mjs';


const routerAPI = Router();


// Important-Internal-Constants: (IIC) ---------------¬
const ROUTE_SPECS = {
  css : { path: paths.css  },
  ico : { path: paths.ico  },
  js  : { path: paths.js   },
  pdf : { path: paths.pdf  },
  png : { path: paths.png  },
  wav : { path: paths.wav  },
  webp: { path: paths.webp },
}
// ___________________________________________________-


// ~~~~~~~~~~~ROUTER-API~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
routerAPI.get('/api',
  middleware.query({}),
  async (req, res) => {
    const folders = await getFolders({ folder_path: paths.static });

    if (folders.length === 0) return res.status(404)
      .json({ error: 'Sorry: folders not found' });
      
    const endpoints = folders.map(folder => `${importer.env.SERVER_URL}/api/${folder}`);

    return res.status(202)
      .json({
        availableFolders  : folders,
        availableEndpoints: endpoints,
      });
  }
);

routerAPI.get('/api/:route',
  middleware.query({}),
  middleware.route({ scheme: { route: 'string' }, }),
  async (req, res) => {
    const { route } = req.params;

    if (!ROUTE_SPECS[route]) return res.status(400)
      .json({ error: `Unknown route: ${route}` });

    const folders = await getFolders({ folder_path: ROUTE_SPECS[route].path });

    if (folders.length === 0) return res.status(404)
      .json({ error: 'Sorry: folders not found' });

    const endpoints = folders.map(folder => `${importer.env.SERVER_URL}/api/${route}/${folder}`);

    return res.status(202)
      .json({
        availableFolders  : folders,
        availableEndpoints: endpoints,
      });
  }
);

routerAPI.get('/api/:route/:to',
  middleware.query({}),
  middleware.route({
    scheme: {
      route: 'string',
      to   : 'string',
    },
  }),
  async (req, res) => {
    const { route, to } = req.params;

    if (!ROUTE_SPECS[route]) return res.status(400)
      .json({ error: `Unknown route: ${route}` });

    if (to === 'private') {
      const { auth_token } = req.cookies;

      if (!auth_token) return res.status(401)
        .json({ error: 'Unauthorized response: token not provided' });

      await service.token.findByToken({ token: auth_token }, (error, info) => {
        if (error) return res.redirect('/error_at_get?' +
          `error=${encodeURIComponent(error)}`);

        if (!info) return res.status(401)
          .json({ error: 'Unauthorized response: invalid token' });
        
        return info;
      });
  
      if (res.headersSent) return;
    }

    const abs_path = join(ROUTE_SPECS[route].path, to);
    const files    = await getFiles({ folder_path: abs_path });

    if (files.length === 0) return res.status(404)
      .json({ error: 'Sorry: files not found' });

    const endpoints = files.map(file => `${importer.env.SERVER_URL}/api/${route}/${to}/${file}`);

    return res.status(202)
      .json({
        availableFiles    : files,
        availableEndpoints: endpoints,
      });
  }
);

routerAPI.get('/api/:route/:to/:file',
  middleware.query({
    scheme  : { v: 'number' },
    optional: { v: null },
  }),
  middleware.route({
    scheme: {
      route: 'string',
      to   : 'string',
      file : 'string',
    },
  }),
  async (req, res) => {
    const { route, to, file } = req.params;

    if (!ROUTE_SPECS[route]) return res.status(400)
      .json({ error: `Unknown route: ${route}` });

    if (to === 'private') {
      const { auth_token } = req.cookies;

      if (!auth_token) return res.status(401)
        .json({ error: 'Unauthorized response: token not provided' });

      await service.token.findByToken({ token: auth_token }, (error, info) => {
        if (error) return res.redirect('/error_at_get?' +
          `error=${encodeURIComponent(error)}`);

        if (!info) return res.status(401)
          .json({ error: 'Unauthorized response: invalid token' });
        
        return info;
      });
  
      if (res.headersSent) return;
    }

    const requested_path = join(ROUTE_SPECS[route]?.path, to, file);

    try {
      await access(requested_path, constants.F_OK);

      res.setHeader('Content-Type', lookup(requested_path));

      return res.sendFile(requested_path);
      
    } catch (error) {
      if (error.code === 'ENOENT') return res.status(404)
        .json({ error: 'Sorry: resource not found' });

      return res.sendStatus(503);
    }
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-API~~~~~~~~~~~

export default routerAPI;
