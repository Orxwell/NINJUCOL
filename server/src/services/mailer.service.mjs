// External & Internal Libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';
import nodemailer from 'nodemailer';
import ejs        from 'ejs';

import { env } from '#importers/env.importer.mjs';

const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);

export default class MailerService {
  constructor () {
    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: MailerService instance needs to be initialized.`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Invalid argument: `,
      'ERR-2': `Internal-Server-Error, from ${filename}: Internal troubles rendering EJS-file.`,
      'ERR-3': `Internal-Server-Error, from ${filename}: Internal troubles sending the email.`,
    };

    this.is_initialized = false;
  }

  async init () {
    // Instantiating controllers -----------¬
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: env.CORP_EMAIL_DOMAIN,
        pass: env.CORP_EMAIL_KEY,
      },
      tls: { rejectUnauthorized: false }
    });
    // ______________________________________

    this.is_initialized = true;
  }

  #ensureInit () {
    if (!this.is_initialized) {
      const error = new Error(this.errors['ERR-0']);
      error.code = 'ERR-0';
      throw error;
    }
  }

  #ensureString (value, name) {
    if (
      typeof value !== 'string' ||
      value.trim() === ''
    ) {
      const error = new Error(this.errors['ERR-1'] + `'${name}' must be a valid string.`);
      error.code = 'ERR-1';
      throw error;
    }
  }

  #ensureObject (value, name) {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
      const error = new Error(this.errors['ERR-1'] + `'${name}' must be a valid plain object.`);
      error.code = 'ERR-1';
      throw error;
    }
  }

  async #validateFirm (firm) {

  }

  async send ({ to, subject, text, ejs_path, ejs_args }={}) {
    this.#ensureInit();

    this.#ensureString(to      , 'to'      );
    this.#ensureString(subject , 'subject' );
    this.#ensureString(text    , 'text'    );
    this.#ensureString(ejs_path, 'ejs_path');
    this.#ensureObject(ejs_args, 'ejs_args');

    let html;
    try { html = await ejs.renderFile(ejs_path, ejs_args); }
    catch (_) {
      const error = new Error(this.errors['ERR-2']);
      error.code = 'ERR-2';
      throw error;
    }

    const mail = {
      from: env.CORP_EMAIL_DOMAIN,
      to  : to,

      subject: subject,
      text   : text,
      html   : html,
    }

    if (await this.#validateFirm(firm)) {  } // Something to validate with an API, preferred OAuth to delete everything

    this.transporter.sendMail(mail, (error, info) => {
      if (error) {
        const cache_error = new Error(this.errors['ERR-3'] + info);
        cache_error.code = 'ERR-3';
        throw cache_error;
      }
    });
  }
};
