import { NextResponse } from 'next/server';
import crypto from 'crypto';

// El PIN correcto se obtiene de la variable de entorno
const CORRECT_PIN = process.env.AUTH_PIN || '1234';

// Función para generar un token simple
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request) {
  try {
    const { pin } = await request.json();

    if (!pin || pin.length !== 4) {
      return NextResponse.json(
        { error: 'PIN inválido' },
        { status: 400 }
      );
    }

    // Verificar el PIN
    if (pin === CORRECT_PIN) {
      const token = generateToken();

      // Crear respuesta con el token
      const response = NextResponse.json(
        {
          success: true,
          token,
          message: 'Autenticación exitosa'
        },
        { status: 200 }
      );

      // Guardar el token en una cookie segura
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });

      return response;
    } else {
      return NextResponse.json(
        { error: 'PIN incorrecto' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
