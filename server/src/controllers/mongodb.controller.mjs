// API connected with the client
import { connectDB } from '#src/importers/mongodb.importer.mjs';

// External & Internal Libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';

const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);

export default class MongoAPIcontroller {
  constructor () {
    this.collection = null;

    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: MongoDB connection needs to be done, try: connect().`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Collection needs to be set, try: setCollection().`,
      'ERR-2': `Internal-Server-Error, from ${filename}: Invalid argument: `,
    };

    this.db = null;
  }

  async connect () { this.db = await connectDB(); }

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

  #collectionHandler () {
    this.#ensureConnection();
    this.#ensureCollection();

    return this.db.collection(this.collection);
  }

  setCollection ({ collection }={}) {
    this.#ensureString(collection, 'collection');

    this.collection = collection;
  }

  /**
   * Create a single document in a specific collection on MongoDB.
   *
   * @param {Object} [options={}]          - Options object.
   * @param {Object} [options.document={}] - Object of a document to create.
   * 
   * @returns {Promise<Object>} - Object promise.
   * 
   * @throws {Error} If something goes wrong...
   */
  async createDocument ({ document={} }={}) {
    this.#ensureObject(document, 'document');

    return await this.#collectionHandler()
      .insertOne(document);
  }

  /**
   * Create multiple documents in a specific collection on MongoDB.
   *
   * @param {Object} [options={}]           - Options object.
   * @param {Object} [options.documents=[]] - Array of documents to create.
   * 
   * @returns {Promise<Object>} - Object promise.
   * 
   * @throws {Error} If something goes wrong...
   */
  async createDocuments ({ documents=[] }={}) {
    this.#ensureArray(documents, 'documents');

    documents.forEach(document => this.#ensureObject(document, 'document'));

    return await this.#collectionHandler()
      .insertMany(documents);
  }

  /**
   * Search a document in a specific collection on MongoDB.
   *
   * @param {Object} [options={}]            - Options object.
   * @param {Object} [options.filter={}]     - Filter's query.
   * @param {Object} [options.projection={}] - Projection's query.
   * 
   * @returns {Promise<Object>} - Object promise. If any results but default: null.
   * 
   * @throws {Error} If something goes wrong...
   */
  async findDocument ({ filter={}, projection={} }={}) {
    this.#ensureObject(filter    , 'filter'    );
    this.#ensureObject(projection, 'projection');

    return await this.#collectionHandler()
      .findOne(filter, { projection });
  }

  /**
   * Search documents in a specific collection on MongoDB.
   *
   * @param {Object} [options={}]            - Options object.
   * @param {Object} [options.filter={}]     - Filter's query.
   * @param {Object} [options.projection={}] - Projection's query.
   * @param {Object} [options.modifiers={}]  - Modify the query with { sort: {}, limit: {}, skip: {} }.
   * 
   * @returns {Promise<Array>} - Array promise. If any results but default: [].
   * 
   * @throws {Error} If something goes wrong...
   */
  async findDocuments({ filter={}, projection={}, modifiers={} }={}) {
    this.#ensureObject(filter    , 'filter'    );
    this.#ensureObject(projection, 'projection');
    this.#ensureObject(modifiers , 'modifiers' );

    if (modifiers.sort  !== undefined) { this.#ensureObject(modifiers.sort , 'modifiers.sort' ); }
    if (modifiers.limit !== undefined) { this.#ensureNumber(modifiers.limit, 'modifiers.limit'); }
    if (modifiers.skip  !== undefined) { this.#ensureNumber(modifiers.skip , 'modifiers.skip' ); }

    return await this.#collectionHandler()
      .find(filter, { projection })
      .sort( modifiers.sort  ?? {})
      .limit(modifiers.limit ??  0)
      .skip( modifiers.skip  ??  0)
      .toArray();
  }

  /**
   * Update the first document found in a specific collection on MongoDB.
   *
   * @param {Object} [options={}]         - Options object.
   * @param {Object} [options.filter={}]  - Filter's query.
   * @param {Object} [options.update={}]  - Update's query.
   * @param {Object} [options.options={}] - Option's query.
   * 
   * @returns {Promise<Array>} - Array promise. If any results but default: [].
   * 
   * @throws {Error} If something goes wrong...
   */
  async updateDocument({ filter={}, update={}, options={} }={}) {
    this.#ensureObject(filter , 'filter' );
    this.#ensureObject(update , 'update' );
    this.#ensureObject(options, 'options');

    return await this.#collectionHandler()
      .updateOne(filter, update, options);
  }

  /**
   * Update all documents in a specific collection on MongoDB.
   *
   * @param {Object} [options={}]        - Options object.
   * @param {Object} [options.filter={}] - Filter's query.
   * @param {Object} [options.update={}] - Update's query.
   * 
   * @returns {Promise<Array>} - Array promise. If any results but default: [].
   * 
   * @throws {Error} If something goes wrong...
   */
  async updateDocuments({ filter={}, update={} }={}) {
    this.#ensureObject(filter, 'filter');
    this.#ensureObject(update, 'update');

    return await this.#collectionHandler()
      .updateMany(filter, update);
  }

  /**
   * Update all documents in a specific collection on MongoDB.
   *
   * @param {Object} [options={}]             - Options object.
   * @param {Object} [options.filter={}]      - Filter's query.
   * @param {Object} [options.replacement={}] - Replacement's document.
   * 
   * @returns {Promise<Array>} - Array promise. If any results but default: [].
   * 
   * @throws {Error} If something goes wrong...
   */
  async replaceDocument({ filter={}, replacement={} }={}) {
    this.#ensureObject(filter     , 'filter'     );
    this.#ensureObject(replacement, 'replacement');

    return await this.#collectionHandler()
      .replaceOne(filter, replacement);
  }

  /**
   * Delete a single document in a specific collection on MongoDB.
   *
   * @param {Object} [options={}]        - Options object.
   * @param {Object} [options.filter={}] - Filter's query.
   * 
   * @returns {Promise<DeleteResult>} - Promise.
   * 
   * @throws {Error} If something goes wrong...
   */
  async deleteDocument ({ filter={} }={}) {
    this.#ensureObject(filter, 'filter');

    return await this.#collectionHandler()
      .deleteOne(filter);
  }

  /**
   * Delete multiple documents in a specific collection on MongoDB.
   *
   * @param {Object} [options={}]        - Options object.
   * @param {Object} [options.filter={}] - Filter's query.
   * 
   * @returns {Promise<DeleteResult>} - Promise.
   * 
   * @throws {Error} If something goes wrong...
   */
  async deleteDocuments ({ filter={} }={}) {
    this.#ensureObject(filter, 'filter');

    return await this.#collectionHandler()
      .deleteMany(filter);
  }

  /**
   * Delete all the documents in a specific collection on MongoDB.
   * 
   * @returns {Promise<DeleteResult>} - Promise.
   * 
   * @throws {Error} If something goes wrong...
   */
  async clearCollection () {
    return await this.#collectionHandler()
      .deleteMany({});
  }

  /**
   * Create indexes in a specific collection on MongoDB.
   * 
   * @param {Object} [options={}]         - Options object.
   * @param {Object} [options.indexes={}] - Array of indexes to create.
   * 
   * @returns {Promise<Object>} - Promise.
   * 
   * @throws {Error} If something goes wrong...
   */
  async createIndexes ({ indexes=[] }={}) {
    this.#ensureArray(indexes, 'indexes');
  
    indexes.forEach((index, i) => {
      this.#ensureObject(index    , `indexes[${i}]`    );
      this.#ensureObject(index.key, `indexes[${i}].key`);
    });
  
    return await this.#collectionHandler()
      .createIndexes(indexes);
  }

  /**
   * Drop one index in the current collection by name.
   *
   * @param {Object} [options={}]    - Options object.
   * @param {string} [options.index] - Index name.
   *
   * @returns {Promise<Object>} - Promise with the operation result.
   *
   * @throws {Error} If something goes wrong...
   */
  async dropIndex ({ index }={}) {
    this.#ensureString(index, 'index');

    return await this.#collectionHandler()
      .dropIndex(index);
  }

  /**
 * Drop all indexes in the current collection, except _id.
 *
 * @returns {Promise<Object>} - Promise.
 *
 * @throws {Error} If something goes wrong...
 */
  async dropIndexes () {
    return await this.#collectionHandler()
      .dropIndexes();
  }
};
