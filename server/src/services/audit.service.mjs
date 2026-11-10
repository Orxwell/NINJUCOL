// Controllers for service
import controller from '#controllers/handler.controller.mjs';

// External & Internal Libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class AuditService {
  constructor () {
    this.collection = 'audit';

    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: AuditService instance needs to be initialized.`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Invalid argument: `,
    };

    this.initialized = false;
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

      this.initialized = true;

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
    if (!this.initialized) {
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
   * Ensure that `value` is a valid array.
   * @param {*} value
   * @param {string} name
   * 
   * @returns {void}
   * 
   * @throws {Error}
   */
  #ensureArray (value, name) {
    if (!Array.isArray(value)) {
      const error = new Error(this.errors['ERR-1'] + `'${name}' must be a valid array.`);
      error.code = 'ERR-1';
      throw error;
    }
  }

  /**
   * Ensure that `value` is a valid object.
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
   * @param {Array<Object>} options.records
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async send ({ records }, callback) {
    try {
      this.#ensureInit();

      this.#ensureArray(records, 'records');

      await this.dbAPI.createRecords({ records: records, });

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }
};
