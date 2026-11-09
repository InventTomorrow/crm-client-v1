"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import { Skeleton } from "@/shared/ui/Skeleton";
import { StaggerItem, StaggerList } from "@/shared/ui/Motion";
import { FlaskConical } from "lucide-react";
import { useSeedCatalog } from "../hooks/useSeedCatalog";
import { SeedRecordCard } from "./SeedRecordCard";

export function SeedPanel() {
  const { user, isLoading: isUserLoading } = useMe();
  const isTester = !!user?.isTester;
  const { data: catalog, isLoading: isCatalogLoading } = useSeedCatalog(isTester);

  if (isUserLoading || (isTester && isCatalogLoading)) return <SeedPanelSkeleton />;

  if (!isTester) {
    return (
      <div className="card p-[22px] text-[13px] text-[var(--ink-soft)]">
        Test data tools are not enabled for this account.
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="flex items-center gap-2 text-[20px] font-semibold">
          <FlaskConical size={18} />
          Test data
        </h2>
        <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
          Add up to 10 sample records at a time. Leads, orders and conversations are never seeded.
        </p>
      </div>
      <StaggerList className="grid gap-3.5 md:grid-cols-2">
        {(catalog ?? []).map((entry) => (
          <StaggerItem key={entry.recordType}>
            <SeedRecordCard entry={entry} />
          </StaggerItem>
        ))}
      </StaggerList>
    </>
  );
}

function SeedPanelSkeleton() {
  return (
    <div className="grid gap-3.5 md:grid-cols-2">
      <Skeleton className="h-[170px] rounded-xl" />
      <Skeleton className="h-[170px] rounded-xl" />
    </div>
  );
}
