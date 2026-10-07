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
          key   : { 'profile.email': 1, } ,
          name  : 'email_unique',
          unique: true          ,
        },
      ],
    });
  }

  #validateFirm (firm) {

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

    const normalized_email = email.trim().toLowerCase();

    const uuid = randomUUID(); 
    
    const hashed_password = await bcryptjs.hash(password, 10);

    const date = new Date();
    const created_at = date
      .toISOString()
      .split('.')[0] + 'Z';

    await this.dbAPI.createDocument({
      document: {
        UUID: uuid,
        profile: {
          firstname      : firstname,
          lastname       : lastname ,
          birthdate      : birthdate,
          phone          : phone,
          url_photo      : '',
          email          : normalized_email,
          hashed_password: hashed_password,
          roles: {
            isStaff: false,
            isAdmin: false,
          },
        },
        status: 'PENDING',
        created_at: created_at,
        updated_at: ''
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
      filter    : { 'profile.email': normalized_email, },
      projection: { _id: 0, },
    });
  }

  async findAllAccountsByStatus ({ status }={}) {
    this.#ensureInit();

    this.#ensureString(status, 'status');

    if (!['PENDING', 'APPROVED', 'FREEZE', 'TERMINATED'].includes(status)) {
      const error = new Error(this.errors['ERR-1']);
      error.code = 'ERR-1';
      throw error;
    }

    return await this.dbAPI.findDocuments({
      filter    : { status: status, },
      projection: { _id: 0, },
    });
  }

  async updateAccountsStatuses ({ statuses }={}) {
    this.#ensureInit();

    this.#ensureObject(statuses, 'statuses');

    const allowed_statuses = [
      'PENDING',
      'APPROVED',
      'FREEZE',
      'TERMINATED',
    ];

    for (const status of allowed_statuses) {
      const uuids = statuses[status];

      if (!uuids) continue;
      
      this.#ensureArray(uuids, `statuses.${status}`);

      if (uuids.length === 0) continue;

      for (const [i, uuid] of uuids.entries()) {
        this.#ensureString(uuid, `statuses.${status}[${i}]`);
      }

      await this.dbAPI.updateDocuments({
        filter: {
          UUID: { $in: uuids, },
        },
        update: {
          $set: { status: status, },
        },
      });
    }
  }

  async updateAccountsRoles ({ roles }={}) {
    this.#ensureInit();

    this.#ensureObject(roles, 'roles');

    const role_mapping = {
      NONE : { isStaff: false, isAdmin: false, },
      STAFF: { isStaff: true , isAdmin: false, },
      ADMIN: { isStaff: false, isAdmin: true,  },
      ALL  : { isStaff: true , isAdmin: true,  },
    };

    for (const [role, permissions] of Object.entries(role_mapping)) {
      const uuids = roles[role];

      if (!uuids) continue;
      
      this.#ensureArray(uuids, `roles.${role}`);

      if (uuids.length === 0) continue;

      for (const [i, uuid] of uuids.entries()) {
        this.#ensureString(uuid, `roles.${role}[${i}]`);
      }

      await this.dbAPI.updateDocuments({
        filter: {
          UUID: { $in: uuids, },
        },
        update: {
          $set: {
            'profile.roles.isStaff': permissions.isStaff,
            'profile.roles.isAdmin': permissions.isAdmin,
          },
        },
      });
    }
  }

  async deleteByEmail ({ email }={}) {
    this.#ensureInit();

    this.#ensureString(email, 'email');

    const normalized_email = email.trim().toLowerCase();

    await this.dbAPI.deleteDocument({ filter: { 'profile.email': normalized_email, }, });
  }

  async deleteAll ({ firm }={}) {
    this.#ensureInit();

    this.#validateFirm(firm);

    if (firm) {  } // Something to validate with an API, preferred OAuth to delete everything

    await this.dbAPI.clearCollection();
  }
};
