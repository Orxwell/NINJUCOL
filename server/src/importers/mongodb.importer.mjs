import { env } from '#importers/env.importer.mjs';

import {
  MongoClient     ,
  ServerApiVersion,
} from 'mongodb';

// -----------Configuring the MongoDB-client - BELOW-----------
const URI = env.URI_CLUSTER
  .replace('<username_cluster>', encodeURIComponent(env.USERNAME_CLUSTER))
  .replace('<password_cluster>', encodeURIComponent(env.PASSWORD_CLUSTER));

const client_config = {
  serverApi: {
    version          : ServerApiVersion.v1,
    strict           : true               ,
    deprecationErrors: true               ,
  }
};

const client = new MongoClient(URI, client_config);
// -----------Configuring the MongoDB-client - ABOVE-----------

// -----------Connecting to the Cluster - BELOW-----------
/**
 * @type {import('mongodb').Db}
 */
let db       ;
let dbPromise;
export async function connectDB() {
  // Already connected...
  if (db) return db;

  // Already connecting...
  if (dbPromise) return dbPromise;

  // Connecting to the database...
  dbPromise = (async () => {
    try {
      await client.connect();
      console.log('  ~Connected to MongoDB.~');
      
      db = client.db(env.DBNAME_CLUSTER);
      console.log(`  ~Using cluster: ${env.DBNAME_CLUSTER}~`);

      return db;
    } catch (error) {
      // If it fails, then reset
      dbPromise = null;

      throw error;
    }
  })();

  return dbPromise;
}
// -----------Connecting to the Cluster - ABOVE-----------
