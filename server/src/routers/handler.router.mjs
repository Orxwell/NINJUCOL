import handlingAPIRouter  from './api.router.mjs' ;
import handlingGEtRouter  from './get.router.mjs' ;
import handlingPOSTRouter from './post.router.mjs';

// Import more route if it's needed

const router = {
  'api' : handlingAPIRouter,
  'get' : handlingGEtRouter,
  'post': handlingPOSTRouter,
  // Remember importing it
}

export default router;
