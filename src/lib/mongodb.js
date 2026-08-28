import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Por favor define la variable MONGODB_URI en el archivo .env.local');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Por favor define la variable MONGODB_DB en el archivo .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usar una variable global para que la conexión
  // persista entre hot-reloads (HMR) de Next.js
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, crear nueva conexión
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Exportar promise del cliente
export default clientPromise;

// Helper para obtener la base de datos
export async function getDatabase() {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB);
}

// Helper para obtener una colección específica
export async function getCollection(collectionName) {
  const db = await getDatabase();
  return db.collection(collectionName);
}
