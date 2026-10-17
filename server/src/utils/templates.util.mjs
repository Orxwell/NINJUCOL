import { join } from 'path';

import global from '#utils/paths.util.mjs';

const temp = {
  // Templates for handling API resources
  //api_EJS: join(global.apiPath, '/.api.ejs'),

  // Templates for handling HTTP errors
  error_atGetEJS : join(global.errorsPath, '/at_get.error.ejs' ),
  error_atPostEJS: join(global.errorsPath, '/at_post.error.ejs'),

  // Templates for handling mails
  mail_signInEJS: join(global.mailsPath, '/sing_in.mail.ejs'),

  // Private templates - Staff authentication
  private_dashboardEJS: join(global.privatePath, '/dashboard.private.ejs'),

  // Public templates - No authentication
  public_homeEJS      : join(global.publicPath, '/home.public.ejs'),
  public_aboutUsEJS   : join(global.publicPath, '/about_us.public.ejs'),
  public_newsEJS      : join(global.publicPath, '/news.public.ejs'),
  public_newEJS       : join(global.publicPath, '/new.public.ejs'),
  public_repositoryEJS: join(global.publicPath, '/repository.public.ejs'),
  public_campaignsEJS : join(global.publicPath, '/campaigns.public.ejs'),
  public_joinUsEJS    : join(global.publicPath, '/join_us.public.ejs'),
  public_signInEJS     : join(global.publicPath, '/sign_in.public.ejs'),
};

//export const apiEJS = temp.api_EJS;

export const errorAtGetEJS  = temp.error_atGetEJS;
export const errorAtPostEJS = temp.error_atPostEJS;

export const mailSignInEJS = temp.mail_signInEJS;

export const privateDashboardEJS = temp.private_dashboardEJS;

export const publicHomeEJS       = temp.public_homeEJS;
export const publicAboutUsEJS    = temp.public_aboutUsEJS;
export const publicNewsEJS       = temp.public_newsEJS;
export const publicNewEJS        = temp.public_newEJS;
export const publicRepositoryEJS = temp.public_repositoryEJS;
export const publicCampaignsEJS  = temp.public_campaignsEJS;
export const publicJoinUsEJS     = temp.public_joinUsEJS;
export const publicSignInEJS     = temp.public_signInEJS;
