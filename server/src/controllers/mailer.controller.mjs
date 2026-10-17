// External & Internal Libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';

import nodemailer from 'nodemailer';
import ejs        from 'ejs';

import { env } from '#importers/env.importer.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class MailerController {
  constructor () {
    this.collection = null;

    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: MailerController instance needs to be initialized.`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Internal troubles rendering EJS-file.`,
      'ERR-2': `Internal-Server-Error, from ${filename}: Internal troubles sending the email.`,
    };

    this.mailer = undefined;
  }

  async init ({ host, port, secure }={}, onError=null) {
    try {
      this.mailer = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: env.CORP_EMAIL_DOMAIN,
          pass: env.CORP_EMAIL_KEY,
        },
        tls: { rejectUnauthorized: false }
      });

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  #ensureInit () {
    if (!this.is_initialized) {
      const error = new Error(this.errors['ERR-0']);
      error.code = 'ERR-0';
      throw error;
    }
  }

  async send ({ to, subject, text, ejs_path, ejs_args }={}, onError=null) {
    try {
      this.#ensureInit();

      let html;
      try {
        html = await ejs.renderFile(ejs_path, ejs_args);
      } catch (_) {
        const error = new Error(this.errors['ERR-1']);
        error.code = 'ERR-1';
        throw error;
      }

      const mail = {
        from: env.CORP_EMAIL_DOMAIN,
        to  : to,

        subject: subject,
        text   : text,
        html   : html,
      }

      this.mailer.sendMail(mail, (error, info) => {
        if (error) {
          const error = new Error(this.errors['ERR-2'] + info);
          error.code = 'ERR-2';
          throw error;
        }
      });

      return 'DONE';

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }
};
