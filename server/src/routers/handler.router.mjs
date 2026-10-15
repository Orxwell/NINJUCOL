import handlingHOME       from './home.router.mjs';
import handlingABOUT_US   from './about_us.router.mjs';
import handlingNEWS       from './news.router.mjs';
import handlingCAMPAIGNS  from './campaigns.router.mjs';
import handlingREPOSITORY from './repository.router.mjs';
import handlingJOIN_US    from './join_us.router.mjs';
import handlingSIGN       from './sign.router.mjs';
import handlingDASHBOARD  from './dashboard.router.mjs';
import handlingAPI        from './api.router.mjs';
import handlingERROR      from './error.router.mjs';
// Import more route if it's needed

const router = {
  'home'      : handlingHOME,
  'about_us'  : handlingABOUT_US,
  'news'      : handlingNEWS,
  'campaigns' : handlingCAMPAIGNS,
  'repository': handlingREPOSITORY,
  'join_us'   : handlingJOIN_US,
  'sign'      : handlingSIGN,
  'dashboard' : handlingDASHBOARD,
  'api'       : handlingAPI,
  'error'     : handlingERROR,
  // Remember importing it
};

export default router;
