// This is a test page for monitoring token refresh functionality
'use client';

import TokenRefreshTest from '@/components/TokenRefreshTest';

export default function TokenRefreshTestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Token Refresh Test Page</h1>
      <TokenRefreshTest />
      
      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-4">How to Test Token Refresh</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Log in to your account</li>
          <li>Watch the timer counting down to token expiration</li>
          <li>The token should automatically refresh about 1 minute before expiration</li>
          <li>To test tab visibility detection:
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Open another browser tab or window</li>
              <li>After a minute or so, return to this tab</li>
              <li>If the token is close to expiring (within 10 minutes), it should refresh automatically</li>
            </ul>
          </li>
          <li>Check browser console for detailed logs about token refresh events</li>
        </ol>
      </div>
    </div>
  );
}
