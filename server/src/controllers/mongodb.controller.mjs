/**
 * MongoDB controller for managing collections, records, and indexes.
 * @see {@link https://www.mongodb.com/docs/drivers/node/current/ | MongoDB Node.js Driver Documentation}
 */

// External & Internal libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';

import importer from '#importers/handler.importer.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class MongoDBController {
  constructor () {
    this.collection = null;

    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: MongoDB connection needs to be initialized, try: init().`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Collection needs to be set, try: setCollection().`,
      'ERR-2': `Internal-Server-Error, from ${filename}: Invalid argument: `,
    };

    this.is_initialized = false;
    this.db = null;
  }

  /**
   * Initialize the MongoDB connection, for this instance.
   * @see {@link https://www.mongodb.com/docs/drivers/node/current/connect/ | MongoDB Connection Documentation}
   * 
   * @param {(error: Error|null, info: string|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async init (callback) {
    try {
      this.db = await importer.db();

      this.is_initialized = true;
    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Ensure MongoDBController initialization.
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
   * Ensure MongoDB collection.
   * @returns {void}
   * 
   * @throws {Error}
   */
  #ensureCollection () {
    if (!this.collection) {
      const error = new Error(this.errors['ERR-1']);
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

  /**
   * Ensure that `value` is an object.
   * @param {*} value
   * @param {string} name
   * 
   * @returns {void}
   * 
   * @throws {Error}
   */
  #ensureObject (value, name) {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
      const error = new Error(this.errors['ERR-2'] + `'${name}' must be a valid plain object.`);
      error.code = 'ERR-2';
      throw error;
    }
  }

  /**
   * Ensure that `value` is an array.
   * @param {*} value
   * @param {string} name
   * 
   * @returns {void}
   * 
   * @throws {Error}
   */
  #ensureArray (value, name) {
    if (!Array.isArray(value)) {
      const error = new Error(this.errors['ERR-2'] + `'${name}' must be a valid plain array.`);
      error.code = 'ERR-2';
      throw error;
    }
  }

  /**
   * Ensure that `value` is a valid number.
   * @param {*} value
   * @param {string} name
   * 
   * @returns {void}
   * 
   * @throws {Error}
   */
  #ensureNumber (value, name) {
    if (
      !Number.isSafeInteger(value) ||
      value < 0
    ) {
      const error = new Error(this.errors['ERR-2'] + `'${name}' must be a valid number.`);
      error.code = 'ERR-2';
      throw error;
    }
  }

  /**
   * Get the MongoDB collection handler for the established collection.
   * @see {@link https://www.mongodb.com/docs/drivers/node/current/databases-collections/ | MongoDB Collections Documentation}
   * 
   * @returns {import('mongodb').Collection<import('mongodb').Document>}
   * 
   * @throws {Error}
   */
  #collectionHandler () {
    this.#ensureInit();
    this.#ensureCollection();

    return this.db.collection(this.collection);
  }

  /**
   * Set the MongoDB collection for use, in this instance.
   * @see {@link https://www.mongodb.com/docs/drivers/node/current/databases-collections/ | MongoDB Collections Documentation}
   * 
   * @param {Object} [options]
   * @param {string} [options.collection]
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {'DONE'|void}
   * 
   * @throws {Error}
   */
  setCollection ({ collection='' }={}, callback) {
    try {
      this.#ensureString(collection, 'collection');

      this.collection = collection;

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Create a record in the established collection.
   * @see {@link https://www.mongodb.com/es/docs/drivers/node/current/crud/insert/ | MongoDB insertOne(), Node.js Driver Documentation}
   * 
   * @param {Object} [options]
   * @param {import('mongodb').OptionalUnlessRequiredId<import('mongodb').Document>} [options.record]
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async createRecord ({ record={} }={}, callback) {
    try {
      this.#ensureObject(record, 'record');

      const handler = this.#collectionHandler();

      await handler.insertOne(record);

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Create multiple records in the established collection.
   * @see {@link https://www.mongodb.com/es/docs/drivers/node/current/crud/insert/ | MongoDB insertMany(), Node.js Driver Documentation}
   * 
   * @param {Object} [options]
   * @param {Array<import('mongodb').OptionalUnlessRequiredId<import('mongodb').Document>>} [options.records]
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async createRecords ({ records=[] }={}, callback) {
    try {
      this.#ensureArray(records, 'records');

      records.forEach(record => this.#ensureObject(record, 'record'));

      const handler = this.#collectionHandler();

      await handler.insertMany(records);

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Create an index in the established collection.
   * @see {@link https://www.mongodb.com/docs/drivers/node/current/indexes/ | MongoDB Indexes Documentation}
   *
   * @param {Object} [options]
   * @param {import('mongodb').IndexDescription} [options.index]
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   *
   * @returns {Promise<'DONE'|void>}
   *
   * @throws {Error}
   */
  async createIndex ({ index={} }={}, callback) {
    try {
      this.#ensureObject(index, 'index');
      this.#ensureObject(index.key, 'index.key');

      const handler = this.#collectionHandler();

      const { key, ...options } = index;

      await handler.createIndex(key, options);

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Create multiple indexes in the established collection.
   * @see {@link https://www.mongodb.com/docs/drivers/node/current/indexes/ | MongoDB Indexes Documentation}
   * @param {Object} [options]
   * 
   * @param {Array<import('mongodb').IndexDescription>} [options.indexes]
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async createIndexes ({ indexes=[] }={}, callback) {
    try {
      this.#ensureArray(indexes, 'indexes');
  
      indexes.forEach((index, i) => {
        this.#ensureObject(index    , `indexes[${i}]`);
        this.#ensureObject(index.key, `indexes[${i}].key`);
      });

      const handler = this.#collectionHandler();
    
      await handler.createIndexes(indexes);

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Find a single record in the established collection.
   * @see {@link https://www.mongodb.com/es/docs/drivers/node/current/crud/query/retrieve/ | MongoDB findOne(), Node.js Driver Documentation}
   * 
   * @param {Object} [options]
   * @param {import('mongodb').Filter<import('mongodb').Document>} [options.filter]
   * @param {import('mongodb').Document} [options.projection]
   * @param {(error: Error|null, record: import('mongodb').Document|null) => void} [callback]
   * 
   * @returns {Promise<import('mongodb').Document|void>}
   * 
   * @throws {Error}
   */
  async findRecord ({ filter={}, projection={} }={}, callback) {
    let record;

    try {
      this.#ensureObject(filter    , 'filter');
      this.#ensureObject(projection, 'projection');

      const handler = this.#collectionHandler();

      record = await handler.findOne(filter, { projection });

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, record);

    return record;
  }

  /**
   * Find multiple records in the established collection.
   * @see {@link https://www.mongodb.com/es/docs/drivers/node/current/crud/query/retrieve/ | MongoDB find(), Node.js Driver Documentation}
   * 
   * @param {Object} [options]
   * @param {import('mongodb').Filter<import('mongodb').Document>} [options.filter]
   * @param {import('mongodb').Document} [options.projection]
   * @param {Object} [options.modifiers]
   * @param {import('mongodb').Sort} [options.modifiers.sort]
   * @param {number} [options.modifiers.limit]
   * @param {number} [options.modifiers.skip]
   * @param {(error: Error|null, records: Array<import('mongodb').Document>|null) => void} [callback]
   * 
   * @returns {Promise<Array<import('mongodb').Document>|void>}
   * 
   * @throws {Error}
   */
  async findRecords({ filter={}, projection={}, modifiers={} }={}, callback) {
    let records;

    try {
      this.#ensureObject(filter    , 'filter');
      this.#ensureObject(projection, 'projection');
      this.#ensureObject(modifiers , 'modifiers');

      if (modifiers.sort !== undefined) this.#ensureObject(modifiers.sort, 'modifiers.sort');
      if (modifiers.limit !== undefined) this.#ensureNumber(modifiers.limit, 'modifiers.limit');
      if (modifiers.skip !== undefined) this.#ensureNumber(modifiers.skip, 'modifiers.skip');

      const handler = this.#collectionHandler();

      records = await handler
        .find(filter, { projection })
        .sort( modifiers.sort  ?? {})
        .limit(modifiers.limit ?? 0)
        .skip( modifiers.skip  ?? 0)
        .toArray();

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, records);

    return records;
  }

  /**
   * Update a single record in the established collection.
   * @see {@link https://www.mongodb.com/es/docs/drivers/node/current/crud/update/ | MongoDB updateOne(), Node.js Driver Documentation}
   * 
   * @param {Object} [options]
   * @param {import('mongodb').Filter<import('mongodb').Document>} [options.filter]
   * @param {import('mongodb').UpdateFilter<import('mongodb').Document>} [options.update]
   * @param {import('mongodb').UpdateOptions} [options.options]
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async updateRecord({ filter={}, update={}, options={} }={}, callback) {
    try {
      this.#ensureObject(filter , 'filter');
      this.#ensureObject(update , 'update');
      this.#ensureObject(options, 'options');

      const handler = this.#collectionHandler();

      await handler.updateOne(filter, update, options);

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Update multiple records in the established collection.
   * @see {@link https://www.mongodb.com/es/docs/drivers/node/current/crud/update/ | MongoDB updateMany(), Node.js Driver Documentation}
   * 
   * @param {Object} [options]
   * @param {import('mongodb').Filter<import('mongodb').Document>} [options.filter]
   * @param {import('mongodb').UpdateFilter<import('mongodb').Document>} [options.update]
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async updateRecords({ filter={}, update={} }={}, callback) {
    try {
      this.#ensureObject(filter, 'filter');
      this.#ensureObject(update, 'update');

      const handler = this.#collectionHandler();

      await handler.updateMany(filter, update);

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Replace a single record in the established collection.
   * @see {@link https://www.mongodb.com/es/docs/drivers/node/current/crud/update/replace/ | MongoDB replaceOne(), Node.js Driver Documentation}
   * 
   * @param {Object} [options]
   * @param {import('mongodb').Filter<import('mongodb').Document>} [options.filter]
   * @param {import('mongodb').WithoutId<import('mongodb').Document>} [options.replacement]
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async replaceRecord({ filter={}, replacement={} }={}, callback) {
    try {
      this.#ensureObject(filter     , 'filter');
      this.#ensureObject(replacement, 'replacement');

      const handler = this.#collectionHandler();

      await handler.replaceOne(filter, replacement);

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Delete a single record from the established collection.
   * @see {@link https://www.mongodb.com/es/docs/drivers/node/current/crud/delete/ | MongoDB deleteOne(), Node.js Driver Documentation}
   * 
   * @param {Object} [options]
   * @param {import('mongodb').Filter<import('mongodb').Document>} [options.filter]
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async deleteRecord ({ filter={} }={}, callback) {
    try {
      this.#ensureObject(filter, 'filter');

      const handler = this.#collectionHandler();

      await handler.deleteOne(filter);

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Delete multiple records from the established collection.
   * @see {@link https://www.mongodb.com/es/docs/drivers/node/current/crud/delete/ | MongoDB deleteMany(), Node.js Driver Documentation}
   * 
   * @param {Object} [options]
   * @param {import('mongodb').Filter<import('mongodb').Document>} [options.filter]
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async deleteRecords ({ filter={} }={}, callback) {
    try {
      this.#ensureObject(filter, 'filter');

      const handler = this.#collectionHandler();

      await handler.deleteMany(filter);

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Delete all records from the established collection.
   * @see {@link https://www.mongodb.com/es/docs/drivers/node/current/crud/delete/ | MongoDB deleteMany(), Node.js Driver Documentation}
   * 
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async deleteAllRecords (callback) {
    try {
      const handler = this.#collectionHandler();

      await handler.deleteMany({});

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Delete a specific index from the established collection.
   * @see {@link https://www.mongodb.com/docs/drivers/node/current/indexes/ | MongoDB Indexes Documentation}
   * 
   * @param {Object} [options]
   * @param {string} [options.index]
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async deleteIndex ({ index }={}, callback) {
    try {
      this.#ensureString(index, 'index');

      const handler = this.#collectionHandler();

      await handler.dropIndex(index);

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * Delete all removable indexes from the established collection.
   * The default _id index is preserved by MongoDB.
   * @see {@link https://www.mongodb.com/docs/drivers/node/current/indexes/ | MongoDB Indexes Documentation}
   * 
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async deleteAllIndexes (callback) {
    try {
      const handler = this.#collectionHandler();

      await handler.dropIndexes();

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);
  
      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }
};
