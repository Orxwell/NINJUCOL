// Controllers for service
import controller from '#controllers/handler.controller.mjs';

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
      'ERR-2': `Internal-Server-Error, from ${filename}: Account already exist.`,
      'ERR-3': `Internal-Server-Error, from ${filename}: Account doesn't exist.`,
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
            key   : { 'email': 1, } ,
            name  : 'email_unique',
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
   * @param {string} info.firstname - Firstname's account.
   * @param {string} info.lastname - Lastname's account.
   * @param {string} info.birthdate - Birthdate's account.
   * @param {string} info.phone - Phone's account.
   * @param {string} info.email - Email's account.
   * @param {string} info.password - Password's account.
   * @param {Object} info.roles - Roles's account.
   * @param {string} info.status - Status's account.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async create ({ firstname, lastname, birthdate, phone, email, password, roles, status }={}, callback=()=>{}) {
    try {
      this.#ensureInit();

      this.#ensureString(firstname, 'firstname');
      this.#ensureString(lastname , 'lastname');
      this.#ensureString(birthdate, 'birthdate');
      this.#ensureString(phone    , 'phone');
      this.#ensureString(email    , 'email');
      this.#ensureString(password , 'password');
      this.#ensureObject(roles    , 'roles');
      this.#ensureString(status   , 'status');

      const account = await this.findByEmail({ email: email }, (error) => { throw error; });

      if (account) {
        const error = new Error(this.errors['ERR-2']);
        error.code = 'ERR-2';
        return { error: error, };
      }

      const uuid = randomUUID(); 
      
      const hashed_password = await bcryptjs.hash(password, 10);

      const date = new Date().toLocaleDateString('es-ES', {
        minute: '2-digit',
        hour: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour12: true,
      });

      await this.dbAPI.createRecord({
        record: {
          uuid: uuid,
          
          firstname: firstname,
          lastname : lastname,
          birthdate: birthdate,
          phone    : phone,
          email    : email,

          hashed_password: hashed_password,

          roles : roles,
          status: status,

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
   * @param {string} info.email - Email's account.
   * @param {string} info.password - Password's account.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async auth ({ email, password }={}, callback=()=>{}) {
    try {
      this.#ensureInit();

      this.#ensureString(email   , 'email');
      this.#ensureString(password, 'password');

      const account = await this.dbAPI.findRecord({
        filter    : { email: email, },
        projection: { _id: 0, },
      }, (error) => { throw error; });

      const case_1 = {
        message: `Account doesn't exist.`,
        status: 'DENIED',
      };

      if (!account) {
        if (typeof callback === 'function') return callback(null, case_1);

        return case_1;
      }

      const status = await bcryptjs.compare(password, account.hashed_password);

      const case_2 = {
        message: `Invalid password.`,
        status: 'DENIED',
      };

      if (!status) {
        if (typeof callback === 'function') return callback(null, case_2);

        return case_2;
      }

      const case_3 = {
        message: 'Account verified.',
        status: 'GRANTED'
      };

      if (typeof callback === 'function') return callback(null, case_3);
        
      return case_3;

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }

  /**
   * @param {Object} info
   * @param {string} info.email - Email's record.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async findByEmail ({ email }={}, callback=()=>{}) {
    try {
      this.#ensureInit();

      this.#ensureString(email, 'email');

      const record = await this.dbAPI.findRecord({
        filter    : { email: email, },
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

  async updateByEmail ({ email, setter }={}, callback=()=>{}) {
    try {
      this.#ensureInit();

      this.#ensureString(email, 'email');
      this.#ensureObject(setter, 'setter');

      Object.entries(setter).forEach(([key, value]) => {
        this.#ensureString(value, `setter.${key}`);
      });

      await this.dbAPI.updateRecord({
        filter: { email: email, },
        update: { $set: setter, },
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
   * @param {string} info.email - Email's record.
   * @param {(error: Error|null, info: string|null) => void} [callback] - (Optional)
   */
  async deleteByEmail ({ email }={}, callback=()=>{}) {
    try {
      this.#ensureInit();

      this.#ensureString(email, 'email');

      await this.dbAPI.deleteRecord({ filter: { email: email } }, (error) => { throw error; });

      if (typeof callback === 'function') return callback(null, 'DONE');

      return 'DONE';

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
