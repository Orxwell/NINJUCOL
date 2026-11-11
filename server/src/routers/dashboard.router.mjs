// Templates for the Front-End
import template from '#utils/templates.util.mjs';

// Services for the router
import service from '#services/handler.service.mjs';

// Middlewares for the router
import middleware from '#middlewares/handler.middleware.mjs';

// External & Internal libraries
import importer from '#importers/handler.importer.mjs';


// ~~~~~~~~~~~ROUTER-DASHBOARD~~~~~~~~~~~
const routerDASHBOARD = {
  // >>-------- GET - BELOW --------<<
  GET: {
    '/dashboard': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard',
        }),
        query: new middleware.query({
          scheme  : { info: 'string', },
          optional: { info: null, },

          path: '/dashboard',
        }),
      },
      handler: async (req, res) => {
        const token_obj = res.token_obj;
    
        const found_account = await service.account.findByEmail({ email: token_obj.email, }, (error, record) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent(error)}`);
    
          if (record.status === 'DENIED') return res.redirect('/sign/in?' +
            `error=${encodeURIComponent('Acceso denegado')}`);
          
          return record;
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
    
        return res.render(template.privateDashboardEJS, {
          title: `Dashboard | NINJUCOL`,
    
          account: found_account,
          repository: found_repository,
          data: {
            news      : found_news,
            campaigns : found_campaigns,
            records : found_campaigns,
            repository: found_repository,
          },
    
          server_url: importer.env.SERVER_URL,
        }, (error, html) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent('RENDER_ERROR./dashboard')}`);
            
          return res.send(html);
        });
      },
    },

    '/dashboard/add/new': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard/add/new',
        }),
        query: new middleware.query({
          path: '/dashboard/add/new',
        }),
      },
      handler: async (req, res) => {
        return res.render(template.privateAddNewEJS, {
          title: `AddNew | NINJUCOL`,
    
          server_url: importer.env.SERVER_URL,
        }, (error, html) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent('RENDER_ERROR./dashboard/add/new')}`);
            
          return res.send(html);
        });
      },
    },
    '/dashboard/upd/new': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard/upd/new',
        }),
        query: new middleware.query({
          scheme: { uuid: 'string', },

          path: '/dashboard/upd/new',
        }),
      },
      handler: async (req, res) => {
        const { uuid } = req.query;
    
        const found_new = await service.new.findByUUID({ uuid: uuid, }, (error, info) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent(error)}`);
          
          return info;
        });
    
        if (res.headersSent) return;
    
        return res.render(template.privateUpdNewEJS, {
          title: `UpdateNew | NINJUCOL`,
    
          data: found_new,
    
          server_url: importer.env.SERVER_URL,
        }, (error, html) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent('RENDER_ERROR./dashboard/upd/new')}`);
            
          return res.send(html);
        });
      },
    },

    '/dashboard/add/campaign': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard/add/campaign',
        }),
        query: new middleware.query({
          path: '/dashboard/add/campaign',
        }),
      },
      handler: async (req, res) => {
        return res.render(template.privateAddCampaignEJS, {
          title: `AddCampaign | NINJUCOL`,
    
          server_url: importer.env.SERVER_URL,
        }, (error, html) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent('RENDER_ERROR./dashboard/add/campaign')}`);
            
          return res.send(html);
        });
      },
    },
    '/dashboard/upd/campaign': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard/upd/campaign',
        }),
        query: new middleware.query({
          scheme: { uuid: 'string', },

          path: '/dashboard/upd/campaign',
        }),
      },
      handler: async (req, res) => {
        const { uuid } = req.query;
        
        const found_campaign = await service.campaign.findByUUID({ uuid: uuid, }, (error, info) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent(error)}`);
          
          return info;
        });
    
        if (res.headersSent) return;
    
        return res.render(template.privateUpdCampaignEJS, {
          title: `UpdateCampaign | NINJUCOL`,
    
          data: found_campaign,
    
          server_url: importer.env.SERVER_URL,
        }, (error, html) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent('RENDER_ERROR./repository')}`);
            
          return res.send(html);
        });
      },
    },

    '/dashboard/add/repository': {
      multipart: {
        auth: new middleware.auth({
          path: '/dashboard/add/repository',
        }),
        query: new middleware.query({
          path: '/dashboard/add/repository',
        }),
      },
      handler: async (req, res) => {
        return res.render(template.privateAddRepositoryEJS, {
          title: `AddRepository | NINJUCOL`,
    
          server_url: importer.env.SERVER_URL,
        }, (error, html) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent('RENDER_ERROR./repository')}`);
            
          return res.send(html);
        });
      },
    },
    '/dashboard/upd/repository': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard/upd/repository',
        }),
        query: new middleware.query({
          scheme: { uuid: 'string', },

          path: '/dashboard/upd/repository',
        }),
      },
      handler: async (req, res) => {
        const { uuid } = req.query;
        
        const found_repository = await service.repository.findByUUID({ uuid: uuid, }, (error, info) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent(error)}`);
          
          return info;
        });
    
        if (res.headersSent) return;
    
        return res.render(template.privateUpdRepositoryEJS, {
          title: `UpdateRepository | NINJUCOL`,
    
          data: found_repository,
    
          server_url: importer.env.SERVER_URL,
        }, (error, html) => {
          if (error) return res.redirect('/error_at_get?' +
            `error=${encodeURIComponent('RENDER_ERROR./repository')}`);
            
          return res.send(html);
        });
      },
    },
  },
  // >>-------- GET - ABOVE --------<<

  // >>-------- POST - BELOW --------<<
  POST: {
    '/dashboard/add/new': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard/add/new',
        }),
        query: new middleware.query({
          scheme  : { error: 'string', },
          optional: { error: null,     },

          path: '/dashboard/add/new',
        }),
        multipart: new middleware.multipart({
          scheme: { resource: ['image/jpeg', 'image/png', 'image/webp'], },
          max_file_size_mb: { resource: 10, },

          path: '/dashboard/add/new',
        }),
        body: new middleware.body({
          scheme: {
            title      : 'string',
            author     : 'string',
            resume     : 'string',
            description: 'string',
            video_url  : 'string',

            resource_uri: 'string',
          },

          path: '/dashboard/add/new',
        }),
      },
      handler: async (req, res) => {
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
    },
    '/dashboard/upd/new': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard/upd/new',
        }),
        query: new middleware.query({
          scheme: { uuid: 'string', },

          path: '/dashboard/upd/new',
        }),
        multipart: new middleware.multipart({
          scheme: { resource: ['image/jpeg', 'image/png', 'image/webp'], },
          max_file_size_mb: { resource: 10, },

          path: '/dashboard/upd/new',
        }),
        body: new middleware.body({
          scheme: {
            title      : 'string',
            author     : 'string',
            resume     : 'string',
            description: 'string',
            video_url  : 'string',

            resource_uri: 'string',
          },

          path: '/dashboard/upd/new',
        }),
      },
      handler: async (req, res) => {
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
    },
    '/dashboard/del/new': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard/del/new',
        }),
        query: new middleware.query({
          scheme: { uuid: 'string', },

          path: '/dashboard/del/new',
        }),
      },
      handler: async (req, res) => {
        const { uuid } = req.query;
    
        return await service.new.deleteByUUID({ uuid: uuid }, (error, info) => {
          if (error) return res.redirect('/error_at_post?' +
            `error=${encodeURIComponent(error)}`);
          
          return res.redirect('/dashboard?' +
            `info=${encodeURIComponent('Noticia borrado.')}`);
        });
      },
    },

    '/dashboard/add/campaign': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard/add/campaign',
        }),
        multipart: new middleware.multipart({
          scheme: { resource: ['image/jpeg', 'image/png', 'image/webp'], },
          max_file_size_mb: { resource: 10, },

          path: '/dashboard/add/campaign',
        }),
        body: new middleware.body({
          scheme: {
            title      : 'string',
            description: 'string',

            resource_uri: 'string',
          },

          path: '/dashboard/add/campaign',
        }),
      },
      handler: async (req, res) => {
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
    },
    '/dashboard/upd/campaign': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard/upd/campaign',
        }),
        query: new middleware.query({
          scheme: { uuid: 'string', },

          path: '/dashboard/upd/campaign',
        }),
        multipart: new middleware.multipart({
          scheme: { resource: ['image/jpeg', 'image/png', 'image/webp'], },
          max_file_size_mb: { resource: 10, },

          path: '/dashboard/upd/campaign',
        }),
        body: new middleware.body({
          scheme: {
            title      : 'string',
            description: 'string',
              
            resource_uri: 'string',
          },

          path: '/dashboard/upd/campaign',
        }),
      },
      handler: async (req, res) => {
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
    },
    '/dashboard/del/campaign': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard/del/campaign',
        }),
        query: new middleware.query({
          scheme: { uuid: 'string', },

          path: '/dashboard/del/campaign',
        }),
      },
      handler: async (req, res) => {
        const { uuid } = req.query;
    
        return await service.campaign.deleteByUUID({ uuid: uuid }, (error, info) => {
          if (error) return res.redirect('/error_at_post?' +
            `error=${encodeURIComponent(error)}`);
          
          return res.redirect('/dashboard?' +
            `info=${encodeURIComponent('Campaña borrado.')}`);
        });
      },
    },

    '/dashboard/add/repository': {
      multipart: {
        auth: new middleware.auth({
          path: '/dashboard/add/repository',
        }),
        multipart: new middleware.multipart({
          scheme: {
            resource: [
              'image/jpeg',
              'image/png',
              'image/webp',

              'application/pdf',
            ],
          },
          max_file_size_mb: { resource: 10, },

          path: '/dashboard/add/repository',
        }),
        body: new middleware.body({
          scheme: {
            title      : 'string',
            description: 'string',

            resource_uri: 'string',
          },

          path: '/dashboard/add/repository',
        }),
      },
      handler: async (req, res) => {
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
    },
    '/dashboard/upd/repository': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard/upd/repository',
        }),
        query: new middleware.query({
          scheme: { uuid: 'string', },

          path: '/dashboard/upd/repository',
        }),
      multipart: new middleware.multipart({
          scheme: {
            resource: [
              'image/jpeg',
              'image/png',
              'image/webp',

              'application/pdf',
            ],
          },
          max_file_size_mb: { resource: 10, },

          path: '/dashboard/upd/repository',
        }),
        body: new middleware.body({
          scheme: {
            title      : 'string',
            description: 'string',

            resource_uri: 'string',
          },

          path: '/dashboard/upd/repository',
        }),
      },
      handler: async (req, res) => {
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
    },
    '/dashboard/del/repository': {
      middlewares: {
        auth: new middleware.auth({
          path: '/dashboard/del/repository',
        }),
        query: new middleware.query({
          scheme: { uuid: 'string', },

          path: '/dashboard/del/repository',
        }),
      },
      handler: async (req, res) => {
        const { uuid } = req.query;
    
        return await service.repository.deleteByUUID({ uuid: uuid }, (error, info) => {
          if (error) return res.redirect('/error_at_post?' +
            `error=${encodeURIComponent(error)}`);
          
          return res.redirect('/dashboard?' +
            `info=${encodeURIComponent('Recurso borrado.')}`);
        });
      },
    },
  },
  // >>-------- POST - ABOVE --------<<
};
// ~~~~~~~~~~~ROUTER-DASHBOARD~~~~~~~~~~~


export default routerDASHBOARD;
