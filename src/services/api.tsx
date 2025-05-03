import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Tạo baseQuery tùy chỉnh để xử lý phản hồi text
const customBaseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8080',
  prepareHeaders: async (headers) => {
    try {
      const token = localStorage.getItem('accessToken');
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
  
  responseHandler: async (response) => {
    const contentType = response.headers.get('content-type');
    

    if (contentType && contentType.includes('text/plain')) {
      const text = await response.text();
      return { message: text };
    }
    
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  },
})

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery,
  tagTypes: ['Permission'],
  endpoints: builder => ({}),
})

export default apiSlice;
