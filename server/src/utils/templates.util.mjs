import { join } from 'path';

import global from '#utils/paths.util.mjs';

const temp = {
  // Templates for handling HTTP errors
  error_atGetEJS : join(global.errorsPath, '/at_get.error.ejs' ),
  error_atPostEJS: join(global.errorsPath, '/at_post.error.ejs'),

  // Templates for handling mails
  mail_signInEJS: join(global.mailsPath, '/sign_in.mail.ejs'),

  // Private templates - Staff authentication
  private_dashboardEJS    : join(global.privatePath, '/dashboard.private.ejs'),
  private_addNewEJS       : join(global.privatePath, '/add_new.private.ejs'),
  private_updNewEJS       : join(global.privatePath, '/upd_new.private.ejs'),
  private_addCampaignEJS  : join(global.privatePath, '/add_campaign.private.ejs'),
  private_updCampaignEJS  : join(global.privatePath, '/upd_campaign.private.ejs'),
  private_addRepositoryEJS: join(global.privatePath, '/add_repository.private.ejs'),
  private_updRepositoryEJS: join(global.privatePath, '/upd_repository.private.ejs'),

  // Public templates - No authentication
  public_homeEJS      : join(global.publicPath, '/home.public.ejs'),
  public_aboutUsEJS   : join(global.publicPath, '/about_us.public.ejs'),
  public_newsEJS      : join(global.publicPath, '/news.public.ejs'),
  public_newEJS       : join(global.publicPath, '/new.public.ejs'),
  public_repositoryEJS: join(global.publicPath, '/repository.public.ejs'),
  public_campaignsEJS : join(global.publicPath, '/campaigns.public.ejs'),
  public_joinUsEJS    : join(global.publicPath, '/join_us.public.ejs'),
  public_signInEJS    : join(global.publicPath, '/sign_in.public.ejs'),
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
