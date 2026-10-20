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
  middleware.query({}),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    try {
      const found_token = await service.token.findByToken({ token: auth_token }, (error) => { throw error; });
      
      if (!found_token) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      const found_account = await service.account.findByEmail({ email: found_token.email, }, (error) => { throw error; });

      const found_news       = await service.new.findAll((error) => { throw error; });
      const found_campaigns  = await service.campaign.findAll((error) => { throw error; });
      const found_repository = await service.repository.findAll((error) => { throw error; });

      return res.render(privateDashboardEJS, {
        title: `Dashboard | NINJUCOL`,

        account: found_account,

        data: {
          news      : found_news,
          campaigns : found_campaigns,
          repository: found_repository,
        },

        server_url: env.SERVER_URL,
      });

    } catch (error) {
      return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
    }
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
routerDASHBOARD.post('/dashboard/add/new',
  middleware.multipart({
    scheme: { image: ['image/png'], },
    max_file_size_mb: { image: 5, }
  }),
  middleware.body({
    scheme: {
      title: 'string',
      author: 'string',
      resume: 'string',
      description: 'string',
      video_url: 'string',

      image_uri: 'string',
    }
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    const data = req.body;

    try {
      const found_token = await service.token.findByToken({ token: auth_token }, (error) => { throw error; });
      
      if (!found_token) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      await service.new.create({
        title      : data.title,
        author     : data.author,
        resume     : data.resume,
        description: data.description,
        video_url  : data.video_url,

        image_uri: data.image_uri,
      }, (error) => { throw error; });

      return res.sendStatus(200);

    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
    }
  },
);

routerDASHBOARD.post('/dashboard/del/new',
  middleware.query({ scheme: { uuid: 'string' } }),
  async (req, res) => {
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
        `error=${encodeURIComponent(error)}`);
    }
  },
);

routerDASHBOARD.post('/dashboard/upd/new',
  middleware.query({ scheme: { uuid: 'string' } }),
  middleware.multipart({
    scheme: { image: ['image/png'], },
    max_file_size_mb: { image: 5, }
  }),
  middleware.body({
    scheme: {
      title: 'string',
      author: 'string',
      resume: 'string',
      description: 'string',
      video_url: 'string',

      image_uri: 'string',
    }
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    const { uuid } = req.query;

    const data = req.body;

    try {
      const found_token = await service.token.findByToken({ token: auth_token }, (error) => { throw error; });
      
      if (!found_token) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      await service.new.updateByUUID({
        uuid: uuid,
        setter: {
          title      : data.title,
          author     : data.author,
          resume     : data.resume,
          description: data.description,
          video_url  : data.video_url,

          image_uri: data.image_uri,
        }
      }, (error) => { throw error; });

      return res.sendStatus(200);

    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
    }
  },
);

routerDASHBOARD.post('/dashboard/add/campaign',
  middleware.multipart({
    scheme: { image: ['image/png'], },
    max_file_size_mb: { image: 5, }
  }),
  middleware.body({
    scheme: {
      title      : 'string',
      description: 'string',

      image_uri: 'string',
    }
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    const data = req.body;

    try {
      const found_token = await service.token.findByToken({ token: auth_token }, (error) => { throw error; });
      
      if (!found_token) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      await service.campaign.create({
        title      : data.title,
        description: data.description,

        image_uri: data.image_uri,
      }, (error) => { throw error; });

      return res.sendStatus(200);

    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
    }
  },
);

routerDASHBOARD.post('/dashboard/del/campaign',
  middleware.query({ scheme: { uuid: 'string' } }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    const { uuid } = req.query;

    try {
      const found_token = await service.token.findByToken({ token: auth_token }, (error) => { throw error; });
      
      if (!found_token) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      await service.campaign.deleteByUUID({ uuid: uuid }, (error) => { throw error; })

      return res.sendStatus(200);

    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
    }
  },
);

routerDASHBOARD.post('/dashboard/upd/campaign',
  middleware.query({ scheme: { uuid: 'string' } }),
  middleware.multipart({
    scheme: { image: ['image/png'], },
    max_file_size_mb: { image: 5, }
  }),
  middleware.body({
    scheme: {
      title      : 'string',
      description: 'string',
        
      image_uri: 'string',
    }
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    const { uuid } = req.query;

    const data = req.body;

    try {
      const found_token = await service.token.findByToken({ token: auth_token }, (error) => { throw error; });
      
      if (!found_token) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      await service.campaign.updateByUUID({
        uuid: uuid,
        setter: {
          title      : data.title,
          description: data.description,

          image_uri: data.image_uri,
        }
      }, (error) => { throw error; });

      return res.sendStatus(200);

    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error.message)}`
      );
    }
  },
);

routerDASHBOARD.post('/dashboard/add/repository',
  middleware.multipart({
    scheme: {
      image   : ['image/png'],
      resource: ['image/jpeg'],
    },
    max_file_size_mb: {
      image   : 5,
      resource: 6,
    }
  }),
  middleware.body({
    scheme: {
      title      : 'string',
      description: 'string',

      image_uri   : 'string',
      resource_uri: 'string',
    }
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    const data = req.body;

    try {
      const found_token = await service.token.findByToken({ token: auth_token }, (error) => { throw error; });
      
      if (!found_token) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      await service.repository.create({
        title      : data.title,
        description: data.description,

        image_uri   : data.image_uri,
        resource_uri: data.resource_uri,
      }, (error) => { throw error; });

      return res.sendStatus(200);

    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
    }
  },
);

routerDASHBOARD.post('/dashboard/del/repository',
  middleware.query({ scheme: { uuid: 'string' } }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    const { uuid } = req.query;

    try {
      const found_token = await service.token.findByToken({ token: auth_token }, (error) => { throw error; });
      
      if (!found_token) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      await service.repository.deleteByUUID({ uuid: uuid }, (error) => { throw error; })

      return res.sendStatus(200);

    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
    }
  },
);

routerDASHBOARD.post('/dashboard/upd/repository',
  middleware.query({ scheme: { uuid: 'string' } }),
  middleware.multipart({
    scheme: {
      image   : ['image/png'],
      resource: ['image/jpeg'],
    },
    max_file_size_mb: {
      image   : 5,
      resource: 6,
    }
  }),
  middleware.body({
    scheme: {
      title      : 'string',
      description: 'string',

      image_uri   : 'string',
      resource_uri: 'string',
    }
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);

    const { uuid } = req.query;

    const data = req.body;

    try {
      const found_token = await service.token.findByToken({ token: auth_token }, (error) => { throw error; });
      
      if (!found_token) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      await service.repository.updateByUUID({
        uuid: uuid,
        setter: {
          title      : data.title,
          description: data.description,

          image_uri   : data.image_uri,
          resource_uri: data.resource_uri,
        }
      }, (error) => { throw error; });

      return res.sendStatus(200);

    } catch (error) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
    }
  },
);
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-DASHBOARD~~~~~~~~~~~

export default routerDASHBOARD;
