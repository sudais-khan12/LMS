import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Note: NextAuth handles authentication through the credentials provider
    // This endpoint can be used for custom login logic if needed
    // The actual authentication is handled by NextAuth in [...nextauth]/route.ts

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful. Use NextAuth signIn() function on the client side.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

