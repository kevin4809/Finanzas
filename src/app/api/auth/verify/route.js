import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Verificar si existe el token en las cookies
    const token = request.cookies.get('auth_token')?.value;

    if (token) {
      return NextResponse.json(
        { authenticated: true },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error en verificación:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
