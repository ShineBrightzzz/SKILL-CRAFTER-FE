import apiSlice from "./api";

const eventsService = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getEvents: builder.query<any, void>({
            query: () => `/eventDetails/ongoing`,
        }),
        getRegisteredEvents: builder.query({
            query: ({studentId}) => `/events/registered?studentId=${studentId}`,
        }),
        getEventById: builder.query({
            query: ({eventId}) => `/eventDetails/${eventId}`,
        }),
        createEvent: builder.mutation<any, any>({
            query: (eventData) => {
                return {
                    url: `/eventDetails/create-event`,
                    method: "POST",
                    body: eventData,
                };
            },
        }),
        updateEvent: builder.mutation<any, { id: string; body: any }>({
            query: ({ id, body }) => {
                return {
                    url: `/eventDetails/update-event/${id}`,
                    method: "PUT",
                    body,
                };
            },
        }),
        deleteEvent: builder.mutation<any, { id: string }>({
            query: ({ id }) => {
                return {
                    url: `/eventDetails/delete-event/${id}`,
                    method: "DELETE",
                };
            },
        }),
        registerEvent: builder.mutation<any, {studentId: string, eventId: string}>({
            query: ({studentId, eventId}) => {
                return {
                    url: `/events/register`,
                    method: "POST",
                    body: {
                        studentId: studentId,
                        eventId: eventId,
                    },
                };
            },
        }),
        checkinEvent: builder.mutation<any, {studentId: string, eventId: string, image: string}>({
            query: ({studentId, eventId, image}) => {
                return {
                    url: `/events/checkin`,
                    method: "PUT",
                    body: {
                        studentId: studentId,
                        eventId: eventId,
                        time: new Date().toISOString(),
                        image: image
                    },
                };
            },
        }), 
        checkoutEvent: builder.mutation<any, {studentId: string, eventId: string}>({
            query: ({studentId, eventId}) => {
                return {
                    url: `/events/checkout`,
                    method: "PUT",
                    body: {
                        studentId: studentId,
                        eventId: eventId,
                        time: new Date().toISOString()
                    },
                };
            },
        }),
        getCheckinCount: builder.query<any, {studentId: string, eventId: string}>({
            query: ({studentId, eventId}) => {
                return {
                    url: `/checkincnt?studentId=${studentId}&eventId=${eventId}`,
                };
            },
        }),
        getTopRegisteredEvents: builder.query<any, void>({
            query: () => `/eventDetails/top-registered`,
        }),
        getExistsScore: builder.query({
            query: () => `/score/check-all`,
        }),
    }),
    overrideExisting: true,
});

export const { 
    useGetEventsQuery, 
    useGetRegisteredEventsQuery, 
    useGetEventByIdQuery, 
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    useRegisterEventMutation, 
    useCheckinEventMutation, 
    useGetCheckinCountQuery, 
    useCheckoutEventMutation,
    useGetTopRegisteredEventsQuery,
    useGetExistsScoreQuery
} = eventsService;
