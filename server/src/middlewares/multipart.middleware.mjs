// Importers for the middleware
import paths from '#utils/paths.util.mjs';

// Utils for the middleware
import {
  errorHTTP,
  isValidMimeType
} from '#utils/functions.util.mjs';

// External & Internal ibraries
import multer from 'multer';

import { randomUUID }    from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  mkdir,
  open,
  rm
} from 'node:fs/promises';
import {
  basename,
  extname,
  join
} from 'node:path';

import BaseMiddleware from './base.middleware.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class MultipartMiddleware extends BaseMiddleware {
  constructor ({
    scheme={},
    optional=[],
    max_file_size_mb={},
    mode='reply',
    path='*',
  }={}) {
    super({
      name: 'MultipartMiddleware',
      mode: mode,
      path: path,
    });

    // Middleware's configuration____________
    this.ALLOWED_MIME_TYPES = {
      'image/jpeg': {
        extension: '.jpg',
        folder: 'jpeg',
      },
      'image/png': {
        extension: '.png',
        folder: 'png',
      },
      'image/webp': {
        extension: '.webp',
        folder: 'webp',
      },
    
      'application/pdf': {
        extension: '.pdf',
        folder: 'pdf',
      },
    };
    this.AMT_keys = Object.keys(this.ALLOWED_MIME_TYPES);

    this.allowed_extensions = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png' : ['.png'],
      'image/webp': ['.webp'],
    
      'application/pdf': ['.pdf'],
    };

    this.MB    = 1024 * 1024
    this.maxMB = 10 * this.MB;

    this.scheme           = scheme;
    this.optional         = optional;
    this.max_file_size_mb = max_file_size_mb;
  }

  async onInit() {}

  async onInitializing () {
    // Checking: scheme
    if (Object.prototype.toString.call(this.scheme) !== '[object Object]') throw new Error(`[${this.name}] from ${filename}: 'scheme' must be a valid plain object.`);

    // Pre-calculating internal-keys
    this.internal_keys = Object.keys(this.scheme);

    // Checking: scheme.args.arg[]
    for (let i=0; i<this.internal_keys.length; i++) {
      const key   = this.internal_keys[i];
      const value = this.scheme[key];
      
      if (
        !Array.isArray(value) ||
        value.length === 0
      ) throw new Error(`[${this.name}] from ${filename}: 'scheme.${key}' must be a non-empty array.`);

      value.forEach(mime_type => {
        if (
          typeof mime_type !== 'string' ||
          mime_type.length === 0
        ) throw new Error(`[${this.name}] from ${filename}: 'scheme.${key}[${i}]' must be a non-empty string.`);

        if (!this.AMT_keys.includes(mime_type)) throw new Error(`[${this.name}] from ${filename}: 'scheme.${key}[${i}]' must contain an allowed mime-type.`);
      });
    }

    // Checking: optional
    if (!Array.isArray(this.optional)) throw new Error(`[${this.name}] from ${filename}: 'optional' must be an array.`);

    // Checking: optional[]
    const optional_cache = []
    this.optional.forEach(option => {
      if (typeof option !== 'string') throw new Error(`[${this.name}] from ${filename}: 'optional' must only contain strings.`);

      const option_trimmed = option.trim();

      if (option_trimmed.length === 0) throw new Error(`[${this.name}] from ${filename}: 'optional' must only contain non-empty strings.`);

      optional_cache.push(option_trimmed);
    });
    
    const optional_cleaned = [...new Set(optional_cache)];

    for (let i=0; i<optional_cleaned.length; i++) {
      if (!this.internal_keys.includes(optional_cleaned[i])) throw new Error(`[${this.name}] from ${filename}: 'optional[${i}]' is not declared in 'scheme'.`);
    }

    // Pre-calculating required-keys
    this.required_keys = this.internal_keys.filter(key => !optional_cleaned.includes(key));

    // Checking: max_file_size
    if (Object.prototype.toString.call(this.max_file_size_mb) !== '[object Object]') throw new Error(`[${this.name}] from ${filename}: 'max_file_size_mb' must be a valid plain object.`);

    const max_file_size_mb_keys = Object.keys(this.max_file_size_mb);
    this.internal_keys.forEach(key => {
      if (!max_file_size_mb_keys.includes(key)) throw new Error(`[${this.name}] from ${filename}: 'max_file_size_mb.${key}' must be declared in 'scheme'.`);

      const value = this.max_file_size_mb[key];

      if (
        !Number.isSafeInteger(value) ||
        value <= 0
      ) throw new Error(`[${this.name}] from ${filename}: 'max_file_size.${key}' must be a positive integer.`);
    
      if (value > this.maxMB) throw new Error(`[${this.name}] from ${filename}: 'max_file_size.${key}' cannot be greater than ${this.maxMB}MB.`);
    });

    if (max_file_size_mb_keys.length !== this.internal_keys.length) throw new Error(`[${this.name}] from ${filename}: 'scheme' contains undeclared keys in 'max_file_size_mb'.`);

    // Checking: mode
    if (!this.modes.includes(this.mode)) throw new Error(`[${this.name}] from ${filename}: 'mode' must be one of [${this.modes
      .map(option => `'${option}'`)
      .join(', ')}].`,
    );

    // Checking: available physical folders
    for (const mime_types of Object.values(this.scheme)) {
      for (const mime_type of mime_types) {
        const { folder } = this.ALLOWED_MIME_TYPES[mime_type];

        if (!folder) throw new Error(`[${this.name}] from ${filename}: invalid storage folder for '${mime_type}'.`);
      }
    }

    // Multer's configuration
    const global_max_file_size = Math.max(
      ...Object.values(this.max_file_size_mb)
    ) * this.MB;

    this.upload = multer({
      storage: multer.memoryStorage(),
    
      limits: {
        fileSize: global_max_file_size,
        files: this.internal_keys.length,
        fields: 30,
        parts: this.internal_keys.length + 30,
      },
    
      fileFilter: (req, file, callback) => {
        const key = file.fieldname;
    
        // Checking: declared fields
        if (!this.internal_keys.includes(key)) return callback(
          new multer.MulterError(
            'LIMIT_UNEXPECTED_FILE',
            key
          )
        );
    
        // Checking: allowed MIME types for this field
        if (!this.scheme[key].includes(file.mimetype)) {
          const error = new Error(`Invalid MIME type '${file.mimetype}' for field '${key}'.`);
          error.code = 'INVALID_FILE_TYPE';
          return callback(error);
        }
    
        return callback(null, true);
      },
    }).fields(this.internal_keys.map(key => ({
      name: key,
      maxCount: 1,
    })));
  }

  // -------------- CLI --------------

  async onStart () {}

  async onStarting () {}

  async onStop () {}

  async onStopping () {}

  // -------------- MIDDLEWARE --------------

  middleware = async (req, res, next) => {
    const header = {
      req: req,
      res: res,

      next: next,
      mode: this.mode,

      middleware: 'multipart',
    };

    if (!this.initialized) return errorHTTP({
      header: header,
      body: {
        status : 503,
        id     : 'ERR-0',
        message: `[${this.name}] middleware is not initialized.`,
      },
    });

    if (
      !this.running ||
      this.stop_promise
    ) return next();

    this.upload(req, res, async (error) => {
      const saved_paths = [];

      try {
        // ------------ Multer-ERRORS ------------
        if (error) {
          const client_error = (
            error instanceof multer.MulterError ||
            error.code === 'INVALID_FILE_TYPE'
          );

          return errorHTTP({
            header: header,
            body: {
              status : 400,
              id     : 'ERR-1',
              message: client_error
                ? error.message
                : 'Failed to process multipart files.',
            },
          });
        }

        // ------------ Getting files... ------------
        const request_files = req.files ?? {};

        // Checking: required files
        const missing_keys = this.required_keys.filter(
          key => !request_files[key]?.length
        );

        if (missing_keys.length > 0) return errorHTTP({
          header: header,
          body: {
            status : 400,
            id     : 'ERR-2',
            message: `Missing required files [${missing_keys
              .map(key => `'${key}'`)
              .join(', ')}].`,
          },
        });

        // ------------ Setting body... ------------
        const request_body = req.body ?? {};

        for (const key of this.internal_keys) {
          const generated_key = `${key}_uri`;

          if (Object.hasOwn(request_body, generated_key)) return errorHTTP({
            header: header,
            body: {
              status : 400,
              id     : 'ERR-3',
              message: `Reserved body field '${generated_key}'.`,
            },
          });
        }

        // ------------ Validating files... ------------
        const prepared_files = [];

        for (const key of this.internal_keys) {
          const file = request_files[key]?.[0];

          // Optional file not provided
          if (!file) continue;

          // Checking: individual file size
          const max_size = this.max_file_size_mb[key] * this.MB;

          if (file.size > max_size) return errorHTTP({
            header: header,
            body: {
              status : 400,
              id     : 'ERR-4',
              message: `File '${key}' exceeds the maximum size of ${this.max_file_size_mb[key]} MB.`,
            },
          });

          // Checking MIME configuration
          const mime_config = this.ALLOWED_MIME_TYPES[file.mimetype];

          if (!mime_config) return errorHTTP({
            header: header,
            body: {
              status : 400,
              id     : 'ERR-5',
              message: `Unsupported MIME type for '${key}'.`,
            },
          });

          // Checking actual binary signature
          if (!isValidMimeType(file.buffer, file.mimetype)) return errorHTTP({
            header: header,
            body: {
              status : 400,
              id     : 'ERR-6',
              message: `The file is corrupt '${file.originalname}'.`,
            },
          });

          const { folder } = mime_config;

          // Getting filename
          const file_name = file.originalname;

          if (
            !file_name ||
            file_name === '.' ||
            file_name === '..' ||
            /[/\\\x00-\x1f\x7f]/.test(file_name) ||
            /[<>:"|?*]/.test(file_name) ||
            /[. ]$/.test(file_name) ||
            /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i.test(file_name)
          ) return errorHTTP({
            header: header,
            body: {
              status : 400,
              id     : 'ERR-7',
              message: `Invalid filename for '${key}'.`,
            },
          });

          const file_extension = extname(file_name).toLowerCase();

          if (!this.allowed_extensions[file.mimetype]?.includes(file_extension)) return errorHTTP({
            header: header,
            body: {
              status : 400,
              id     : 'ERR-8',
              message: `Invalid file extension for '${key}'.`,
            },
          });

          // Physical storage location
          const destination_path = join(
            paths.static,
            folder,
            'public'
          );

          const final_name = `${randomUUID()}.public${file_extension}`

          const final_path = join(
            destination_path,
            final_name
          );

          // Public URI
          const generated_uri = `/api/${folder}/public/${final_name}`;

          prepared_files.push({
            key,
            buffer: file.buffer,
            destination_path,
            final_path,
            generated_uri,
          });
        }

        // ------------ Saving files... ------------
        for (const file of prepared_files) {
          await mkdir(
            file.destination_path,
            { recursive: true }
          );

          // 'wx' prevents overwriting an existing file.
          // open() also gives us a handle to close explicitly.
          const handle = await open(
            file.final_path,
            'wx'
          );

          saved_paths.push(file.final_path);

          try     { await handle.writeFile(file.buffer); }
          finally { await handle.close(); }
        }

        // ------------ Mutating req.body ------------
        for (const file of prepared_files) {
          req.body[`${file.key}_uri`] = file.generated_uri;
        }

      } catch (error) {
        // ------------ Rollback ------------
        await Promise.all(
          saved_paths.map(path =>
            rm(path, { force: true }).catch(() => {})
          )
        );

        if (error.code === 'EEXIST') return errorHTTP({
          header: header,
          body: {
            status : 409,
            id     : 'ERR-9',
            message: 'A file with that name already exists.',
          },
        });

        return errorHTTP({
          header: header,
          body: {
            status : 500,
            id     : 'ERR-10',
            message: 'Failed to save multipart files.',
          },
        });
      }

      // If all checks pass, we continue
      return next();
    });
  }
}
