const TRAILING_SELECTION = /\s\([^()]*\)$/;

// Lines are saved as "Product (L / Black)" or menu "Dish (Variant) + Addon"; catalog search matches the base name only.
export const getCatalogSearchName = (
  orderLineName: string,
  isMenuCatalog: boolean,
): string => {
  const baseLine = isMenuCatalog
    ? orderLineName.split(" + ")[0]
    : orderLineName;
  return baseLine.replace(TRAILING_SELECTION, "").trim();
};
