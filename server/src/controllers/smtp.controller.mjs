/**
 * Mailer controller for configuring an SMTP transporter and sending
 * emails with EJS templates.
 * @see {@link https://ejs.co/ | EJS Documentation}
 */

// External & Internal libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';

import ejs from 'ejs';

import importer from '#importers/handler.importer.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class SMTPController {
  constructor () {
    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: SMTPController instance needs to be initialized, try: init().`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Internal troubles rendering EJS-file.`,
      'ERR-2': `Internal-Server-Error, from ${filename}: Internal troubles sending the email.`,
    };

    this.is_initialized = false;
    this.smtp = null;
  }

  /**
   * Initialize the SMTP transporter for this instance.
   * Uses the configured corporate-email credentials for authentication.
   * @see {@link https://nodemailer.com/smtp/ | Nodemailer SMTP Transport Documentation}
   *
   * @param {Object} [options]
   * @param {string} [options.host='smtp.gmail.com']
   * @param {number} [options.port=465]
   * @param {boolean} [options.secure=true]
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   *
   * @returns {Promise<'DONE'|void>}
   *
   * @throws {Error}
   */
  async init ({ host='smtp.gmail.com', port=465, secure=true }={}, callback) {
    try {
      this.smtp = await importer.smtp({
        host  : host,
        port  : port,
        secure: secure,
      });

      this.is_initialized = true;

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Ensure that the SMTP controller has been initialized.
   *
   * @returns {void}
   *
   * @throws {Error}
   */
  #ensureInit () {
    if (!this.is_initialized) {
      const error = new Error(this.errors['ERR-0']);
      error.code = 'ERR-0';
      throw error;
    }
  }

  /**
   * Render an EJS template and send an email using the established
   * SMTP transporter.
   * @see {@link https://nodemailer.com/message/ | Nodemailer Message Configuration Documentation}
   * @see {@link https://ejs.co/ | EJS Template Documentation}
   *
   * @param {Object} [options]
   * @param {string|string[]} [options.to]
   * @param {string} [options.subject]
   * @param {string} [options.text]
   * @param {string} [options.ejs_path]
   * @param {Object} [options.ejs_args]
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   *
   * @returns {Promise<'DONE'|void>}
   *
   * @throws {Error}
   */
  async send ({ to, subject, text, ejs_path, ejs_args }={}, callback) {
    try {
      this.#ensureInit();

      let html;
      try {
        html = await ejs.renderFile(ejs_path, ejs_args);
      } catch (cause) {
        const error = new Error(this.errors['ERR-1'], { cause });
        error.code = 'ERR-1';
        throw error;
      }

      const mail = {
        from: importer.env.EMAIL_DOMAIN,
        to  : to,

        subject: subject,
        text   : text,
        html   : html,
      }

      this.smtp.sendMail(mail, async (cause, info) => {
        if (cause) {
          const error = new Error(this.errors['ERR-2'], { cause });
          error.code = 'ERR-2';
          
          if (typeof callback === 'function') return callback(error, null);

          return;
        }

        if (typeof callback === 'function') return callback(null, 'DONE');
      });

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }
  }
};
