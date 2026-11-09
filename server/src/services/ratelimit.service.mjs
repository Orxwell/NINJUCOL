// Controllers for service
import controller from '#controllers/handler.controller.mjs';

// External & Internal libraries
import { basename }      from 'path';
import { fileURLToPath } from 'url';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);

// Caching the IPs, global for short-term
const cached_ips = {};


export default class RatelimitService {
  constructor () {
    this.collection = 'ratelimit';

    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: RatelimitService instance needs to be initialized.`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Invalid argument: `,

      'ERR-2': `External-Server-Error, too many requests.`,
    };

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
            key   : { grouped_ip: 1, },
            name  : 'grouped_ip_unique',
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
   * @param {string} options.ip
   * @param {string} options.group
   * @param {string} options.contract
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {'DONE'|void}
   * 
   * @throws {Error}
   */
  shortTerm ({ ip, group, contract }, callback) {
    try {
      const { ip_ttl_ms, max_request } = contract;

      const grouped_ip = `${group}:${ip}`;
      const now = Date.now();

      let client = cached_ips[grouped_ip];

      // Check if client exists or client-TTL expired
      if (
        !client ||
        now >= client.expires
      ) {
        // Miliseconds of error: clearing timer
        if (client && client.interval) clearTimeout(client.interval);
      
        cached_ips[grouped_ip] = {
          n_request: 0,
          expires  : now + ip_ttl_ms,
      
          // Prevent memory leak
          interval: setTimeout(() => {
            delete cached_ips[grouped_ip];
          }, ip_ttl_ms),
        }
      
        client = cached_ips[grouped_ip];
      }

      // Check if the client overpassed the limit
      if (client.n_request >= max_request) {
        const retry_after_s = Math.ceil((client.expires - now) / 1000)
        
        const error = new Error(this.errors['ERR-2']);
        error.code = 'ERR-2';
        error.status = 429;
        error.retry_after_s = retry_after_s;
        throw error;
      }

      // Increment N° request (+1)
      client.n_request++;

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
