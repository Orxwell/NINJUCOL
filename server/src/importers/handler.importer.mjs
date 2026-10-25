import { env }       from './env.importer.mjs';
import { connect }   from './mongodb.importer.mjs';
import { transport } from './smtp.importer.mjs';
// Import more controllers if it's needed

const importer = {
  env : env, 
  db  : connect,
  smtp: transport,
  // Remember importing it
};

export default importer;
