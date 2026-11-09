import AuditMiddleware     from './audit.middleware.mjs';
import AuthMiddleware      from './auth.middleware.mjs';
import BodyMiddleware      from './body.middleware.mjs';
import MultipartMiddleware from './multipart.middleware.mjs';
import QueryMiddleware     from './query.middleware.mjs';
//import RatelimitMiddleware from './ratelimit.middleware.mjs';
import RouteMiddleware     from './route.middleware.mjs';
// Import more middlewares if it's needed


const middleware = {
  audit    : AuditMiddleware,
  auth     : AuthMiddleware,
  body     : BodyMiddleware,
  multipart: MultipartMiddleware,
  query    : QueryMiddleware,
  //ratelimit: RatelimitMiddleware,
  route    : RouteMiddleware,
  // Remember importing it
}

export default middleware;
