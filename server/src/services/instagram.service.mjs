// External & Internal Libraries
import { basename }      from 'path';
import { fileURLToPath } from 'url';

import importer from '#importers/handler.importer.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);

const hours_to_ms = 60 * 60 * 1000;


export default class InstagramService {
  constructor () {
    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: InstagramService instance needs to be initialized.`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Invalid argument: `,
      'ERR-2': `External-Service-Error, from ${filename}: Instagram API request failed.`,
    };

    this.cache_ttl_ms = importer.env.INSTAGRAM_TTL_HOURS * hours_to_ms;

    this.is_initialized = false;

    this.url = null;
    this.cache = {};
    this.pending = {};
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
      this.url = `${importer.env.INSTAGRAM_API_URI}`;

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
  #ensureNumber (value, name) {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value)
    ) {
      const error = new Error(this.errors['ERR-1'] + `'${name}' must be a valid number.`);
      error.code = 'ERR-1';
      throw error;
    }
  }

  /**
   * @param {Object} options
   * @param {number} [options.latest]
   * @param {(error: Error|null, info: Array<Object>|null) => void} [callback]
   * 
   * @returns {Promise<Array<Object>|void>}
   * 
   * @throws {Error}
   */
  async findByLatest ({ latest=5 }, callback) {
    try {
      this.#ensureInit();
    
      this.#ensureNumber(latest, 'latest');

      if (latest < 1 || latest > 9) {
        const error = new Error(this.errors['ERR-1'] + `'lastest' must be an integer between 1 and 9.`);
        error.code = 'ERR-1';
        throw error;
      }

      const cached = this.cache[latest];
      
      if (
        cached &&
        Date.now() < cached.expires_at
      ) return cached.posts;

      if (this.pending[latest]) return await this.pending[latest];

      const request = (async () => {
        try {
          this.url += `&limit=${latest}`;

          const response = await fetch(this.url, {
            signal: AbortSignal.timeout(5000),
          });

          if (!response.ok) {
            const error = new Error(this.errors['ERR-2']);
            error.code = 'ERR-2';
            throw error;
          }

          const data = await response.json();

          if (!Array.isArray(data.data)) {
            const error = new Error(this.errors['ERR-2']);
            error.code = 'ERR-2';
            throw error;
          }

          const posts = data.data.filter(item =>
            item.media_type === 'IMAGE' ||
            item.media_type === 'CAROUSEL_ALBUM'
          );

          this.cache[latest] = {
            posts,
            expires_at: Date.now() + this.cache_ttl_ms,
          };

          return posts;

        } catch (error) {
          if (cached) return cached.posts;

          throw error;

        } finally { delete this.pending[latest]; }
      })();

      this.pending[latest] = request;

      if (typeof callback === 'function') return callback(null, request);

      return await request;

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }
};
