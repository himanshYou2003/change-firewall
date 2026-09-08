import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  console.warn('⚠️ MONGODB_URI is not set in environment variables.');
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  clientPromise = Promise.resolve(null as any);
}

export async function getDatabase(dbName: string = 'change_firewall'): Promise<Db> {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

export default clientPromise;
