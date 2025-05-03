import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
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
  }),

  tagTypes: ['Permission'],

  endpoints: builder => ({}),
})

export default apiSlice;
