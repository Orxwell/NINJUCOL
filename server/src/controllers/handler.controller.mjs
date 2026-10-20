import MongoDBController from './mongodb.controller.mjs';
import MailerController  from './mailer.controller.mjs';
// Import more controllers if it's needed

const controller = {
  dbAPI    : MongoDBController,
  mailerAPI: MailerController,
  // Remember importing it
};

export default controller;
