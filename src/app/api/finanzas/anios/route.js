import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// GET /api/finanzas/anios
// Obtener la lista de años disponibles en la base de datos
export async function GET() {
  try {
    const collection = await getCollection('finanzas');

    // Obtener solo los años, ordenados de forma descendente
    const anios = await collection
      .find({}, { projection: { anio: 1, _id: 0 } })
      .sort({ anio: -1 })
      .toArray();

    // Extraer solo los valores numéricos de año
    const listaAnios = anios.map((doc) => doc.anio);

    return NextResponse.json({
      anios: listaAnios,
      total: listaAnios.length,
    });
  } catch (error) {
    console.error('Error al obtener años de MongoDB:', error);
    return NextResponse.json(
      { error: 'Error al obtener la lista de años' },
      { status: 500 }
    );
  }
}
