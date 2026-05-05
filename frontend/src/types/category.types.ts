export type CategoryType = "income" | "expense";

export type Category = {
  id: number;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
};

export type CategoryPayload = {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
};
