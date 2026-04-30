import type { CategoryType } from "./api";

type CategoryVisual = {
  color: string;
  icon: string;
};

type CategoryRule = {
  keywords: string[];
  visual: CategoryVisual;
};

const categoryRules: CategoryRule[] = [
  {
    keywords: ["salary", "gaji", "income", "bonus", "payroll", "paycheck"],
    visual: { color: "#22c55e", icon: "wallet" },
  },
  {
    keywords: [
      "food",
      "makan",
      "groceries",
      "grocery",
      "belanja",
      "restaurant",
      "snack",
    ],
    visual: { color: "#f59e0b", icon: "utensils" },
  },
  {
    keywords: [
      "transport",
      "bensin",
      "gojek",
      "grab",
      "fuel",
      "travel",
      "commute",
    ],
    visual: { color: "#3b82f6", icon: "car" },
  },
  {
    keywords: ["bill", "listrik", "internet", "utility", "utilities", "wifi"],
    visual: { color: "#8b5cf6", icon: "receipt" },
  },
  {
    keywords: ["health", "kesehatan", "medical", "doctor", "hospital", "clinic"],
    visual: { color: "#f43f5e", icon: "heart" },
  },
  {
    keywords: ["entertainment", "hiburan", "movie", "game", "music", "streaming"],
    visual: { color: "#a855f7", icon: "gamepad" },
  },
];

const incomeFallback: CategoryVisual = { color: "#22c55e", icon: "wallet" };
const expenseFallback: CategoryVisual = { color: "#ef4444", icon: "tag" };

export function getCategoryDefaults(
  name: string,
  type: CategoryType,
): CategoryVisual {
  const normalizedName = normalizeCategoryName(name);
  const matchedRule = categoryRules.find((rule) =>
    rule.keywords.some((keyword) => normalizedName.includes(keyword)),
  );

  if (matchedRule) {
    return matchedRule.visual;
  }

  return type === "income" ? incomeFallback : expenseFallback;
}

function normalizeCategoryName(name: string): string {
  return name.trim().toLowerCase();
}
