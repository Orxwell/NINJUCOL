import MongoDBController from './mongodb.controller.mjs';
import MailerController  from './mailer.controller.mjs';
// Import more controllers if it's needed

// Instantiating controllers --------¬
const dbAPI = new MongoDBController();
await dbAPI.init();

const mailer = new MailerController();
await mailer.init();
// ___________________________________

const controller = {
  'dbAPI' : dbAPI,
  'mailer': mailer,
  // Remember importing it
};

export default controller;
