import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// GET /api/finanzas/anios
// Obtener la lista de años disponibles en la base de datos
export async function GET() {
  try {
    console.log('[API ANIOS] Iniciando petición para obtener años');
    console.log('[API ANIOS] MONGODB_URI existe:', !!process.env.MONGODB_URI);
    console.log('[API ANIOS] MONGODB_DB:', process.env.MONGODB_DB);

    console.log('[API ANIOS] Conectando a MongoDB...');
    const collection = await getCollection('finanzas');
    console.log('[API ANIOS] Conexión exitosa, obteniendo años...');

    // Obtener solo los años, ordenados de forma descendente
    const anios = await collection
      .find({}, { projection: { anio: 1, _id: 0 } })
      .sort({ anio: -1 })
      .toArray();

    console.log('[API ANIOS] Años encontrados:', anios);

    // Extraer solo los valores numéricos de año
    const listaAnios = anios.map((doc) => doc.anio);

    console.log('[API ANIOS] Lista de años:', listaAnios);

    return NextResponse.json({
      anios: listaAnios,
      total: listaAnios.length,
    });
  } catch (error) {
    console.error('[API ANIOS] ERROR COMPLETO:', error);
    console.error('[API ANIOS] Error stack:', error.stack);
    console.error('[API ANIOS] Error name:', error.name);
    console.error('[API ANIOS] Error message:', error.message);
    return NextResponse.json(
      {
        error: 'Error al obtener la lista de años',
        details: error.message,
        name: error.name
      },
      { status: 500 }
    );
  }
}
