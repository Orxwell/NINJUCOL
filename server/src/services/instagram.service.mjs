// External & Internal Libraries
import { basename }      from 'path';
import { fileURLToPath } from 'url';

import { env } from '#importers/env.importer.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class InstagramService {
  constructor () {
    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: InstagramService instance needs to be initialized.`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Invalid argument: `,
      'ERR-2': `External-Service-Error, from ${filename}: Instagram API request failed.`,
    };

    this.is_initialized = false;

    this.url = null;
    this.cache = {};
    this.pending = {};

    this.cache_ttl_ms = env.INSTAGRAM_TTL_HOURS * 60 * 60 * 1000;
  }

  /**
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async init (callback=()=>{}) {
    try {
      this.url = `${env.INSTAGRAM_API_URI}`;

      this.is_initialized = true;

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
   * @param {Object} info
   * @param {string} info.latest
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async findByLatest ({ latest=4 }={}, callback=()=>{}) {
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
