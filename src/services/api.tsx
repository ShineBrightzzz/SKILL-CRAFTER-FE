import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080',
    prepareHeaders: async (headers) => {
      try {
        const token = localStorage.getItem('accessToken') || 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJTVDAwMSIsImNoaW5oLmxoNTQiOnsicHJpbmNpcGFsIjp7InBhc3N3b3JkIjpudWxsLCJ1c2VybmFtZSI6IlNUMDAxIiwiYXV0aG9yaXRpZXMiOlt7InJvbGUiOiJST0xFX01PREVSQVRPUiJ9XSwiYWNjb3VudE5vbkV4cGlyZWQiOnRydWUsImFjY291bnROb25Mb2NrZWQiOnRydWUsImNyZWRlbnRpYWxzTm9uRXhwaXJlZCI6dHJ1ZSwiZW5hYmxlZCI6dHJ1ZX0sImNyZWRlbnRpYWxzIjpudWxsLCJhdXRob3JpdGllcyI6W3sicm9sZSI6IlJPTEVfTU9ERVJBVE9SIn1dLCJkZXRhaWxzIjpudWxsLCJhdXRoZW50aWNhdGVkIjp0cnVlfSwiZXhwIjoxMDM4NDkxMzY5MSwiaWF0IjoxNzQ0OTEzNjkxfQ.vNiAaN7g5x9NiuLKQP3zYTXzCUo5pi6Vv5jjG-QXRY01_cNgd_-pHqJilyFpuceLJ0hAuaccFFp3QJgdavU5HA';
        console.log(token)
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
        
        return headers;
      } catch (error) {
        console.error('Error preparing headers:', error);
        return headers;
      }
    },
  }),

  tagTypes: ['Permission'],

  endpoints: builder => ({}),
})

export default apiSlice;
