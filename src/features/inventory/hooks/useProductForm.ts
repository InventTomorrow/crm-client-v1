import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import {
  deleteUploadedFile,
  type VariantPayload,
} from "../services/productsService";
import type { Product, ProductVariant } from "../types";
import {
  CATEGORIES,
  getSizeGroupsForCategory,
  getVariantLabel,
  productSchema,
  type ProductFormData,
  type ProductVariantFormInput,
} from "../types";
import {
  useAddProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "./useProducts";
import { getSuggestedVariantSkus, getVariantTotals } from "../utils/variants";

type SavedVariant = ProductFormData["variants"][number];

const EMPTY_VARIANT = {
  name: "",
  size: "",
  sku: "",
  imageUrl: "",
} satisfies Omit<ProductVariantFormInput, "price" | "stock" | "color">;

const toInputValue = (value: unknown): string =>
  value === undefined || value === null ? "" : String(value);

const toVariantFormValues = (
  variant: ProductVariant,
): ProductVariantFormInput => ({
  id: variant.id,
  name: variant.name,
  size: variant.size ?? "",
  color: variant.color ?? "",
  sku: variant.sku ?? "",
  imageUrl: variant.imageUrl ?? "",
  price: String(variant.price),
  stock: String(variant.stock),
});

/** Sizes the versions come in, first spelling kept — becomes the product's size list. */
const getVariantSizes = (variants: SavedVariant[]): string[] => {
  const seen = new Set<string>();
  return variants.flatMap((variant) => {
    const size = variant.size?.trim();
    if (!size || seen.has(size.toLowerCase())) return [];
    seen.add(size.toLowerCase());
    return [size];
  });
};

// The API prices a variant as an offset from the product, which carries the cheapest one.
const toVariantPayloads = (
  variants: SavedVariant[],
  basePrice: number,
  productName: string,
  productSku: string | undefined,
): VariantPayload[] => {
  const suggestedSkus = getSuggestedVariantSkus(productSku, variants);
  return variants.map((variant, index) => ({
    ...(variant.id ? { id: variant.id } : {}),
    name: getVariantLabel(variant, productName),
    size: variant.size || undefined,
    color: variant.color || undefined,
    sku: variant.sku || suggestedSkus[index],
    imageUrl: variant.imageUrl || undefined,
    priceDelta: Math.round((variant.price - basePrice) * 100) / 100,
    stock: variant.stock,
  }));
};

const INITIAL_FORM_VALUES = {
  name: "",
  sku: "",
  price: "",
  discountPercentage: undefined,
  stock: "",
  cat: "Uncategorized",
  sizes: [],
  gender: "",
  color: "",
  desc: "",
  customOptionsEnabled: false,
  customOptionKeys: [],
  customOptionNote: "",
  variants: [],
} satisfies z.input<typeof productSchema>;

/** Owns the product form page's state: prefill from the cached product list,
 * the image gallery, the live discounted-price preview, and save/delete
 * wiring. Pass a productId to switch into edit mode. */
export function useProductForm(productId?: string) {
  const router = useRouter();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const isEditMode = !!productId;
  const editingProduct = useMemo(
    () =>
      productId ? products.find((p: Product) => p.id === productId) : undefined,
    [products, productId],
  );
  const notFound = isEditMode && !isLoadingProducts && !editingProduct;

  // Full gallery — first entry is the cover image shown on cards and tables.
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const form = useForm<z.input<typeof productSchema>, unknown, ProductFormData>(
    {
      resolver: zodResolver(productSchema),
      defaultValues: INITIAL_FORM_VALUES,
    },
  );

  useEffect(() => {
    if (!editingProduct) return;
    setImageUrls(editingProduct.imageUrls ?? []);
    form.reset({
      name: editingProduct.name ?? "",
      sku: editingProduct.sku ?? "",
      price: editingProduct.price != null ? String(editingProduct.price) : "",
      discountPercentage:
        editingProduct.discountPercentage != null
          ? editingProduct.discountPercentage
          : undefined,
      stock: editingProduct.stock != null ? String(editingProduct.stock) : "",
      cat: editingProduct.cat ?? "Uncategorized",
      sizes: editingProduct.sizes ?? [],
      gender: editingProduct.gender ?? "",
      color: editingProduct.color ?? "",
      desc: editingProduct.desc ?? "",
      customOptionsEnabled: editingProduct.customOptionsEnabled ?? false,
      customOptionKeys: editingProduct.customOptionKeys ?? [],
      customOptionNote: editingProduct.customOptionNote ?? "",
      variants: (editingProduct.variants ?? []).map(toVariantFormValues),
    });
    // Keyed on the id so a background refetch doesn't clobber in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingProduct?.id]);

  // Categories shown in the picker: the built-in set plus whatever existing
  // products already use (so previously-created ones keep showing up).
  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const category of [
      ...CATEGORIES,
      ...(products?.map((p: Product) => p.cat) ?? []),
    ]) {
      const key = category?.trim().toLowerCase();
      if (!category || !key || seen.has(key)) continue;
      seen.add(key);
      out.push(category);
    }
    return out.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const selectedCategory = useWatch({ control: form.control, name: "cat" });
  const customOptionsEnabled = useWatch({
    control: form.control,
    name: "customOptionsEnabled",
  });
  const watchedPrice = useWatch({ control: form.control, name: "price" });
  const watchedDiscount = useWatch({
    control: form.control,
    name: "discountPercentage",
  });

  const discountedPrice = useMemo(() => {
    const price = Number(watchedPrice);
    const discount = Number(watchedDiscount);
    if (!price || !discount || discount <= 0 || discount > 100) return null;
    return price - (price * discount) / 100;
  }, [watchedPrice, watchedDiscount]);

  const variantFields = useFieldArray({
    control: form.control,
    name: "variants",
  });
  // Price, stock and colour typed on the product before it had variants — every new variant starts from them.
  const typedProductDefaultsRef = useRef({ price: "", stock: "", color: "" });
  const watchedVariants = useWatch({ control: form.control, name: "variants" });
  const watchedSku = useWatch({ control: form.control, name: "sku" });
  const hasVariants = (watchedVariants?.length ?? 0) > 0;
  const variantSizeOptions = useMemo(
    () =>
      getSizeGroupsForCategory(selectedCategory).flatMap((group) => [
        ...group.options,
      ]),
    [selectedCategory],
  );
  const variantTotals = useMemo(
    () => getVariantTotals(watchedVariants ?? []),
    [watchedVariants],
  );
  const variantSkuSuggestions = useMemo(
    () => getSuggestedVariantSkus(watchedSku, watchedVariants ?? []),
    [watchedSku, watchedVariants],
  );

  // With variants, price and stock are no longer typed by hand: the cheapest
  // variant sets the price, and stock is what all of them hold together.
  useEffect(() => {
    if (!hasVariants) return;
    if (variantTotals.minPrice !== null) {
      form.setValue("price", String(variantTotals.minPrice), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    form.setValue("stock", String(variantTotals.totalStock), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [variantTotals, hasVariants, form]);

  const isSaving = addProduct.isPending || updateProduct.isPending;
  const isDeleting = deleteProduct.isPending;

  // Photos uploaded on this screen. Until the form is saved they belong to no
  // product, so removing or replacing one has to delete it from S3 here —
  // nothing else ever will. A photo already saved on the product is never in
  // this list: the server deletes that one on update or delete, after the save.
  const [uploadsPendingSave, setUploadsPendingSave] = useState<string[]>([]);

  const discardUploads = useCallback((urls: string[]) => {
    if (urls.length === 0) return;
    setUploadsPendingSave((prev) => prev.filter((url) => !urls.includes(url)));
    for (const url of urls) {
      // A leftover object costs storage, not correctness — never block the form.
      void deleteUploadedFile(url).catch(() => {});
    }
  }, []);

  // Single product image for now — variants will reintroduce a gallery. Extra
  // URLs on products created earlier are kept as-is so nothing is lost.
  const applyCoverImage = useCallback(
    (url: string | null, isOwnUpload: boolean) => {
      const replaced = imageUrls[0];
      if (
        replaced &&
        replaced !== url &&
        uploadsPendingSave.includes(replaced)
      ) {
        discardUploads([replaced]);
      }
      if (url && isOwnUpload) {
        setUploadsPendingSave((prev) =>
          prev.includes(url) ? prev : [...prev, url],
        );
      }
      setImageUrls((prev) => (url ? [url, ...prev.slice(1)] : prev.slice(1)));
    },
    [imageUrls, uploadsPendingSave, discardUploads],
  );

  const setCoverImage = useCallback(
    (url: string | null) => applyCoverImage(url, true),
    [applyCoverImage],
  );

  /**
   * A photo the seller linked to instead of uploading. It lives on someone
   * else's host, so it is never tracked for deletion — DELETE /upload would
   * refuse it anyway, the key not being under this workspace's prefix.
   */
  const setLinkedCoverImage = useCallback(
    (url: string) => applyCoverImage(url, false),
    [applyCoverImage],
  );

  /** Leaving without saving: every photo uploaded here is now an orphan. */
  const discardUnsavedUploads = useCallback(() => {
    discardUploads(uploadsPendingSave);
  }, [uploadsPendingSave, discardUploads]);

  const discardIfUnsaved = useCallback(
    (url: string | undefined) => {
      if (url && uploadsPendingSave.includes(url)) discardUploads([url]);
    },
    [uploadsPendingSave, discardUploads],
  );

  /** Variant photos are always uploaded here, so each one is tracked until the product is saved. */
  const setVariantImage = useCallback(
    (index: number, url: string | null) => {
      const replaced = form.getValues(`variants.${index}.imageUrl`);
      if (replaced !== url) discardIfUnsaved(replaced);
      if (url) {
        setUploadsPendingSave((prev) =>
          prev.includes(url) ? prev : [...prev, url],
        );
      }
      form.setValue(`variants.${index}.imageUrl`, url ?? "", {
        shouldDirty: true,
      });
    },
    [form, discardIfUnsaved],
  );

  // A linked photo lives on someone else's host, so it is never tracked for deletion — same as the cover's.
  const setLinkedVariantImage = useCallback(
    (index: number, url: string) => {
      const replaced = form.getValues(`variants.${index}.imageUrl`);
      if (replaced !== url) discardIfUnsaved(replaced);
      form.setValue(`variants.${index}.imageUrl`, url, { shouldDirty: true });
    },
    [form, discardIfUnsaved],
  );

  const appendVariant = useCallback(() => {
    // Once variants exist the product fields turn into auto totals, so the hand-typed values are captured first.
    if (variantFields.fields.length === 0) {
      typedProductDefaultsRef.current = {
        price: toInputValue(form.getValues("price")),
        stock: toInputValue(form.getValues("stock")),
        color: toInputValue(form.getValues("color")).trim(),
      };
    }
    const { price, stock, color } = typedProductDefaultsRef.current;
    variantFields.append({
      ...EMPTY_VARIANT,
      price: price || toInputValue(form.getValues("price")),
      stock,
      color,
    });
  }, [form, variantFields]);

  const removeVariant = useCallback(
    (index: number) => {
      discardIfUnsaved(form.getValues(`variants.${index}.imageUrl`));
      variantFields.remove(index);
    },
    [form, variantFields, discardIfUnsaved],
  );

  const handleSubmit = form.handleSubmit((data: ProductFormData) => {
    const { variants } = data;
    const hasSavedVariants = variants.length > 0;
    const basePrice = hasSavedVariants
      ? Math.min(...variants.map((variant) => variant.price))
      : data.price;
    const payload = {
      name: data.name,
      sku: data.sku || undefined,
      price: basePrice,
      discountPercentage: data.discountPercentage,
      stock: hasSavedVariants
        ? variants.reduce((sum, variant) => sum + variant.stock, 0)
        : data.stock,
      description: data.desc || undefined,
      category: data.cat || undefined,
      sizes: hasSavedVariants ? getVariantSizes(variants) : (data.sizes ?? []),
      gender: data.gender || undefined,
      // Colours live on the variants now; a leftover product colour would tell the assistant a second, wrong one.
      color: hasSavedVariants ? "" : data.color || undefined,
      imageUrls,
      // Sent even when empty, so removing the last variant clears it on the server.
      variants: toVariantPayloads(variants, basePrice, data.name, data.sku),
      customOptionsEnabled: data.customOptionsEnabled,
      // Cleared when the switch is off, so a disabled product can't quietly
      // keep options that the listing badge would still count.
      customOptionKeys: data.customOptionsEnabled ? data.customOptionKeys : [],
      customOptionNote: data.customOptionsEnabled
        ? data.customOptionNote || undefined
        : undefined,
    };
    // No cleanup on success: the photo is the product's now, and this screen
    // unmounts on the redirect.
    const onSuccess = () => router.push("/inventory");
    if (editingProduct?.id) {
      updateProduct.mutate(
        { id: editingProduct.id, data: payload },
        { onSuccess },
      );
    } else {
      addProduct.mutate(payload, { onSuccess });
    }
  });

  const confirmDelete = () => {
    if (!editingProduct?.id) return;
    setDeleteConfirmOpen(false);
    deleteProduct.mutate(editingProduct.id, {
      onSuccess: () => router.push("/inventory"),
    });
  };

  return {
    form,
    isEditMode,
    isLoadingProducts,
    notFound,
    editingProduct,
    imageUrls,
    setCoverImage,
    setLinkedCoverImage,
    discardUnsavedUploads,
    categoryOptions,
    selectedCategory,
    discountedPrice,
    isSaving,
    isDeleting,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    handleSubmit,
    confirmDelete,
    customOptionsEnabled,
    variantFields,
    hasVariants,
    variantTotals,
    variantSkuSuggestions,
    variantSizeOptions,
    appendVariant,
    removeVariant,
    setVariantImage,
    setLinkedVariantImage,
  };
}
