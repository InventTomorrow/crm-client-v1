import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import type { Product } from "../types";
import { CATEGORIES, productSchema, type ProductFormData } from "../types";
import {
  useAddProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "./useProducts";

const INITIAL_FORM_VALUES = {
  name: "",
  sku: "",
  price: "",
  discountPercentage: undefined,
  stock: "",
  cat: "Apparel",
  sizes: [],
  gender: "",
  color: "",
  desc: "",
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
      productId
        ? products.find((p: Product) => p.id === productId)
        : undefined,
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
      cat: editingProduct.cat ?? "Apparel",
      sizes: editingProduct.sizes ?? [],
      gender: editingProduct.gender ?? "",
      color: editingProduct.color ?? "",
      desc: editingProduct.desc ?? "",
    });
    // Keyed on the id so a background refetch doesn't clobber in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingProduct?.id]);

  // Categories shown in the picker: the built-in set plus whatever existing
  // products already use (so previously-created ones keep showing up).
  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const c of [...CATEGORIES, ...products.map((p: Product) => p.cat)]) {
      const key = c?.trim().toLowerCase();
      if (!c || !key || seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
    return out;
  }, [products]);

  const selectedCategory = useWatch({ control: form.control, name: "cat" });
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

  const isSaving = addProduct.isPending || updateProduct.isPending;
  const isDeleting = deleteProduct.isPending;

  // Single product image for now — variants will reintroduce a gallery. Extra
  // URLs on products created earlier are kept as-is so nothing is lost.
  const setCoverImage = useCallback((url: string | null) => {
    setImageUrls((prev) => (url ? [url, ...prev.slice(1)] : prev.slice(1)));
  }, []);

  const handleSubmit = form.handleSubmit((data: ProductFormData) => {
    const payload = {
      name: data.name,
      sku: data.sku || undefined,
      price: data.price,
      discountPercentage: data.discountPercentage,
      stock: data.stock,
      description: data.desc || undefined,
      category: data.cat || undefined,
      sizes: data.sizes ?? [],
      gender: data.gender || undefined,
      color: data.color || undefined,
      imageUrls,
    };
    const onSuccess = () => router.push("/inventory");
    if (editingProduct?.id) {
      updateProduct.mutate({ id: editingProduct.id, data: payload }, { onSuccess });
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
    categoryOptions,
    selectedCategory,
    discountedPrice,
    isSaving,
    isDeleting,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    handleSubmit,
    confirmDelete,
  };
}
