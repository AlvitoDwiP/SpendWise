export const API_ENDPOINTS = {
  auth: {
    google: "/auth/google",
    login: "/auth/login",
    register: "/auth/register",
  },
  categories: {
    byId: (id: number) => `/categories/${id}`,
    list: "/categories",
  },
  dashboard: {
    summary: "/dashboard/summary",
  },
  profile: {
    me: "/me",
    password: "/me/password",
    resetData: "/me/reset-data",
  },
  reports: {
    monthly: "/reports/monthly",
  },
  transactions: {
    byId: (id: number) => `/transactions/${id}`,
    list: "/transactions",
    recent: "/transactions/recent",
    scanReceipt: "/transactions/scan-receipt",
  },
} as const;
