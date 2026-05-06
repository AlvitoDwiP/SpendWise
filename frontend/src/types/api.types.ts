export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiErrorDetail = {
  code: string;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  message?: string;
  error?: ApiErrorDetail;
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
