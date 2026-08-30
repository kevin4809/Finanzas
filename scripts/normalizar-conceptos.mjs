import fs from 'fs';
import { MongoClient } from 'mongodb';
import { unificarConceptosGlobal } from '../src/lib/conceptosTexto.js';

const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

console.log('Unificando conceptos en MongoDB...');
console.log('Base de datos:', dbName);

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });

try {
  await client.connect();
  const collection = client.db(dbName).collection('finanzas');
  const docs = await collection.find({}).toArray();

  if (!docs.length) {
    console.log('No hay documentos en la colección finanzas.');
    process.exit(0);
  }

  const documentosPorAnio = Object.fromEntries(
    docs.map((doc) => [String(doc.anio), { anio: doc.anio, meses: doc.meses }])
  );

  const { documentos, cambios, unificaciones, mapaCanonico } = unificarConceptosGlobal(documentosPorAnio);

  console.log(`\nAños encontrados: ${docs.map((d) => d.anio).join(', ')}`);
  console.log(`Grupos canónicos: ${mapaCanonico.size}`);
  console.log(`Cambios totales: ${cambios}`);

  if (unificaciones.length) {
    console.log('\nUnificaciones aplicadas:');
    for (const u of unificaciones) {
      console.log(`  "${u.antes}" → "${u.despues}"`);
    }
  } else {
    console.log('\nNo había conceptos duplicados que unificar.');
  }

  if (cambios === 0) {
    console.log('\nNada que guardar.');
    process.exit(0);
  }

  for (const doc of docs) {
    const anio = String(doc.anio);
    const meses = documentos[anio]?.meses;
    if (!meses) continue;

    await collection.updateOne(
      { anio: doc.anio },
      { $set: { meses, updatedAt: new Date() } }
    );
    console.log(`\n✓ Año ${doc.anio} actualizado`);
  }

  console.log('\nListo. Conceptos unificados en la base de datos.');
  await client.close();
  process.exit(0);
} catch (error) {
  console.error('ERROR:', error.message);
  await client.close().catch(() => {});
  process.exit(1);
}
