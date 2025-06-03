import { NextRequest, NextResponse } from 'next/server';

/**
 * Special handler for setting the refresh token cookie
 */
export async function POST(request: NextRequest) {
  try {
    // Get the refresh token from the request body
    const body = await request.json();
    const { refreshToken } = body;
    
    if (!refreshToken) {
      console.error('Missing refresh token in request');
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }
    
    console.log('Setting refresh token cookie:', refreshToken.substring(0, 8) + '...');
    
    // Create a response with the cookie
    const response = NextResponse.json(
      { success: true, message: 'Refresh token cookie set successfully' },
      { status: 200 }
    );
    
    // Calculate expiration date for logging
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // 30 days from now
    
    // Set the cookie - HttpOnly for security, Path=/ to make it available across the site
    response.cookies.set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true, // Prevent JavaScript access
      path: '/',
      sameSite: 'lax', // 'lax' is better than 'strict' for cross-site requests
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
      // Secure flag should be true in production
      secure: process.env.NODE_ENV === 'production',
    });
    
    console.log(`Refresh token cookie set successfully. Expires: ${expirationDate.toISOString()}`);
    
    // Add CORS headers
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', origin);
    
    return response;
  } catch (error) {
    console.error('Error setting refresh token cookie:', error);
    return NextResponse.json(
      { error: 'Failed to set refresh token cookie' },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || 'http://localhost:3000';
  
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}
