// Controllers for APIs
import MongoAPIcontroller from '#controllers/mongodb.controller.mjs';

// External & Internal Libraries
import bcryptjs from 'bcryptjs';

import { fileURLToPath } from 'url';
import { randomUUID }    from 'crypto';
import { basename }      from 'path';

const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);

export default class AccountService {
  constructor () {
    this.collection = 'accounts';

    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: AccountService instance needs to be initialized.`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Invalid argument: `,
      'ERR-2': `Internal-Server-Error, from ${filename}: Account doesn't exist.`,
      'ERR-3': `Internal-Server-Error, from ${filename}: Account already exist.`,
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
          key   : { 'email': 1, } ,
          name  : 'email_unique',
          unique: true,
        },
      ],
    });
  }

  async #validateFirm (firm) {

  }

  async create ({ firstname, lastname, birthdate, phone, email, password }={}) {
    this.#ensureInit();

    this.#ensureString(firstname, 'firstname');
    this.#ensureString(lastname , 'lastname');
    this.#ensureString(birthdate, 'birthdate');
    this.#ensureString(phone    , 'phone');
    this.#ensureString(email    , 'email');
    this.#ensureString(password , 'password');

    const account = await this.findByEmail({ email: email, });

    if (account) {
      const error = new Error(this.errors['ERR-3']);
      error.code = 'ERR-3';
      throw error;
    }

    const uuid = randomUUID(); 

    const normalized_firstname = firstname.trim().toLowerCase();
    const normalized_lastname = lastname.trim().toLowerCase();
    const normalized_birthdate = birthdate.trim().toLowerCase();
    const normalized_phone = phone.trim().toLowerCase();
    const normalized_email = email.trim().toLowerCase();
    
    const hashed_password = await bcryptjs.hash(password, 10);

    const date = new Date().toLocaleDateString('es-ES', {
      minute: '2-digit',
      hour: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour12: true,
    });

    await this.dbAPI.createDocument({
      document: {
        uuid: uuid,
        
        firstname: normalized_firstname,
        lastname : normalized_lastname ,
        birthdate: normalized_birthdate,
        phone    : normalized_phone,
        email    : normalized_email,

        hashed_password: hashed_password,

        date: date,
      },
    });
  }

  async auth ({ email, password }={}) {
    this.#ensureInit();

    this.#ensureString(email   , 'email'   );
    this.#ensureString(password, 'password');

    const account = await this.findByEmail({ email: email, });

    if (!account) {
      const error = new Error(this.errors['ERR-2']);
      error.code = 'ERR-2';
      throw error;
    }

    const status = await bcryptjs.compare(password, account.profile.hashed_password);
      
    return { status: status ? 'GRANTED' : 'DENIED' };
  }

  async findByEmail ({ email }={}) {
    this.#ensureInit();

    this.#ensureString(email, 'email');

    const normalized_email = email.trim().toLowerCase();

    return await this.dbAPI.findDocument({
      filter    : { email: normalized_email, },
      projection: { _id: 0, },
    });
  }

  async findAll () {
    this.#ensureInit();

    return await this.dbAPI.findDocuments({
      projection: { _id: 0, },
    });
  }

  async updateByEmail ({ email, setter }={}) {
    this.#ensureInit();

    this.#ensureString(email, 'email');
    this.#ensureObject(setter, 'setter');

    Object.entries(setter).forEach(([key, value]) => {
      this.#ensureString(value, `setter.${key}`);
    });

    await this.dbAPI.updateDocument({
      filter: { email: email, },
      update: { $set: setter, },
    });
  }

  async deleteByEmail ({ email }={}) {
    this.#ensureInit();

    this.#ensureString(email, 'email');

    const normalized_email = email.trim().toLowerCase();

    await this.dbAPI.deleteDocument({ filter: { email: normalized_email, }, });
  }

  async deleteAll ({ firm }={}) {
    this.#ensureInit();

    if (await this.#validateFirm(firm)) {  } // Something to validate with an API, preferred OAuth to delete everything

    await this.dbAPI.clearCollection();
  }
};
