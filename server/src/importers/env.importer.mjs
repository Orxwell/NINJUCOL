// Importing essentials functions
import { auditENV } from '#utils/functions.util.mjs';


const temp = {}


// Server configuration...
temp.SERVER_MODE = auditENV({
  name   : 'SERVER_MODE',
  type   : 'string',
  preset : 'dev',
  options: [
    'dev' ,
    'comb',
    'prod',
    'DEV' ,
    'COMB',
    'PROD',
  ],
}).toLowerCase();
temp.SERVER_DOMAIN = auditENV({
  name  : 'SERVER_DOMAIN',
  type  : 'string',
  preset: 'localhost',
});
temp.SERVER_PORT = auditENV({
  name  : 'SERVER_PORT',
  type  : 'number',
  preset: 5050,
});
temp.SERVER_URL = ['localhost', '127.0.0.1'].includes(temp.SERVER_DOMAIN)
  ? `http://localhost:${temp.SERVER_PORT}`
  : `https://${temp.SERVER_DOMAIN}`;


// Database configuration...
temp.DB_CLUSTER_NAME = auditENV({
  name    : 'DB_CLUSTER_NAME',
  type    : 'string',
  required: true,
});
temp.DB_CLUSTER_OWNER = auditENV({
  name    : 'DB_CLUSTER_OWNER',
  type    : 'string',
  required: true,
});
temp.DB_CLUSTER_PASSWORD = auditENV({
  name    : 'DB_CLUSTER_PASSWORD',
  type    : 'string',
  required: true,
});
temp.DB_CLUSTER_URI = auditENV({
  name    : 'DB_CLUSTER_URI',
  type    : 'string',
  required: true,
});
temp.DB_CLUSTER_URI = temp.DB_CLUSTER_URI
  .replace('<db_cluster_owner>', encodeURIComponent(temp.DB_CLUSTER_OWNER))
  .replace('<db_cluster_password>', encodeURIComponent(temp.DB_CLUSTER_PASSWORD));


// Corporate-Email configuration...
temp.EMAIL_DOMAIN = auditENV({
  name    : 'EMAIL_DOMAIN',
  type    : 'string',
  required: true,
});
temp.EMAIL_KEY = auditENV({
  name    : 'EMAIL_KEY',
  type    : 'string',
  required: true,
});


// Instagram configuration...
temp.INSTAGRAM_TOKEN = auditENV({
  name    : 'INSTAGRAM_TOKEN',
  type    : 'string',
  required: true,
});
temp.INSTAGRAM_URI = auditENV({
  name    : 'INSTAGRAM_URI',
  type    : 'string',
  required: true,
});
temp.INSTAGRAM_TTL_HOURS = auditENV({
  name  : 'INSTAGRAM_TTL_HOURS',
  type  : 'number',
  preset: 1,
});
temp.INSTAGRAM_URI = temp.INSTAGRAM_URI
  .replace('<access_token>', encodeURIComponent(temp.INSTAGRAM_TOKEN));


// Token configuration...
temp.TOKEN_TTL_HOURS = auditENV({
  name  : 'TOKEN_TTL_HOURS',
  type  : 'number',
  preset: 1,
});


// Cookie configuration...
temp.COOKIE_SECRET = auditENV({
  name  : 'COOKIE_SECRET',
  type  : 'string',
  preset: 'secret',
});


export const env = Object.freeze({
  // Server configuration...
  SERVER_MODE  : temp.SERVER_MODE,
  SERVER_DOMAIN: temp.SERVER_DOMAIN,
  SERVER_PORT  : temp.SERVER_PORT,
  SERVER_URL   : temp.SERVER_URL,

  // Database configuration...
  DB_CLUSTER_NAME    : temp.DB_CLUSTER_NAME,
  DB_CLUSTER_OWNER   : temp.DB_CLUSTER_OWNER,
  DB_CLUSTER_PASSWORD: temp.DB_CLUSTER_PASSWORD,
  DB_CLUSTER_URI     : temp.DB_CLUSTER_URI,

  // Email configuration...
  EMAIL_DOMAIN: temp.EMAIL_DOMAIN,
  EMAIL_KEY   : temp.EMAIL_KEY,

  // Instagram configuration...
  INSTAGRAM_TOKEN    : temp.INSTAGRAM_TOKEN,
  INSTAGRAM_URI      : temp.INSTAGRAM_URI,
  INSTAGRAM_TTL_HOURS: temp.INSTAGRAM_TTL_HOURS,

  // Token configuration...
  TOKEN_TTL_HOURS: temp.TOKEN_TTL_HOURS,

  // Cookie configuration...
  COOKIE_SECRET: temp.COOKIE_SECRET,
});
