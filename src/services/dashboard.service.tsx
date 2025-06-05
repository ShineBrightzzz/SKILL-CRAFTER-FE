import apiSlice from './api';
import { DashboardApiResponse, MonthlyData } from '@/types/dashboard';

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLast6MonthsRevenue: builder.query<DashboardApiResponse<MonthlyData>, void>({
      query: () => '/api/dashboard/revenue/last-6-months',
    }),
    getLast6MonthsRegistrations: builder.query<DashboardApiResponse<MonthlyData>, void>({
      query: () => '/api/dashboard/registrations/last-6-months',
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetLast6MonthsRevenueQuery,
  useGetLast6MonthsRegistrationsQuery,
} = dashboardApiSlice;
