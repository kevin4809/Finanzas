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
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4, // Forzar IPv4
  tls: true,
  tlsAllowInvalidCertificates: false,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usar una variable global para que la conexión
  // persista entre hot-reloads (HMR) de Next.js
  if (!global._mongoClientPromise) {
    console.log('[MongoDB] Creando nueva conexión (desarrollo)');
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, crear nueva conexión
  console.log('[MongoDB] Creando conexión (producción)');
  console.log('[MongoDB] URI incluye srv:', uri.includes('mongodb+srv://'));
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(client => {
      console.log('[MongoDB] Conexión exitosa');
      return client;
    })
    .catch(error => {
      console.error('[MongoDB] Error de conexión:', error.name);
      console.error('[MongoDB] Mensaje:', error.message);
      throw error;
    });
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
