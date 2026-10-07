// Framework for the Back-End
import { Router } from 'express';

// Templates for the API

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// Services for the API

// External & Internal Libraries
import { lookup } from 'mime-types';
import { join }   from 'path'      ;
import {
  access   ,
  constants,
} from 'fs/promises';

import { env } from '#importers/env.importer.mjs';

import paths from '#utils/paths.util.mjs' ;
import {
  getFolders,
  getFiles  ,
} from '#utils/functions.util.mjs';


const routerAPI = Router();

// Instantiating services -------------------¬
// ___________________________________________


// ~~~~~~~~~~~~~~~~~~~~~~~~~API-GET~~~~~~~~~~~~~~~~~~~~~~~~~
// Important Internal Constants: (IIC) ---------------¬
const ROUTE_SPECS = {
  css : { path: paths.cssPath  },
  ico : { path: paths.icoPath  },
  js  : { path: paths.jsPath   },
  pdf : { path: paths.pdfPath  },
  png : { path: paths.pngPath  },
  wav : { path: paths.wavPath  },
  webp: { path: paths.webpPath },
}
// ___________________________________________________-


// >>-------- GET - API in General - Below --------<<
routerAPI.get('/api',
  middleware.queryParams({ scheme: {}, mode: 'reply' }),
  async (req, res) => {
    if (req?.queryParamsError) {
      // Handle the error
    }

    const folders = await getFolders(paths.staticPath);

    if (!folders) return res.sendStatus(404);
    
    const endpoints = folders.map(folder => `${env.SERVER_URL}/api/${folder}`);

    return res.status(202).json({
      availableFolders  : folders  ,
      availableEndpoints: endpoints,
    });
  }
);

routerAPI.get('/api/:route',
  middleware.routeParams({ scheme: { route: 'string' }, }),
  async (req, res) => {
    if (req?.routeParamsError) {
      // Handle the error
    }

    const { route } = req.params;

    if (!ROUTE_SPECS[route]) return res.status(400).json({ error: `Unknown route: ${route}` });

    const folders = await getFolders(ROUTE_SPECS[route].path);

    if (!folders) return res.sendStatus(404);

    const endpoints = folders.map(folder => `${env.SERVER_URL}/api/${route}/${folder}`);

    return res.status(202).json({
      availableFolders  : folders  ,
      availableEndpoints: endpoints,
    });
  }
);

routerAPI.get('/api/:route/:to',
  middleware.routeParams({
    scheme: {
      route: 'string',
      to   : 'string',
    },
  }),
  async (req, res) => {
    if (req?.routeParamsError) {
      // Handle the error
    }

    const { route, to } = req.params;

    if (!ROUTE_SPECS[route]) return res.status(400).json({ error: `Unknown route: ${route}` });

    const abs_path = join(ROUTE_SPECS[route].path, to);
    const files    = await getFiles(abs_path)         ;

    if (!files) return res.sendStatus(404);

    const endpoints = files.map(file => `${env.SERVER_URL}/api/${route}/${to}/${file}`);

    return res.status(202).json({
      availableFiles    : files    ,
      availableEndpoints: endpoints,
    });
  }
);

routerAPI.get('/api/:route/:to/:file',
  middleware.routeParams({
    scheme: {
      route: 'string',
      to   : 'string',
      file : 'string',
    },
  }),
  async (req, res) => {
    if (req?.routeParamsError) {
      // Handle the error
    }
    
    const { route, to, file } = req.params;

    if (!ROUTE_SPECS[route]) return res.status(400).json({ error: `Unknown route: ${route}` });

    const requested_path = join(ROUTE_SPECS[route]?.path, to, file);

    // Try-Catch
    try {
      await access(requested_path, constants.F_OK);

      res.setHeader('Content-Type', lookup(requested_path));

      return res.sendFile(requested_path);
      
    } catch (_) { return res.sendStatus(404); }
  }
);
// >>-------- GET - API in General - Above --------<<

// ~~~~~~~~~~~~~~~~~~~~~~~~~API-GET~~~~~~~~~~~~~~~~~~~~~~~~~


// ~~~~~~~~~~~~~~~~~~~~~~~~~API-POST~~~~~~~~~~~~~~~~~~~~~~~~~
// >>-------- POST - API for downloads - Below --------<<

// >>-------- POST - API for downloads - Above --------<<
// ~~~~~~~~~~~~~~~~~~~~~~~~~API-POST~~~~~~~~~~~~~~~~~~~~~~~~~


// >>-------- API - Error Handler - BELOW --------<<
routerAPI.use((error, req, res, next) => {
  return res.status(error.status).json({
    id     : error.id,
    message: error.message,
  });
});
// >>-------- API - Error Handler - ABOVE --------<<

export default routerAPI;
