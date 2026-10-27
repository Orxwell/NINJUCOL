// Importers for the utils
import paths from '#utils/paths.util.mjs';

// External & Internal libraries
import { join } from 'path';


const temp = {
  // Templates for handling HTTP errors
  error_atGetEJS : join(paths.errors, '/at_get.error.ejs' ),
  error_atPostEJS: join(paths.errors, '/at_post.error.ejs'),

  // Templates for handling mails
  mail_signInEJS: join(paths.mails, '/sign_in.mail.ejs'),

  // Private templates - Staff authentication
  private_dashboardEJS    : join(paths.private, '/dashboard.private.ejs'),
  private_addNewEJS       : join(paths.private, '/add_new.private.ejs'),
  private_updNewEJS       : join(paths.private, '/upd_new.private.ejs'),
  private_addCampaignEJS  : join(paths.private, '/add_campaign.private.ejs'),
  private_updCampaignEJS  : join(paths.private, '/upd_campaign.private.ejs'),
  private_addRepositoryEJS: join(paths.private, '/add_repository.private.ejs'),
  private_updRepositoryEJS: join(paths.private, '/upd_repository.private.ejs'),

  // Public templates - No authentication
  public_homeEJS      : join(paths.public, '/home.public.ejs'),
  public_aboutUsEJS   : join(paths.public, '/about_us.public.ejs'),
  public_newsEJS      : join(paths.public, '/news.public.ejs'),
  public_newEJS       : join(paths.public, '/new.public.ejs'),
  public_repositoryEJS: join(paths.public, '/repository.public.ejs'),
  public_campaignsEJS : join(paths.public, '/campaigns.public.ejs'),
  public_joinUsEJS    : join(paths.public, '/join_us.public.ejs'),
  public_signInEJS    : join(paths.public, '/sign_in.public.ejs'),
};


export const errorAtGetEJS  = temp.error_atGetEJS;
export const errorAtPostEJS = temp.error_atPostEJS;

export const mailSignInEJS = temp.mail_signInEJS;

export const privateDashboardEJS     = temp.private_dashboardEJS;
export const privateAddNewEJS        = temp.private_addNewEJS;
export const privateUpdNewEJS        = temp.private_updNewEJS;
export const privateAddCampaignEJS   = temp.private_addCampaignEJS;
export const privateUpdCampaignEJS   = temp.private_updCampaignEJS;
export const privateAddRepositoryEJS = temp.private_addRepositoryEJS;
export const privateUpdRepositoryEJS = temp.private_updRepositoryEJS;

export const publicHomeEJS       = temp.public_homeEJS;
export const publicAboutUsEJS    = temp.public_aboutUsEJS;
export const publicNewsEJS       = temp.public_newsEJS;
export const publicNewEJS        = temp.public_newEJS;
export const publicRepositoryEJS = temp.public_repositoryEJS;
export const publicCampaignsEJS  = temp.public_campaignsEJS;
export const publicJoinUsEJS     = temp.public_joinUsEJS;
export const publicSignInEJS     = temp.public_signInEJS;
