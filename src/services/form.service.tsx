import apiSlice from "./api";

const formService = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCurrentForm: builder.query<any, void>({
            query: () => ({
                url: `/form/current`,
                method: "GET",
            }),
        }),
        createForm: builder.mutation<any, any>({
            query: (formData) => ({
                url: `/form/create`,
                method: "POST",
                body: formData,
            }),
        }),
    }),
});

export const {
    useGetCurrentFormQuery,
    useCreateFormMutation,
} = formService;