// API connected with the client
import { connectDB } from '#src/importers/mongodb.importer.mjs';

// External & Internal Libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class MongoDBController {
  constructor () {
    this.collection = null;

    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: MongoDB connection needs to be done, try: connect().`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Collection needs to be set, try: setCollection().`,
      'ERR-2': `Internal-Server-Error, from ${filename}: Invalid argument: `,
    };

    this.db = null;
  }

  async init (onError=null) {
    try {
      this.db = await connectDB();

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  #ensureConnection () {
    if (!this.db) {
      const error = new Error(this.errors['ERR-0']);
      error.code = 'ERR-0';
      throw error;
    }
  }

  #ensureCollection () {
    if (!this.collection) {
      const error = new Error(this.errors['ERR-1']);
      error.code = 'ERR-1';
      throw error;
    }
  }

  #ensureString (value, name) {
    if (
      typeof value !== 'string' ||
      value.trim() === ''
    ) {
      const error = new Error(this.errors['ERR-2'] + `'${name}' must be a valid non-empty string.`);
      error.code = 'ERR-2';
      throw error;
    }
  }

  #ensureObject (value, name) {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
      const error = new Error(this.errors['ERR-2'] + `'${name}' must be a valid plain object.`);
      error.code = 'ERR-2';
      throw error;
    }
  }

  #ensureArray (value, name) {
    if (!Array.isArray(value)) {
      const error = new Error(this.errors['ERR-2'] + `'${name}' must be a valid plain array.`);
      error.code = 'ERR-2';
      throw error;
    }
  }

  #ensureNumber (value, name) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      const error = new Error(this.errors['ERR-2'] + `'${name}' must be a valid number.`);
      error.code = 'ERR-2';
      throw error;
    }
  }

  #collectionHandler (onError=null) {
    try {
      this.#ensureConnection();
      this.#ensureCollection();

      return this.db.collection(this.collection);

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  setCollection ({ collection }={}, onError=null) {
    try {
      this.#ensureString(collection, 'collection');

      this.collection = collection;

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async createRecord ({ record={} }={}, onError=null) {
    try {
      this.#ensureObject(record, 'record');

      const handler = this.#collectionHandler((error) => { throw error; });

      return await handler.insertOne(record);

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async createRecords ({ records=[] }={}, onError=null) {
    try {
      this.#ensureArray(records, 'records');

      records.forEach(record => this.#ensureObject(record, 'record'));

      const handler = await this.#collectionHandler((error) => { throw error; });

      return handler.insertMany(records);

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async findRecord ({ filter={}, projection={} }={}, onError=null) {
    try {
      this.#ensureObject(filter    , 'filter');
      this.#ensureObject(projection, 'projection');

      const handler = await this.#collectionHandler((error) => { throw error; });

      return handler.findOne(filter, { projection });

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async findRecords({ filter={}, projection={}, modifiers={} }={}, onError=null) {
    try {
      this.#ensureObject(filter    , 'filter');
      this.#ensureObject(projection, 'projection');
      this.#ensureObject(modifiers , 'modifiers');

      if (modifiers?.sort) this.#ensureObject(modifiers.sort, 'modifiers.sort');
      if (modifiers?.limit) this.#ensureNumber(modifiers.limit, 'modifiers.limit');
      if (modifiers?.skip) this.#ensureNumber(modifiers.skip, 'modifiers.skip');

      const handler = await this.#collectionHandler();

      return handler
        .find(filter, { projection })
        .sort( modifiers.sort  ?? {})
        .limit(modifiers.limit ?? 0)
        .skip( modifiers.skip  ?? 0)
        .toArray();

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async updateRecord({ filter={}, update={}, options={} }={}, onError=null) {
    try {
      this.#ensureObject(filter , 'filter');
      this.#ensureObject(update , 'update');
      this.#ensureObject(options, 'options');

      const handler = await this.#collectionHandler();

      return handler.updateOne(filter, update, options);

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async updateRecords({ filter={}, update={} }={}, onError=null) {
    try {
      this.#ensureObject(filter, 'filter');
      this.#ensureObject(update, 'update');

      const handler = await this.#collectionHandler();

      return handler.updateMany(filter, update);

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async replaceRecord({ filter={}, replacement={} }={}, onError=null) {
    try {
      this.#ensureObject(filter     , 'filter');
      this.#ensureObject(replacement, 'replacement');

      const handler = await this.#collectionHandler();

      return handler.replaceOne(filter, replacement);
    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async deleteRecord ({ filter={} }={}, onError=null) {
    try {
      this.#ensureObject(filter, 'filter');

      const handler = await this.#collectionHandler();

      return handler.deleteOne(filter);

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async deleteRecords ({ filter={} }={}, onError=null) {
    try {
      this.#ensureObject(filter, 'filter');

      const handler = await this.#collectionHandler();

      return handler.deleteMany(filter);

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async clearCollection (onError=null) {
    try {
      const handler = await this.#collectionHandler();

      return handler.deleteMany({});

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async createIndexes ({ indexes=[] }={}, onError=null) {
    try {
      this.#ensureArray(indexes, 'indexes');
  
      indexes.forEach((index, i) => {
        this.#ensureObject(index    , `indexes[${i}]`);
        this.#ensureObject(index.key, `indexes[${i}].key`);
      });

      const handler = await this.#collectionHandler();
    
      return handler.createIndexes(indexes);

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async dropIndex ({ index }={}, onError=null) {
    try {
      this.#ensureString(index, 'index');

      const handler = await this.#collectionHandler();

      return handler.dropIndex(index);

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }

  async dropIndexes (onError=null) {
    try {
      const handler = await this.#collectionHandler();

      return handler.dropIndexes();

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }
  
      throw error;
    }
  }
};
