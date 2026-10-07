// Controllers for APIs
import MongoAPIcontroller from '#controllers/mongodb.controller.mjs';

// Services for the server
import AccountService from '#services/account.service.mjs';

// External & Internal Libraries
import { randomBytes } from 'crypto';

import { fileURLToPath } from 'url';
import { basename }      from 'path';

import { env } from '#importers/env.importer.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);

// Instantiating services -----------------¬
const accountService = new AccountService();
await accountService.init();
// _________________________________________


export default class TokenService {
  constructor () {
    this.collection = 'tokens';

    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: TokenService instance needs to be initialized.`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Invalid argument: `,
      'ERR-2': `Internal-Server-Error, from ${filename}: Token doesn't exist.`,
      'ERR-3': `Internal-Server-Error, from ${filename}: Token already exist.`,
      'ERR-4': `Internal-Server-Error, from ${filename}: Token expired.`,
    };

    this.token_life_ms = env.TOKEN_LIFE_SECONDS * 1000;

    this.is_initialized = false;
    this.dbAPI = null;
  }

  async init () {
    // Instantiating controllers -----------¬
    this.dbAPI = new MongoAPIcontroller();
    await this.dbAPI.connect();

    this.dbAPI.setCollection({ collection: this.collection });
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
      const error = new Error(this.errors['ERR-1'] + `'${name}' must be a valid non-empty string.`);
      error.code = 'ERR-1';
      throw error;
    }
  }

  #ensureDate (value, name) {
    if (
      !(value instanceof Date) ||
      isNaN(value.getTime())
    ) {
      const error = new Error(this.errors['ERR-1'] + `'${name}' must be a valid plain Date object.`);
      error.code = 'ERR-1';
      throw error;
    }
  }

  async #createIndexes () {
    this.#ensureInit();

    await this.dbAPI.createIndexes({
      indexes: [
        {
          key   : { token: 1 },
          name  : 'token_unique',
          unique: true,
        },
        {
          key               : { expiration: 1 },
          name              : 'expiration_ttl',
          expireAfterSeconds: 0,
        },
      ],
    });
  }

  #validateFirm (firm) {

  }

  async generate ({ email }={}) {
    const account = accountService.findByEmail({ email: email });

    if (!account) {
      const error = new Error(this.errors['ERR-0']);
      error.code = 'ERR-0';
      throw error;
    }
    
    return {
      token     : randomBytes(32).toString('base64url'),
      email     : email,
      expiration: new Date(Date.now() + this.token_life_ms),
    };
  }

  async save ({ token, email, expiration }={}) {
    this.#ensureInit();

    this.#ensureString(token, 'token');
    this.#ensureDate(expiration, 'expiration');

    await this.dbAPI.createDocument({
      document: {
        token     : token,
        email     : email,
        expiration: expiration,
      },
    });
  }

  async findByToken ({ token }={}) {
    this.#ensureInit();
    
    this.#ensureString(token, 'token');

    return await this.dbAPI.findDocument({
      filter    : { token: token, },
      projection: { _id: 0, },
    });
  }

  async findByEmail ({ email }={}) {
    this.#ensureInit();
    
    this.#ensureString(email, 'email');

    return await this.dbAPI.findDocument({
      filter    : { email: email, },
      projection: { _id: 0, },
    });
  }

  async delete ({ token }={}) {
    this.#ensureInit();
    
    this.#ensureString(token, 'token');

    // Erasing one token
    await this.dbAPI.deleteDocument({ filter: { token: token, }, });
  }

  async deleteAll ({ firm }={}) {
    this.#ensureInit();

    this.#validateFirm(firm);

    if (firm) {  } // Something to validate with an API, preferred OAuth to delete everything
    
    // Erasing all tokens
    await this.dbAPI.clearCollection();
  }
};
