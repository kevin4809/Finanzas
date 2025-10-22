import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Sesión cerrada' },
      { status: 200 }
    );

    // Eliminar la cookie de autenticación
    response.cookies.delete('auth_token');

    return response;
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
