import apiSlice from "./api";

const roleSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
       getRole : builder.query<any, void>({
            query: () => `/roles`,
       }),
        getRoleById: builder.query({
            query: (id) => `/roles/${id}`,
        }),
        createRole: builder.mutation({
            query: ({ body }) => ({
                url: '/roles',
                method: 'POST',
                body,
            }),
        }),

        updateRole: builder.mutation({
            query: ({ id, body }) => ({
                url: `/roles/${id}`,
                method: 'PUT',
                body,
            }),
        }),
        deleteRole: builder.mutation({
            query: (id) => ({
                url: `/roles/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
    overrideExisting: true,
});

export const { useGetRoleQuery, useGetRoleByIdQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } = roleSlice;
