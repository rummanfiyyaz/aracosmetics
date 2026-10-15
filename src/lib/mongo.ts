import 'server-only'
import dns from 'dns'
import { MongoClient, type Db } from 'mongodb'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch {
  // ignore if restricted
}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'threadandgear'

if (!uri) {
  throw new Error(
    'MONGODB_URI is not set. Add it to .env.local (Atlas connection string).',
  )
}

declare global {
  // eslint-disable-next-line no-var
  var __threadGearMongoClient: Promise<MongoClient> | undefined
}

function connect(): Promise<MongoClient> {
  const promise = new MongoClient(uri!, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 4000,
    socketTimeoutMS: 15000,
    retryWrites: true,
  }).connect()

  // If the connection fails, drop the cached promise so the next call retries
  // instead of returning the same rejected promise forever.
  promise.catch(() => {
    if (globalThis.__threadGearMongoClient === promise) {
      globalThis.__threadGearMongoClient = undefined
    }
  })

  return promise
}

export async function getDb(): Promise<Db> {
  if (!globalThis.__threadGearMongoClient) {
    globalThis.__threadGearMongoClient = connect()
  }
  const client = await globalThis.__threadGearMongoClient
  return client.db(dbName)
}
