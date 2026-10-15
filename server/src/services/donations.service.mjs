// Controllers for APIs
import MongoAPIcontroller from '#controllers/mongodb.controller.mjs';

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
  }

  async init () {
    // Instantiating controllers -----------¬
    this.dbAPI = new MongoAPIcontroller();
    await this.dbAPI.connect();

    this.dbAPI.setCollection({ collection: this.collection});
    // ______________________________________

    this.is_initialized = true;

    await this.#createIndexes();
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

  async #createIndexes () {
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
  }

  async #validateFirm (firm) {

  }

  async create ({}={}) {
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
    });
  }

  async findByUUID ({ uuid }={}) {
    this.#ensureInit();

    this.#ensureString(uuid, 'uuid');
    
    return await this.dbAPI.findDocument({
      filter    : { 'uuid': uuid, },
      projection: { _id: 0, },
    });
  }

  async findAll () {
    this.#ensureInit();

    return await this.dbAPI.findDocuments({
      projection: { _id: 0, uuid: 0, },
    });
  }

  async deleteAll ({ firm }={}) {
    this.#ensureInit();

    if (await this.#validateFirm(firm)) {  } // Something to validate with an API, preferred OAuth to delete everything

    await this.dbAPI.clearCollection();
  }
};
