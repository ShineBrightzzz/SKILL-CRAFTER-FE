import apiSlice from './api';

// Define types for pagination parameters
interface PaginationParams {
  page?: number;
  size?: number;  // Changed from pageSize to size
  sort?: string;
  order?: 'asc' | 'desc';
}

// Define module params
interface ModuleParams {
  module: string;
}

// Define API path params
interface ApiPathParams {
  apiPath: string;
  method: string;
}

// Search params
interface SearchParams extends PaginationParams {
  name?: string;
  apiPath?: string;
  method?: string;
  module?: string;
}

// Define the Permission type
export interface Permission {
  id: string;
  name?: string;
  apiPath?: string;
  method?: string;
  module?: string;
  active?: boolean;
  // Add other permission properties as needed
}

// Response type for multiple permissions
interface PermissionsResponse {
  data: {
    result: Permission[];
    meta?: {
      page: number;
      pageSize: number;
      total: number;
    }
  };
}

export const permissionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Permission endpoints
    getAllPermissions: builder.query<PermissionsResponse, PaginationParams>({
      query: (params: PaginationParams = {}) => {
        // Build query string for pagination
        const { page, size, sort, order } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (size) queryParams.push(`size=${size}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/permissions${queryString}`;
      },
      providesTags: (result) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Permission' as const, id })),
              { type: 'Permission' as const, id: 'LIST' },
            ]
          : [{ type: 'Permission' as const, id: 'LIST' }],
    }),
    
    getPermissionById: builder.query<Permission, string>({
      query: (permissionId) => `/api/permissions/${permissionId}`,
      providesTags: (result, error, id) => [{ type: 'Permission' as const, id }],
    }),

    searchPermissions: builder.query<PermissionsResponse, SearchParams>({
      query: (params: SearchParams) => {
        const { page, size, sort, order, name, apiPath, method, module } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (size) queryParams.push(`size=${size}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        if (name) queryParams.push(`name=${encodeURIComponent(name)}`);
        if (apiPath) queryParams.push(`apiPath=${encodeURIComponent(apiPath)}`);
        if (method) queryParams.push(`method=${encodeURIComponent(method)}`);
        if (module) queryParams.push(`module=${encodeURIComponent(module)}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/permissions/search${queryString}`;
      },
      providesTags: (result) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Permission' as const, id })),
              { type: 'Permission' as const, id: 'LIST' },
            ]
          : [{ type: 'Permission' as const, id: 'LIST' }],
    }),

    getPermissionsByModule: builder.query<Permission[], string>({
      query: (module) => `/api/permissions/by-module/${module}`,
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Permission' as const, id })),
              { type: 'Permission' as const, id: 'LIST' },
            ]
          : [{ type: 'Permission' as const, id: 'LIST' }],
    }),

    getPermissionsByApiPath: builder.query<Permission[], ApiPathParams>({
      query: (params) => {
        const { apiPath, method } = params;
        return {
          url: `/api/permissions/by-api-path?apiPath=${encodeURIComponent(apiPath)}&method=${encodeURIComponent(method)}`,
          method: 'GET',
        };
      },
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Permission' as const, id })),
              { type: 'Permission' as const, id: 'LIST' },
            ]
          : [{ type: 'Permission' as const, id: 'LIST' }],
    }),

    createPermission: builder.mutation<Permission, { body: Partial<Permission> }>({
      query: ({body}) => ({
        url: '/api/permissions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Permission' as const, id: 'LIST' }],
    }),

    bulkCreatePermissions: builder.mutation<Permission[], { body: Partial<Permission>[] }>({
      query: ({body}) => ({
        url: '/api/permissions/bulk-create',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Permission' as const, id: 'LIST' }],
    }),
    
    updatePermission: builder.mutation<Permission, { id: string; body: Partial<Permission> }>({
      query: ({ id, body }) => ({
        url: `/api/permissions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Permission' as const, id },
        { type: 'Permission' as const, id: 'LIST' },
      ],
    }),
    
    deletePermission: builder.mutation<void, { id: string }>({
      query: ({id}) => ({
        url: `/api/permissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Permission' as const, id },
        { type: 'Permission' as const, id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: true,
});

// Export the hooks
export const {
  useGetAllPermissionsQuery,
  useGetPermissionByIdQuery,
  useSearchPermissionsQuery,
  useGetPermissionsByModuleQuery,
  useGetPermissionsByApiPathQuery,
  useCreatePermissionMutation,
  useBulkCreatePermissionsMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} = permissionApiSlice;
