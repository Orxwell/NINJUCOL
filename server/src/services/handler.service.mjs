import TokenService      from './token.service.mjs';
import AccountService    from './account.service.mjs';
import NewService        from './new.service.mjs';
import CampaignService   from './campaign.service.mjs';
import RepositoryService from './repository.service.mjs';
import DonationService   from './donation.service.mjs';
import MailerService     from './mailer.service.mjs';
// Import more services if it's needed

// Instantiating services -----------------------¬
const tokenService = new TokenService();
await tokenService.init();

const accountService = new AccountService();
await accountService.init();

const newService = new NewService();
await newService.init();

const campaignService = new CampaignService();
await campaignService.init();

const repositoryService = new RepositoryService();
await repositoryService.init();

const donationService = new DonationService();
await donationService.init();

const mailerService = new MailerService();
await mailerService.init();
// _______________________________________________

const service = {
  'token'     : tokenService,
  'account'   : accountService,
  'new'      : newService,
  'campaign' : campaignService,
  'repository': repositoryService,
  'donation' : donationService,
  'mailer'    : mailerService,
  // Remember importing it
};

export default service;
