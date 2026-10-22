// Framework for the Back-End
import { Router } from 'express';

// Templates for the Front-End
import {
  privateDashboardEJS,
  privateAddNewEJS,
  privateUpdNewEJS,
  privateAddCampaignEJS,
  privateUpdCampaignEJS,
  privateAddRepositoryEJS,
  privateUpdRepositoryEJS,
} from '#utils/templates.util.mjs';

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
  middleware.query({
    scheme  : { info: 'string', },
    optional: { info: null, },
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    const found_token = await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    const found_account = await service.account.findByEmail({ email: found_token.email, }, (error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    const found_news = await service.new.findAll((error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;
    
    const found_campaigns = await service.campaign.findAll((error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;
    
    const found_repository = await service.repository.findAll((error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    console.log({
      news      : found_news,
      campaigns : found_campaigns,
      repository: found_repository,
    });

    return res.render(privateDashboardEJS, {
      title: `Dashboard | NINJUCOL`,

      account: found_account,

      data: {
        news      : found_news,
        campaigns : found_campaigns,
        repository: found_repository,
      },

      server_url: env.SERVER_URL,
    }, (error, html) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent('RENDER_ERROR./dashboard')}`);
        
      return res.send(html);
    });
  }
);

routerDASHBOARD.get('/dashboard/add/new',
  middleware.query({}),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    return res.render(privateAddNewEJS, {
      title: `AddNew | NINJUCOL`,

      server_url: env.SERVER_URL,
    }, (error, html) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent('RENDER_ERROR./dashboard/add/new')}`);
        
      return res.send(html);
    });
  }
);

routerDASHBOARD.get('/dashboard/upd/new',
  middleware.query({ scheme: { uuid: 'string', }, }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    const { uuid } = req.query;

    const found_new = await service.new.findByUUID({ uuid: uuid, }, (error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.render(privateUpdNewEJS, {
      title: `UpdateNew | NINJUCOL`,

      data: found_new,

      server_url: env.SERVER_URL,
    }, (error, html) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent('RENDER_ERROR./dashboard/upd/new')}`);
        
      return res.send(html);
    });
  }
);

routerDASHBOARD.get('/dashboard/add/campaign',
  middleware.query({}),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    return res.render(privateAddCampaignEJS, {
      title: `AddCampaign | NINJUCOL`,

      server_url: env.SERVER_URL,
    }, (error, html) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent('RENDER_ERROR./dashboard/add/campaign')}`);
        
      return res.send(html);
    });
  }
);

routerDASHBOARD.get('/dashboard/upd/campaign',
  middleware.query({ scheme: { uuid: 'string', }, }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    const { uuid } = req.query;
    
    const found_campaign = await service.campaign.findByUUID({ uuid: uuid, }, (error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.render(privateUpdCampaignEJS, {
      title: `UpdateCampaign | NINJUCOL`,

      data: found_campaign,

      server_url: env.SERVER_URL,
    }, (error, html) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent('RENDER_ERROR./repository')}`);
        
      return res.send(html);
    });
  }
);

routerDASHBOARD.get('/dashboard/add/repository',
  middleware.query({}),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    return res.render(privateAddRepositoryEJS, {
      title: `AddRepository | NINJUCOL`,

      server_url: env.SERVER_URL,
    }, (error, html) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent('RENDER_ERROR./repository')}`);
        
      return res.send(html);
    });
  }
);

routerDASHBOARD.get('/dashboard/upd/repository',
  middleware.query({ scheme: { uuid: 'string', }, }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    const { uuid } = req.query;
    
    const found_repository = await service.repository.findByUUID({ uuid: uuid, }, (error, info) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.render(privateUpdRepositoryEJS, {
      title: `UpdateRepository | NINJUCOL`,

      data: found_repository,

      server_url: env.SERVER_URL,
    }, (error, html) => {
      if (error) return res.redirect('/error_at_get?' +
        `error=${encodeURIComponent('RENDER_ERROR./repository')}`);
        
      return res.send(html);
    });
  }
);
// >>-------- GET - ABOVE --------<<


// >>-------- POST - BELOW --------<<
routerDASHBOARD.post('/dashboard/add/new',
  middleware.multipart({
    scheme: { resource: ['image/jpeg', 'image/png', 'image/webp'], },
    max_file_size_mb: { resource: 10, }
  }),
  middleware.body({
    scheme: {
      title: 'string',
      author: 'string',
      resume: 'string',
      description: 'string',
      video_url: 'string',

      resource_uri: 'string',
    }
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    const data = req.body;

    await service.new.create({
      title      : data.title,
      author     : data.author,
      resume     : data.resume,
      description: data.description,
      video_url  : data.video_url,

      resource_uri: data.resource_uri,
    }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.redirect('/dashboard?' +
      `info=${encodeURIComponent('¡Noticia creada!')}`);
  },
);

routerDASHBOARD.post('/dashboard/del/new',
  middleware.query({ scheme: { uuid: 'string', }, }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    const { uuid } = req.query;

    await service.new.deleteByUUID({ uuid: uuid }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.redirect('/dashboard?' +
      `info=${encodeURIComponent('Noticia borrada.')}`);
  },
);

routerDASHBOARD.post('/dashboard/upd/new',
  middleware.query({ scheme: { uuid: 'string' } }),
  middleware.multipart({
    scheme: { resource: ['image/jpeg', 'image/png', 'image/webp'], },
    max_file_size_mb: { resource: 10, }
  }),
  middleware.body({
    scheme: {
      title: 'string',
      author: 'string',
      resume: 'string',
      description: 'string',
      video_url: 'string',

      resource_uri: 'string',
    }
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    const { uuid } = req.query;

    const data = req.body;

    await service.new.updateByUUID({
      uuid: uuid,
      setter: {
        title      : data.title,
        author     : data.author,
        resume     : data.resume,
        description: data.description,
        video_url  : data.video_url,

        resource_uri: data.resource_uri,
      }
    }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.redirect('/dashboard?' +
      `info=${encodeURIComponent('Noticia actualizada.')}`);
  },
);

routerDASHBOARD.post('/dashboard/add/campaign',
  middleware.multipart({
    scheme: { resource: ['image/jpeg', 'image/png', 'image/webp'], },
    max_file_size_mb: { resource: 10, }
  }),
  middleware.body({
    scheme: {
      title      : 'string',
      description: 'string',

      resource_uri: 'string',
    }
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    const data = req.body;

    await service.campaign.create({
      title      : data.title,
      description: data.description,

      resource_uri: data.resource_uri,
    }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.redirect('/dashboard?' +
      `info=${encodeURIComponent('¡Campaña creada!')}`);
  },
);

routerDASHBOARD.post('/dashboard/del/campaign',
  middleware.query({ scheme: { uuid: 'string' } }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    const { uuid } = req.query;

    await service.campaign.deleteByUUID({ uuid: uuid }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.redirect('/dashboard?' +
      `info=${encodeURIComponent('Campaña borrada.')}`);
  },
);

routerDASHBOARD.post('/dashboard/upd/campaign',
  middleware.query({ scheme: { uuid: 'string' } }),
  middleware.multipart({
    scheme: { resource: ['image/jpeg', 'image/png', 'image/webp'], },
    max_file_size_mb: { resource: 10, }
  }),
  middleware.body({
    scheme: {
      title      : 'string',
      description: 'string',
        
      resource_uri: 'string',
    }
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    const { uuid } = req.query;

    const data = req.body;

    await service.campaign.updateByUUID({
      uuid: uuid,
      setter: {
        title      : data.title,
        description: data.description,

        resource_uri: data.resource_uri,
      }
    }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.redirect('/dashboard?' +
      `info=${encodeURIComponent('Noticia borrada.')}`);
  },
);

routerDASHBOARD.post('/dashboard/add/repository',
  middleware.multipart({
    scheme: {
      resource: [
        'image/jpeg',
        'image/png',
        'image/webp',

        'application/pdf',
      ],
    },
    max_file_size_mb: { resource: 10, },
  }),
  middleware.body({
    scheme: {
      title      : 'string',
      description: 'string',

      resource_uri: 'string',
    }
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    const data = req.body;

    await service.repository.create({
      title      : data.title,
      description: data.description,

      resource_uri: data.resource_uri,
    }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.redirect('/dashboard?' +
      `info=${encodeURIComponent('¡Recurso creado!')}`);
  },
);

routerDASHBOARD.post('/dashboard/del/repository',
  middleware.query({ scheme: { uuid: 'string' } }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    const { uuid } = req.query;

    await service.repository.deleteByUUID({ uuid: uuid }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.redirect('/dashboard?' +
      `info=${encodeURIComponent('Recurso borrado.')}`);
  },
);

routerDASHBOARD.post('/dashboard/upd/repository',
  middleware.query({ scheme: { uuid: 'string' } }),
  middleware.multipart({
    scheme: {
      resource: [
        'image/jpeg',
        'image/png',
        'image/webp',

        'application/pdf',
      ],
    },
    max_file_size_mb: { resource: 10, },
  }),
  middleware.body({
    scheme: {
      title      : 'string',
      description: 'string',

      resource_uri: 'string',
    }
  }),
  async (req, res) => {
    const { auth_token } = req.cookies;

    if (!auth_token) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.redirect('/sign_in?' +
      `error=${encodeURIComponent('Redireccionamiento debido a token inválido.')}`);
    }

    await service.token.findByToken({ token: auth_token }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      if (!info) {
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);
      }
      
      return info;
    });

    if (res.headersSent) return;

    const { uuid } = req.query;

    const data = req.body;

    await service.repository.updateByUUID({
      uuid: uuid,
      setter: {
        title      : data.title,
        description: data.description,

        resource_uri: data.resource_uri,
      }
    }, (error, info) => {
      if (error) return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(error)}`);
      
      return info;
    });

    if (res.headersSent) return;

    return res.redirect('/dashboard?' +
      `info=${encodeURIComponent('Noticia actualizada.')}`);
  },
);
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-DASHBOARD~~~~~~~~~~~

export default routerDASHBOARD;
