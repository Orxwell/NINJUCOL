// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import { privateDashboardEJS } from '#utils/templates.util.mjs';

// Middlewares for the endpoints
import middleware from '#middlewares/handler.middleware.mjs';

// Services for the server
import service from '#services/handler.service.mjs';

// External & Internal Libraries
import { env } from '#importers/env.importer.mjs';


const routerDASHBOARD = Router();


// ~~~~~~~~~~~ROUTER-DASHBOARD~~~~~~~~~~~
// >>-------- GET - BELOW --------<<
routerDASHBOARD.get('/dashboard',
  middleware.queryParams({}),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    try {
      const found_token = await service.token.findByToken({ token: auth_token }, (error) => { throw error; });
      
      if (!found_token) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      const found_account = await service.account.findByEmail({ email: found_token.email, }, (error) => { throw error; });

      return res.render(privateDashboardEJS, {
        title: `Dashboard | NINJUCOL`,

        account: found_account,

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
routerDASHBOARD.post('/dashboard/add/new',
  middleware.bodyParams({
    scheme: {
      new: {
        title: 'string',
        author: 'string',
        resume: 'string',
        description: 'string',
        image_url: 'string',
        video_url: 'string',
      },
    }
  }),
  async (res, req) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    const data = req.query;

    try {
      const found_token = await service.token.findByToken({ token: auth_token }, (error) => { throw error; });
      
      if (!found_token) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      await service.new.create({
        title      : data.title,
        author     : data.author,
        resume     : data.resume,
        description: data.description,
        image_url  : data.image_url,
        video_url  : data.video_url,
      }, (error) => { throw error; });

      return res.sendStatus(200);

    } catch (err) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(err.message)}`
      );
    }
  },
)

routerDASHBOARD.post('/dashboard/del/new',
  middleware.queryParams({ scheme: { uuid: 'string' } }),
  async (res, req) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    const { uuid } = req.query;

    try {
      const found_token = await service.token.findByToken({ token: auth_token }, (error) => { throw error; });
      
      if (!found_token) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      await service.new.deleteByUUID({ uuid: uuid }, (error) => { throw error; })

      return res.sendStatus(200);

    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error.message)}`
      );
    }
  },
)

routerDASHBOARD.post('/dashboard/upd/new',
  middleware.queryParams({ scheme: { uuid: 'string' } }),
  middleware.bodyParams({
    scheme: {
      new: {
        title: 'string',
        author: 'string',
        resume: 'string',
        description: 'string',
        image_url: 'string',
        video_url: 'string',
      },
    }
  }),
  async (res, req) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    const { uuid } = req.query;

    try {
      const found_token = await service.token.findByToken({ token: auth_token });
      
      if (!found_token) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      await service.new.updateByUUID({
        uuid: uuid,
        setter: {
          title      : data.title,
          author     : data.author,
          resume     : data.resume,
          description: data.description,
          image_url  : data.image_url,
          video_url  : data.video_url,
        }
      }, (error) => { throw error; });

      return res.sendStatus(200);

    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error.message)}`
      );
    }
  },
)
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-DASHBOARD~~~~~~~~~~~

export default routerDASHBOARD;
