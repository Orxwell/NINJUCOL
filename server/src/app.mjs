import express      from 'express';
import morgan       from 'morgan';
import cookieParser from 'cookie-parser';

// Framework for the Back-End
import { Router } from 'express';

// Routers for the app
import router from '#routers/handler.router.mjs';

// Middlewares for the app
import middleware from '#middlewares/handler.middleware.mjs';

// Services for the app
import service from '#services/handler.service.mjs';

// Utils for the router
import { initRouter } from '#src/utils/functions.util.mjs';

// Importers for the app
import importer from '#importers/handler.importer.mjs';


const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(importer.env.COOKIE_SECRET));

morgan.token('url', (req) => {
  return req.originalUrl.split('?')[0];
});

switch (importer.env.SERVER_MODE) {
  case 'dev':
    app.use(morgan('dev'));
    break;
  
  case 'comb':
    app.use(morgan('combined'));
    break;

  case 'prod': break;

  default: throw new Error('  ~Internal-Server-Error: invalid application mode.~');
}

// Global middlewares ----------------¬
const audit = new middleware.audit({});
await audit.init();

app.use(audit.middleware);
// ____________________________________

// Setting the routes
for (const [name, config] of Object.entries(router)) {
  const cache_router = Router();

  await initRouter({
    router: cache_router,
    config: config,
  });

  app.use(cache_router);

  console.log(`[Server] using the router-${name}`);
}

// Handling global events
app.use((error, req, res, next) => {
  return res.status(error.status ?? 500).json({
    id     : error.id     ,
    message: error.message,
  });
});

// Erasing all tokens
await service.token.deleteAll({ firm: '' });

// Export app-config of the app
const app_config = {
  app: {
    audit: audit,
  },
  routers: router,
};

export { app_config };

export default app;
