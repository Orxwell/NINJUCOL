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
    this.dbAPI = null;
  }

  /**
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async init (callback=()=>{}) {
    try {
      // Setting collection
      this.dbAPI = new controller.dbAPI();
      await this.dbAPI.init((error) => { throw error; });
      this.dbAPI.setCollection({ collection: this.collection }, (error) => { throw error; });

      this.is_initialized = true;

      await this.#createIndexes();

      if (typeof callback === 'function') return callback(null, 'DONE');

      return 'DONE';

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

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

  /**
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async #createIndexes (callback=()=>{}) {
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

      if (typeof callback === 'function') return callback(null, 'DONE');

      return 'DONE';

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }

  /**
   * @param {string} firm
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async #validateFirm (firm='', callback=()=>{}) {
    try {
      this.#ensureInit();

      if (typeof callback === 'function') return callback(null, 'DONE');

      return 'DONE';

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }
  }

  /**
   * @param {Object} info
   * @param {string} info.email - Owner's token.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async generate ({ email }={}, callback=()=>{}) {
    try {
      const account = await service.account.findByEmail({ email: email }, (error, info) => {
        if (error) throw error;

        return info;
      });

      if (!account) {
        const error = new Error(this.errors['ERR-5']);
        error.code = 'ERR-5';
        throw error;
      }

      const token = randomBytes(32).toString('base64url');
      const normalized_email = email.trim().toLowerCase();
      const expiration = new Date(Date.now() + this.token_life_ms);

      const token_body = {
        token     : token,
        email     : normalized_email,
        expiration: expiration,
      };

      if (typeof callback === 'function') return callback(null, token_body);
      
      return token_body;

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }

  /**
   * @param {Object} info
   * @param {string} info.token - Token's concept.
   * @param {string} info.email - Owner's token.
   * @param {string} info.expiration - Expiration's token.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async save ({ token, email, expiration }={}, callback=()=>{}) {
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

      if (typeof callback === 'function') return callback(null, 'DONE');

      return 'DONE';

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }

  /**
   * @param {Object} info
   * @param {string} info.token - Token's record.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async findByToken ({ token }={}, callback=()=>{}) {
    try {
      this.#ensureInit();
    
      this.#ensureString(token, 'token');

      const record = await this.dbAPI.findRecord({
        filter    : { token: token, },
        projection: { _id: 0, },
      }, (error) => { throw error; });

      if (typeof callback === 'function') return callback(null, record);

      return record;

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }

  /**
   * @param {Object} info
   * @param {string} info.email - Email's record.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async findByEmail ({ email }={}, callback=()=>{}) {
    try {
      this.#ensureInit();
    
      this.#ensureString(email, 'email');

      const record = await this.dbAPI.findRecord({
        filter    : { email: email, },
        projection: { _id: 0, },
      }, (error) => { throw error; });

      if (typeof callback === 'function') return callback(null, record);

      return record;

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }

  /**
   * @param {Object} info
   * @param {string} info.token - Token's record.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async deleteByToken ({ token }={}, callback=()=>{}) {
    try {
      this.#ensureInit();
      
      this.#ensureString(token, 'token');

      await this.dbAPI.deleteRecord({ filter: { token: token }, }, (error) => { throw error; });

      if (typeof callback === 'function') return callback(null, 'DONE');

      return 'DONE';

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }

  /**
   * @param {Object} info
   * @param {string} info.email - Email's record.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async deleteByEmail ({ email }={}, callback=()=>{}) {
    try {
      this.#ensureInit();
    
      this.#ensureString(email, 'email');

      await this.dbAPI.deleteRecord({ filter: { email: email }, }, (error) => { throw error; });

      if (typeof callback === 'function') return callback(null, 'DONE');

      return 'DONE';

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }

  /**
   * @param {Object} info
   * @param {string} [info.firm=''] - Firm from OAuth.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async deleteAll ({ firm='' }={}, callback=()=>{}) {
    try {
      this.#ensureInit();

      await this.#validateFirm(firm, (error, info) => {
        if (error) throw error;

        return info;
      });

      await this.dbAPI.clearCollection((error) => { throw error; });

      if (typeof callback === 'function') return callback(null, 'DONE');

      return 'DONE';

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }
};
