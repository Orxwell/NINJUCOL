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
    this.mailerAPI = undefined;
  }

  async init (onError=null) {
    try {
      // Setting controllers
      this.mailerAPI = controller.mailer;

      this.is_initialized = true;

      return 'DONE';
      
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

  async #validateFirm (firm, onError=null) {
    try {
      this.#ensureInit();

      return 'DONE';

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async send ({ to, subject, text, ejs_path, ejs_args }={}, onError=null) {
    try {
      this.#ensureInit();

      this.#ensureString(to      , 'to');
      this.#ensureString(subject , 'subject');
      this.#ensureString(text    , 'text');
      this.#ensureString(ejs_path, 'ejs_path');
      this.#ensureObject(ejs_args, 'ejs_args');

      await this.#validateFirm(firm, (error) => { throw error; });

      await this.mailerAPI.send({
        to      : to,
        subject : subject,
        text    : text,
        ejs_path: ejs_path,
        ejs_args: ejs_args,
      }, (error) => { throw error; });

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
