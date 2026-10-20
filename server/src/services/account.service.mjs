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

  async init (onError=null) {
    try {
      // Setting collection
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
            key   : { 'email': 1, } ,
            name  : 'email_unique',
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

  async create ({ firstname, lastname, birthdate, phone, email, password, roles, status }={}, onError=null) {
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

      return 'DONE';

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }

      throw error;
    }
  }

  async auth ({ email, password }={}, onError=null) {
    try {
      this.#ensureInit();

      this.#ensureString(email   , 'email');
      this.#ensureString(password, 'password');

      const account = await this.dbAPI.findRecord({
        filter    : { email: email, },
        projection: { _id: 0, },
      }, (error) => { throw error; });

      if (!account) return {
        message: `Account doesn't exist.`,
        status: 'DENIED',
      };

      const status = await bcryptjs.compare(password, account.hashed_password);

      if (!status) return {
        message: `Invalid password.`,
        status: 'DENIED',
      };
        
      return {
        message: 'Account verified.',
        status: 'GRANTED'
      };

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }

      throw error;
    }
  }

  async findByEmail ({ email }={}, onError=null) {
    try {
      this.#ensureInit();

      this.#ensureString(email, 'email');

      const record = await this.dbAPI.findRecord({
        filter    : { email: email, },
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

  async updateByEmail ({ email, setter }={}, onError=null) {
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

      return 'DONE';

    } catch (error) {
      if (typeof onError === 'function')  {
        onError(error);
        return;
      }

      throw error;
    }
  }

  async deleteByEmail ({ email }={}, onError=null) {
    try {
      this.#ensureInit();

      this.#ensureString(email, 'email');

      await this.dbAPI.deleteRecord({ filter: { email: email } }, (error) => { throw error; });

      return 'DONE';

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
