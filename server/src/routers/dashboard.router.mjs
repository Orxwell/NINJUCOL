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
      const token_body = await service.token.findByToken({ token: auth_token });
      
      if (!token_body) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      const account = await service.account.findByEmail({ email: token_body.email, });

      return res.render(privateDashboardEJS, {
        title: `Dashboard | NINJUCOL`,

        account: account,

        server_url: env.SERVER_URL,
      });

    } catch (err) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(err.message)}`
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

    try {
      const token_body = await service.token.findByToken({ token: auth_token });
      
      if (!token_body) return res.redirect('/sign_in?' +
        `error=${encodeURIComponent('Sesión expirada.')}`);

      //* Guardar la noticia, con la capa de servicio NewsService

    } catch (err) {
      return res.redirect('/error_at_post?' +
        `error=${encodeURIComponent(err.message)}`
      );
    }
  },
)
// >>-------- POST - ABOVE --------<<
// ~~~~~~~~~~~ROUTER-DASHBOARD~~~~~~~~~~~

export default routerDASHBOARD;
