/**
 * MongoDB importer for managing connection.
 * @see {@link https://www.mongodb.com/docs/drivers/node/current/ | MongoDB Node.js Driver Documentation}
 */

// External & Internal libraries
import {
  MongoClient     ,
  ServerApiVersion,
} from 'mongodb';

import { env } from './env.importer.mjs';


const client = new MongoClient(env.DB_CLUSTER_URI, {
  serverApi: {
    version          : ServerApiVersion.v1,
    strict           : true               ,
    deprecationErrors: true               ,
  }
});

let db       ;
let dbPromise;


// -----------MongoDB-client - BELOW-----------
/**
 * Connects to the MongoDB database.
 * @returns {Promise<import('mongodb').Db>}
 */
export async function connect () {
  // Already connected...
  if (db) return db;

  // Already connecting...
  if (dbPromise) return dbPromise;

  // Connecting to the database...
  dbPromise = (async () => {
    try {
      await client.connect();

      console.log('  ~Connected to MongoDB.~');
      console.log(`  ~Using cluster: ${env.DB_CLUSTER_NAME}~`);

      return client.db(env.DB_CLUSTER_NAME);

    } catch (error) {
      // If it fails, then reset
      dbPromise = null;

      throw error;
    }
  })();

  return dbPromise;
}
// -----------MongoDB-client - ABOVE-----------
