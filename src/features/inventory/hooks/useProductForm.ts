import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import type { Product } from "../types";
import { productSchema, type ProductFormData } from "../types";

const INITIAL_FORM_VALUES = {
  name: "",
  sku: "",
  price: 0,
  discountPercentage: undefined,
  stock: 0,
  cat: "Apparel",
  sizes: [],
  gender: "",
  color: "",
  desc: "",
} satisfies z.input<typeof productSchema>;

/** Owns the product dialog's form state, image field, and the live
 * discounted-price preview. Reset whenever the dialog opens with a
 * different (or no) initial product. */
export function useProductForm(open: boolean, initial?: Product | null) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const form = useForm<z.input<typeof productSchema>, unknown, ProductFormData>(
    {
      resolver: zodResolver(productSchema),
      defaultValues: INITIAL_FORM_VALUES,
    },
  );

  useEffect(() => {
    if (!open) return;
    setImageUrl(initial?.imageUrls?.[0] ?? null);
    form.reset(
      initial
        ? {
            name: initial.name ?? "",
            sku: initial.sku ?? "",
            price: initial.price ?? 0,
            discountPercentage: initial.discountPercentage ?? undefined,
            stock: initial.stock ?? 0,
            cat: initial.cat ?? "Apparel",
            sizes: initial.sizes ?? [],
            gender: initial.gender ?? "",
            color: initial.color ?? "",
            desc: initial.desc ?? "",
          }
        : INITIAL_FORM_VALUES,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

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

  return {
    form,
    imageUrl,
    setImageUrl,
    selectedCategory,
    discountedPrice,
  };
}
