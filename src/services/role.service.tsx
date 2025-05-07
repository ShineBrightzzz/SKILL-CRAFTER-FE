import apiSlice from "./api";

const roleSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
       getRole : builder.query<any, void>({
            query: () => `/roles`,
            providesTags: ['Roles']
       }),
        getRoleById: builder.query({
            query: (id) => `/roles/${id}`,
            providesTags: (result, error, id) => [{ type: 'Roles', id }]
        }),
        createRole: builder.mutation({
            query: ({ body }) => ({
                url: '/roles',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Roles']
        }),

        updateRole: builder.mutation({
            query: ({ id, body }) => ({
                url: `/roles/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Roles']
        }),
        deleteRole: builder.mutation({
            query: ({ id }) => ({
                url: `/roles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Roles']
        }),
    }),
    overrideExisting: true,
});

export const { useGetRoleQuery, useGetRoleByIdQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } = roleSlice;
