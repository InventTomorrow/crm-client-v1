// Menu lines are saved as "Dish (Variant) + Addon" (server formatMenuLineName); the menu search matches the dish name only.
export const getMenuDishName = (orderLineName: string): string =>
  orderLineName.split(" + ")[0].replace(/\s\([^()]*\)$/, "").trim();
