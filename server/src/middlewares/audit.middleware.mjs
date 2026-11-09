// Services for the middleware
import service from '#services/handler.service.mjs';

// Importers for the middleware
import importer from '#src/importers/handler.importer.mjs';

// Utils for the middleware
import paths from '#utils/paths.util.mjs';

import { errorHTTP } from '#utils/functions.util.mjs';

// External & Internal libraries
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  rm,
  readdir,
  readFile,
  rename,
  stat,
  writeFile,
  mkdir
} from 'node:fs/promises';
import {
  basename,
  extname,
  join,
} from 'node:path';

import BaseMiddleware from './base.middleware.mjs';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


export default class AuditMiddleware extends BaseMiddleware {
  constructor ({
    max_logs=10_000,
    mode='reply',
    path='*',
  }={}) {
    super({
      name: 'AuditMiddleware',
      mode: mode,
      path: path,
    });

    this.max_logs = max_logs;
    this.cache    = [];

    // Flusher's configuration_____________________
    this.flusher_ms      = importer.env.FLUSHER_MS;
    this.flusher_timer   = null;
    this.flusher_promise = null;

    // Persistency's configuration_________________________
    this.persistency_ms      = importer.env.PERSISTENCY_MS;
    this.persistency_timer   = null;
    this.persistency_promise = null;
  }

  // -------------- METHODS --------------

  async onInit() {}

  async onInitializing () {
    // Checking: max_logs
    if (
      !Number.isInteger(this.max_logs) ||
      (
        this.max_logs < 1_000 ||
        this.max_logs > 50_000
      )
    ) throw new Error(`[${this.name}] from ${filename}: 'max_logs' must be an integer between 1.000 and 50.000.`);

    // Prepare 'server/logs' directory
    await mkdir(paths.logs, { recursive: true });

    const stats = await stat(paths.logs);
    if (!stats.isDirectory()) throw new Error("'src/logs' is not a directory.");

    // Checking: mode
    if (!this.modes.includes(this.mode)) throw new Error(`[${this.name}] from ${filename}: 'mode' must be one of [${this.modes
      .map(option => `'${option}'`)
      .join(', ')}].`,
    );
  }

  // -------------- CLI --------------

  async onStart () {}

  async onStarting () {
    // Start timers
    this.persistency_timer = setInterval(async () => {
      void this.persistency().catch(error => {
        console.error(`[${this.name}] Persistency:`, error);
      });
    }, this.persistency_ms);

    this.flusher_timer = setInterval(async () => {
      void this.flusher().catch(error => {
        console.error(`[${this.name}] Flusher:`, error);
      });
    }, this.flusher_ms);
  }

  async onStop () {
    // Stop the timers
    clearInterval(this.persistency_timer);
    clearInterval(this.flusher_timer);

    this.persistency_timer = null;
    this.flusher_timer     = null;
  }

  async onStopping () {
    // Wait for active persistency
    if (this.persistency_promise) await this.persistency_promise;

    // Persist all records remaining in RAM
    while (this.cache.length > 0) { await this.persistency(); }

    // Wait for active flush
    if (this.flusher_promise) await this.flusher_promise;

    // Export remaining files
    await this.flusher();
  }

  // -------------- MIDDLEWARE --------------

  middleware = async (req, res, next) => {
    const header = {
      req: req,
      res: res,

      next: next,
      mode: this.mode,

      middleware: 'audit',
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

    const record = {
      id: randomUUID(),

      ip    : req.ip,
      method: req.method,
      path  : req.path,

      protocol    : req.protocol,
      hostname    : req.hostname,
      http_version: req.httpVersion,

      params: req.params,
      query : req.query,
      body  : req.body,

      user_agent: req.get('user-agent') ?? null,

      timestamp: new Date().toISOString(),
    };

    this.cache.push(record);

    if (this.cache.length >= this.max_logs) this.persistency().catch(error => {
      console.error(`[${this.name}] Persistency:`, error);
    });

    return next();
  }

  persistency () {
    // Return promise if there is one
    if (this.persistency_promise) return this.persistency_promise;

    // Return promise resolved if there is no cache
    if (this.cache.length === 0) return Promise.resolve();

    // Start the persistency process
    const persistency_process = this.persisting();
  
    // Track the persistency process when finally
    const tracked = persistency_process.finally(() => {
      if (this.persistency_promise === tracked) this.persistency_promise = null;
    });

    // Cache the tracked promise
    this.persistency_promise = tracked;

    // Return the tracked promise
    return tracked;
  }

  async persisting () {
    // Separate current batch from incoming requests
    const batch = this.cache;
    this.cache = [];

    const id = `${Date.now()}-${randomUUID()}`;
    const name = `audit.${id}`;

    const tmp_abs_path = join(paths.logs, `${name}.tmp`);
    const json_abs_path = join(paths.logs, `${name}.json`);

    try {
      // Write entire batch
      await writeFile(
        tmp_abs_path,
        JSON.stringify(batch),
        { flag: 'wx' }
      );

      // Publish completed file
      await rename(tmp_abs_path, json_abs_path);

    } catch (error) {
      // Restore records in chronological order
      this.cache = [...batch, ...this.cache];

      // Remove incomplete temporary file
      try { await rm(tmp_abs_path, { force: true }); }
      catch (error) {
        console.error(`[${this.name}] case:`, error);
      }

      throw error;
    }
  }

  flusher () {
    // Return promise if there is one
    if (this.flusher_promise) return this.flusher_promise;

    // Start the flush process
    const flush_process = this.flushing();
  
    // Track the flush process when finally
    const tracked = flush_process.finally(() => {
      if (this.flusher_promise === tracked) this.flusher_promise = null;
    });

    // Cache the tracked promise
    this.flusher_promise = tracked;

    // Return the tracked promise
    return tracked;
  }

  async flushing () {
    // Read all the files in the directory
    const files = await readdir(paths.logs);

    // Select only published audited files
    const logs = files
      .filter(file =>
        file.startsWith('audit.') &&
        extname(file) === '.json'
      )
      .map(file => join(paths.logs, file));

    // If there's any, return
    if (logs.length === 0) return;

    const records = [];
    for (const log of logs) {
      const content = await readFile(log, 'utf8');
      const batch = JSON.parse(content);

      if (!Array.isArray(batch)) throw new Error(`[${this.name}] Invalid audit file: ${log}`);

      records.push({ record: batch, });
    }

    // Export the data:
    if (records.length > 0) {
      // to the DB
      await service.audit.send({ records: records, });

      // TODO: Send records to api.orxwell.com
      // Await delivery if required before deleting files.
    }

    // Delete only after successful export
    for (const log of logs) { await rm(log); }
  }
}
