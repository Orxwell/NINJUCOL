// Controllers for service
import controller from '#controllers/handler.controller.mjs';

// Services for the service
import service from '#services/handler.service.mjs';

// External & Internal Libraries
import { basename }      from 'path';
import { randomBytes }   from 'crypto';
import { fileURLToPath } from 'url';

import { env } from '#importers/env.importer.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class TokenService {
  constructor () {
    this.collection = 'tokens';

    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: TokenService instance needs to be initialized.`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Invalid argument: `,
      'ERR-2': `Internal-Server-Error, from ${filename}: Token doesn't exist.`,
      'ERR-3': `Internal-Server-Error, from ${filename}: Token already exist.`,
      'ERR-4': `Internal-Server-Error, from ${filename}: Token expired.`,
      'ERR-5': `Internal-Server-Error, from ${filename}: E-mail doesn't exist in tokens-collection.`,
    };

    this.token_life_ms = env.TOKEN_LIFE_SECONDS * 1000;

    this.is_initialized = false;
    this.dbAPI = undefined;
  }

  async init (onError=null) {
    try {
      // Stting collection
      this.dbAPI = controller.dbAPI;
      this.dbAPI.setCollection({ collection: this.collection });

      this.is_initialized = true;

      await this.#createIndexes((error) => { throw error; });

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
      const error = new Error(this.errors['ERR-1'] + `'${name}' must be a valid non-empty string.`);
      error.code = 'ERR-1';
      throw error;
    }
  }

  #ensureDate (value, name) {
    if (
      !(value instanceof Date) ||
      isNaN(value.getTime())
    ) {
      const error = new Error(this.errors['ERR-1'] + `'${name}' must be a valid plain Date object.`);
      error.code = 'ERR-1';
      throw error;
    }
  }

  async #createIndexes (onError=null) {
    try {
      this.#ensureInit();

      await this.dbAPI.createIndexes({
        indexes: [
          {
            key   : { token: 1, },
            name  : 'token_unique',
            unique: true,
          },
          {
            key               : { expiration: 1, },
            name              : 'expiration_ttl',
            expireAfterSeconds: 0,
          },
        ],
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

  async generate ({ email }={}, onError=null) {
    try {
      const account = await service.account.findByEmail({ email: email }, (error) => { throw error; });

      if (!account) {
        const error = new Error(this.errors['ERR-5']);
        error.code = 'ERR-5';
        throw error;
      }

      const token = randomBytes(32).toString('base64url');
      const normalized_email = email.trim().toLowerCase();
      const expiration = new Date(Date.now() + this.token_life_ms);
      
      return {
        token     : token,
        email     : normalized_email,
        expiration: expiration,
      };

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }

      throw error;
    }
  }

  async save ({ token, email, expiration }={}, onError=null) {
    try {
      this.#ensureInit();

      this.#ensureString(token, 'token');
      this.#ensureDate(expiration, 'expiration');

      await this.dbAPI.createRecord({
        record: {
          token     : token,
          email     : email,
          expiration: expiration,
        },
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

  async findByToken ({ token }={}, onError=null) {
    try {
      this.#ensureInit();
    
      this.#ensureString(token, 'token');

      const record = await this.dbAPI.findRecord({
        filter    : { token: token, },
        projection: { _id: 0, },
      }, (error) => { throw error; });

      return record;

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }

      throw error;
    }
  }

  async findByEmail ({ email }={}, onError=null) {
    try {
      this.#ensureInit();
    
      this.#ensureString(email, 'email');

      const record = await this.dbAPI.findRecord({
        filter    : { email: email, },
        projection: { _id: 0, },
      }, (error) => { throw error; });

      return record;

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }

      throw error;
    }
  }

  async deleteByToken ({ token }={}, onError=null) {
    try {
      this.#ensureInit();
      
      this.#ensureString(token, 'token');

      await this.dbAPI.deleteRecord({ filter: { token: token }, }, (error) => { throw error; });

      return 'DONE';

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }

      throw error;
    }
  }

  async deleteByEmail ({ email }={}, onError=null) {
    try {
      this.#ensureInit();
    
      this.#ensureString(email, 'email');

      await this.dbAPI.deleteRecord({ filter: { email: email }, }, (error) => { throw error; });

      return 'DONE';

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }

      throw error;
    }
  }

  async deleteAll ({ firm }={}, onError=null) {
    try {
      this.#ensureInit();

      await this.#validateFirm(firm, (error) => { throw error; });

      await this.dbAPI.clearCollection((error) => { throw error; });

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
