"use client";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { Input } from "@/shared/ui/Input";
import { Label } from "@/shared/ui/Label";
import { Switch } from "@/shared/ui/Switch";
import { useState } from "react";
import {
  useCreateClinicLocation,
  useUpdateClinicLocation,
} from "../hooks/useClinicCoverage";
import {
  clinicLocationFormSchema,
  type ClinicLocation,
  type ClinicLocationFormValues,
} from "../types";
import { CityAutocomplete } from "./CityAutocomplete";

interface ClinicLocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: ClinicLocation | null;
}

interface FormState {
  city: string;
  area: string;
  branchName: string;
  addressLine: string;
  mapsUrl: string;
  contactPhone: string;
  handlesEmergencies: boolean;
  isOpen24x7: boolean;
  emergencyHoursNote: string;
  isActive: boolean;
}

const emptyForm = (): FormState => ({
  city: "",
  area: "",
  branchName: "",
  addressLine: "",
  mapsUrl: "",
  contactPhone: "",
  handlesEmergencies: false,
  isOpen24x7: false,
  emergencyHoursNote: "",
  isActive: true,
});

const fromLocation = (location: ClinicLocation): FormState => ({
  city: location.city,
  area: location.area ?? "",
  branchName: location.branchName ?? "",
  addressLine: location.addressLine ?? "",
  mapsUrl: location.mapsUrl ?? "",
  contactPhone: location.contactPhone ?? "",
  handlesEmergencies: location.handlesEmergencies,
  isOpen24x7: location.isOpen24x7,
  emergencyHoursNote: location.emergencyHoursNote ?? "",
  isActive: location.isActive,
});

function ClinicLocationFormBody({
  onOpenChange,
  location,
}: Omit<ClinicLocationFormDialogProps, "open">) {
  const [form, setForm] = useState<FormState>(() =>
    location ? fromLocation(location) : emptyForm(),
  );
  const [error, setError] = useState<string | null>(null);

  const createLocation = useCreateClinicLocation();
  const updateLocation = useUpdateClinicLocation(location?.id ?? "");
  const isSaving = createLocation.isPending || updateLocation.isPending;

  const patch = (changes: Partial<FormState>) =>
    setForm((current) => ({ ...current, ...changes }));

  const handleSubmit = async () => {
    const text = (value: string) => (value.trim() ? value.trim() : undefined);

    const parsed = clinicLocationFormSchema.safeParse({
      city: form.city,
      area: text(form.area),
      branchName: text(form.branchName),
      addressLine: text(form.addressLine),
      mapsUrl: text(form.mapsUrl),
      contactPhone: text(form.contactPhone),
      handlesEmergencies: form.handlesEmergencies,
      isOpen24x7: form.isOpen24x7,
      emergencyHoursNote: text(form.emergencyHoursNote),
      isActive: form.isActive,
      displayOrder: location?.displayOrder ?? 0,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    const payload = parsed.data as ClinicLocationFormValues;
    if (location) await updateLocation.mutateAsync(payload);
    else await createLocation.mutateAsync(payload);
    onOpenChange(false);
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{location ? "Edit location" : "Add location"}</DialogTitle>
        <DialogDescription>
          A city or area the clinic serves. Areas added here become columns in
          the coverage grid.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="branchName">Branch name</Label>
          <Input
            id="branchName"
            placeholder="Gulberg Clinic"
            value={form.branchName}
            onChange={(event) => patch({ branchName: event.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <CityAutocomplete
              value={form.city}
              onChange={(city) => patch({ city })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="area">Area</Label>
            <Input
              id="area"
              placeholder="DHA — blank means the whole city"
              value={form.area}
              onChange={(event) => patch({ area: event.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="addressLine">Address</Label>
          <Input
            id="addressLine"
            value={form.addressLine}
            onChange={(event) => patch({ addressLine: event.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contactPhone">Contact phone</Label>
            <Input
              id="contactPhone"
              placeholder="+92 300 1234567"
              value={form.contactPhone}
              onChange={(event) => patch({ contactPhone: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mapsUrl">Map link</Label>
            <Input
              id="mapsUrl"
              placeholder="https://maps..."
              value={form.mapsUrl}
              onChange={(event) => patch({ mapsUrl: event.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="handlesEmergencies">Handles emergencies</Label>
              <p className="text-muted-foreground text-sm">
                Patients in a crisis may be directed here. Needs a contact
                phone.
              </p>
            </div>
            <Switch
              id="handlesEmergencies"
              checked={form.handlesEmergencies}
              onCheckedChange={(handlesEmergencies) =>
                patch({ handlesEmergencies })
              }
            />
          </div>

          {form.handlesEmergencies && (
            <>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="isOpen24x7">Open 24/7</Label>
                <Switch
                  id="isOpen24x7"
                  checked={form.isOpen24x7}
                  onCheckedChange={(isOpen24x7) => patch({ isOpen24x7 })}
                />
              </div>
              {!form.isOpen24x7 && (
                <div className="space-y-1.5">
                  <Label htmlFor="emergencyHoursNote">Emergency hours</Label>
                  <Input
                    id="emergencyHoursNote"
                    placeholder="Emergency desk 08:00–22:00"
                    value={form.emergencyHoursNote}
                    onChange={(event) =>
                      patch({ emergencyHoursNote: event.target.value })
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="isActive">Active</Label>
          <Switch
            id="isActive"
            checked={form.isActive}
            onCheckedChange={(isActive) => patch({ isActive })}
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {location ? "Save changes" : "Add location"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function ClinicLocationFormDialog({
  open,
  onOpenChange,
  location,
}: ClinicLocationFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ClinicLocationFormBody
          key={location?.id ?? "new"}
          onOpenChange={onOpenChange}
          location={location}
        />
      )}
    </Dialog>
  );
}
