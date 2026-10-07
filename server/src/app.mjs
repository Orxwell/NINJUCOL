import express      from 'express'      ;
import morgan       from 'morgan'       ;
import cookieParser from 'cookie-parser';

import router from '#routers/handler.router.mjs';

// Services for the server
import TokenService from '#services/token.service.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser('secret'));

switch (env.MODE) {
  case 'dev':
    app.use(morgan(env.MODE));
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

// Instantiating services -------------¬
const tokenService = new TokenService();
await tokenService.init();
// _____________________________________

// Erasing all tokens
await tokenService.deleteAll({ firm: 1 });

export default app;
