export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
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
