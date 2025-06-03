import { NextRequest, NextResponse } from 'next/server';

/**
 * Special handler for the refresh-token endpoint to ensure proper handling
 * of cookies and authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: 'API URL not configured' },
        { status: 500 }
      );
    }

    // Build the target URL specifically for refresh token
    const targetUrl = new URL('/refresh-token', apiUrl);
    
    console.log('Sending refresh token request to:', targetUrl.toString());
    
    // Get the refresh token from cookies if available
    let refreshToken = request.cookies.get('refreshToken')?.value || '';
    
    // If not found directly via the cookies API, try parsing the cookie header
    if (!refreshToken) {
      const cookie = request.headers.get('cookie');
      if (cookie) {
        const cookies = cookie.split(';');
        for (const c of cookies) {
          const [name, value] = c.trim().split('=');
          if (name === 'refreshToken') {
            refreshToken = value;
            console.log('Found refresh token in cookie header');
            break;
          }
        }
      }
    }
    
    // If no refresh token in cookies, try to get it from local storage via the request body
    // This is a fallback for development/testing
    if (!refreshToken) {
      try {
        // Clone the request since we can only read the body once
        const clonedRequest = request.clone();
        const bodyText = await clonedRequest.text();
        
        if (bodyText) {
          try {
            const body = JSON.parse(bodyText);
            if (body && body.refreshToken) {
              refreshToken = body.refreshToken;
              console.log('Found refresh token in request body');
            }
          } catch (jsonError) {
            console.error('Error parsing JSON body:', jsonError);
          }
        }
      } catch (e) {
        console.error('Error reading request body:', e);
      }
    }
    
    console.log('Found refresh token:', refreshToken ? 'Yes' : 'No');
    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token found' },
        { status: 400 }
      );
    }
    
    // Forward the request to the API server with the refresh token in the body
    console.log('Sending refresh token to backend:', refreshToken.substring(0, 8) + '...');
    
    // Try different formats based on what the backend might expect
    // Format 1: Standard JSON
    try {
      console.log('Trying standard JSON format...');
      const response = await fetch(targetUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });
      
      // If successful, process the response
      if (response.ok || response.status !== 415) {
        return await processResponse(response, request);
      }
      
      console.log('Standard JSON format failed with status:', response.status);
    } catch (error) {
      console.error('Error with standard JSON format:', error);
    }
    
    // Format 2: URL-encoded form
    try {
      console.log('Trying URL-encoded form format...');
      const formData = new URLSearchParams();
      formData.append('refreshToken', refreshToken);
      
      const response = await fetch(targetUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: formData.toString(),
      });
      
      // If successful, process the response
      if (response.ok || response.status !== 415) {
        return await processResponse(response, request);
      }
      
      console.log('URL-encoded form format failed with status:', response.status);
    } catch (error) {
      console.error('Error with URL-encoded form format:', error);
    }
    
    // Format 3: Query parameter
    try {
      console.log('Trying query parameter format...');
      const urlWithParams = new URL(targetUrl.toString());
      urlWithParams.searchParams.append('refreshToken', refreshToken);
      
      const response = await fetch(urlWithParams.toString(), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      // If successful, process the response
      if (response.ok || response.status !== 415) {
        return await processResponse(response, request);
      }
      
      console.log('Query parameter format failed with status:', response.status);
    } catch (error) {
      console.error('Error with query parameter format:', error);
    }
    
    // If all formats failed, return an error
    return NextResponse.json(
      { success: false, error: 'All refresh token formats failed' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Refresh token proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy refresh token request' },
      { status: 500 }
    );
  }
}

// Helper function to process the response
async function processResponse(response: Response, request: NextRequest) {
  console.log('Refresh token response status:', response.status);
  
  let responseData;
  try {
    const text = await response.text();
    console.log('Refresh token response text:', text);
    
    // Try to parse the response as JSON
    if (text) {
      try {
        responseData = JSON.parse(text);
        
        // Preserve the original response structure if it comes from the backend
        console.log('Original response data:', JSON.stringify(responseData, null, 2));
        
        // If the response has a success field, use it
        // Otherwise, assume success based on HTTP status
        if (!('success' in responseData)) {
          responseData = {
            success: response.ok,
            data: responseData
          };
        }
        
        console.log('Formatted response data:', JSON.stringify(responseData, null, 2));
      } catch (error) {
        console.error('Error parsing JSON from text:', error);
        responseData = { success: false, error: 'Failed to parse JSON response' };
      }
    } else {
      responseData = { success: false, error: 'Empty response' };
    }
  } catch (error) {
    console.error('Error handling response:', error);
    responseData = { success: false, error: 'Failed to process response' };
  }
  
  // Create a new response
  const newResponse = NextResponse.json(responseData, {
    status: response.status,
    statusText: response.statusText,
  });

  // Copy all response headers
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'content-length') {
      newResponse.headers.set(key, value);
    }
  });

  // Ensure we copy the Set-Cookie header to maintain the refresh token
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    newResponse.headers.set('set-cookie', setCookieHeader);
  }

  // Add CORS headers
  const origin = request.headers.get('origin') || 'http://localhost:3000';
  newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
  newResponse.headers.set('Access-Control-Allow-Origin', origin);
  newResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return newResponse;
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
