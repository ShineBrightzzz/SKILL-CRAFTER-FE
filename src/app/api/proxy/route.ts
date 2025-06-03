import { NextRequest, NextResponse } from 'next/server';

/**
 * API route handler that proxies requests to the backend API
 */
export async function GET(request: NextRequest) {
  return await proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return await proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return await proxyRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return await proxyRequest(request, 'DELETE');
}

export async function PATCH(request: NextRequest) {
  return await proxyRequest(request, 'PATCH');
}

export async function OPTIONS(request: NextRequest) {
  // Handle preflight requests directly
  const origin = request.headers.get('origin') || 'http://localhost:3000';
  
  // Create a response for preflight
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

/**
 * Helper function to proxy requests to the backend API
 */
async function proxyRequest(request: NextRequest, method: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: 'API URL not configured' },
        { status: 500 }
      );
    }

    // Get the path from the original request (exclude /api/proxy)
    const pathname = request.nextUrl.pathname;
    const apiPath = pathname.replace('/api/proxy', '');
    
    // Build the target URL
    const targetUrl = new URL(apiPath, apiUrl);
    
    // Copy query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    // Prepare headers (forward most headers except host)
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Skip host header
      if (key.toLowerCase() !== 'host') {
        headers.append(key, value);
      }
    });

    // Forward the request to the API server
    const response = await fetch(targetUrl.toString(), {
      method,
      headers,
      body: method !== 'GET' && method !== 'HEAD' ? await request.text() : undefined,
      credentials: 'include',
    });    // Create a new response with the API response
    const newResponse = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy response headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-length') {
        newResponse.headers.set(key, value);
      }
    });

    // Add CORS headers
    newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    newResponse.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || 'http://localhost:3000');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return newResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}
