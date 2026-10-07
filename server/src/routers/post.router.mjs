// Framework for the Back-End
import { Router } from 'express';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// Services for the server
import AccountService from '#services/account.service.mjs';
import TokenService   from '#services/token.service.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const routerPOST = Router();

// Instantiating services -----------------¬
const accountService = new AccountService();
await accountService.init();

const tokenService = new TokenService();
await tokenService.init();
// _________________________________________


// ~~~~~~~~~~~~~~~~~~~~~~~~~API-POST~~~~~~~~~~~~~~~~~~~~~~~~~
// >>-------- POST - Public Routes - BELOW --------<<
routerPOST.post('/test',
  async (req, res) => {
    try       { return res.sendStatus(202); }
    catch (_) { return res.sendStatus(503); }
  }
);

routerPOST.post('/register',
  middleware.bodyParams({
    scheme: {
      firstname   : 'string',
      lastname    : 'string',
      birthdate   : 'string',
      phone       : 'string',
      email       : 'string',
      password    : 'string',
      re_password : 'string',
      accept_terms: 'string',
    },
  }),
  async (req, res) => {
    const { firstname, lastname, birthdate, phone, email, password, re_password } = req.body;

    if (password !== re_password) {
      return res.redirect('/register?' +
        `error=${encodeURIComponent('Check both password fields.')}`
      );
    }

    try {
      const formatted_firstname = firstname
        .charAt(0)
        .toUpperCase() + firstname.slice(1);

      const formatted_lastname = lastname
        .charAt(0)
        .toUpperCase() + lastname.slice(1);
        
      await accountService.create({
        firstname: formatted_firstname,
        lastname : formatted_lastname,
        birthdate: birthdate,
        phone    : phone,
        email    : email,
        password : password,
      });

    } catch (err) {
      if (err.code === 'ERR-3') {
        return res.redirect('/register?' +
          `error=${encodeURIComponent('Account already exist.')}`
        );
      }
      
      return res.redirect('/error-at-post?' +
        `error=${encodeURIComponent(err.message)}`
      );
    }

    try {
      return res.redirect('/login');

    } catch (_) { return res.sendStatus(503); }
  }
);

routerPOST.post('/login',
  middleware.bodyParams({
    scheme: {
      email   : 'string',
      password: 'string',
    },
  }),
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const auth = await accountService.auth({
        email   : email,
        password: password,
      });

      if (auth.status === 'DENIED') {
        return res.redirect('/login?' +
          `error=${encodeURIComponent('Invalid password.')}`
        );
      }

    } catch (err) {
      if (err.code === 'ERR-2') {
        return res.redirect('/login?' +
          `error=${encodeURIComponent('Invalid email.')}`);
      }
      
      return res.redirect('/error-at-post?' +
        `error=${encodeURIComponent(err.message)}`
      );
    }

    try {
      const searched_token = await tokenService.findByEmail({ email: email, });

      let token_body;
      if (searched_token) {
        token_body = searched_token;
      } else {
        token_body = await tokenService.generate({ email: email, });
        await tokenService.save(token_body);
      }

      res.cookie('auth_token', token_body.token, {
        httpOnly: true,
        secure  : true,
        sameSite: 'strict',
        expires : new Date(
          Date.now() +
          (env.TOKEN_LIFE_SECONDS * 1000)
        ),
      });

      return res.redirect('/dashboard');

    } catch (err) {
      return res.redirect('/error-at-post?' +
        `error=${encodeURIComponent(err.message)}`
      );
    }
  }
);
// >>-------- POST - Public Routes - ABOVE --------<<


// >>-------- POST - Private Routes - ABOVE --------<<
routerPOST.post('/logout',
  middleware.queryParams({}),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      return res.redirect('/login?' +
        `error=${encodeURIComponent('Usted a sido redireccionado porque no cuenta con un token válido.')}`);
    }

    try {
      const token_body = await tokenService.findByToken({ token: auth_token });
      
      if (!token_body) {
        return res.redirect('/login?' +
          `error=${encodeURIComponent('Sesión expirada.')}`);
      }

      await tokenService.delete({ token: token_body.token });

      return res.redirect('/login');

    } catch (err) {
      return res.redirect('/error-at-post?' +
        `error=${encodeURIComponent(err.message)}`
      );
    }
  }
);

routerPOST.post('/dashboard/api/manage-accounts',
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      return res.redirect('/login?' +
        `error=${encodeURIComponent('Usted a sido redireccionado porque no cuenta con un token válido.')}`);
    }

    try {
      const token_body = await tokenService.findByToken({ token: auth_token });
      
      if (!token_body) {
        return res.redirect('/login?' +
          `error=${encodeURIComponent('Sesión expirada.')}`);
      }

      const body = req.body;

      if (body.STATUSES) await accountService.updateAccountsStatuses({ statuses: body.STATUSES, });
      if (body.ROLES)    await accountService.updateAccountsRoles({ roles: body.ROLES, });

      return res.redirect('/dashboard');

    } catch (err) {
      return res.redirect('/error-at-post?' +
        `error=${encodeURIComponent(err.message)}`
      );
    }
  }
);
// >>-------- POST - Private Routes - BELOW --------<<


// >>-------- POST - Errors Routes - BELOW --------<<
routerPOST.post('/*splat',
  async (req, res) => {
    try       { return res.redirect('/error-at-post'); }
    catch (_) { return res.sendStatus(503)           ; }
  }
);
// >>-------- POST - Errors Routes - ABOVE --------<<
// ~~~~~~~~~~~~~~~~~~~~~~~~~API-POST~~~~~~~~~~~~~~~~~~~~~~~~~


export default routerPOST;
