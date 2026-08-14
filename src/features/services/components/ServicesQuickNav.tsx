"use client";
import { Button } from "@/shared/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ServiceOffering } from "../types";

interface ServicesQuickNavProps {
  services: ServiceOffering[];
}

/** Jump list for the catalog — every service plus the two actions that aren't a service:
 * creating one and reviewing pricing across all of them. */
export function ServicesQuickNav({ services }: ServicesQuickNavProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="xl">
          All services
          <ChevronDown size={14} className="ml-1.5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="max-h-[420px] w-64 overflow-y-auto"
      >
        <DropdownMenuLabel>
          {services.length > 0 ? `Services (${services.length})` : "Services"}
        </DropdownMenuLabel>

        {services.length === 0 ? (
          <p className="px-2 py-2 text-[11px] text-[var(--ink-mute)]">
            No services yet.
          </p>
        ) : (
          services.map((service) => (
            <DropdownMenuItem
              key={service.id}
              onClick={() => router.push(`/services/${service.id}`)}
            >
              <span className="truncate">{service.name}</span>
              {!service.isActive && (
                <span className="ml-auto pl-2 text-[10px] text-[var(--ink-mute)]">
                  Inactive
                </span>
              )}
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push("/services/new")}>
          <Plus size={13} className="mr-2" /> Add service
        </DropdownMenuItem>
        {/*
        <DropdownMenuItem onClick={() => router.push('/services/plans')}>
          <LayoutList size={13} className="mr-2" /> Plans &amp; pricing
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
