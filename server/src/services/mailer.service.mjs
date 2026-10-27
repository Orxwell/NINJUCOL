// Controllers for service
import controller from '#controllers/handler.controller.mjs';

// External & Internal Libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';


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
    this.mailerAPI = null;
  }

  /**
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async init (callback) {
    try {
      // Setting controllers
      this.mailerAPI = new controller.smtpAPI();
      await this.mailerAPI.init({});

      this.is_initialized = true;
      
    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Ensure service's initialization.
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
   * Ensure that `value` is a non-empty string.
   * @param {*} value
   * @param {string} name
   * 
   * @returns {void}
   * 
   * @throws {Error}
   */
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

  /**
   * Ensure that `value` is a non-empty string.
   * @param {*} value
   * @param {string} name
   * 
   * @returns {void}
   * 
   * @throws {Error}
   */
  #ensureObject (value, name) {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
      const error = new Error(this.errors['ERR-1'] + `'${name}' must be a valid plain object.`);
      error.code = 'ERR-1';
      throw error;
    }
  }

  /**
   * @param {Object} options
   * @param {string} options.to
   * @param {string} options.subject
   * @param {string} options.text
   * @param {string} options.ejs_path
   * @param {Object} options.ejs_args
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async send ({ to, subject, text, ejs_path, ejs_args }, callback) {
    try {
      this.#ensureInit();

      this.#ensureString(to      , 'to');
      this.#ensureString(subject , 'subject');
      this.#ensureString(text    , 'text');
      this.#ensureString(ejs_path, 'ejs_path');
      this.#ensureObject(ejs_args, 'ejs_args');

      await this.mailerAPI.send({
        to      : to,
        subject : subject,
        text    : text,
        ejs_path: ejs_path,
        ejs_args: ejs_args,
      });

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }
};
