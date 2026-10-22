import express      from 'express'      ;
import morgan       from 'morgan'       ;
import cookieParser from 'cookie-parser';

// Router for the server
import router from '#routers/handler.router.mjs';

// Services for the server
import service from '#services/handler.service.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser('secret'));

morgan.token('url', (req) => {
  return req.originalUrl.split('?')[0];
});

switch (env.MODE) {
  case 'dev':
    app.use(morgan('dev'));
    break;
  
  case 'comb':
    app.use(morgan('combined'));
    break;

  case 'prod': break;

  default: throw new Error('  ~Internal-Server-Error: invalid application mode.~');
}

// Setting the routes
Object.entries(router).forEach(([name, router]) => {
  console.log(`  ~Server using the router-${name}~`);

  app.use(router);
});

// Handling global events
app.use((error, req, res, next) => {
  return res.status(error.status ?? 500).json({
    id     : error.id     ,
    message: error.message,
  });
});

// Erasing all tokens
await service.token.deleteAll({ firm: 1 });

export default app;
