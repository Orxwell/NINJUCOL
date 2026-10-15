// Controllers for APIs
import MongoAPIcontroller from '#controllers/mongodb.controller.mjs';

import { fileURLToPath } from 'url';
import { randomUUID }    from 'crypto';
import { basename }      from 'path';

const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);

export default class NewsService {
  constructor () {
    this.collection = 'news';

    this.errors = {
      'ERR-0': `Internal-Server-Error, from ${filename}: NewsService instance needs to be initialized.`,
      'ERR-1': `Internal-Server-Error, from ${filename}: Invalid argument: `,
      'ERR-2': `Internal-Server-Error, from ${filename}: New doesn't exist.`,
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
          key   : { 'uuid': 1, } ,
          name  : 'uuid_unique',
          unique: true          ,
        },
      ],
    });
  }

  #validateFirm (firm) {

  }

  async create ({ title, author, resume, description, image_url, video_url }={}) {
    this.#ensureInit();

    this.#ensureString(title      , 'title'      );
    this.#ensureString(author     , 'author'     );
    this.#ensureString(resume     , 'resume'     );
    this.#ensureString(description, 'description');
    this.#ensureString(image_url  , 'image_url'  );
    this.#ensureString(video_url  , 'video_url'  );

    const uuid = randomUUID(); 

    const normalized_title       = title.trim();
    const normalized_author      = author.trim();
    const normalized_resume      = resume.trim();
    const normalized_description = description.trim();
    const normalized_image_url   = image_url.trim();
    const normalized_video_url   = video_url.trim();

    const date = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    await this.dbAPI.createDocument({
      document: {
        UUID: uuid,

        title      : normalized_title,
        author     : normalized_author,
        resume     : normalized_resume,
        description: normalized_description,
        image_url  : normalized_image_url,
        video_url  : normalized_video_url,

        date: date,
      },
    });
  }

  async findByUUID ({ uuid }={}) {
    this.#ensureInit();

    this.#ensureString(uuid, 'uuid');

    return await this.dbAPI.findDocument({
      filter    : { 'uuid': uuid, },
      projection: { _id: 0,
        title      : 1,
        author     : 1,
        description: 1,
        image_url  : 1,
        video_url  : 1,

        date: 1,
      },
    });
  }

  async findAll () {
    this.#ensureInit();

    return await this.dbAPI.findDocuments({
      projection: { _id: 0,
        uuid: 1,

        title    : 1,
        resume   : 1,
        image_url: 1,

        date: 1,
      },
    });
  }

  async updateByUUID ({ uuid, setter }={}) {
    this.#ensureInit();

    this.#ensureString(uuid, 'uuid');
    this.#ensureObject(setter, 'setter');

    Object.entries(setter).forEach(([key, value]) => {
      this.#ensureString(value, `setter.${key}`);
    });

    const normalized_title       = title.trim();
    const normalized_author      = author.trim();
    const normalized_resume      = resume.trim();
    const normalized_description = description.trim();
    const normalized_image_url   = image_url.trim();
    const normalized_video_url   = video_url.trim();

    await this.dbAPI.updateDocument({
      filter: { uuid: uuid, },
      update: {
        $set: {
          title      : normalized_title,
          author     : normalized_author,
          resume     : normalized_resume,
          description: normalized_description,
          image_url  : normalized_image_url,
          video_url  : normalized_video_url,
        },
      },
    });
  }

  async deleteByUUID ({ uuid }={}) {
    this.#ensureInit();

    this.#ensureString(uuid, 'uuid');

    await this.dbAPI.deleteDocument({ filter: { 'uuid': uuid, }, });
  }

  async deleteAll ({ firm }={}) {
    this.#ensureInit();

    this.#validateFirm(firm);

    if (firm) {  } // Something to validate with an API, preferred OAuth to delete everything

    await this.dbAPI.clearCollection();
  }
};
