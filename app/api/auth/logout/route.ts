import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    // NextAuth handles session invalidation on the client side
    // This endpoint can be used for server-side logout logic if needed

    return NextResponse.json(
      {
        success: true,
        message: 'Logout successful. Use NextAuth signOut() function on the client side.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

