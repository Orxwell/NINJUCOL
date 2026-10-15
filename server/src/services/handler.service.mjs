import TokenService      from './token.service.mjs';
import AccountService    from './account.service.mjs';
import NewsService       from './news.service.mjs';
import CampaignsService  from './campaigns.service.mjs';
import RepositoryService from './repository.service.mjs';
//* import mailer
// Import more route if it's needed

// Instantiating services -----------------------¬
const tokenService = new TokenService();
await tokenService.init();

const accountService = new AccountService();
await accountService.init();

const newsService = new NewsService();
await newsService.init();

const campaignsService = new CampaignsService();
await campaignsService.init();

const repositoryService = new RepositoryService();
await repositoryService.init();

//* init mailer
// _______________________________________________

const service = {
  'token'     : tokenService,
  'account'   : accountService,
  'news'      : newsService,
  'campaigns' : campaignsService,
  'repository': repositoryService,
  //* add mailer
  // Remember importing it
};

export default service;
