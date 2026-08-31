"use client";
import { usePresignedUpload } from "@/features/inventory/hooks/useProducts";
import { FileUpload } from "@/shared/ui/FileUpload";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/ToggleGroup";
import type { PractitionerFormSectionProps } from "../../types";
import { PractitionerTitleAutocomplete } from "../PractitionerTitleAutocomplete";

/** Free text on the server, so a value typed before this list still round-trips. */
const GENDER_OPTIONS = ["Female", "Male", "Other"] as const;

export function PractitionerIdentityFields({
  form,
  isSaving,
}: PractitionerFormSectionProps) {
  const {
    upload,
    isPending: isUploading,
    progress,
    phase,
  } = usePresignedUpload("avatars");

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_150px] md:items-start">
      <div className="order-2 space-y-5 md:order-1">
        <div className="grid gap-5 sm:grid-cols-[190px_1fr]">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <PractitionerTitleAutocomplete
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={isSaving}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ayesha Khan"
                    disabled={isSaving}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Consultant Physiotherapist"
                    disabled={isSaving}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="PMDC-45821-P"
                    disabled={isSaving}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                {/* Radix hands back '' when the pressed option is toggled off,
                    which is exactly "not stated" for this optional field. */}
                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={isSaving}
                  className="flex-wrap justify-start"
                >
                  {GENDER_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option}
                      value={option}
                      aria-label={option}
                      className="data-[state=on]:bg-[var(--accent)] data-[state=on]:text-white data-[state=on]:border-[var(--accent)] data-[state=on]:hover:bg-[var(--accent)] data-[state=on]:hover:text-white"
                    >
                      {option}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FormControl>
              <FormDescription>
                Some patients ask for a practitioner of a particular gender.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="photoUrl"
        render={({ field }) => (
          <FormItem className="order-1 md:order-2">
            <FormLabel>Photo</FormLabel>
            <FormControl>
              <FileUpload
                value={field.value ?? null}
                onChange={field.onChange}
                onUpload={upload}
                isUploading={isUploading}
                uploadPhase={phase}
                progress={progress}
                disabled={isSaving}
                accept="image/*"
                maxSize={5 * 1024 * 1024}
                thumbnail
                compactHeight="h-[150px]"
                className="w-37.5"
              />
            </FormControl>
            <FormDescription className="max-w-37.5">
              Optional — PNG, JPG or WEBP up to 5 MB. With a photo, the
              assistant sends this profile as a picture instead of plain text.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
