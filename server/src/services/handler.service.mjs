import AccountService    from './account.service.mjs';
import CampaignService   from './campaign.service.mjs';
import DonationService   from './donation.service.mjs';
import InstagramService  from './instagram.service.mjs';
import MailerService     from './mailer.service.mjs';
import NewService        from './new.service.mjs';
import RepositoryService from './repository.service.mjs';
import TokenService      from './token.service.mjs';
// Import more services if it's needed

// Instantiating services -----------------------¬
const accountService = new AccountService();
await accountService.init();

const campaignService = new CampaignService();
await campaignService.init();

const donationService = new DonationService();
await donationService.init();

const instagramService = new InstagramService();
await instagramService.init();

const mailerService = new MailerService();
await mailerService.init();

const newService = new NewService();
await newService.init();

const repositoryService = new RepositoryService();
await repositoryService.init();

const tokenService = new TokenService();
await tokenService.init();
// _______________________________________________

const service = {
  'account'   : accountService,
  'campaign'  : campaignService,
  'donation'  : donationService,
  'instagram' : instagramService,
  'mailer'    : mailerService,
  'new'       : newService,
  'repository': repositoryService,
  'token'     : tokenService,
  // Remember importing it
};

export default service;
