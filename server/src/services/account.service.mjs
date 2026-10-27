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
   * Initialize the service, for this instance.
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async init (callback) {
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

  /**
   * Ensure service's initialization.
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
      const error = new Error(this.errors['ERR-1'] + `'${name}' must be a valid string.`);
      error.code = 'ERR-1';
      throw error;
    }
  }

  /**
   * Ensure that `value` is a valid object.
   * @param {*} value
   * @param {string} name
   * 
   * @returns {void}
   * 
   * @throws {Error}
   */
  #ensureObject (value, name) {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
      const error = new Error(this.errors['ERR-1'] + `'${name}' must be a valid plain object.`);
      error.code = 'ERR-1';
      throw error;
    }
  }

  /**
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async #createIndexes (callback) {
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
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async #validateFirm (firm, callback) {
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
   * @param {Object} options
   * @param {string} options.firstname
   * @param {string} options.lastname
   * @param {string} options.birthdate
   * @param {string} options.phone
   * @param {string} options.email
   * @param {string} options.password
   * @param {Object} options.roles
   * @param {string} options.status
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async create ({ firstname, lastname, birthdate, phone, email, password, roles, status }, callback) {
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

      const account = await this.findByEmail({ email: email });

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
      });

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * @param {Object} options
   * @param {string} options.email
   * @param {string} options.password
   * @param {(error: Error|null, info: Object|null) => void} [callback]
   * 
   * @returns {Promise<Object|void>}
   * 
   * @throws {Error}
   */
  async auth ({ email, password }, callback) {
    try {
      this.#ensureInit();

      this.#ensureString(email   , 'email');
      this.#ensureString(password, 'password');

      const account = await this.dbAPI.findRecord({
        filter    : { email: email, },
        projection: { _id: 0, },
      });

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
        message: `Status' account isn't APPROVED.`,
        status: 'DENIED',
      };

      if (['PENDING', 'DENIED'].includes(account.status)) {
        if (typeof callback === 'function') return callback(null, case_3);

        return case_3;
      }

      const case_4 = {
        message: 'Account verified.',
        status: 'GRANTED'
      };

      if (typeof callback === 'function') return callback(null, case_4);
        
      return case_4;

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }
  }

  /**
   * @param {Object} options
   * @param {string} options.email
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async findByEmail ({ email }, callback) {
    try {
      this.#ensureInit();

      this.#ensureString(email, 'email');

      const record = await this.dbAPI.findRecord({
        filter    : { email: email, },
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
   * @param {(error: Error|null, records: Array<Object>|null) => void} [callback]
   * 
   * @returns {Promise<Array<Object>|void>}
   * 
   * @throws {Error}
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
   * @param {Object} options
   * @param {string} options.email
   * @param {Object} options.setter
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async updateByEmail ({ email, setter }, callback) {
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
      });

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * @param {Object} options
   * @param {string} options.email
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async deleteByEmail ({ email }, callback) {
    try {
      this.#ensureInit();

      this.#ensureString(email, 'email');

      await this.dbAPI.deleteRecord({ filter: { email: email } });

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }

  /**
   * @param {Object} options
   * @param {string} options.firm
   * @param {(error: Error|null, info: 'DONE'|null) => void} [callback]
   * 
   * @returns {Promise<'DONE'|void>}
   * 
   * @throws {Error}
   */
  async deleteAll ({ firm }, callback) {
    try {
      this.#ensureInit();

      await this.#validateFirm();

      await this.dbAPI.deleteAllRecords();

    } catch (error) {
      if (typeof callback === 'function') return callback(error, null);

      throw error;
    }

    if (typeof callback === 'function') return callback(null, 'DONE');

    return 'DONE';
  }
};
