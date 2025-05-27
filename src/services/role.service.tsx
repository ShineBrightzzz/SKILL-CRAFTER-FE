import apiSlice from './api';
import { Permission } from './permission.service';

// Define types for pagination parameters
interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Define the Role type
interface Role {
  id: string;
  name?: string;
  description?: string;
  active?: boolean;
  // Add other role properties as needed
}

// Response type for multiple roles
interface RolesResponse {
  data: {
    result: Role[];
    meta?: {
      page: number;
      pageSize: number;
      total: number;
    }
  };
}

export const roleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Role endpoints
    getAllRoles: builder.query<RolesResponse, PaginationParams>({
      query: (params: PaginationParams = {}) => {
        // Build query string for pagination
        const { page, pageSize, sort, order } = params;
        const queryParams = [];
        
        if (page) queryParams.push(`page=${page}`);
        if (pageSize) queryParams.push(`pageSize=${pageSize}`);
        if (sort) queryParams.push(`sort=${sort}`);
        if (order) queryParams.push(`order=${order}`);
        
        const queryString = queryParams.length > 0 
          ? `?${queryParams.join('&')}` 
          : '';
          
        return `/api/roles${queryString}`;
      },
      providesTags: (result) => 
        result?.data?.result
          ? [
              ...result.data.result.map(({ id }) => ({ type: 'Roles' as const, id })),
              { type: 'Roles' as const, id: 'LIST' },
            ]
          : [{ type: 'Roles' as const, id: 'LIST' }],
    }),
    
    getRoleById: builder.query<Role, string>({
      query: (roleId) => `/api/roles/${roleId}`,
      providesTags: (result, error, id) => [{ type: 'Roles' as const, id }],
    }),

    getActiveRoles: builder.query<Role[], void>({
      query: () => '/api/roles/active',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Roles' as const, id })),
              { type: 'Roles' as const, id: 'ACTIVE' },
            ]
          : [{ type: 'Roles' as const, id: 'ACTIVE' }],
    }),

    getRolePermissions: builder.query<Permission[], string>({
      query: (roleId) => `/api/roles/${roleId}/permissions`,
      providesTags: (result, error, roleId) => [
        { type: 'Roles' as const, id: `${roleId}-permissions` },
      ],
    }),

    createRole: builder.mutation<Role, { body: Partial<Role> }>({
      query: ({body}) => ({
        url: '/api/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Roles' as const, id: 'LIST' }],
    }),
    
    updateRole: builder.mutation<Role, { id: string; body: Partial<Role> }>({
      query: ({ id, body }) => ({
        url: `/api/roles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Roles' as const, id },
        { type: 'Roles' as const, id: 'LIST' },
        { type: 'Roles' as const, id: 'ACTIVE' },
      ],
    }),
    
    deleteRole: builder.mutation<void, { id: string }>({
      query: ({id}) => ({
        url: `/api/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Roles' as const, id },
        { type: 'Roles' as const, id: 'LIST' },
        { type: 'Roles' as const, id: 'ACTIVE' },
      ],
    }),

    assignPermissionToRole: builder.mutation<void, { roleId: string; permissionId: string }>({
      query: ({ roleId, permissionId }) => ({
        url: `/api/roles/${roleId}/permissions/${permissionId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { roleId }) => [
        { type: 'Roles' as const, id: `${roleId}-permissions` },
      ],
    }),

    removePermissionFromRole: builder.mutation<void, { roleId: string; permissionId: string }>({
      query: ({ roleId, permissionId }) => ({
        url: `/api/roles/${roleId}/permissions/${permissionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { roleId }) => [
        { type: 'Roles' as const, id: `${roleId}-permissions` },
      ],
    }),

    toggleRoleStatus: builder.mutation<Role, { id: string }>({
      query: ({id}) => ({
        url: `/api/roles/${id}/toggle-status`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Roles' as const, id },
        { type: 'Roles' as const, id: 'LIST' },
        { type: 'Roles' as const, id: 'ACTIVE' },
      ],
    }),
  }),
  overrideExisting: true,
});

// Export the hooks
export const {
  useGetAllRolesQuery,
  useGetRoleByIdQuery,
  useGetActiveRolesQuery,
  useGetRolePermissionsQuery,
  useLazyGetRolePermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignPermissionToRoleMutation,
  useRemovePermissionFromRoleMutation,
  useToggleRoleStatusMutation,
} = roleApiSlice;
