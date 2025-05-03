import apiSlice from "./api";

const permissionSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPermissions: builder.query<any, void>({
            query: () => `/permissions`,
            providesTags: ['Permission'], 
        }),
        getPermissionById: builder.query({
            query: (id) => `/permissions/${id}`,
            providesTags: (result, error, id) => [{ type: 'Permission', id }],
        }),
        createPermission: builder.mutation({
            query: ({ body }) => ({
                url: '/permissions',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Permission'], 
        }),
        updatePermission: builder.mutation({
            query: ({ id, body }) => ({
                url: `/permissions/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Permission'], 
        }),
        deletePermission: builder.mutation({
            query: ({ id }) => ({
                url: `/permissions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Permission'], 
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetPermissionsQuery,
    useGetPermissionByIdQuery,
    useCreatePermissionMutation,
    useUpdatePermissionMutation,
    useDeletePermissionMutation
} = permissionSlice;
