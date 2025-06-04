import apiSlice from './api';
import { useAuth } from '@/store/hooks';
import { ApiResponse } from '@/types/api';
import { Page } from '@/types/pagination';

// Define types
export interface NotificationDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: number;
  referenceId: string;
  read: boolean;
  createdAt: string;
}

interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Notification endpoints
    getUserNotifications: builder.query<BaseResponse<NotificationDTO[]>, void>({
      query: () => {
        const userId = localStorage.getItem('userId');
        return {
          url: `/api/notifications/${userId}`,
          method: 'GET'
        };
      },
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map((notification: NotificationDTO) => ({ 
                type: 'Notifications' as const, 
                id: notification.id 
              })),
              { type: 'Notifications' as const, id: 'LIST' }
            ]
          : [{ type: 'Notifications' as const, id: 'LIST' }],
    }),

    getUserNotificationsPaginated: builder.query<
      BaseResponse<{
        content: NotificationDTO[];
        totalPages: number;
        totalElements: number;
        size: number;
        number: number;
      }>,
      { page: number; size: number }
    >({
      query: ({ page, size }) => {
        const userId = localStorage.getItem('userId');
        return {
          url: `/api/notifications/${userId}/paginated`,
          method: 'GET',
          params: { page, size }
        };
      },
      providesTags: (result) => 
        result?.data?.content
          ? [
              ...result.data.content.map((notification: NotificationDTO) => ({ 
                type: 'Notifications' as const, 
                id: notification.id 
              })),
              { type: 'Notifications' as const, id: 'LIST' }
            ]
          : [{ type: 'Notifications' as const, id: 'LIST' }],
    }),

    getUnreadCount: builder.query<BaseResponse<number>, void>({
      query: () => {
        const userId = localStorage.getItem('userId');
        return {
          url: `/api/notifications/user/${userId}/unread-count`,
          method: 'GET'
        };
      },
      providesTags: [{ type: 'Notifications', id: 'COUNT' }],
    }),

    markAsRead: builder.mutation<BaseResponse<NotificationDTO>, string>({
      query: (id) => ({
        url: `/api/notifications/${id}/mark-read`,
        method: 'PATCH'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Notifications', id },
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'COUNT' }
      ],
    }),

    markAllAsRead: builder.mutation<BaseResponse<void>, void>({
      query: () => {
        const userId = localStorage.getItem('userId');
        return {
          url: `/api/notifications/user/${userId}/mark-all-read`,
          method: 'PATCH'
        };
      },
      invalidatesTags: [
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'COUNT' }
      ],
    }),
  }),
});

export const {
  useGetUserNotificationsQuery,
  useGetUserNotificationsPaginatedQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApiSlice;
