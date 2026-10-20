// Controllers for service
import controller from '#controllers/handler.controller.mjs';

// External & Internal Libraries
import { fileURLToPath } from 'url';
import { randomUUID }    from 'crypto';
import { basename }      from 'path';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class RepositoryService {
  constructor () {
    this.collection = 'repository';

    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: RepositoryService instance needs to be initialized.`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Invalid argument: `,
      'ERR-2': `Internal-Server-Error, from ${filename}: Repository doesn't exist.`,
    };

    this.is_initialized = false;
    this.dbAPI = null;
  }

  async init (onError=null) {
    try {
      // Setting controllers
      this.dbAPI = new controller.dbAPI();
      await this.dbAPI.init((error) => { throw error; });
      this.dbAPI.setCollection({ collection: this.collection }, (error) => { throw error; });

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

  async #createIndexes (onError=null) {
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

      return 'DONE';

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }

      throw error;
    }
  }

  async #validateFirm (firm=null, onError=null) {
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

  async create ({ title, description, image_uri, resource_uri }={}, onError=null) {
    try {
      this.#ensureInit();

      this.#ensureString(title      , 'title');
      this.#ensureString(description, 'description');

      this.#ensureString(image_uri   , 'image_uri');
      this.#ensureString(resource_uri, 'resource_uri');

      const uuid = randomUUID();

      const date = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      await this.dbAPI.createRecord({
        document: {
          uuid: uuid,

          title      : title,
          description: description,

          image_uri   : image_uri,
          resource_uri: resource_uri,

          date: date,
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

  async findByUUID ({ uuid }={}, onError=null) {
    try {
      this.#ensureInit();

      this.#ensureString(uuid, 'uuid');
      
      const record = await this.dbAPI.findRecord({
        filter    : { 'uuid': uuid, },
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

  async findAll (onError=null) {
    try {
      this.#ensureInit();

      const records = await this.dbAPI.findRecords({
        projection: { _id: 0, },
      }, (error) => { throw error; });

      return records;

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async updateByUUID ({ uuid, setter }={}, onError=null) {
    try {
      this.#ensureInit();

      this.#ensureString(uuid, 'uuid');
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

            image_uri   : setter.image_uri,
            resource_uri: setter.resource_uri,
          },
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

  async deleteByUUID ({ uuid }={}, onError=null) {
    try {
      this.#ensureInit();

      this.#ensureString(uuid, 'uuid');

      await this.dbAPI.deleteRecord({ filter: { 'uuid': uuid }, }, (error) => { throw error; });
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

      await this.#validateFirm(null, (error) => { throw error; });

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
