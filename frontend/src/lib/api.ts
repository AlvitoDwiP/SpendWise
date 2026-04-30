const API_BASE_URL = resolveApiBaseUrl();
const TOKEN_STORAGE_KEY = "spendwise_token";

type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

type ApiErrorResponse = {
  success: false;
  message: string;
};

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    if (hostname.endsWith(".devtunnels.ms")) {
      // Default devtunnel convention: frontend on *-3000, backend on *-8080.
      const backendHost = hostname.replace(/-3000(\.|$)/, "-8080$1");
      return `${protocol}//${backendHost}`;
    }
  }

  return "http://localhost:8080";
}

export type User = {
  id: number;
  name: string;
  email: string;
  profile_photo_url?: string | null;
};

export type CategoryType = "income" | "expense";

export type Category = {
  id: number;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
};

export type Transaction = {
  id: number;
  category_id: number;
  type: CategoryType;
  amount: number;
  title: string;
  note: string;
  transaction_date: string;
  category?: Category;
};

export type DashboardSummary = {
  current_balance: number;
  this_month_income: number;
  this_month_expense: number;
  this_month_transaction_count: number;
};

export type MonthlyReportItem = {
  month: number;
  income: number;
  expense: number;
};

export type MonthlyReport = {
  year: number;
  months: MonthlyReportItem[];
};

export type PaginationMeta = {
  limit: number;
  offset: number;
  total: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type UpdateProfilePayload = {
  name: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export type CategoryPayload = {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
};

export type TransactionPayload = {
  category_id: number;
  type: CategoryType;
  amount: number;
  title: string;
  note?: string;
  transaction_date: string;
};

export type TransactionListParams = {
  limit?: number;
  offset?: number;
  type?: CategoryType;
  category_id?: number;
  start_date?: string;
  end_date?: string;
};

export type ReceiptScanCategorySuggestion = {
  id?: number;
  name?: string;
};

export type ReceiptScanSuggestion = {
  type?: CategoryType;
  amount?: number | null;
  transaction_date?: string;
  merchant?: string;
  note?: string;
  category_suggestion?: ReceiptScanCategorySuggestion | null;
  confidence?: number;
};

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const response = await apiRequest<ApiSuccessResponse<User>>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiRequest<ApiSuccessResponse<LoginResponse>>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await apiRequest<ApiSuccessResponse<User>>("/me");

  return response.data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiRequest<ApiSuccessResponse<User>>("/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiRequest<ApiSuccessResponse<null>>("/me/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function resetUserData(): Promise<void> {
  await apiRequest<ApiSuccessResponse<null>>("/me/reset-data", {
    method: "POST",
  });
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response =
    await apiRequest<ApiSuccessResponse<DashboardSummary>>("/dashboard/summary");

  return response.data;
}

export async function getCategories(): Promise<Category[]> {
  const response =
    await apiRequest<ApiSuccessResponse<Category[]>>("/categories");

  return response.data;
}

export async function getCategoryById(id: number): Promise<Category> {
  const response = await apiRequest<ApiSuccessResponse<Category>>(
    `/categories/${id}`,
  );

  return response.data;
}

export async function createCategory(
  payload: CategoryPayload,
): Promise<Category> {
  const response = await apiRequest<ApiSuccessResponse<Category>>(
    "/categories",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function updateCategory(
  id: number,
  payload: CategoryPayload,
): Promise<Category> {
  const response = await apiRequest<ApiSuccessResponse<Category>>(
    `/categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiRequest<ApiSuccessResponse<null>>(`/categories/${id}`, {
    method: "DELETE",
  });
}

export async function getTransactions(
  params: TransactionListParams = {},
): Promise<PaginatedResponse<Transaction>> {
  return apiRequest<PaginatedResponse<Transaction>>(
    withQuery("/transactions", params),
  );
}

export async function getTransactionById(id: number): Promise<Transaction> {
  const response = await apiRequest<ApiSuccessResponse<Transaction>>(
    `/transactions/${id}`,
  );

  return response.data;
}

export async function createTransaction(
  payload: TransactionPayload,
): Promise<Transaction> {
  const response = await apiRequest<ApiSuccessResponse<Transaction>>(
    "/transactions",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function updateTransaction(
  id: number,
  payload: TransactionPayload,
): Promise<Transaction> {
  const response = await apiRequest<ApiSuccessResponse<Transaction>>(
    `/transactions/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function deleteTransaction(id: number): Promise<void> {
  await apiRequest<ApiSuccessResponse<null>>(`/transactions/${id}`, {
    method: "DELETE",
  });
}

export async function getRecentTransactions(): Promise<Transaction[]> {
  const response = await apiRequest<ApiSuccessResponse<Transaction[]>>(
    "/transactions/recent",
  );

  return response.data;
}

export async function getMonthlyReport(year: number): Promise<MonthlyReport> {
  const response = await apiRequest<ApiSuccessResponse<MonthlyReport>>(
    withQuery("/reports/monthly", { year }),
  );

  return response.data;
}

export async function scanReceipt(file: File): Promise<ReceiptScanSuggestion> {
  const formData = new FormData();
  formData.append("receipt", file);

  const headers = new Headers();
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl("/transactions/scan-receipt"), {
    method: "POST",
    body: formData,
    headers,
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    if (response.status === 401) {
      removeToken();
      throw new Error(message || "Sesi Anda berakhir. Silakan login ulang.");
    }
    if (response.status === 500) {
      throw new Error("Gagal memproses scan receipt. Coba lagi sebentar.");
    }
    if (response.status === 400) {
      throw new Error(message || "File receipt tidak valid.");
    }
    throw new Error(message);
  }

  const payload =
    (await response.json()) as
      | ApiSuccessResponse<ReceiptScanSuggestion>
      | ReceiptScanSuggestion;

  if ("success" in payload) {
    return payload.data;
  }

  return payload;
}

function buildUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function withQuery(path: string, params: QueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  if (!query) {
    return path;
  }

  return `${path}${path.includes("?") ? "&" : "?"}${query}`;
}

async function getErrorMessage(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;

  try {
    const error = (await response.json()) as Partial<ApiErrorResponse>;
    return error.message || fallback;
  } catch {
    return fallback;
  }
}
