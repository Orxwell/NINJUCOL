import MongoDBController from './mongodb.controller.mjs';
import SMTPController    from './smtp.controller.mjs';
// Import more controllers if it's needed

const controller = {
  dbAPI  : MongoDBController,
  smtpAPI: SMTPController,
  // Remember importing it
};

export default controller;
