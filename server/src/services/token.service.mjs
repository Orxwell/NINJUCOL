// Controllers for service
import controller from '#controllers/handler.controller.mjs';

// Services for the service
import service from '#services/handler.service.mjs';

// Importers for the endpoints
import importer from '#importers/handler.importer.mjs';

// External & Internal Libraries
import { basename }      from 'path';
import { randomBytes }   from 'crypto';
import { fileURLToPath } from 'url';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);

const hours_to_ms = 60 * 60 * 1000;


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

    this.token_ttl_ms = importer.env.TOKEN_TTL_HOURS * hours_to_ms;

    this.is_initialized = false;
    this.dbAPI = null;
  }

  /**
   * Initialize the service, for this instance.
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async init (callback) {
    try {
      // Setting collection
      this.dbAPI = new controller.dbAPI();
      await this.dbAPI.init();

      this.dbAPI.setCollection({ collection: this.collection });

      this.is_initialized = true;

      await this.#createIndexes();

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
      const error = new Error(this.errors['ERR-1'] + `'${name}' must be a valid non-empty string.`);
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
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async #createIndexes (callback) {
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
      });

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * @param {string} firm
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {void}
   * 
   * @throws {Error}
   */
  async #validateFirm (firm, callback) {
    try {
      this.#ensureInit();

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * @param {Object} options
   * @param {string} options.email
   * @param {(error: Error|null, token_obj: Object|null) => void} [callback]
   * 
   * @returns {Promise<Object|void>}
   * 
   * @throws {Error}
   */
  async generate ({ email }, callback) {
    try {
      await service.account.findByEmail({ email: email }, (error, record) => {
        if (error) throw error;

        if (!record) {
          const error = new Error(this.errors['ERR-5']);
          error.code = 'ERR-5';
          throw error;
        }
      });

      const token = randomBytes(32).toString('base64url');
      const normalized_email = email.trim().toLowerCase();
      const expiration = new Date(Date.now() + this.token_ttl_ms);

      const token_obj = {
        token     : token,
        email     : normalized_email,
        expiration: expiration,
      };

      if (typeof callback === 'function') return callback(null, token_obj);
      
      return token_obj;

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }

  /**
   * @param {Object} options
   * @param {string} options.token
   * @param {string} options.email
   * @param {string} options.expiration
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async save ({ token, email, expiration }, callback) {
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
      });

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * @param {Object} options
   * @param {string} options.token
   * @param {(error: Error|null, token_obj: Object|null) => void} [callback]
   * 
   * @returns {Promise<Object|void>}
   * 
   * @throws {Error}
   */
  async findByToken ({ token }, callback) {
    try {
      this.#ensureInit();
    
      this.#ensureString(token, 'token');

      const record = await this.dbAPI.findRecord({
        filter    : { token: token, },
        projection: { _id: 0, },
      });

      if (typeof callback === 'function') return callback(null, record);

      return record;

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }

  /**
   * @param {Object} options
   * @param {string} options.email
   * @param {(error: Error|null, token_obj: Object|null) => void} [callback]
   * 
   * @returns {Promise<Object|void>}
   * 
   * @throws {Error}
   */
  async findByEmail ({ email }, callback) {
    try {
      this.#ensureInit();
    
      this.#ensureString(email, 'email');

      const record = await this.dbAPI.findRecord({
        filter    : { email: email, },
        projection: { _id: 0, },
      });

      if (typeof callback === 'function') return callback(null, record);

      return record;

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }

  /**
   * @param {Object} options
   * @param {string} options.token
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async deleteByToken ({ token }, callback) {
    try {
      this.#ensureInit();
      
      this.#ensureString(token, 'token');

      await this.dbAPI.deleteRecord({ filter: { token: token }, });

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * @param {Object} options
   * @param {string} options.email
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async deleteByEmail ({ email }, callback) {
    try {
      this.#ensureInit();
    
      this.#ensureString(email, 'email');

      await this.dbAPI.deleteRecord({ filter: { email: email }, });

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * @param {Object} options
   * @param {string} options.firm
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async deleteAll ({ firm='' }, callback) {
    try {
      this.#ensureInit();

      await this.#validateFirm(firm);

      await this.dbAPI.deleteAllRecords();

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }
};
