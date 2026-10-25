import handlingAuth      from './auth.middleware.mjs';
import handlingBody      from './body.middleware.mjs';
import handlingMultipart from './multipart.middleware.mjs';
import handlingQuery     from './query.middleware.mjs';
import handlingRoute     from './route.middleware.mjs';
// Import more middlewares if it's needed

const middleware = {
  'auth'     : handlingAuth,
  'body'     : handlingBody,
  'multipart': handlingMultipart,
  'query'    : handlingQuery,
  'route'    : handlingRoute,
  // Remember importing it
}

export default middleware;
