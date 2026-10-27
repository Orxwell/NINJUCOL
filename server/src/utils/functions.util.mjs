// Importers for the utils
import paths from '#utils/paths.util.mjs';

// External & Internal libraries
import { fileURLToPath }     from 'url';
import { basename, resolve } from 'path';
import { readdir, unlink }   from 'fs/promises';


const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);


// Async-function to get the folders of a folder...
export async function getFolders({ folder_path }={}) {
  // Checking: folder_path
  if (typeof folder_path !== 'string') return;
  
  // Find the folder content, including archives types
  const folder_content = await readdir(folder_path, { withFileTypes: true });

  // Return just the names of the directories
  return folder_content
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

// Async-function to get the files of a folder...
export async function getFiles({ folder_path }={}) {
  // Checking: folder_path
  if (typeof folder_path !== 'string') return;

  // Find the folder content, including archives types
  const folder_content = await readdir(folder_path, { withFileTypes: true });
  
  // Return just the names of the files
  return folder_content
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name);
}

// Async-function to delete a file of a folder...
export async function delFile({ folder_path }={}) {
  try {
    const allowed_folders = /(?:public|private)/
    const allowed_types = /(?:jpeg|png|webp|pdf)/

    // Checking: folder_path
    if (
      typeof folder_path !== 'string' ||
      !new RegExp(`^/${allowed_types.source}/${allowed_folders.source}$`).test(folder_path)
    ) return false;

    // Create the absolute file's path
    const file_path = resolve(paths.static, `.${folder_path}`);

    // Delete the file
    await unlink(file_path);

    return true;

  } catch (error) { return false; }
}

export function isValidMimeType(buffer, mime_type) {
  if (!Buffer.isBuffer(buffer)) return false;

  // Check magic numbers of PNGs
  if (mime_type === 'image/png') {
    const signature = Buffer.from([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);

    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(signature)
    );
  }

  // Check magic numbers of JPEGs
  if (mime_type === 'image/jpeg') {
    return (
      buffer.length >= 4 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff &&
      buffer[buffer.length - 2] === 0xff &&
      buffer[buffer.length - 1] === 0xd9
    );
  }

  // Check magic numbers of WEBPs
  if (mime_type === 'image/webp') {
    return (
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    );
  }
  
  // Check magic numbers of PDFs
  if (mime_type === 'application/pdf') {
    return (
      buffer.length >= 5 &&
      buffer.toString('ascii', 0, 5) === '%PDF-'
    );
  }

  return false;
}

export function errorHTTP ({ header={}, body={} }={}) {
  function buildError ({ status=500, id='ERR-0', message=''}={}) {
    const error = new Error(message);
  
    error.status = status;
    error.id     = id;
  
    return error;
  }

  function throwError (message) {
    throw buildError({ message: message });
  }

  if (Object.prototype.toString.call(header) !== '[object Object]') throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'header' must be a valid plain object.`);

  if (Object.prototype.toString.call(body) !== '[object Object]') throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'body' must be a valid plain object.`);

  if (
    !header.res ||
    typeof header.res.status !== 'function' ||
    typeof header.res.json !== 'function'
  ) throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'header.res' must be a valid ExpressJS response-object.`);

  if (
    !header.req ||
    typeof header.req !== 'object'
  ) throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'header.req' must be a valid ExpressJS request-object.`);

  if (typeof header.next !== 'function') throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'header.next' must be a valid ExpressJS next-function.`);

  const modes = ['reply', 'attach', 'next'];
  if (!modes.includes(header.mode)) throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'header.mode' must be one of [${modes
    .map(option => `'${option}'`)
    .join(', ')}].`);
  
  const middlewares = ['query', 'body', 'route', 'multipart', 'auth'];
  if (!middlewares.includes(header.middleware)) throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'header.middleware' must be one of [${middlewares
    .map(option => `'${option}'`)
    .join(', ')}].`);
  
  const status = Number(body.status);

  if (
    !Number.isInteger(status) ||
    (
      status < 100 ||
      status > 599
    )
  ) throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'body.status' must be 100 to 599`);

  if (
    typeof body.id !== 'string' ||
    body.id.trim() === ''
  ) throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'body.id' must be a non-empty string`);

  if (
    typeof body.message !== 'string' ||
    body.message.trim() === ''
  ) throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'body.message' must be a non-empty string`);

  const error = buildError({
    status : status,
    id     : body.id,
    message: body.message,
  })

  switch (header.mode) {
    case 'reply': return header.res
      .status(status)
      .json({
        id     : body.id,
        message: body.message,
      });

    case 'attach':
      header.req[`${header.middleware}Error`] = error;

      return header.next();

    case 'next': return header.next(error);
  }
}

export function auditENV ({ name, type, preset, required=false, options=[] }={}) {
  const consulted = process.env[name];

  if (
    consulted === undefined ||
    consulted === null ||
    String(consulted).trim() === ''
  ) {
    if (required)
      throw new Error(`Env-Error: '${name}' is required and it wasn't found in the .env file.~`);

    if (preset !== undefined) return preset;

    return undefined;
  }

  switch (type) {
    case 'string': {
      const value = String(consulted)
        .trim();

      if (
        options.length > 0 &&
        !options.includes(value)
      )
        throw new Error(`Env-Error: '${name}' must be one of [${options
          .join(', ')}].~`);

      return value;
    }

    case 'number': {
      const value = Number(consulted);

      if (
        options.length > 0 &&
        !options.includes(value)
      )
        throw new Error(`Env-Error: '${name}' must be one of [${options
          .join(', ')}].~`);

      if (Number.isNaN(value))
        throw new Error(`Env-Error: '${name}' cannot be NaN.~`);

      return value;
    }

    case 'boolean': {
      const normalized = String(consulted)
        .trim()
        .toLowerCase();

      if (['true' , 'yes', 'on' ].includes(normalized)) return true;
      if (['false', 'no' , 'off'].includes(normalized)) return false;

      throw new Error(`Env-Error: '${name}' must be a valid semantic boolean.~`);
    }

    default:
      throw new Error(`Env-Error: Unsupported type '${type}' for '${name}'.~`);
  }
}
