import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const customBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
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
  tagTypes: ['Permission', 'Roles', 'Chapters', 'Courses', 'Lessons', 'Categories', 'Users', 'CodeSubmits', 'TestCases'],
  endpoints: builder => ({}),
})

export default apiSlice;
