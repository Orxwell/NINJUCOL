// Controllers for service
import controller from '#controllers/handler.controller.mjs';

// External & Internal Libraries
import { fileURLToPath } from 'url';
import { randomUUID }    from 'crypto';
import { basename }      from 'path';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class DonationsService {
  constructor () {
    this.collection = 'donations';

    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: DonationsService instance needs to be initialized.`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Invalid argument: `,
      'ERR-2': `Internal-Server-Error, from ${filename}: Donation doesn't exist.`,
    };

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

      this.dbAPI.setCollection({ collection: this.collection });

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

  #ensureArray (value, name) {
    if (!Array.isArray(value)) {
      const error = new Error(this.errors['ERR-1'] + `'${name}' must be a valid plain array.`);
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
            key   : { 'uuid': 1, },
            name  : 'uuid_unique',
            unique: true,
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
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async create ({}={}, callback=()=>{}) {
    try {
      this.#ensureInit();

      const uuid = randomUUID();

      const date = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      await this.dbAPI.createDocument({
        document: {
          uuid: uuid,

          date: date,
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
   * @param {string} info.uuid - UUID's record.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async findByUUID ({ uuid }={}, callback=()=>{}) {
    try {
      this.#ensureInit();

      this.#ensureString(uuid, 'uuid');
      
      const record = await this.dbAPI.findRecord({
        filter    : { 'uuid': uuid, },
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
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async findAll (callback=()=>{}) {
    try {
      this.#ensureInit();

      const records = await this.dbAPI.findRecords({
        projection: { _id: 0, },
      }, (error) => { throw error; });

      if (typeof callback === 'function') return callback(null, records);

      return records;

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

      await this.#validateFirm(null, (error) => { throw error; });

      await this.dbAPI.clearCollection((error) => { throw error; });

      if (typeof callback === 'function') return callback(null, 'DONE');

      return 'DONE';

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }
};
