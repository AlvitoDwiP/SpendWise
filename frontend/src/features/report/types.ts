export type ReportPeriod = "this_month" | "last_month" | "this_year" | "all_time";

export type ReportCategoryBreakdownItem = {
  key: string;
  name: string;
  total: number;
  percentage: number;
};

export type ReportTrendItem = {
  key: string;
  label: string;
  expense: number;
};
