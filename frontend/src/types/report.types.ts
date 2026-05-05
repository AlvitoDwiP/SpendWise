export type MonthlyReportItem = {
  month: number;
  income: number;
  expense: number;
};

export type MonthlyReport = {
  year: number;
  months: MonthlyReportItem[];
};
