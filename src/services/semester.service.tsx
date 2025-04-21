import apiSlice from "./api";

const semesterService = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSemester: builder.query<any, void>({
            query: () => `/semester/allSemester`,
        }),
        getSemesterByStudentId: builder.query({
            query: ({studentId}) => `/semester/by-student-id/${studentId}`,
        }),
        getExistsScore: builder.query({
            query: () => `/score/check-all`,
        }),
        getStudentScoresBySemester: builder.query({
            query: ({semesterId}) => `/score/all-by-semester?semester=${semesterId}`
        }),
        createSemester: builder.mutation({
            query: ({ body }) => ({
              url: '/semester/create-semester',
              method: 'POST',
              body,
            }),
            
          }),
          updateSemester: builder.mutation({
            query: ({ semesterId, body }) => ({
              url: `/semester/update-semester/${semesterId}`,
              method: 'PUT',
              body,
            }),
          }),

          deleteSemester: builder.mutation({
            query: ({semesterId}) => ({
                url: `/semester/delete-semester/${semesterId}`,
                method: 'DELETE',
            }),
          })
    }),
});

export const { 
    useGetSemesterQuery, 
    useGetSemesterByStudentIdQuery, 
    useGetExistsScoreQuery, 
    useGetStudentScoresBySemesterQuery, 
    useCreateSemesterMutation,
    useUpdateSemesterMutation,
    useDeleteSemesterMutation 
} = semesterService;
