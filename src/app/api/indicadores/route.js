import { NextResponse } from 'next/server';
import { obtenerIndicadoresEconomicos } from '@/lib/indicadoresColombia';

export async function GET() {
  try {
    const indicadores = await obtenerIndicadoresEconomicos();
    return NextResponse.json(indicadores);
  } catch (error) {
    console.error('Error al obtener indicadores económicos:', error);
    return NextResponse.json({ error: 'No se pudieron obtener los indicadores económicos' }, { status: 500 });
  }
}
