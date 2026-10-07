// External & Internal Libraries
import { fileURLToPath } from 'url';
import { basename }      from 'path';
import { readdir }       from 'fs/promises';

const abspath  = fileURLToPath(import.meta.url);
const filename = basename(abspath);

// Async-function to get the folders of a folder...
export async function getFolders(directoryPath) {
  try {
    // Find the folder content, including archives types
    const folder_content = await readdir(directoryPath, { withFileTypes: true });

    // Filter the folder content by directories
    const filtered_folders = folder_content.filter(dirent => dirent.isDirectory());

    // Return just the names of the directories
    return filtered_folders.map(dirent => dirent.name);
  } catch (err) { throw err; }
}

// Async-function to get the files of a folder...
export async function getFiles(directoryPath) {
  try {
    // Find the folder content, including archives types
    const folder_content = await readdir(directoryPath, { withFileTypes: true });

    // Filter the folder content by files
    const filtered_files = folder_content.filter(dirent => dirent.isFile());
    
    // Return just the names of the files
    return filtered_files.map(dirent => dirent.name);
  } catch (_) { return; }
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

  if (Object.prototype.toString.call(header) !== '[object Object]')
    throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'header' must be a valid plain object.`);

  if (Object.prototype.toString.call(body) !== '[object Object]')
    throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'body' must be a valid plain object.`);

  if (
    !header.res ||
    typeof header.res.status !== 'function' ||
    typeof header.res.json !== 'function'
  )
    throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'header.res' must be a valid ExpressJS response-object.`);

  if (
    !header.req ||
    typeof header.req !== 'object'
  )
    throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'header.req' must be a valid ExpressJS request-object.`);

  if (typeof header.next !== 'function')
    throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'header.next' must be a valid ExpressJS next-function.`);

  const modes = ['reply', 'attach', 'next']
  if (!modes.includes(header.mode))
    throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'header.mode' must be one of [${modes
      .map(option => `'${option}'`)
      .join(', ')}].`);
  
  const middlewares = ['queryParams', 'bodyParams', 'routeParams']
  if (!middlewares.includes(header.middleware))
    throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'header.middleware' must be one of [${middlewares
      .map(option => `'${option}'`)
      .join(', ')}].`);
  
  const status = Number(body.status);

  if (
    !Number.isInteger(status) ||
    (
      status < 100 ||
      status > 599
    )
  )
    throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'body.status' must be 100 to 599`);

  if (
    typeof body.id !== 'string' ||
    body.id.trim() === ''
  )
    throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'body.id' must be a non-empty string`);

  if (
    typeof body.message !== 'string' ||
    body.message.trim() === ''
  )
    throwError(`Internal-Server-Error, errorHTTP() from ${filename}: 'body.message' must be a non-empty string`);

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
