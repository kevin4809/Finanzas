import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// GET /api/finanzas?anio=2025
// Obtener los datos financieros de un año específico
export async function GET(request) {
  try {
    console.log('[API GET] Iniciando petición para obtener datos');
    console.log('[API GET] MONGODB_URI existe:', !!process.env.MONGODB_URI);
    console.log('[API GET] MONGODB_DB:', process.env.MONGODB_DB);

    const { searchParams } = new URL(request.url);
    const anio = parseInt(searchParams.get('anio'));

    console.log('[API GET] Año solicitado:', anio);

    if (!anio || isNaN(anio)) {
      return NextResponse.json(
        { error: 'El parámetro "anio" es requerido y debe ser un número' },
        { status: 400 }
      );
    }

    console.log('[API GET] Conectando a MongoDB...');
    const collection = await getCollection('finanzas');
    console.log('[API GET] Conexión exitosa, buscando datos...');

    const datos = await collection.findOne({ anio });
    console.log('[API GET] Datos encontrados:', datos ? 'SÍ' : 'NO');

    if (datos) {
      console.log('[API GET] Cantidad de meses:', datos.meses?.length);
    }

    if (!datos) {
      // Si no existe el año, devolver null para que el cliente cree la estructura inicial
      console.log('[API GET] No hay datos, retornando null');
      return NextResponse.json({ anio, datos: null });
    }

    console.log('[API GET] Retornando datos exitosamente');
    return NextResponse.json({ anio, datos: datos.meses });
  } catch (error) {
    console.error('[API GET] ERROR COMPLETO:', error);
    console.error('[API GET] Error stack:', error.stack);
    console.error('[API GET] Error name:', error.name);
    console.error('[API GET] Error message:', error.message);
    return NextResponse.json(
      {
        error: 'Error al obtener los datos financieros',
        details: error.message,
        name: error.name
      },
      { status: 500 }
    );
  }
}

// POST /api/finanzas
// Crear o actualizar los datos financieros de un año
export async function POST(request) {
  try {
    const body = await request.json();
    const { anio, meses } = body;

    if (!anio || !meses) {
      return NextResponse.json(
        { error: 'Los campos "anio" y "meses" son requeridos' },
        { status: 400 }
      );
    }

    const collection = await getCollection('finanzas');

    // Usar upsert para crear o actualizar el documento
    const resultado = await collection.updateOne(
      { anio: parseInt(anio) },
      {
        $set: {
          meses,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      modified: resultado.modifiedCount > 0,
      created: resultado.upsertedCount > 0,
      anio,
    });
  } catch (error) {
    console.error('Error al guardar datos en MongoDB:', error);
    return NextResponse.json(
      { error: 'Error al guardar los datos financieros' },
      { status: 500 }
    );
  }
}

// DELETE /api/finanzas?anio=2025
// Eliminar los datos financieros de un año
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const anio = parseInt(searchParams.get('anio'));

    if (!anio || isNaN(anio)) {
      return NextResponse.json(
        { error: 'El parámetro "anio" es requerido y debe ser un número' },
        { status: 400 }
      );
    }

    const collection = await getCollection('finanzas');
    const resultado = await collection.deleteOne({ anio });

    return NextResponse.json({
      success: true,
      deleted: resultado.deletedCount > 0,
      anio,
    });
  } catch (error) {
    console.error('Error al eliminar datos de MongoDB:', error);
    return NextResponse.json(
      { error: 'Error al eliminar los datos financieros' },
      { status: 500 }
    );
  }
}
