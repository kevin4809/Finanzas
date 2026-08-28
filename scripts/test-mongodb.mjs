import fs from 'fs';
import { MongoClient } from 'mongodb';

const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

console.log('Probando conexion a MongoDB Atlas...');
console.log('Base de datos:', dbName);

try {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
  await client.connect();
  const db = client.db(dbName);
  const collections = await db.listCollections().toArray();
  console.log('OK: Conexion exitosa');
  console.log('Colecciones:', collections.map((c) => c.name).join(', ') || '(ninguna)');
  await client.close();
  process.exit(0);
} catch (error) {
  console.error('ERROR:', error.name);
  console.error('Mensaje:', error.message);
  process.exit(1);
}
