// Controllers for service
import controller from '#controllers/handler.controller.mjs';

// External & Internal Libraries
import { fileURLToPath } from 'url';
import { randomUUID }    from 'crypto';
import { basename }      from 'path';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class CampaignsService {
  constructor () {
    this.collection = 'campaigns';

    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: CampaignsService instance needs to be initialized.`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Invalid argument: `,
      'ERR-2': `Internal-Server-Error, from ${filename}: Campaign doesn't exist.`,
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
  async #createIndexes (callback) {
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
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async #validateFirm (firm='', callback) {
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
   * @param {Object} info
   * @param {string} info.title - Title's campaign.
   * @param {string} info.description - Description's campaign.
   * @param {string} info.resource_uri - URI's campaign.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async create ({ title, description, resource_uri }={}, callback) {
    try {
      this.#ensureInit();

      this.#ensureString(title      , 'title');
      this.#ensureString(description, 'description');

      this.#ensureString(resource_uri, 'resource_uri');

      const uuid = randomUUID();

      const date = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      await this.dbAPI.createRecord({
        record: {
          uuid: uuid,

          title      : title,
          description: description,

          resource_uri: resource_uri,

          date: date,
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
   * @param {Object} info
   * @param {string} info.uuid - UUID's record.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async findByUUID ({ uuid }={}, callback) {
    try {
      this.#ensureInit();

      this.#ensureString(uuid, 'uuid');
      
      const record = await this.dbAPI.findRecord({
        filter    : { 'uuid': uuid, },
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
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async findAll (callback) {
    try {
      this.#ensureInit();

      const records = await this.dbAPI.findRecords({
        projection: { _id: 0, },
      });

      if (typeof callback === 'function') return callback(null, records);

      return records;

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }
  }

  /**
   * @param {Object} info
   * @param {string} info.uuid - UUID's record.
   * @param {Object} info.setter - Setter's record.
   * @param {string} info.setter.title - Set title.
   * @param {string} info.setter.description - Set description.
   * @param {string} info.setter.resource_uri - Set URI's resource.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async updateByUUID ({ uuid, setter }={}, callback) {
    try {
      this.#ensureInit();

      this.#ensureObject(uuid, 'uuid');
      this.#ensureObject(setter, 'setter');

      Object.entries(setter).forEach(([key, value]) => {
        this.#ensureString(value, `setter.${key}`);
      });

      await this.dbAPI.updateRecord({
        filter: { uuid: uuid, },
        update: {
          $set: {
            title      : setter.title,
            description: setter.description,
            
            resource_uri: setter.resource_uri,
          },
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
   * @param {Object} info
   * @param {string} info.uuid - UUID's record.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async deleteByUUID ({ uuid }={}, callback) {
    try {
      this.#ensureInit();

      this.#ensureString(uuid, 'uuid');

      await this.dbAPI.findRecord({
        filter: { uuid: uuid, },
        projection: { _id: 0, },
      }, async (error, record) => {
        if (error) throw error;
      
        if (record) {
          await delFile({ folder_path: record.resource_uri.slice(4) });
        
          await this.dbAPI.deleteRecord({ filter: { uuid: record.uuid }, });
        }
      });

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * @param {Object} info
   * @param {string} [info.firm=''] - Firm from OAuth.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async deleteAll ({ firm='' }={}, callback) {
    try {
      this.#ensureInit();

      await this.#validateFirm(null);

      await this.dbAPI.deleteAllRecords();

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }
};
