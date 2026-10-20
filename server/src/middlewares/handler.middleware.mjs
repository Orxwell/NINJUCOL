import handlingQuery     from './query.middleware.mjs';
import handlingBody      from './body.middleware.mjs';
import handlingRoute     from './route.middleware.mjs';
import handlingMultipart from './multipart.middleware.mjs';
// Import more middlewares if it's needed

const middleware = {
  'query'    : handlingQuery,
  'body'     : handlingBody,
  'route'    : handlingRoute,
  'multipart': handlingMultipart,
  // Remember importing it
}

export default middleware;
