// Importing essentials functions
import { auditENV } from '#utils/functions.util.mjs';


const temp = {}


// Server configuration...
temp.MODE = auditENV({
  name   : 'MODE'  ,
  type   : 'string',
  preset : 'dev'   ,
  options: [
    'dev' ,
    'comb',
    'prod',
    'DEV' ,
    'COMB',
    'PROD',
  ],
}).toLowerCase();
temp.DOMAIN = auditENV({
  name  : 'DOMAIN'   ,
  type  : 'string'   ,
  preset: 'localhost',
});
temp.PORT = auditENV({
  name  : 'PORT'  ,
  type  : 'number',
  preset: 5050    ,
});
temp.SERVER_URL = ['localhost', '127.0.0.1'].includes(temp.DOMAIN)
  ? `http://localhost:${temp.PORT}`
  : `https://${temp.DOMAIN}`       ;


// Database configuration...
temp.DBNAME_CLUSTER = auditENV({
  name    : 'DBNAME_CLUSTER',
  type    : 'string'        ,
  required: true            ,
});
temp.USERNAME_CLUSTER = auditENV({
  name    : 'USERNAME_CLUSTER',
  type    : 'string'          ,
  required: true              ,
});
temp.PASSWORD_CLUSTER = auditENV({
  name    : 'PASSWORD_CLUSTER',
  type    : 'string'          ,
  required: true              ,
});
temp.URI_CLUSTER = auditENV({
  name    : 'URI_CLUSTER',
  type    : 'string'     ,
  required: true         ,
});


// Corporate-Email configuration...
temp.CORP_EMAIL_USER = auditENV({
  name: 'CORP_EMAIL_USER',
  type: 'string'         ,
});
temp.CORP_EMAIL_KEY = auditENV({
  name: 'CORP_EMAIL_KEY',
  type: 'string'        ,
});


// Token configuration...
temp.TOKEN_LIFE_SECONDS = auditENV({
  name  : 'TOKEN_LIFE_SECONDS',
  type  : 'number'            ,
  preset: 3600                ,
});


// Cookie configuration...
temp.COOKIE_SECRET = auditENV({
  name  : 'COOKIE_SECRET',
  type  : 'string'       ,
  preset: 'secret'       ,
});


export const env = Object.freeze({
  // Server configuration...
  MODE      : temp.MODE      ,
  DOMAIN    : temp.DOMAIN    ,
  PORT      : temp.PORT      ,
  SERVER_URL: temp.SERVER_URL,

  // Database configuration...
  DBNAME_CLUSTER  : temp.DBNAME_CLUSTER  ,
  USERNAME_CLUSTER: temp.USERNAME_CLUSTER,
  PASSWORD_CLUSTER: temp.PASSWORD_CLUSTER,
  URI_CLUSTER     : temp.URI_CLUSTER     ,

  // Corporate-Email configuration...
  CORP_EMAIL_USER: temp.CORP_EMAIL_USER,
  CORP_EMAIL_KEY : temp.CORP_EMAIL_KEY ,

  // Token configuration...
  TOKEN_LIFE_SECONDS: temp.TOKEN_LIFE_SECONDS,

  // Cookie configuration...
  COOKIE_SECRET: temp.COOKIE_SECRET,
});
