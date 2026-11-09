import routerHOME       from './home.router.mjs';
import routerABOUT_US   from './about_us.router.mjs';
import routerNEWS       from './news.router.mjs';
import routerCAMPAIGNS  from './campaigns.router.mjs';
import routerREPOSITORY from './repository.router.mjs';
import routerJOIN_US    from './join_us.router.mjs';
import routerSIGN       from './sign.router.mjs';
import routerDASHBOARD  from './dashboard.router.mjs';
import routerAPI        from './api.router.mjs';
import routerERROR      from './error.router.mjs';
// Import more route if it's needed


const router = {
  HOME      : routerHOME,
  ABOUT_US  : routerABOUT_US,
  NEWS      : routerNEWS,
  CAMPAIGNS : routerCAMPAIGNS,
  REPOSITORY: routerREPOSITORY,
  JOIN_US   : routerJOIN_US,
  SIGN      : routerSIGN,
  DASHBOARD : routerDASHBOARD,
  API       : routerAPI,
  ERROR     : routerERROR,
  // Remember importing it
};


export default router;
